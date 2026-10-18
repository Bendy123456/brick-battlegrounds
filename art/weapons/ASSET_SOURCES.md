# Brick Battlegrounds — authored weapon mesh sources

The nine replacement game viewmodels are **adaptations of artist-authored 3D weapon meshes**, not hand-sculpted originals made by ChatGPT. These are bundled from an upstream game-asset project that identifies the sources and licenses:

- Source distribution: https://github.com/cktang88/3d-fps/tree/main/public/assets/models/weapons
- Upstream asset/artist acknowledgments: https://github.com/cktang88/3d-fps#credits--licences
- The upstream fallback gun set combines public-domain/CC0 assets, and CC BY licensed models for certain items. Attribution retained below.
- **SCAR-L / Ranger**: AdamKokrito, “ScarL”, CC BY 3.0, https://poly.pizza/m/ab1V8RlPDc — modified for Brick Battlegrounds.
- **Shotgun / Breacher**: Harry_L (source acknowledged by Mugen87/dive), CC BY, https://sketchfab.com/models/53b158b0d5a54b4491b09d1fb3058e29 — modified for Brick Battlegrounds.
- **Other meshes** (M4A1, MP5A5, VSS, AK-47, M24, P226, M1911) are derived from the upstream Operation Steel Tide / Quaternius / Nisu / Taradavies CC0 source set as documented in the upstream README, with adaptation and redistribution here.

Every weapon mesh is modified for the game by normalizing orientation and size and adding a visibly orange airsoft replica muzzle guard and bare dark forearm/hand viewmodel parts. Original meshes and any associated embedded textures retain their respective licenses; the project's original graphics/code have separate licensing.

Download mapping:
- `vanguard` ← `m4a1.glb`
- `ranger` ← `scarl.glb`
- `specter` ← `vss.glb`
- `atlas` ← `ak47.glb`
- `whisper` ← `mp5a5.glb`
- `breacher` ← `shotgun.glb`
- `watcher` ← `m24.glb`
- `echo` ← `p226.glb`
- `tempo` ← `m1911.glb`

The source repository URL and revisions are documented in the importer workflow for reproducibility.
