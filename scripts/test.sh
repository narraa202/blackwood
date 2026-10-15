#!/usr/bin/env bash
# Runs tests.html in headless Chrome and prints the results.
# Exit code 0 only when every test passes. Dev tool, not part of the game.
set -euo pipefail
cd "$(dirname "$0")/.."
PORT=${PORT:-8765}
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
PROFILE=".superpowers/chrome-profile"
mkdir -p "$PROFILE"
python3 -m http.server "$PORT" --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null || true' EXIT
for _ in $(seq 1 50); do
  curl -s -o /dev/null "http://127.0.0.1:$PORT/tests.html" && break
  sleep 0.1
done
DOM=$("$CHROME" --headless=new --disable-gpu --no-first-run --user-data-dir="$PROFILE" \
  --virtual-time-budget=15000 --dump-dom "http://127.0.0.1:$PORT/tests.html?$(date +%s)" 2>/dev/null)
echo "$DOM" | python3 -c '
import sys, re, html
d = sys.stdin.read()
for m in re.findall(r"<li class=\"(?:ok|bad)\">(.*?)</li>", d, re.S):
    print(html.unescape(m))
s = re.search(r"<h1 id=\"summary\"[^>]*>(.*?)</h1>", d, re.S)
print(html.unescape(s.group(1)) if s else "NO SUMMARY (page did not finish)")
'
echo "$DOM" | grep -q 'data-status="pass"'
