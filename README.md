# BRICK BATTLEGROUNDS — v0.8.7 CLASSIC ROSTER

Online-ready browser fighting game prototype using original brick ninja fighters and a procedural dojo courtyard.

## What's new

- **v0.8.7:** All nine fighters now use the same plain, articulated LEGO-style model and the Crimson/Verdant anime combat animations. Each keeps its exact original roster color, and character-select portraits reflect the classic body. The existing dash distance, damage, inputs and knockdown mechanics are unchanged.
- **v0.8.6:** All four directional dashes travel approximately 25% farther at unchanged animation durations and with unchanged damage, dash input mappings and stun rules.

- Exactly **nine** ninja fighters displayed in a **3 × 3** clickable circular portrait roster.
- Individual chest crests and helmet/armor touches across all nine original fighters.
- A new procedural dojo courtyard: octagonal platform, engraved tile crest, lanterns, twin temple buildings, entrance gates, flags and lighting. The fighting space is unobstructed.
- Keyframed, smoothly interpolated character rig poses for left jab, right cross, right kick, new fourth-hit left hook, and the existing heavy hook-and-roundhouse. Attack poses are configurable in `public/combat-poses.js` (degrees and seconds). **All nine roster fighters** now use the exaggerated anime attack set in `public/classic-combat.js`: relaxed arms-down idle, deep punch windups, dramatically wider jab/cross/hook extensions, high-chamber kicks, and waist-driven torso rotation. Their knockdown get-up returns to relaxed idle. All nine fighters share the same rig and poses; jumping and gameplay controls remain unchanged.
- **150 starting health** per fighter. Each unblocked light hit = **10** damage. Heavy is **one button press for two hits**, each hit = **20** damage if it lands (40 total maximum). Blocking mitigates damage; misses do no damage.
- 60 FPS **target**, not guaranteed. On-screen FPS readout in combat. A fullscreen toggle stays available.
- Preserves existing CPU match flow and **experimental** private online rooms (online combat is not yet server-authoritative).
- Menu startup is independent of 3D import, preserving the known click-handler fix.


- **Knockdowns:** Land **4 light hits**, **2 separate heavy attacks (two R presses, at least one impact each)**, or **2 light hits followed by one heavy attack** within 3.5 seconds to trigger a procedural ragdoll-style fall. A blocked attack or taking a hit breaks your chain. The target is stunned for 1 second on clean hits, and knockdowns take 1.65 seconds plus brief wake-up protection. The game has no physical ragdoll engine; this is an animated fall and recovery. Experimental online rooms reuse existing hit messages with stun/knockdown effect flags (combat remains client-trusted, not server-authoritative).

- **New directional dashes:** Q on keyboard or **B / Circle** on a standard gamepad. Hold **W (or stick up)** for a forward punching dash, **A/D (stick left/right)** for side-steps, or **S (stick down)** for an animated backward backflip. Tapping Q without direction defaults to forward; CPU dodges retreat backward. Dashes keep the pre-existing brief invulnerability and stun restrictions. The dash punch is **animation-only**, not an extra damaging hit. **E** now activates Special on keyboard because Q is assigned to dash; controller RB/R1 Special is unchanged. Mobile DODGE button now says DASH. Other damage/hitbox rules are unchanged.

## Controls

Keyboard + mouse: WASD move, **M1 / left-click** light attack (**click up to 4 times** within the combo window for jab/cross/kick/hook), **R** heavy attack (automatically plays the two-hit hook + kick sequence), **L** block, **Q** directional dash, Space jump, **E** special, Tab lock on, **M2 / right-click drag** camera.

Controller (standard Xbox/PS5 browser mapping): left stick move, right stick camera, X/Square light, Y/Triangle heavy, LB/L1 block, B/Circle directional dash, A/Cross jump, RB/R1 special, Menu/Options lock on. Controller mappings may vary across browser/OS setups.

## Deploying to your existing GitHub + Render site

1. Extract this ZIP.
2. Replace the existing repository's **root** `server.js` and `package.json` and the four files in **`public/`** (`app.js`, `arena.js`, `index.html`, `style.css`). You may also replace this README.
3. Commit to `main`; your already-configured Render service should auto-deploy if its setting is enabled.
4. After the new Render deployment becomes **Live**, hard-refresh your website (Ctrl+Shift+R) and verify the menu shows **v0.8.7 CLASSIC ROSTER** at the top.
5. Start Fight the Bot, select a fighter, test M1 combo, R heavy, and Q with W/A/S/D, read 150 HP in the HUD, and verify fullscreen and FPS counter.

Do not upload only the ZIP file to GitHub; unpack it first. Keep the `public` directory name and structure unchanged.

## Requirements

Node.js 18+ and `npm install` for local server testing. Start with `npm start`; open the localhost port in a browser. The Node WebSocket server is required for online rooms. On Render, `npm install` and `npm start` are the intended build/start commands.

## Known limitations

- Local browser graphics and physical controller behavior have **not** been validated in the authoring environment; test against your live Render deployment.
- 60 FPS depends on your device, resolution and browser settings.
- Multiplayer is experimental and currently trusts client reports of hits and player state; it needs server-authoritative validation and latency handling before competitive public use.
- This is an original minifigure-inspired visual style, not licensed LEGO artwork or game assets.
