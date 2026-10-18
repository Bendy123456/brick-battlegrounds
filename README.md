# Airsoft Arena — TypeScript prototype

Previously Brick Battlegrounds. Option B migration: preserve the existing repo and Render URL.

**Project status:** This is an original early playable prototype, NOT yet the complete finished game. The full Blender art/animation pipeline, production-grade AI, and multiplayer validation remain to be completed. The original articulated LEGO-style minifigure geometry is reused from the previous game unchanged except for its Three.js module import.

## Install and start

- Requires Node.js 22 or later.
- Run `npm install` at the repository root. Its postinstall script builds the Vite client into `dist/`.
- Run `npm start` to serve the game and the authoritative WebSocket server at http://localhost:3000.
- Development: after starting the server, run `npm run dev` separately. Vite proxies `/ws` to the server.
- Unit tests: `npm test`; typecheck: `npm run check`; build: `npm run build`.

## Deployment on the existing Render URL

Keep the Render Node web service connected to this repo, branch `main`, build command `npm install`, start command `npm start`. The Node server hosts Vite's static production bundle and WebSocket `/ws` on the same existing URL. The requested independent static host can be configured later; this approach preserves the existing link while the project is being built.

## Features currently coded

- Three.js Vite TypeScript first-person view, pointer-lock camera, keyboard controls, basic gamepad mapping, Rapier kinematic capsule and jump collider, client position prediction with authoritative server snapshots.
- 120m x 80m industrial indoor map with cover, wings, elevated floors, basic ramps/stairs, containers, catwalks and zones. Placeholder procedural blockout meshes, NOT Blender assets or baked lightmaps.
- The nine classic minifigure models from Brick Battlegrounds as visible opponents; temporary blockout first-person arms and replica silhouettes.
- Nine fictional airsoft guns with magazine size, fire rate, speed, spread, reload time and firing effects. BB pellets with per-frame movement, gravity/drag and Rapier raycasts for world collisions. Head/body/limb tags; no blood.
- Server-authoritative player movement, fire cadence, ammo and scoring. Solo vs simple server bot; private code 1v1; experimental quick-match queue; rematch and respawn; lightweight reconnect token. First to five.
- HUD with health, time, zone, score, ammo, game results and ping. Local pause, loadout, stored keyboard rebinds, mouse sensitivity and controller deadzone, generated Web Audio placeholder sounds, server-rendered BBs and basic cosmetic props.

## Controls

Keyboard: WASD move; mouse look; LMB fire; RMB aim; R reload; Space jump; C crouch; Z prone; Shift sprint; Q/E lean (prototype support); 1/2 select default primary/pistol; G grenade (placeholder), V melee (placeholder), Tab score; Esc pause and release pointer lock.

Controllers: the standard Gamepad API; left stick move, right stick look, RT/R2 shoot, LT/L2 aim, A/Cross jump, B/Circle crouch, X/Square reload, Y/Triangle switch weapon, L3 sprint. Recognizes PS button naming; vibration when supported. Controller mapping/rebinding and accessibility need additional work.

## Known issues — transparent bug log

- [OPEN] **Blender files:** no original .blend sources, baked lightmaps, GLB character/arms/gun/map assets or authored rig animation clips exist yet. Blockout geometry is procedural. The required all-Blender asset pipeline has not been delivered.
- [OPEN] **Bots:** no navmesh, cover/flank/peek decision-making or true ragdoll solver. Basic bot steering can get stuck on obstacles.
- [OPEN] **Network:** no 150ms server-side position rewind, robust anti-cheat, ranked matchmaking, replayable event logs, 20-cycle soak tests or packet-loss benchmarking. Reconnect rooms are in-memory and disappear on server restart.
- [OPEN] **Physics:** no reliable ricochet or penetration by material, proper synchronized dynamic props, CCD configuration on separate BB rigid bodies, complete slide mechanics, or collider height adjustment for prone and crouch.
- [OPEN] **Equipment:** smoke/flash grenades, melee tagging and detailed per-weapon recoil patterns remain placeholders.
- [OPEN] **Performance:** 60/120fps not benchmarked; draw-call readout available but under-300 budget not verified. No chunked GLB loading, progress UI, baked maps, authored LOD or compressed textures.
- [OPEN] **Testing:** Vitest unit tests and GitHub-hosted TypeScript/Vite build checks pass. Windows Edge/Firefox/Safari, real Xbox/PS5 gamepads, multiple browser networking under 30/100/200ms latency and 2% loss, 10-minute memory, and end-to-end finish/rematch testing are not yet complete.
- [OPEN] **Audio:** original synthetic Web Audio placeholders are in place; full per-surface footsteps, mastered reload/muzzle sounds, and real sampled foley not completed.

Build and test workflow: `.github/workflows/airsoft-ci.yml`.
Existing old-game source remains in `public/` for reference and model history but the Vite build uses `client/`.
