# FartNite — Original Stylized Art Direction v2
**Reference scope:** broad visual principles of colorful, early-era low-poly / painterly adventure games. No game's protected environments, textures, silhouettes, character designs, UI graphics, or models are used.

## Compact style guide
| Component | Art rule | Implementation |
|---|---|---|
| Palette | Fresh grass greens #67B552/#B6CE72, ochre #E8CA93, ceramic roof #D27B4E, warm red #C7735A, sky blue #64BDF0, light peach haze #F8D6B2 | Shared procedural paint materials, per-vertex grass wash and tinted rooftop roof tiles |
| Lighting | 130° warm sunlight and cool skylight with long, feathered shadows; fog softens the far field | Warm directional light, hemisphere blue-green ambient, 1536px soft shadows, exponential haze |
| Silhouettes | Chunky, slightly oversized architectural trims and accessories; avoid fine noise | Original modular cottages, orchard barns, vented warehouses, elevated tower beacon |
| Materials | Broad hand-painted brush streaks, lightly uneven base color, tiny number of material families; minimal outlining | Deterministic 128px CanvasTextures; roof and wood variation; no copied image textures |
| Foliage | Rounded poly canopies, sculptural pines, clumped tufts, flowers, pebble fields | Trees plus instanced blades, flower heads and rocks; tree shapes vary by spawn |
| Terrain | Colored meadows, worn soil, shallow beach, layered cliffs, visible navigational paths | Heightmap variation, vertex paint, coast vertical geometry, sandy trails and water shader |
| Characters | Readable at distance; different hair, field gear and vibrant shoulder emblems | Four original field scouts: Meadow Runner, Copper Courier, Tidal Scout, Violet Voyager |
| Weapons | Clean unique profiles that communicate class at a glance, not replicas of existing games | Trailblazer AR, Field Scattergun, Zipline SMG, Ridge Rifle, Scout Pistol; procedurally modeled |
| UI | Original bold italic title, dark navy glass panels, pale citrus accents, high contrast hotbar | Revised lobby, map, HUD, scoreboard and selectable scout skin tiles |
| FX | Readable ephemeral glows that communicate action without obscuring player | Original glider trails, short sparks, harvesting impacts, placement dust, animated storm wall |
| Performance | Target 60 FPS on capable desktop PCs; adapt if GPU-bound | Reused geometries and materials, instanced details, distance visibility, dynamic pixel ratio, live FPS/draw calls |

## Original locations
Bramble Borough (pastel timber lanes), Emberfield Yard (sawtooth industrial buildings), Driftwood Quay (distinct beacon and pier-side huts), Sunspun Acres (terracotta farm sheds and grain barns), Beacon Bluff (remote survey structure), and Larkspur Lane (smaller cottage crossroads). The original topography and radial route structure were authored for this project; no other game's map is reproduced.

## Fidelity and non-copying audit
1. **Buildings** — geometric modular cabin/barn/warehouse/beacon families with our own trims and 3D layout; not reproductions of another title's POIs.
2. **Weapons** — original fictional names, simple primitives, distinct arrangement of barrels/optics/stocks and color bands; no vendor/trademark logos or imported meshes.
3. **Skins** — stylized original field-scout clothing palettes, invented hair/caps, shoulder badges, utility straps and backpacks; no franchise costume.
4. **UI** — FartNite typographic wordmark and bespoke menu/HUD treatment. Note: the requested FartNite name itself is close to Fortnite and might create **trademark** confusion; do a clearance review before public commercialization.
5. **Textures** — all generated in-browser from seeded strokes, vertex tinting and shader math. No third-party textures included in this art pass.
6. **Gameplay** — battle royale mechanics are general concepts; no protected game content imported.

## Quality passes and remaining limitations
- **Pass A, shape/color:** independently designed settlements, tinted painted surfaces, biome scatter and coastline.
- **Pass B, atmosphere/FX:** gradient sky, warm/cool fill, waves, purple animated storm, dynamic glider/weapon/impact effects.
- **Pass C, gameplay legibility/performance:** four skin selections, distinct loot meshes, environmental draw-distance culling, capped pooled particles, adaptive DPR and FPS/draw-call readout.
- **Pass D, regression:** static type tests, unit tests, Playwright lobby/glider/build/map screenshots and deployment checks.
- **Known:** 60 FPS is a target, not a guaranteed result; actual frame rate varies with browser/hardware. Current preview is solo vs local AI and not a production multiplayer release. Bots, map geometry, collision, animated water and shaders need ongoing real-hardware visual testing and iteration.

## General technical sources
- Unreal Engine environment-lighting guide (Epic): https://dev.epicgames.com/documentation/en-us/unreal-engine/artist-02-light-a-scene
- Unity GPU and draw-call optimization: https://unity.com/how-to/gpu-optimization
- Unity shared materials / GPU instancing guidance: https://docs.unity.com/en-us/engine/6000.0/manual/analysis/graphics-performance-profiling/reduce-draw-calls/optimizing-draw-calls-choose-method

**Safety:** This document is a creative art direction and originality review, not a legal opinion or certification of infringement risk.
