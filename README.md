# Brick Battlegrounds v0.3

Browser-based local-versus-bot and experimental private-room ninja fighting game.

## Deployment (Render)

This application runs as a **Node Web Service**, not a static website.
- Build command: `npm install`
- Start command: `npm start`
- Root directory: repository root (where package.json lives)
- Node 18+

The game now serves Three.js locally from the installed `three` npm dependency (`/vendor/three.module.js`) rather than a CDN. This prevents loss of all menu interactions when an external 3D module fails to load. The 3D engine is loaded only when a match starts; menu clicks are wired at page startup.

## Update existing hosted game

Replace the existing files in your GitHub repository with these updated files, **preserving the directory structure**. Commit them to `main`. Render auto-deploy should rebuild using `npm install`. Check its logs for build success and a Live status, then reload the website (Ctrl+Shift+R).

## Current scope

- V0.3 original brick-inspired ninja roster: Tempest (blue), Inferno (red), Verdant (green), Shade (black)
- Circular fighter portraits; 3D fighter minifigure-inspired proportions
- Bot fight and prototype online room code flow
- Controller/keyboard input and existing combat system

Online multiplayer remains experimental. Server currently relays combat claims rather than being authoritative. Test with a friend before calling it stable or competitive.

## If an arena will not load

Use Chrome/Brave on a computer with WebGL enabled. Open Developer Tools (F12) > Console to inspect errors. If there is a `/vendor/three.module.js` 404, check that Render ran `npm install` after this update.
