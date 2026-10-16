# Brick Battlegrounds — browser prototype v0.2

Original brick-character 3D fighting game. No copyrighted LEGO assets or Ninjago game code are included. The public-facing title is **Brick Battlegrounds** (not the LEGO trademark).

## Go live (browser URL — no downloads for your friends)

1. Put this repository on GitHub.
2. Deploy it on any Node.js host supporting persistent WebSockets (e.g. Render / Railway). Set build command `npm install` and start command `npm start` (Node 18+). No environment secrets needed. The host assigns `PORT` automatically.
3. Share the resulting `https://...` URL with friends. Both visit the same URL. Player 1 selects CREATE ONLINE ROOM and shares a code; Player 2 enters it and joins. Both pick fighters and click READY.

Static-only hosts cannot run the multiplayer server; do **not** deploy to plain GitHub Pages or static Vercel without a separate WebSocket backend. The app also loads Three.js from a CDN at runtime.

## Local development

Run `npm install` and `npm start` in this folder and open http://localhost:3000. A solo CPU mode is included.

## Controls

- WASD / left stick: move
- Mouse drag / right stick: camera
- J / Square (PS5) / X (Xbox): light attack
- K / Triangle (PS5) / Y (Xbox): heavy attack
- L / L1 (PS5) / LB (Xbox): block
- Left Shift / Circle (PS5) / B (Xbox): dodge
- Space / Cross (PS5) / A (Xbox): jump
- Q / R1 (PS5) / RB (Xbox): special
- Tab / R2 (PS5) / RT (Xbox): toggle opponent lock-on

Gamepad input works on supported desktop browsers; controllers must be connected and sometimes require pressing a button to become available.

## Current prototype limitations

This is an experimental alpha, not a finished/fully secure competitive multiplayer build: the WebSocket room relays player positions and hit events and applies basic rate/size checks, but still trusts client-reported combat data. Latency compensation, guard synchronization, secure server-authoritative combat and production anti-cheat need further work. Remote animations are simplified. Opponents who leave a match trigger a disconnect screen. Character abilities currently share a combat moveset and portraits use original CSS art. Some controllers/browsers may need mapping adjustments. Round restarts are local, not server synchronized. No deployment has been performed for you.
