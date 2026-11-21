"""script.json -> finished vertical video with AI voice, kinetic captions and music.
Usage: python3 make.py <script.json> <out.mp4>
"""
import json, os, re, subprocess, sys, glob, tempfile
import numpy as np, soundfile as sf
HERE = os.path.dirname(os.path.abspath(__file__)); VIDEO = os.path.join(HERE, "..", "video")
FPS = 30; GAP = 0.22; LEAD = 0.20; SCENE_TAIL = 0.30
COL = {"red": "#EF4444", "green": "#22C55E", "amber": "#F59E0B", "blue": "#4A7CFF"}
SAY_FIX = [(r"\bShugo\b", "Shoogo"), (r"\bshugo\.pro\b", "shoogo dot pro"), (r"\b2R\b", "two R"), (r"%", " percent")]

def run(*a): subprocess.run(list(a), check=True)

def tts(k, text, voice, speed):
    for pat, rep in SAY_FIX: text = re.sub(pat, rep, text)
    s, sr = k.create(text, voice=voice, speed=speed, lang="en-us")
    s = np.asarray(s, dtype=np.float32); thr = 0.012 * (np.abs(s).max() + 1e-9) / 0.5
    idx = np.where(np.abs(s) > thr)[0]
    a = max(0, idx[0] - int(0.02 * sr)); b = min(len(s), idx[-1] + int(0.08 * sr))
    return s[a:b], sr

def words(show, accent):
    out = []
    for tok in re.findall(r"\*[^*]+\*|\S+", show):
        if tok.startswith("*"):
            out += [{"text": w, "color": accent} for w in tok.strip("*").split()]
        else: out.append({"text": tok})
    return out

def main(script_path, out):
    from kokoro_onnx import Kokoro
    sc = json.load(open(script_path)); voice = sc.get("voice", "am_michael"); speed = sc.get("speed", 1.0)
    k = Kokoro(os.path.join(HERE, "kokoro.onnx"), os.path.join(HERE, "voices.bin"))
    tmp = tempfile.mkdtemp(prefix="shugo_"); clips = []; t = 0.0; scenes = []
    for s in sc["scenes"]:
        accent = COL.get(s.get("accent", "blue"), COL["blue"]); s0 = t; t += LEAD; lines = []
        for l in s["lines"]:
            a, sr = tts(k, l["say"], voice, speed); p = os.path.join(tmp, f"l{len(clips)}.wav"); sf.write(p, a, sr)
            show = l.get("show", l["say"])
            clips.append((p, t, len(a) / sr, l["say"]))
            lines.append({"words": words(show, accent), "at": max(0, round((t - s0 - 0.08) * FPS)), "chars": len(show.replace("*", ""))})
            t += len(a) / sr + GAP
        t += SCENE_TAIL - GAP
        scenes.append({"type": s["type"], "from": round(s0 * FPS), "dur": round((t - s0) * FPS), "accent": accent, "screen": s.get("screen"), "lines": lines})
        t = (scenes[-1]["from"] + scenes[-1]["dur"]) / FPS
    o0 = t; od = 3.4
    if sc["outro"].get("say"):
        a, sr = tts(k, sc["outro"]["say"], voice, speed); p = os.path.join(tmp, "outro.wav"); sf.write(p, a, sr)
        clips.append((p, o0 + 0.55, len(a) / sr, sc["outro"]["say"])); od = max(od, 0.55 + len(a) / sr + 1.3)
    dur_f = round((o0 + od) * FPS); dur = dur_f / FPS
    props = {"scenes": scenes, "outro": {"from": round(o0 * FPS), "tagline": sc["outro"]["tagline"]}, "duration": dur_f}
    pp = os.path.join(tmp, "props.json"); json.dump(props, open(pp, "w"))
    # --- picture
    chrome = (glob.glob("/opt/pw-browsers/chromium-*/chrome-linux*/chrome") + ["/usr/bin/google-chrome"])[0]
    silent = os.path.join(tmp, "silent.mp4")
    subprocess.run(["npx", "remotion", "render", "src/index.ts", "Auto", silent, f"--props={pp}", f"--browser-executable={chrome}", "--crf=25", "--log=error"], check=True, cwd=VIDEO)
    # --- voice track
    inputs = []; parts = []
    for i, (p, at, d, _) in enumerate(clips):
        inputs += ["-i", p]
        parts.append(f"[{i}:a]aresample=48000,highpass=f=80,acompressor=threshold=-22dB:ratio=3:attack=8:release=120:makeup=3,afade=t=in:d=0.02,afade=t=out:st={max(0, d - 0.06):.3f}:d=0.06,adelay={int(at * 1000)}:all=1[s{i}]")
    n = len(clips)
    fc = ";".join(parts) + ";" + "".join(f"[s{i}]" for i in range(n)) + f"amix=inputs={n}:normalize=0,apad,atrim=0:{dur},loudnorm=I=-16:TP=-1.5:LRA=11,aresample=48000,pan=stereo|c0=c0|c1=c0[a]"
    voice_wav = os.path.join(tmp, "voice.wav"); run("ffmpeg", "-v", "error", "-y", *inputs, "-filter_complex", fc, "-map", "[a]", voice_wav)
    bed = os.path.join(tmp, "bed.wav"); run(sys.executable, os.path.join(HERE, "bed.py"), str(dur), str(sc.get("music_seed", 7)), bed)
    part = out + ".part.mp4"
    run("ffmpeg", "-v", "error", "-y", "-i", silent, "-i", voice_wav, "-i", bed, "-filter_complex",
        "[2:a]volume=-10.58dB[m];[1:a]asplit=2[v0][key];[v0]volume=-3dB[v];[m][key]sidechaincompress=threshold=0.03:ratio=3:attack=40:release=500[md];[v][md]amix=inputs=2:normalize=0,volume=1.3dB,alimiter=limit=0.79:level=false[a]",
        "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", part)
    os.replace(part, out)
    report = {"out": out, "duration": round(dur, 2), "size_mb": round(os.path.getsize(out) / 1e6, 2),
              "lines": [{"at": round(at, 2), "len": round(d, 2), "say": s} for _, at, d, s in clips]}
    print(json.dumps(report, indent=1))

if __name__ == "__main__": main(sys.argv[1], sys.argv[2])
