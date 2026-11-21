"""Original ambient bed, synthesized from scratch (no samples, nothing licensed)."""
import numpy as np, sys
from scipy.signal import butter, sosfilt, fftconvolve
from scipy.io import wavfile
SR=48000
def hz(n): return 440*2**((n-69)/12)
def lp(x,f,o=2): return sosfilt(butter(o,f,fs=SR,output='sos'),x)
def hp(x,f,o=2): return sosfilt(butter(o,f,fs=SR,output='sos'),x)
def pad(notes,dur,rng):
    t=np.arange(int(dur*SR))/SR; out=np.zeros((len(t),2))
    for n in notes:
        for det,pan in [(-0.07,0.25),(0.0,0.5),(0.06,0.75)]:
            f=hz(n+det); ph=rng.uniform(0,6.28)
            w=np.sin(2*np.pi*f*t+ph)+0.35*np.sin(2*np.pi*2*f*t+ph*1.7)+0.15*np.sin(2*np.pi*3*f*t+ph*0.3)
            w*=0.75+0.25*np.sin(2*np.pi*rng.uniform(0.07,0.19)*t+rng.uniform(0,6.28))
            out[:,0]+=w*(1-pan); out[:,1]+=w*pan
    return out/len(notes)
def make(dur,seed=7,path="bed.wav"):
    rng=np.random.default_rng(seed); tail=3.0; N=int((dur+tail)*SR); mix=np.zeros((N,2))
    # slow two-chord drift: Am9 -> Fmaj7 -> Am9 ..., long crossfades
    chords=[[45,52,57,60,64,71],[41,48,57,60,64,67]]
    seg=6.0; xf=2.5; i=0; t0=0.0
    while t0<dur+tail:
        d=seg+xf; p=pad(chords[i%2],d,rng); n=len(p)
        env=np.ones(n); k=int(xf*SR); env[:k]=np.sin(np.linspace(0,np.pi/2,k))**2; env[-k:]=np.cos(np.linspace(0,np.pi/2,k))**2
        a=int(t0*SR); b=min(a+n,N); mix[a:b]+=(p*env[:,None])[:b-a]; t0+=seg; i+=1
    for c in range(2): mix[:,c]=lp(mix[:,c],1400)
    t=np.arange(N)/SR
    # sub drone on A
    sub=np.sin(2*np.pi*hz(33)*t)*(0.8+0.2*np.sin(2*np.pi*0.11*t)); mix+=0.35*sub[:,None]
    # airy shimmer: filtered noise swelling slowly
    for c in range(2):
        nz=hp(lp(rng.standard_normal(N),6000),2500)*(0.5+0.5*np.sin(2*np.pi*0.09*t+c*1.3))
        mix[:,c]+=0.035*nz
    # soft pulse, 84 bpm, for a sense of forward motion
    beat=60/84; pulse=np.zeros(N); L=int(0.35*SR); tt=np.arange(L)/SR
    hit=np.sin(2*np.pi*(52*tt+18*(1-np.exp(-tt*30))/30))*np.exp(-tt*11)
    k=0
    while k*beat<dur:
        a=int(k*beat*SR); g=1.0 if k%4==0 else 0.55
        pulse[a:a+L]+=g*hit[:max(0,min(L,N-a))]; k+=1
    mix+=0.22*lp(pulse,180)[:,None]
    # reverb: decaying noise impulse
    irn=int(2.6*SR); ir=np.stack([rng.standard_normal(irn),rng.standard_normal(irn)],1)*np.exp(-np.arange(irn)/SR*2.4)[:,None]
    for c in range(2): ir[:,c]=lp(ir[:,c],5000)
    wet=np.stack([fftconvolve(mix[:,c],ir[:,c])[:N] for c in range(2)],1); wet/=np.abs(wet).max()+1e-9
    mix=mix/ (np.abs(mix).max()+1e-9)*0.7+wet*0.45
    mix=mix[:int(dur*SR)]
    n=len(mix); fi=int(0.6*SR); fo=int(1.6*SR)
    mix[:fi]*=np.linspace(0,1,fi)[:,None]**2; mix[-fo:]*=np.linspace(1,0,fo)[:,None]**2
    mix=mix/np.abs(mix).max()*0.8
    wavfile.write(path,SR,(mix*32767).astype(np.int16))
if __name__=="__main__": make(float(sys.argv[1]),int(sys.argv[2]),sys.argv[3])
