# FartNite

Current build: tactical arena FPS; this is a name change only, with existing gameplay retained.

## Arena V2: Cover Circuit C — original Blender airsoft cover rebuild

**Selected aesthetic: realistic plywood + inflatable tournament bunkers (Option C).**

**Blender build verified:** imported the completed industrial warehouse GLB and added 82 original editable detailed cover models. Final source is approximately 95 MB and the playable GLB is approximately 38 MB, with 30 material-based render meshes. The enlarged asset needs real-hardware load time and FPS verification.

This update adds **82 new gameplay-synchronized airsoft cover obstacles** on top of the industrial warehouse map: 64 detailed plywood / OSB tournament barricades and pallet stacks, and 18 molded soft-bunker inflatables. The plywood includes factory aluminum framing, braces, fasteners, painted safety caps and rental-field markings; the foam bunkers include stitched/welded sections, recessed patches and inflation fittings. Every obstacle is placed using the same `shared/arena-layout.json` model consumed by Blender and the server's Rapier collision.

The cover network has staggered full-height plywood walls to interrupt long firing lanes, low waist-height cover for sliding/crouching, L-shaped corners for peeking, a few pallet stacks, two protected spawn approaches and eight extra upper-mezzanine barriers. Layout tests use a player-radius flood fill across a 1m floor grid and confirm both teams can still reach each other, that the opening sprint lane has several metres of clearance, and that the cover is mirrored. Additional solid cover blocks BB paths; netting remains BB-permeable. **Cover reduces exposure rather than providing guaranteed immunity from being hit.**

Rebuild by running `blender --background --python art/build_arena_v2.py` and export `client/public/assets/arena.glb`; editable source `art/the_arena_v2.blend`. The client cache-busts the model with `ARENA_COVER_CIRCUIT_C_03`, and the top-left HUD displays **THE ARENA V2 · COVER CIRCUIT C** only after all Blender assets load.

Limitations: bot AI remains heuristic, and real-PC performance needs testing with the denser map. These pieces are modelled procedural Blender game geometry rather than scanned photographs or handcrafted film-quality sculpts.

---

## Arena V2 — landmark visual overhaul

**Verified Blender export:** `art/the_arena_v2.blend` (~46 MB), `client/public/assets/arena.glb` (~29 MB), 122 synchronized world colliders, 22 material-batched render meshes. Updated public map URL is versioned; actual hardware FPS still needs user playtesting.

The industrial warehouse model now has clearly identifiable suspended **red/blue team entry gateways** at x=-34m and x=34m, a giant central overhead neon command pavilion visible from both spawn directions, a tournament-style black anti-slip lane floor with glowing color-coded routes, and readable **THE ARENA / INDUSTRIAL V2** signage. These are original 3D Blender meshes, not an image, and are high enough not to alter player/BB collision shapes. The 120 × 80m collision map and movement remain synchronized across client/server.

The client now requests the map with a versioned GLB URL to prevent stale browser/CDN cache reuse. During a match, a HUD tag explicitly says **THE ARENA V2 · INDUSTRIAL SHOWDOWN** only after the Blender model has loaded; otherwise it warns **MAP: LOADING / OLD BLOCKOUT** so players can detect failures instead of silently seeing the old map. This tag does not substitute for the visual art.

# The Arena V2 — original multi-level Blender FPS map

A replacement for the old rectangular blockout, modeled from scratch in Blender, influenced by the user-approved industrial arena layout. Built-in features include the balanced red and blue team bases, central raised cargo objective with stairs, alpha/bravo routes, side mezzanines with navigable stairs, plywood tactical dividers, industrial containers, realistic inflatable cover, safety netting, industrial trusses/fixtures, factory doors, painted floor markings and room signage.

**Editable project:** `art/the_arena_v2.blend` (all original named geometry and packed textures). **Game asset:** `client/public/assets/arena.glb`.

**Blender build verified:** 122 authored collision volumes, 17 material-batched meshes, original packed surface textures. The detailed GLB is currently about 27 MB; further LOD/texture optimization is still a follow-up, not a claimed performance benchmark. **Source:** `art/build_arena_v2.py`, generated through `.github/workflows/blender-arena-v2.yml`.

**Important synchronization rule:** `shared/arena-layout.json` is the single source of the **122+ world obstacle bounding boxes** for both Rapier collision engines AND the Blender geometry generator. The client hides collision placeholders when its GLB loads, but the colliders remain in place. Invisible player-specific dynamic props are removed as before. Visual tiny nuts, seams, sign details, truss elements and rail decoration remain non-collidable; gameplay-sized obstacles match the server colliders. Netting is deliberately BB-permeable.

**Rendering:** approximately eighteen reusable PBR materials, packed procedural concrete/OSB/metal/rubber textures, emissive non-shadow light panels, mesh-batched material GLB. A realistic full bake of physically accurate GI, bespoke hand-painted source textures and navmesh are not yet included. Performance and player navigation on real hardware still need testing.

**Map layout:** 120 × 80m enclosure. Southward accessible team mezzanines and accessible center roof. Bots share world collision; their pathfinding is still heuristic rather than a navmesh. Online and VS Bot reuse the existing movement/combat systems.

---

## Weapon visual style — bare skin and no attachments (October 2026)

All nine original Blender base weapons were regenerated using `art/rebuild_black_barearms.py` with an identical approved visual direction: matte/satin **black airsoft gun parts**, **bright orange airsoft safety tip on every muzzle**, natural **deep ebony skin on bare hands and forearms**, **no gloves**, **no sleeves**, and individual contacts on the trigger grip/supporting handguard, pump or pistol frame. Each weapon has its own native Blender source (`art/weapons/<id>.blend`) and game-ready GLB (`client/public/assets/weapons/<id>.glb`).

**No mounted optics, scopes, flashlight, laser, bipod or angled foregrip attachments.** Factory iron sights and built-in rails are retained so a future dedicated attachments menu can equip actual add-on meshes without rebuilding the weapon. The sniper can be used with iron sights in this version; a scope can be offered later.

First-person bare forearms use dark near-black skin shading and smoothed elliptical anatomical mesh lofts, extending from the lower camera region into the actual gun's grip positions. Each palm has separate modeled fingers, fingertips, a curved opposing thumb and natural nails. The model is made with Blender meshes and procedural materials; it is not photoreal skin scanning. Source files are fully editable. Per-weapon reload animation clips remain future work.

# Nine original Blender airsoft replicas

All nine selectable replicas now have independent editable Blender source scenes in art/weapons/ and exported GLB models in client/public/assets/weapons/. Blender generator: art/build_airsoft_weapons.py.

| Replica | Distinct first-person silhouette |
| --- | --- |
| Vanguard | Lightweight ergonomic AEG carbine, vented handguard, factory iron sights |
| Ranger | Extended vented AEG, skeleton stock and angled foregrip |
| Specter | Compact bullpup AEG, integrated carry handle, rear magazine |
| Atlas | Larger tactical AEG with winding BB drum and broad accessories |
| Whisper | SMG with folding stock, straight BB magazine and compact barrel |
| Breacher | Pump-style airsoft shotgun, tubular assembly and ribbed fore-end |
| Watcher | Long airsoft bolt-action silhouette with factory iron sights |
| Echo | Compact GBB pistol with rounded slide and stippled grip |
| Tempo | Extended competition-style GBB airsoft pistol with iron sights |

The game now loads the specific model for each weapon slot, rather than stretching one rifle model. Each viewmodel is scaled and placed far enough forward to prevent the rear stock from clipping through the camera, with ADS sight alignment adjusted by weapon type. All feature original first-person bare dark-skinned hands and orange airsoft-only muzzle details. GLBs are merged by material for render efficiency; native .blend files retain named parts. These are procedural Blender-modeled game assets, not photographs or high-poly organic sculpts. Reload animations and physically-based texture baking remain future work.

---
## Input synchronization repair (2026-10-18)

- Sprint/slide keyboard and controller inputs, simulation and WebSocket packets are now pumped from a dedicated 60Hz timer, independently from Three.js requestAnimationFrame. This prevents starving the authoritative server when a rendered frame is delayed.
- The Node server uses a monotonic fixed-step accumulator to catch up after event loop delays, and tolerates brief input gaps up to 1.8 seconds (instead of a 450ms threshold which caused rapid run/stop/run oscillation during WebGL stalls).
- Pause immediately sends a zero-movement packet, disconnects immediately stop player input, one-shot slide inputs cannot replay, and incoming input sequence numbers are acknowledged in snapshots.
- Snapshots expose packet input age and sequence acknowledgement, and the FPS debug overlay reports network lag. Client prediction accepts expected network latency without repeatedly teleporting the camera.
- Browser regression test artificially throttles requestAnimationFrame while holding sprint and checks the server keeps receiving input and moves the avatar.
- These changes target network/input continuity. A GPU rendering slowdown remains possible on integrated graphics and needs real-device benchmarking.

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

## Sprint/floor rendering hotfix

- Removed the old generated floor stripes, ceiling beams, fences and point lights when the Blender arena GLB loads, eliminating duplicated geometry and likely floor z-fighting.
- Separated renderer frame delta from physics elapsed time. Slow frames no longer silently discard physics time; the client catches up using bounded 60Hz Rapier substeps (up to seven per displayed frame).
- Reduced server-snapshot rewind during sprint. The predicted player is now smoothly visualized between fixed physics updates; only significant out-of-sync/respawn positions cause hard correction.
- Camera is clamped above the actual collision floor during slides, with smoother physical interpolation and less frantic field-of-view updates. Render pixel ratio is capped at 1.2 to lower GPU load.
- Added browser regression coverage for full-speed running over the modeled floor followed by a slide. True desktop GPU FPS and map-wide visual testing still need manual verification.

## Fast traversal update

- Responsive, momentum-based acceleration: walk 6.5 m/s, hold-to-sprint 11.5 m/s, directional boosted slide up to 14.5 m/s with a roughly 0.8-second friction curve.
- **Keyboard:** hold **Shift + W** to sprint, tap **C** while sprinting to slide. Tap **Space** during a slide to cancel into a jump; release **C** to stand. **C** at walking speed crouches normally.
- **Controller:** hold **L3 + left-stick forward** to sprint, tap **B** (Xbox) / **Circle** (PS5) to slide. Press **A/Cross** to jump out of the slide.
- The server validates slides, movement and stance. Both predicted movement and authoritative players use the same acceleration, slide momentum, steering and cooldown logic. A lowered capsule is used for slides; if overhead clearance is blocked, the player remains crouched rather than clipping through the obstacle.
- Camera leans and drops during slides; sprint and slide provide distinct FOV changes, weapon movement, running bob and brief wind sound. Original LEGO models, Blender stage, weapons, BB hit logic and maps are preserved.
- The movement does not use proprietary game code or assets.

## Controls

Keyboard: WASD move; mouse look; LMB fire; RMB aim; R reload; Space jump; C crouch; Z prone; Shift sprint; Q/E lean (prototype support); 1/2 select default primary/pistol; G grenade (placeholder), V melee (placeholder), Tab score; Esc pause and release pointer lock.

Controllers: the standard Gamepad API; left stick move, right stick look, RT/R2 shoot, LT/L2 aim, A/Cross jump, B/Circle crouch, X/Square reload, Y/Triangle switch weapon, L3 sprint. Recognizes PS button naming; vibration when supported. Controller mapping/rebinding and accessibility need additional work.

## Known issues — transparent bug log

- [OPEN] **Blender files:** no original .blend sources, baked lightmaps, GLB character/arms/gun/map assets or authored rig animation clips exist yet. Blockout geometry is procedural. The required all-Blender asset pipeline has not been delivered.
- [OPEN] **Bots:** no navmesh, cover/flank/peek decision-making or true ragdoll solver. Basic bot steering can get stuck on obstacles.
- [OPEN] **Network:** no 150ms server-side position rewind, robust anti-cheat, ranked matchmaking, replayable event logs, 20-cycle soak tests or packet-loss benchmarking. Reconnect rooms are in-memory and disappear on server restart.
- [OPEN] **Physics:** no reliable ricochet or penetration by material, proper synchronized dynamic props, CCD configuration on separate BB rigid bodies, full vault/mantle/wall-run traversal (slide and lower stance capsule now implemented).
- [OPEN] **Equipment:** smoke/flash grenades, melee tagging and detailed per-weapon recoil patterns remain placeholders.
- [OPEN] **Performance:** 60/120fps not benchmarked; draw-call readout available but under-300 budget not verified. No chunked GLB loading, progress UI, baked maps, authored LOD or compressed textures.
- [OPEN] **Testing:** Vitest unit tests and GitHub-hosted TypeScript/Vite build checks pass. Windows Edge/Firefox/Safari, real Xbox/PS5 gamepads, multiple browser networking under 30/100/200ms latency and 2% loss, 10-minute memory, and end-to-end finish/rematch testing are not yet complete.
- [OPEN] **Audio:** original synthetic Web Audio placeholders are in place; full per-surface footsteps, mastered reload/muzzle sounds, and real sampled foley not completed.

Build and test workflow: `.github/workflows/airsoft-ci.yml`.
Existing old-game source remains in `public/` for reference and model history but the Vite build uses `client/`.
