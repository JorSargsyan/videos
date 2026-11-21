# Shugo auto-video runbook

Each scheduled run makes ONE new video and publishes it to TikTok, Instagram and YouTube.
The owner wants zero involvement: do not ask questions, do not wait for approval. If a step
fails, stop, publish nothing half-done, and report what failed.

## 1. Setup
- In the repo `JorSargsyan/videos` (branch `main`), `bash pipeline/setup.sh` (installs the voice engine, downloads the
  voice model from GitHub releases, installs the Remotion project).

## 2. Write the script
- Read `BRIEF.md` (what Shugo is, audience, tone) and `history/log.jsonl` (every video made:
  date, slug, hook, topic, scene types). Read `history/learnings.md` (what is working).
- Write a NEW script as `scripts/<date>-<slug>.json`. Never repeat a hook or topic angle used
  in the last 30 entries. Rotate topics and scene types so consecutive videos look different.
- Format (see `scripts/sample.json`):
  - 3 to 4 scenes plus the outro; total spoken words 35 to 55 (video lands at 15 to 24 s).
  - Scene `type`: `hook` (one huge line at a time; always first), `stack` (lines pile up),
    `list` (first line is the title, then 2 to 4 short cards), `phone` (app screenshot with
    caption on top). `accent`: red, amber, green or blue.
  - Each line has `say` (what the voice speaks; write numbers as words) and `show` (the
    caption; max about 40 characters; wrap the key word in `*asterisks*` for accent colour).
  - `phone` scenes need `screen`: screen1.jpg home / coach, screen2.jpg sample verdict
    ("Weak setup"), screen3.jpg emotional state 88 calm, screen4.jpg rules list,
    screen5.jpg journal with graded trades, screen6.jpg insights and key finding,
    screen7.jpg trader personality "The Sniper". Only claim what that screen shows.
  - `outro`: `tagline` (max 30 characters) and `say` ("Shugo. <tagline>").
- Content rules (hard): second person, direct, calm, coach-like. The first line must be a
  pain the trader recognises in themselves, not a product claim. No emojis. No promises of
  profit, no win-rate or performance claims, no buy/sell/signal language, no invented
  statistics, no named real people or competitors. Shugo checks the trader's own rules and
  state before a trade; it does not predict the market.

## 3. Build
- `python3 pipeline/make.py scripts/<file>.json out/<date>-<slug>.mp4`
- Check: pull 5 frames with ffmpeg and look at them (text not cut off, right screen shown);
  duration 12 to 30 s; `ebur128` integrated loudness between -17 and -14 LUFS. If a check
  fails, fix the script and rebuild once. If it fails again, stop and report.

## 4. Host
- `bash pipeline/host.sh out/<date>-<slug>.mp4` pushes the video to the public `media` branch
  (it keeps the newest 20 videos and rewrites that branch as one commit) and prints the direct
  link plus its HTTP status. Only continue if the status is 200.
- Commit the script and push to `main` (videos never go on `main`).

## 5. Publish through Buffer
Organization `6ae59eb720e3c9045222e7e3`. Channels: TikTok `6ae59f262f1f5ed6482e4de8`,
Instagram `6ae59eea2f1f5ed6482e4cb6`, YouTube `6ae59f062f1f5ed6482e4d46`.
- One `create_post` per channel, `assets: [{video: {url}}]`, publish immediately (share now).
- Instagram: `metadata.instagram = {type: "reel", shouldShareToFeed: true}`.
- YouTube: `metadata.youtube = {title (<60 chars), categoryId: "27", privacy: "public", madeForKids: false}`.
- TikTok and Instagram caption: one or two hook lines from the video, one line on what Shugo
  does, "Free to start at shugo.pro", "Educational tool. Not financial advice.", then 5 or 6
  hashtags (always #trading #tradingpsychology).
- YouTube description: one sentence, "Free to start: shugo.pro", the disclaimer,
  `#shorts #trading #tradingpsychology`.
- Wait a minute, check each post with `get_post` until `sent` or `error`.

## 6. Record
- Append one line to `history/log.jsonl`: date, slug, hook, topic, scene types, Buffer post
  ids, status per channel. Push.

## Weekly review (separate scheduled run)
- Pull metrics for the last 14 days from Buffer (`list_posts` with `includeMetrics`).
- Rewrite `history/learnings.md`: which hooks, topics and scene types got the most views and
  reactions per channel, which got the least, and 3 concrete instructions for next week's
  scripts. Keep it under 40 lines. Push.
