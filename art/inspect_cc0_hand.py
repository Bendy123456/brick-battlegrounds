"""Inspect a CC0 author-modeled anatomical 16-bone hand in Blender."""
import bpy
from mathutils import Vector
bpy.ops.wm.read_factory_settings(use_empty=True)
p="/tmp/cc0-posable-hand.glb"
bpy.ops.import_scene.gltf(filepath=p)
for ob in bpy.data.objects:
 print("CC0_HAND_OBJECT",ob.name,ob.type,"loc",list(round(x,4) for x in ob.location),
 "scale",list(round(x,4) for x in ob.scale),flush=True)
 if ob.type=="MESH":
  bb=[ob.matrix_world @ Vector(c) for c in ob.bound_box]
  lo=[min(p[i] for p in bb) for i in range(3)]
  hi=[max(p[i] for p in bb) for i in range(3)]
  print("CC0_HAND_MESH",ob.name,"vertices",len(ob.data.vertices),"bounds_min",lo,"bounds_max",hi,
        "modifiers",[(x.type,x.object.name if x.type=="ARMATURE" and x.object else "") for x in ob.modifiers],
        "materials",[m.name for m in ob.data.materials],flush=True)
 if ob.type=="ARMATURE":
  for b in ob.data.bones:
   print("CC0_HAND_BONE",b.name,"parent",b.parent.name if b.parent else None,
         "head",list(round(x,4) for x in b.head_local),
         "tail",list(round(x,4) for x in b.tail_local),flush=True)
print("CC0_HAND_IMPORT_INSPECT_DONE",flush=True)
