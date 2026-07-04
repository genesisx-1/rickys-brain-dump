#!/bin/bash
# Double-click me to open Ricky's Brain Dump locally
cd "$(dirname "$0")"
( sleep 1 && open "http://localhost:8420" ) &
echo "🧠 Ricky's Brain Dump running at http://localhost:8420 — leave this window open. Ctrl+C to stop."
python3 -m http.server 8420
