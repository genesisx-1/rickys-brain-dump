# 🧠 Ricky's Brain Dump

A Lucidchart-style brain map + time blocker + content breakdown board. Built for ADHD brains.
No build step, no framework, no account — one HTML file and a JSON file, synced through git.

## Run it locally

Double-click **`start.command`** (or run `python3 -m http.server 8420` in this folder), then it opens at http://localhost:8420

## How saving works

- **Everything auto-saves to the browser instantly** — you never lose work.
- Hit **💾 Save** to write `data.json` into this folder (first time, a file picker asks where — pick `data.json` in this repo folder; after that it saves silently).
- The board loads whichever is **newer**: your browser save or `data.json`.

## The workflow with Claude

Open a terminal in this folder, run `claude`, and:

| You say | What happens |
|---|---|
| *brain dump anything* | Claude adds/organizes cards in `data.json` — refresh the page to see them |
| "break this down: \<youtube link\>" | Claude pulls the transcript, adds it to Content, and drops idea cards on the map |
| "push it" | Claude commits + pushes to GitHub (this saves your board to the cloud) |
| "deploy" | Same as push — the site auto-updates on GitHub Pages |

On another computer: `git pull`, double-click `start.command`, and you're exactly where you left off.

## Views

- **🗺️ Brain Map** — double-click = new card · drag cards · drag the ● dot to connect · Delete key removes · search box dims non-matches · 🎯 Focus = 25-min timer
- **📅 Time Blocks** — Day / Week / Month. Click any slot to add a block.
- **🎬 Content** — save videos + transcripts, highlight a line → **Selection → Brain Map** turns it into a card.
