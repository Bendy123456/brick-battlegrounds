"""Build only the C-option Cover Circuit as an independent Blender layer.

The existing professional warehouse is kept untouched. This script reuses
every modeled cover function and material from build_arena_v2.py, but selects
only the 82 new cover-circuit objects from the shared physics JSON. The new
editable .blend and lightweight GLB overlay align exactly with the server.

  blender --background --python art/build_cover_layer.py
"""
from pathlib import Path
base=Path('art/build_arena_v2.py').read_text(encoding='utf-8')
def swap(old,new):
 global base
 assert base.count(old)==1,(old[:75],base.count(old))
 base=base.replace(old,new)
swap("for b in LAYOUT['obstacles']:",
 "for b in [o for o in LAYOUT['obstacles'] if o['id'].startswith('cover-')]:")
swap("wear_floor();cargo_detail();safety_details();brand_environment();support_frame()",
 "# The warehouse and its stage decorations are already shipped in arena.glb.")
swap("dramatic_floor_zones()\nelevated_team_gateway(-34,'red')\nelevated_team_gateway(34,'blue')\ncenter_command_pavilion()",
 "# The illuminated team gateways and floor are already present in arena.glb.")
swap("for xx in [-41,41]:\n for zz in [-26,0,26]:\n  worklight('LOWER_BAY_LIGHT',xx,10.9,zz)",
 "# Overhead lighting remains in the base industrial arena model.")
swap("'the_arena_v2.blend'","'cover_circuit.blend'")
base=base.replace("'arena.glb'","'cover_circuit.glb'")
assert "cover_circuit.glb" in base and "cover_circuit.blend" in base
compile(base,'art/build_arena_v2.py','exec')
print('COVER_LAYER_SOURCE_VALID',flush=True)
exec(compile(base,'art/build_arena_v2.py','exec'),{
 '__name__':'__main__',
 '__file__':'art/build_arena_v2.py'
})
