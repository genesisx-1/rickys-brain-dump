#!/bin/bash
# Double-click me to open Ricky's Brain Dump cockpit
cd "$(dirname "$0")"
( sleep 1 && open "http://localhost:8420" ) &
if command -v node >/dev/null 2>&1 && [ -d node_modules ]; then
  node server.js
else
  echo "🧠 basic mode (no in-app terminal) — run 'npm install' here once to unlock the cockpit"
  python3 -m http.server 8420
fi
