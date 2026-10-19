"""Render a neutral-angle studio visual QA of artist-authored hand/weapon fit."""
import bpy,math
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath="art/weapons/vanguard.blend")
# Disable ONE_HAND, expose TWO_HAND
for ob in bpy.data.objects:
    if ob.name.startswith("GRIP_ONE_HAND"):
        ob.hide_render=True
    if ob.type in ('ARMATURE','LIGHT','CAMERA'):
        ob.hide_render=True
bpy.ops.object.camera_add(location=(1.0,-1.55,1.05))
camera=bpy.context.object
target=Vector((0,.23,-.13))
direction=target-camera.location
camera.rotation_euler=direction.to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO'
camera.data.ortho_scale=1.48
bpy.context.scene.camera=camera
bpy.context.scene.render.engine='BLENDER_WORKBENCH'
bpy.context.scene.display.shading.light='STUDIO'
bpy.context.scene.display.shading.color_type='MATERIAL'
bpy.context.scene.display.shading.show_shadows=True
bpy.context.scene.display.shading.show_cavity=True
bpy.context.scene.display.shading.cavity_type='BOTH'
bpy.context.scene.render.resolution_x=780
bpy.context.scene.render.resolution_y=620
bpy.context.scene.render.resolution_percentage=100
bpy.context.scene.render.image_settings.file_format='JPEG'
bpy.context.scene.render.image_settings.quality=58
bpy.context.scene.render.filepath='/tmp/vanguard-real-hand-preview.jpg'
bpy.ops.render.render(write_still=True)
print('ANATOMICAL_RIFLE_PREVIEW_RENDERED',flush=True)
