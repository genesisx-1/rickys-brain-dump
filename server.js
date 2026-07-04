#!/usr/bin/env node
/* 🧠 Ricky's Brain Dump — local cockpit server
 * Serves the app + a real terminal (node-pty) over WebSocket + live data.json sync.
 * Run: node server.js   (or just double-click start.command)
 */
const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const PORT = process.env.PORT || 8420;

let pty = null;
try {
  pty = require('node-pty');
  // prebuild extraction sometimes drops the exec bit — fix it so spawns work
  for (const dir of ['darwin-arm64', 'darwin-x64']) {
    const helper = path.join(ROOT, 'node_modules/node-pty/prebuilds', dir, 'spawn-helper');
    if (fs.existsSync(helper)) { try { fs.chmodSync(helper, 0o755); } catch {} }
  }
} catch { console.warn('⚠️  node-pty not available — terminal panel disabled (run: npm install)'); }

let WebSocketServer = null;
try { ({ WebSocketServer } = require('ws')); } catch { console.warn('⚠️  ws not available — live sync disabled (run: npm install)'); }

/* which AI CLIs are installed? (checked through the login shell so PATH matches the terminal) */
const { execFileSync } = require('child_process');
const AGENT_CMDS = { claude: 'claude', codex: 'codex', antigravity: 'agy' };
let AGENTS_AVAIL = null;
function detectAgents() {
  if (AGENTS_AVAIL) return AGENTS_AVAIL;
  AGENTS_AVAIL = {};
  const shell = process.env.SHELL || '/bin/zsh';
  for (const [k, cmd] of Object.entries(AGENT_CMDS)) {
    try { execFileSync(shell, ['-ilc', 'command -v ' + cmd], { stdio: 'ignore', timeout: 6000 }); AGENTS_AVAIL[k] = true; }
    catch { AGENTS_AVAIL[k] = false; }
  }
  return AGENTS_AVAIL;
}

const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css',
  '.json': 'application/json', '.png': 'image/png', '.svg': 'image/svg+xml', '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x');

  // ── API ──
  if (u.pathname === '/api/ping') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ ok: true, terminal: !!pty, live: !!WebSocketServer, agents: pty ? detectAgents() : {} }));
  }
  if (u.pathname === '/api/team-setup' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 1e6) req.destroy(); });
    req.on('end', () => {
      try {
        const { dir, brief } = JSON.parse(body);
        if (!/^\.team\/[a-z0-9][a-z0-9-]*$/.test(dir)) throw new Error('bad dir');
        const full = path.join(ROOT, dir);
        fs.mkdirSync(full, { recursive: true });
        // write persona to every CLI's convention so Claude/Codex/Antigravity all pick it up
        for (const fn of ['CLAUDE.md', 'AGENTS.md']) fs.writeFileSync(path.join(full, fn), String(brief || ''));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }
  if (u.pathname === '/api/save' && req.method === 'POST') {
    let body = '';
    req.on('data', c => { body += c; if (body.length > 20e6) req.destroy(); });
    req.on('end', () => {
      try {
        const data = JSON.parse(body); // validate it's real JSON before writing
        fs.writeFileSync(path.join(ROOT, 'data.json'), JSON.stringify(data, null, 2));
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end('{"ok":true}');
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: String(e) }));
      }
    });
    return;
  }

  // ── static files ──
  let p = u.pathname === '/' ? '/index.html' : u.pathname;
  p = path.normalize(p).replace(/^(\.\.[\/\\])+/, '');
  const file = path.join(ROOT, p);
  if (!file.startsWith(ROOT)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, buf) => {
    if (err) { res.writeHead(404); return res.end('not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(buf);
  });
});

/* ── WebSockets: /events (live sync) + /term (pty) ── */
if (WebSocketServer) {
  const wssEvents = new WebSocketServer({ noServer: true });
  const wssTerm = new WebSocketServer({ noServer: true });

  server.on('upgrade', (req, sock, head) => {
    const { pathname } = new URL(req.url, 'http://x');
    if (pathname === '/events') wssEvents.handleUpgrade(req, sock, head, ws => wssEvents.emit('connection', ws, req));
    else if (pathname === '/term' && pty) wssTerm.handleUpgrade(req, sock, head, ws => wssTerm.emit('connection', ws, req));
    else sock.destroy();
  });

  // watch data.json → tell every open page to hot-reload the board
  let debounce;
  fs.watch(ROOT, (ev, fname) => {
    if (fname !== 'data.json') return;
    clearTimeout(debounce);
    debounce = setTimeout(() => {
      for (const c of wssEvents.clients) if (c.readyState === 1) c.send('{"type":"data-updated"}');
    }, 150);
  });

  // terminal sessions — ?cwd=.team/<name> runs in a teammate's dir; cols/rows = client's real size
  wssTerm.on('connection', (ws, req) => {
    const shell = process.env.SHELL || '/bin/zsh';
    let cwd = ROOT, cols = 120, rows = 28;
    try {
      const q = new URL(req.url, 'http://x').searchParams;
      const want = q.get('cwd');
      if (want && /^\.team\/[a-z0-9][a-z0-9-]*$/.test(want)) {
        const full = path.join(ROOT, want);
        if (fs.existsSync(full)) cwd = full;
      }
      cols = Math.min(500, Math.max(20, parseInt(q.get('cols')) || 120));
      rows = Math.min(200, Math.max(5, parseInt(q.get('rows')) || 28));
    } catch {}
    const term = pty.spawn(shell, ['-il'], {
      name: 'xterm-256color', cols, rows, cwd,
      env: { ...process.env, TERM_PROGRAM: 'rickys-brain-dump' },
    });
    term.onData(d => { if (ws.readyState === 1) ws.send(JSON.stringify({ type: 'out', data: d })); });
    term.onExit(() => { try { ws.close(); } catch {} });
    ws.on('message', raw => {
      try {
        const m = JSON.parse(raw);
        if (m.type === 'in') term.write(m.data);
        else if (m.type === 'resize') term.resize(Math.max(20, m.cols | 0), Math.max(5, m.rows | 0));
      } catch {}
    });
    ws.on('close', () => { try { term.kill(); } catch {} });
  });
}

server.listen(PORT, () => {
  console.log(`\n🧠 Ricky's Brain Dump cockpit → http://localhost:${PORT}`);
  console.log(`   terminal: ${pty ? 'ON' : 'off'} · live sync: ${WebSocketServer ? 'ON' : 'off'}\n`);
});
