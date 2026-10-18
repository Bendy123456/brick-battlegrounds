# BRICK BATTLEGROUNDS — v0.8.31 ANIMATION POLISH

- Buffered four-hit combos ease into the next strike's windup rather than returning both hands to neutral.
- Impact-sensitive stagger lengths: light 0.32 seconds, heavy 0.54, Spinjitzu 0.27, guard-break 0.72; 1.65-second knockdowns remain unchanged. Multiplayer relays the attack kind for matching victim reactions.
- Classic figures have a real ankle pivot for cosmetic level-foot stabilization, gait/strike support-foot weighting and limited floor correction while the gameplay root and hitboxes stay unchanged.
- Procedural knockdowns feature a progressive collapse, settling motion, sideways roll, hand push-off and smoother easing back to relaxed stance. These are authored procedural poses, not physics-simulated ragdolls.
- Online fighter rotation now follows the shortest arc, and walking cycles respond to the movement actually received from the other player.
- Combat inputs, damage, attack hitframes, Spinjitzu durations/cooldowns, stage, and reconnect recovery are preserved. Browser play-testing is still recommended.


- Replaced electronic-sounding pitched combat beeps with buffer-rendered toy-plastic clacks: inharmonic shell resonances, hard-edge transients, short rattle patterns and five natural variations per hit type.
- Light hits, heavy hits, blocking, guard breaks, Spinjitzu contact and knockdowns have distinct plastic sounds. Swings, dodges and jumping now use low-key broadband air movements, not descending musical tones.
- Rebuilt the 2-second Spinjitzu sound as a wide-band, continuously swirling wind vortex with independent slow gusts, quick swirls, swept air bands, and gentle stereo motion when available. Abrupt interruption or match exit fades it safely.
- Pre-generated one-shots are cached for performance; one shared 4-second noise buffer feeds both possible fighters' vortices. A soft dynamics compressor tames piled-up effects.
- No recorded LEGO audio is claimed: these are original procedural sound approximations requiring no external asset licenses or network downloads. Game mechanics, hit detection, online networking and controls stay unchanged.


- Fixes matches silently freezing when a WebSocket dies: both browsers now show a clear reconnecting/waiting message and pause game time instead of letting attacks occur against a frozen opponent.
- Each room slot has a unique ephemeral recovery token; a player can automatically resume the exact same player slot within 30 seconds after a dropped connection. Other player sees pause/resume status.
- Server and client now use WebSocket heartbeat checks and periodic ping/pong, detect stale incoming player-state packets, cap state-message backpressure and properly report failed restores.
- Prevents duplicate spawn slots if the host leaves and another friend joins; reconnects retain original slot and selected character.
- Server no longer depends on disconnected WebSocket objects as room roster entries. If the Node service restarts and loses in-memory rooms, a clear room-expired message appears instead of a frozen fight.
- Existing 3D arena, controller mappings, damage and hitboxes, sound effects, Spinjitzu, CPU solo mechanics and rendering remain unchanged.


- Replaced generic bass-heavy punches with dry, layered, slightly randomized plastic clicks and hollow LEGO-like clacks for clean light strikes, heavier double impacts, blocks, guard breaks and knockdowns.
- Replaced the short synth Spinjitzu cue with sustained two-layer rushing wind, softly modulated to swirl while the actual 2-second ability is active; it fades immediately when the move finishes, is interrupted, a round ends, or a match is exited.
- Kept hits during Spinjitzu quiet beneath the dominant wind effect. No samples or additional downloads. Sound toggle and M mute remain.
- Changes are audio-only; fighters, map, effects, 2s Spinjitzu duration, 8s cooldown, hit timing, movement and online networking remain untouched.


- Procedural Web Audio sound design for light/heavy swings, impacts, block, guard break, jumps, directional dashes, elemental Spinjitzu and knockdowns (no downloaded samples).
- Glowing hit rings, restrained decaying camera shake, and 20–80 ms solo-only hit-stop to make impacts readable.
- Buffered one-shot combat inputs during hit-stop, preventing dropped inputs when freezing action. Online fight simulations are never hit-stopped.
- In-match sound toggle and keyboard M mute shortcut with a locally saved preference. Browsers require an initial user gesture to enable Web Audio.
- Existing damage, hitboxes, 150 health, attack/combo timing, guard and dash cooldowns, Spinjitzu cooldown/duration, input mappings, CPU logic, map and online protocol are unchanged.
- Physical controller feel and actual browser audio/visual performance should be verified in a manual live match.


Online-ready browser fighting game with original brick ninja fighters and a fully playable 3D mountain monastery courtyard.

## What's new

- **v0.8.26 — Mountain Monastery Arena:** Replaced the dark blue sea/island combat backdrop with a bright, fully modeled mountainside monastery, built directly into the existing Three.js match scene. Retains the exact original eight-sided stone combat floor footprint and elevation. New scenery includes a two-tiered main shrine with curved roof geometry and warm gold eaves, two flanking halls, a monumental entrance gate, detailed latticed screens, mountain terraces, three 360-degree distant peak rings, procedural alpine sky and atmospheric fog, a GPU-instanced pine grove, blossoming trees, stone lanterns, banners, a staircase, aged parapets, and engraved courtyard flagstones. Static decorative geometry is baked into 16 shared-material batches for low draw-call overhead (simulation: 36 scene meshes versus 659 before batching; excludes combat fighters). New scenery is non-colliding and entirely outside the combat boundary. **Damage, hit detection, movement, arena boundaries, controller/keyboard inputs, character models, animations, dashes, Spinjitzu, online networking and camera framing are unchanged.** Automated scene-construction and preservation checks passed; on-site visual review remains to be done.


- **v0.8.25 — Spinjitzu fighter containment:** Updated the playable 3D effect so the visible LEGO minifigure tucks arms/legs inward and eases down to 59% of its normal visual size, while lifting into the tornado's wide center. This prevents stray hands, head and feet from extending beyond the neon energy funnel. It grows back naturally as the tornado dissipates; interrupts and knockdowns restore normal visual scale, position and yaw. The gameplay root, hitboxes, 2-second duration, five-hit timing/damage, 8-second cooldown and online sync are not changed. Simulated intro/active/recovery/interruption transform checks passed.

- **v0.8.24 — Reference-matched Spinjitzu energy:** Reworked the actual in-game Three.js vortex to resemble the supplied bright green show reference: a tall inverted funnel, wide luminous top, concentrated swirling midsection and tight base. Added 116 partially broken, gently slanted, almost-horizontal wind streaks batched into two GPU meshes, plus 15 flowing helix ribbons, 4 rippling translucent shells, 240 soft round sparks, and stronger ground lighting/impact flare. Sharper, layered shader stripes create the sense of rapid rotational motion and soft glowing energy instead of obvious block geometry. Each of the nine ninja colors has an enhanced neon elemental variant; Verdant uses a vivid lime-green glow. Kept all Spinjitzu combat logic untouched (2-second duration, five hits, finisher ragdoll, 8-second cooldown, E/R1/RB), along with multiplayer, other attacks and dashes. Runtime geometry/color/pose tests passed across all nine fighter colors. This update changes the live-game procedural 3D effect, not a static image or Blender render.


- **v0.8.23 — Cinematic Spinjitzu visual overhaul:** Replaced the rigid five tubes, four solid rings, faceted tetrahedron particles, and simple cylinder with a three-layer animated cyclone of translucent shader-driven energy, twelve broad/tapered spiraling wind ribbons, 105 soft round GPU spark sprites, and an animated arena-floor aura. Vertex/fragment shaders deform the vortex and create flowing/highlighted spiral streaks rather than just rotating rigid meshes. The fighter remains visible inside, performing ten fully eased rotations. Reuses geometry/materials for efficiency, retains all nine fighter-element colors, and does not modify the 2s move, 8s cooldown, five-hit damage, knockdown, controls, multiplayer, or other animations. Runtime geometry/keyframe/color checks passed for all nine. This is a live Three.js shader effect, not a Blender-exported mesh; the development environment did not have Blender installed.

- **v0.8.22 — Elemental Spinjitzu:** Replaced the one-hit 1.02s Special Attack with a playable, 2-second, target-seeking Spinjitzu vortex. All nine fighters get the same procedural live Three.js tornado (5 spiraling tube ribbons, tapered cyclone core, rotating rings and embers) tinted to their selected roster color. The minifigure spins inside with guarded arms, tucked knees, eased windup, ten full turns and smooth landing. Five spaced hit checks land at 0.38/0.74/1.10/1.46/1.80 seconds, dealing 5/5/5/5/8 damage when unblocked and in range; the fifth confirmed unblocked hit knocks the opponent back and starts the existing ragdoll-style knockdown. Guarding or evading the finisher prevents knockdown. The existing 8s cooldown and E / PS5 R1 / Xbox RB controls are preserved. Multiplayer carries the finisher flag through the existing WebSocket hit relay so both players see the push/knockdown. Other combat moves, dash distances and cooldowns, roster colors, and controls are unchanged. Tornado geometry is reused instead of recreated on each activation.

- **v0.8.21 — Animation director pass:** Reworked all four light-combo poses, both heavy impacts, and all four directional dash clips to use continuous, per-joint monotone cubic motion rather than coming to a halt at every intermediate keyframe. The classic animation table now specifies each joint only at intentional key times, removing automatic rest-angle resets that produced hand and knee popping. Retimed guard raising, punch extension, front-kick recoil and heavy roundhouse unfolding. Reviewed approximate articulated 3D pose silhouettes and corrected overly low punching fists by balancing torso pitch/rotation against the shoulder drive; the forward punch-dash shares the same correction. Strike-phase visual bob settles into the support foot. The existing nine classic models, all original attack contact frames/durations, four-hit sequence, stuns/ragdolls, damage/hitboxes, dash travel, 2s/1s dash cooldowns, inputs and online state format are unchanged. Kinematic tests at 60 FPS passed for every attack and dash, including guarded off-hand, reset to idle, and stable clip endpoints.

- **v0.8.20:** Backward backflip dash speed increased from 14.5 to 19.5 (~34.5% more travel) with the same .48s animation. Added a per-fighter shared dash cooldown, starting on dash activation: 2.0 seconds for forward and backward, 1.0 second for left/right. Dash input is blocked until the cooldown expires, and the timer clears on every new round. Original controller/keyboard/touch controls, directional animations, dash i-frames, collision, damage, other dash speeds and multiplayer message formats are unchanged. Simulated game-tick tests passed for each direction and confirmed the new backward travel distance.

- **v0.8.19:** Added clear body-weight leaning throughout punches, kicks, and all four directional dash animations. The three punch animations and opening heavy hook drive the torso and cosmetic fighter forward on impact; the snapkick and heavy roundhouse counterbalance backward. Mirrored left/right sidesteps now roll toward travel, the forward punch-dash stays committed to forward tilt, and the backflip gets shaped takeoff/landing lean. The rest stance remains unchanged. All animation-only changes preserve attack contact times/duration, damage, dash speed/distance, collision, i-frames, controller input and multiplayer state. Verified all five attack recovery clips and four dashes at simulated 60 FPS.

- **v0.8.18:** Reanimated all four directional dashes with articulated upper/lower limbs and eased cinematic keyframes. Forward now drives a guarded straight punch from a cocked elbow, lateral sidesteps use mirrored foot push-off and body counter-lean, and backward dash features a full tucked backflip with deliberate untuck and landing. Smoothed transitions and verified the full rig returns to relaxed idle. Dash durations (forward .36s; sides .32s; back .48s), speeds, distance, Q/Circle/B control, i-frames, collision and network synchronization remain unchanged.

- **v0.8.17:** Punch animations now follow an articulated guard → elbow-back coil → forward hand drive → recoil sequence, instead of swinging the straight arm up. The first two light punches, fourth-hit left hook, and the heavy opening hook are updated. The opposite hand stays up, elbows visibly retract, and knuckles travel forward on contact. Right kick and heavy roundhouse remain unchanged, as do damage, hit timing, input, stun/ragdoll and networking. Pose-kinematic and frame-to-idle transition tests passed for all five clips.

- **v0.8.16:** Animation-only upgrade to all nine classic fighters' four-hit light combo and two-impact heavy hook/roundhouse. Stronger anticipation, longer readable extensions, opposite-hand guard during punches, greater hip-to-shoulder torque, more expressive knee lift, full kick re-chamber and controlled recoil back to relaxed idle. Existing 0.2304/0.3795/0.240 and 0.375/0.900 second hit moments, move durations, combo/ragdoll/stun logic, input bindings and networking are unchanged. All five pose clips and idle transitions were numerically checked.

- **v0.8.15:** Implemented the cinematic black-fog character selection screen directly in the playable menu. Added drifting charcoal fog and subtle embers, replaced the compact confirmation panel with a larger, beveled black-and-gold fighter card, and upgraded the ability badge and Back/Confirm buttons to premium gold-trimmed styling. The fighter title and brushed accent use each selected character's true color. This is live DOM/CSS, not a static menu image: all nine clickable head icons, abilities, character choices, controller selection, and solo/online Confirm flows remain active. Includes narrow-screen and reduced-motion adjustments.

- **v0.8.14:** Add a small matching-color neck connector below each of the nine head-only character select icons. Head size, color, selected ring, 3×3 grid, menu buttons and all combat models remain unchanged.

- **v0.8.13:** Updated all nine centered character-selection portraits to show only the actual classic LEGO-style colored head and top stud, without torso, arms, or legs. Preserves each original roster color, selected highlight, fighter ability panel, controller selection and Confirm/online flows. In-game character models are unchanged.

- **v0.8.12:** Character select now centers all nine classic minifigure icons in a 3×3 grid. The large right-side card and decorative speed/power/guard stats are removed; selecting an icon reveals a compact fighter-name and ability panel directly below. The game currently provides the same 8-second-cooldown Special Attack to every fighter, rather than distinct character powers. All roster colors, solo Confirm, controller menu navigation and multiplayer room/ready flow are preserved.

- **v0.8.11:** Reworked the full-screen live 3D menu dojo so the shoji wall and roof dissolve into charcoal darkness instead of a blue enclosed room. Warm neutral fill and lantern lights, distance fog, subtle procedural floating haze, and a stronger edge vignette replace the cold backdrop. Fighter sizes/positions, title, main-menu buttons, roster-after-Fight and online matchmaking are unchanged.

- **v0.8.10:** Removed the floating Crimson/Verdant names and VS label from the full-screen menu. Moved the live LEGO fighters to opposite sides of the centered title, turned both slightly inward, and kept their original model scale. Their podiums follow their responsive positions, while Fight → roster and online room flows are unchanged.

- **v0.8.9:** Full-screen cinematic home menu. Crimson and Verdant remain the same-sized live 3D models in a now-wide dojo; the giant logo is centered near the top and premium Fight / Create / Join buttons are centered at the bottom. Removed the old blue split panel and kept the nine-fighter roster exclusively after selecting Fight, with all online room flows and combat rules unchanged. Responsive small-screen layout and reduced-motion behavior remain supported.

- **v0.8.8:** Redesigned home screen: cinematic dojo environment with actual, live Three.js Crimson and Verdant classic minifigures, subtle idle and showcased combat animations, theatrical lighting, action-focused controls and responsive layouts. **No roster on the home screen**: selecting Fight the Bot opens the nine-fighter selection screen. Online rooms preserve the existing Create / Join → Waiting → Character Select workflow. The dojo loads separately and gracefully falls back if WebGL is unsupported; combat and controls are unchanged.

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
4. After the new Render deployment becomes **Live**, hard-refresh your website (Ctrl+Shift+R) and verify the menu shows **v0.8.8 CINEMATIC DOJO** at the top.
5. Start Fight the Bot, select a fighter, test M1 combo, R heavy, and Q with W/A/S/D, read 150 HP in the HUD, and verify fullscreen and FPS counter.

Do not upload only the ZIP file to GitHub; unpack it first. Keep the `public` directory name and structure unchanged.

## Requirements

Node.js 18+ and `npm install` for local server testing. Start with `npm start`; open the localhost port in a browser. The Node WebSocket server is required for online rooms. On Render, `npm install` and `npm start` are the intended build/start commands.

## Known limitations

- Local browser graphics and physical controller behavior have **not** been validated in the authoring environment; test against your live Render deployment.
- 60 FPS depends on your device, resolution and browser settings.
- Multiplayer is experimental and currently trusts client reports of hits and player state; it needs server-authoritative validation and latency handling before competitive public use.
- This is an original minifigure-inspired visual style, not licensed LEGO artwork or game assets.
