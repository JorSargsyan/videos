#!/bin/bash
# Publish one finished video to the public `media` branch and print its direct link.
# Keeps only the newest 20 videos and rewrites the branch as a single commit so the repo stays small.
# Usage: bash pipeline/host.sh out/<file>.mp4
set -e
F="$(realpath "$1")"; NAME="$(basename "$F")"
REPO="$(git -C "$(dirname "$0")" remote get-url origin)"
W="$(mktemp -d)"; cd "$W"; git init -q -b media; git remote add origin "$REPO"
if git fetch -q --depth 1 origin media 2>/dev/null; then git checkout -q FETCH_HEAD -- . 2>/dev/null || true; fi
cp "$F" "$NAME"
ls -t *.mp4 | tail -n +21 | while read -r old; do git rm -q -f --cached "$old" 2>/dev/null || true; mv "$old" "/tmp/pruned_$old"; done
git add -A
git -c user.name="Claude" -c user.email="noreply@anthropic.com" commit -q -m "Media: $NAME"
git push -q -f origin media
URL="https://raw.githubusercontent.com/JorSargsyan/videos/media/$NAME"
for i in 1 2 3 4 5 6; do c=$(curl -sS -o /dev/null -m 20 -w '%{http_code}' "$URL"); [ "$c" = 200 ] && break; sleep 10; done
echo "$URL $c"
