# 🧠 Ricky's Brain Dump

A Lucidchart-style brain map + time blocker + content breakdowns + an AI **team** — with Claude living in a terminal *inside* the app. Built for ADHD brains.

## Run it (the cockpit)

Double-click **`start.command`** → opens at http://localhost:8420 with:

- **⌨️ Claude button** — a real terminal panel at the bottom running Claude Code. Talk to it; cards appear on your board **live**, no refresh.
- **👥 Team tab** — named AI teammates, each with their own personality, skills, and memory. Click **Talk** and the conversation resumes where you left it (`claude --continue` under the hood, one working dir per teammate in `.team/`). Check 2+ and hit **Group session** for a roundtable.
- **Auto-save everywhere** — every change syncs straight to `data.json`. No save button needed when the cockpit is running.

First-time setup on a new computer: `git clone`, then `npm install` in the folder (unlocks the terminal panel), then `start.command`.

## How saving works

- Cockpit running → **everything auto-syncs to `data.json`** as you work, and the page hot-reloads when Claude edits the file.
- Basic mode (GitHub Pages / no node): auto-saves to the browser; hit **💾 Save** to write `data.json`.
- The board loads whichever is **newer**: browser save or `data.json`.
- Teammate conversation memory is per-computer (it lives in Claude Code's own history); the board itself syncs everywhere through git.

## The workflow with Claude

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
