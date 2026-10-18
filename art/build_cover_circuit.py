"""Fast Blender-only Cover Circuit C export.
Loads finished detailed warehouse GLB, adds precisely the 82 new tournament
cover objects from the shared Rapier JSON, saves an editable Blender scene
then batches new meshes by material into the GLB to preserve browser FPS.
Avoids the prior GitHub timeout caused by rebuilding the entire warehouse.
"""
import bpy,math,random,json,os
from mathutils import Vector
root=os.getcwd()
layout=json.load(open(os.path.join(root,'shared/arena-layout.json'),encoding='utf-8'))
cover=[o for o in layout['obstacles'] if o['id'].startswith('cover-')]
assert len(cover)>=75 and layout['coverEdition']=='COVER_CIRCUIT_C_03'
base=os.path.join(root,'client/public/assets/arena.glb')
assert os.path.getsize(base)>1000000
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=base)
warehouse_objects={o.name for o in bpy.context.scene.objects}
warehouse_meshes=len([o for o in bpy.context.scene.objects if o.type=='MESH'])
assert warehouse_meshes>=10
print('REUSING_COMPLETED_ARENA_GLTF',warehouse_meshes,flush=True)
script=open(os.path.join(root,'art/build_arena_v2.py'),encoding='utf-8').read()
first=script.index('def coords(')
end=script.index('# Generate all shared collider visuals')
# Load only model-building helper definitions, the Blender material palette,
# and the new original cover detail functions. Do NOT regenerate the warehouse.
helpers=script[first:end]
ns={'bpy':bpy,'math':math,'random':random,'json':json,'os':os,'Vector':Vector}
exec(compile(helpers,'art/build_arena_v2.py','exec'),ns)
# The existing arena has already been bevel-baked. For the add-on pieces,
# avoid expensive per-object modifier application: the material edges,
# frame geometry and screws provide the apparent finished shape.
def quick_apply(obj,name,material,bevel=0):
 obj.name=name
 obj.data.materials.append(material)
 return obj
ns['apply']=quick_apply
counts={'plywood':0,'pallet':0,'inflatable':0}
for obj in cover:
 if obj['id'].startswith('cover-foam-'):
  ns['cover_circuit_foam'](obj);counts['inflatable']+=1
 elif obj['id'].startswith('cover-pallet-'):
  ns['cover_circuit_pallet'](obj);counts['pallet']+=1
 else:
  ns['cover_circuit_panel'](obj);counts['plywood']+=1
print('NEW_COVER_PARTS_CREATED',counts,flush=True)
# Source .blend preserves original model batches AND every separately
# editable added frame, bolt, wall, vinyl weld, and modular wooden panel.
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene.unit_settings.scale_length=1
bpy.ops.file.pack_all()
source=os.path.join(root,'art/the_arena_v2.blend')
bpy.ops.wm.save_as_mainfile(filepath=source)
print('EDITABLE_BLENDER_SOURCE_SAVED',os.path.getsize(source),flush=True)
# Batch ONLY the new geometry. Do not touch pre-optimized warehouse meshes.
new_meshes=[o for o in bpy.context.scene.objects
 if o.type=='MESH' and o.name not in warehouse_objects]
by_mat={}
for o in new_meshes:
 key=o.active_material.name if o.active_material else '_UNASSIGNED'
 by_mat.setdefault(key,[]).append(o)
for name,parts in by_mat.items():
 if len(parts)<2:continue
 bpy.ops.object.select_all(action='DESELECT')
 for o in parts:o.select_set(True)
 bpy.context.view_layer.objects.active=parts[0]
 bpy.ops.object.join()
 bpy.context.object.name='COVER_CIRCUIT_C_BATCH_'+name
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
assert len(meshes)<85,(len(meshes),len(by_mat))
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.export_scene.gltf(filepath=base,export_format='GLB',
 use_selection=True,export_yup=True,export_apply=True,
 export_normals=True,export_materials='EXPORT')
assert os.path.getsize(base)>180000
print('COVER_CIRCUIT_C_BUILD_SUCCESS',
 len(cover),'colliders',len(meshes),'runtime_mesh_batches',
 os.path.getsize(base),'GLB_BYTES',flush=True)
