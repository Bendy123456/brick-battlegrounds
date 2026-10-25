# FartNite — Island Survival

**FartNite** is an original third-person, browser-based island battle-royale prototype. It is not a port of Fortnite or a Roblox Studio project. All visible game art and terrain in the active build are generated with Three.js geometry in this repository. No Fortnite files, logos, sounds, characters, weapon models, or map assets are included.

## Playable solo prototype

- One procedurally modelled island with original locations: Maple Meadows, Copper Crossing, Willow Wharf, Sunset Orchard, Ridgewatch, and Clover Commons
- Third-person movement, jumping, sprinting, crouching, a controllable glider descent, and basic Xbox/PlayStation-style gamepad input
- Twenty contenders total: the player and 19 local simulated enemies
- Loot spawns with five fictional weapon classes: Trailblazer AR, Field Scattergun, Zipline SMG, Ridge Rifle and Scout Pistol
- Ammo, reloading, rarities, shield/health pickups, harvesting trees and rocks
- Three constructible wood structures (walls, ramps and floors), purchased with gathered wood/stone
- Multiple damaging storm phases with a shrinking safe zone and minimap
- Browser-based main menu, how-to-play panel, HUD, map, pause, and results screens

This is an **early solo-only preview**, not a production-ready online battle royale. Bots simulate combat locally in the browser and are not server-authoritative. Online games, persistence, real matchmaking, full animations, accurate collision, proper weapon ballistics and deep environment art are still planned work. Existing Airsoft Arena and Brick Battlegrounds source remains in the repository for reference but is no longer loaded by the current build.

## Run locally

Requires Node.js 22 or later.

    npm install
    npm run dev

Open the Vite local URL. For a production build:

    npm run build
    npm start

The static server serves the built game and responds to GET /health.

## Controls

| Action | Keyboard / mouse | Controller |
| --- | --- | --- |
| Move | WASD | Left stick |
| Look | Mouse | Right stick |
| Sprint | Shift | Keyboard for now |
| Jump | Space | A / Cross |
| Crouch | C | Keyboard for now |
| Shoot / harvest | Left click | Right trigger |
| Aim | Right click | Left trigger |
| Reload | R | X / Square |
| Pick up loot | E | Y / Triangle |
| Select hotbar | 1–5, Q for harvest | Shoulder buttons |
| Build mode | V | Keyboard for now |
| Choose wall / ramp / floor | F / G / H | Keyboard for now |
| Map | M | Keyboard for now |
| Pause | Escape | Keyboard for now |

Gamepad support is preliminary. Controller mappings and smooth input need further device testing.

## Active entry points

- client/index.html — loads the new game
- client/src/fartnite.js — gameplay, AI, camera, loot, match lifecycle, UI
- client/src/fartnite-world.js — original map, character and structure geometry
- client/src/fartnite.css — redesigned UI and HUD
- server-fartnite.js — static production server
- tests/fartnite.pw.ts — browser smoke tests

## Backups

The existing Airsoft Arena/FartNite rename build is preserved on the branch:

    backup-airsoft-before-fartnite-br

Older source files were deliberately retained rather than deleted.

## Naming and IP note

General game concepts and mechanics can be used to create original games, but copyrighted graphics, audio, levels, maps, character designs, and other protected expression should not be copied. FartNite is an independent prototype with original art and naming within the game. The currently requested project name may still pose trademark/confusion questions given its similarity to Fortnite; verify independently before a public commercial release.
