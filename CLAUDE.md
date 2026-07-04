# 🧠 Ricky's Brain Dump — AI operator guide

You are inside Ricky's brain-dump app repo. The webpage (running at http://localhost:8420) is a visual board that **hot-reloads the instant you edit `data.json`** — Ricky is usually watching it while talking to you. Edit the file, he sees cards appear live.

## Who you're talking to

Ricky has ADHD. Keep replies **short and punchy**. One thing at a time. No walls of text. When he brain-dumps a mess of ideas, YOUR job is to organize it into cards and connections on his board — don't just talk about it, PUT IT ON THE BOARD.

## The board file: `data.json`

```jsonc
{
  "savedAt": 1720000000000,   // ⚠️ ALWAYS set to current epoch ms when you edit — the page only applies updates with a newer savedAt
  "nodes": [                   // brain map cards
    { "id": "abc1234", "x": 60, "y": 60, "title": "Card title", "body": "notes\nwith newlines", "color": "purple" }
  ],
  "edges": [                   // lines connecting cards
    { "id": "e1", "a": "<node id>", "b": "<node id>" }
  ],
  "blocks": [                  // time blocks (Day/Week/Month planner)
    { "id": "b1", "date": "2026-07-04", "start": 9, "dur": 2, "label": "deep work", "color": "green" }
  ],
  "content": [                 // video breakdowns
    { "id": "v1", "title": "...", "url": "...", "transcript": "...", "notes": "...", "added": 1720000000000 }
  ],
  "team": [],                  // AI teammates (managed by the Team tab — keep intact)
  "groups": {}                 // group-session history flags (keep intact)
}
```

## Rules for editing the board

- **Bump `savedAt` to current epoch ms** on every write, or the page ignores your change.
- Never change existing node `id`s. New ids: any short random string.
- Cards are ~230px wide. Space them ≥ 270px apart horizontally, ≥ 150px vertically.
- Cluster related cards near each other and **connect them with edges** — the connections are the whole point of a brain map.
- Colors mean vibes, use them: `purple` ideas · `green` money/business · `blue` learning · `orange` projects · `pink` people · `yellow` insights from content · `red` urgent · `gray` someday/parked.
- Put new clusters BELOW or to the RIGHT of existing cards (check existing x/y first — don't stack on top of old cards).
- Preserve everything you weren't asked to change. Valid JSON only.

## Commands Ricky uses

| He says | You do |
|---|---|
| *(any brain dump)* | Organize it into cards + edges in `data.json`. Confirm with a 1-liner. |
| "push it" / "deploy" | `git add -A && git commit && git push` (site auto-deploys to GitHub Pages) |
| "break this down: <youtube url>" | Pull the transcript (yt-dlp: `yt-dlp --skip-download --write-auto-subs --sub-format vtt -o t "<url>"`, install via brew if missing). Add a `content` entry with the transcript, then add the 3–7 best ideas as yellow cards on the map, connected to a hub card titled after the video. |
| "block my week" / time stuff | Add `blocks` entries. Ask what days/hours only if genuinely unclear. |

## Repo layout

- `index.html` — the whole app (vanilla JS, no build step)
- `server.js` — local cockpit server (terminal-in-browser + live sync + auto-save)
- `data.json` — the board (the thing you edit)
- `.team/<name>/` — per-teammate working dirs with persona CLAUDE.md files
- Live site: https://genesisx-1.github.io/rickys-brain-dump/
