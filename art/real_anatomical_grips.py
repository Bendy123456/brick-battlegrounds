"""Use CC0 artist-modeled anatomical hands instead of procedural primitives.
Original: Innerscene Posable Anatomical Right Hand, MakeHuman CC0, 8120 vertices.
Nine airsoft weapon rigs receive individual wrist/trigger/support contact poses.
"""
import bpy
from mathutils import Vector,Matrix
from anatomical_grips import GRIPS,vertex_points,contact_point,sculpt_mesh

HAND_ASSET='/tmp/cc0-posable-hand.glb'
def weighted(mesh,source,group_name):
    g=source.vertex_groups.get(group_name)
    if not g:return None
    total=Vector((0,0,0));weight=0
    for i,v in enumerate(source.data.vertices):
        for w in v.groups:
            if w.group==g.index and w.weight>.10:
                total+=mesh.vertices[i].co*w.weight;weight+=w.weight
    return total/weight if weight>.0001 else None

def baked_pose(source,rig,hand,bend):
    for p in rig.pose.bones:
        p.rotation_mode='XYZ';p.rotation_euler=(0,0,0)
    for p in rig.pose.bones:
        chunks=p.name.lower().split('_')
        if len(chunks)<3 or chunks[0] not in ('index','middle','ring','pinky','thumb'):continue
        finger=chunks[0];level=int(chunks[1])
        if finger=='thumb':a=[.30,.42,.20][level-1]
        elif finger=='index':a=[.35,.62,.58][level-1]
        else:a=[.70,.82,.60][level-1]
        p.rotation_euler.z=a*bend
    bpy.context.view_layer.update()
    dg=bpy.context.evaluated_depsgraph_get()
    ob=source.evaluated_get(dg)
    mesh=bpy.data.meshes.new_from_object(ob,preserve_all_data_layers=True,depsgraph=dg)
    assert len(mesh.vertices)>=7500,('Hand geometry missing',len(mesh.vertices))
    mesh.transform(source.matrix_world)
    if hand=='LEFT':
        mesh.transform(Matrix.Scale(-1,4))
        mesh.flip_normals()
    return mesh

def basis(fwd,side):
    f=fwd.normalized()
    a=(side-f*side.dot(f)).normalized()
    n=a.cross(f).normalized()
    return Matrix((a,f,n)).transposed()

def slender_forearm(name,origin,hand,material,parent,pistol):
    sign=1 if hand=='RIGHT' else -1
    x,y,z=origin
    length=.19 if pistol else .26
    rings=[
       ((x+sign*.110,y-length,z-.210),.050,.056),
       ((x+sign*.095,y-length*.84,z-.172),.052,.056),
       ((x+sign*.061,y-length*.62,z-.130),.046,.049),
       ((x+sign*.033,y-length*.37,z-.075),.040,.042),
       ((x+sign*.012,y-.055,z-.025),.033,.035),
       ((x,y,z),.029,.032)]
    arm=sculpt_mesh(name+' slim bare forearm',rings,material,28)
    transform=arm.matrix_world.copy()
    arm.parent=parent;arm.matrix_world=transform

def make_real_grips(weapon_id,klass,materials,gun_meshes,lo,hi):
    assert weapon_id in GRIPS
    original=set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=HAND_ASSET)
    incoming=[o for o in bpy.data.objects if o not in original]
    source=next((o for o in incoming if o.type=='MESH' and len(o.data.vertices)>7500),None)
    rig=next((o for o in incoming if o.type=='ARMATURE'),None)
    assert source and rig,'CC0 detailed hand import missing armature/mesh'
    conf=GRIPS[weapon_id]
    verts=vertex_points(gun_meshes)
    right=contact_point(verts,lo,hi,conf['right'],conf['right_z'],1,conf['right_shift'])
    left=contact_point(verts,lo,hi,conf['left'],conf['left_z'],-1,conf['left_shift'])
    pistol=klass=='pistol'
    count=0
    for mode in ('ONE_HAND','TWO_HAND'):
        parent=bpy.data.objects.new('GRIP_'+mode,None)
        bpy.context.collection.objects.link(parent)
        parent['weapon_id']=weapon_id
        parent['hand_source']='Innerscene MakeHuman CC0 anatomical hand'
        hands=[('RIGHT',right)]+([('LEFT',left)] if mode=='TWO_HAND' else [])
        for hand,contact in hands:
            mesh=baked_pose(source,rig,hand,.78 if hand=='RIGHT' else 1.12)
            palm=weighted(mesh,source,'hand_r')
            middle=weighted(mesh,source,'middle_03_r')
            thumb=weighted(mesh,source,'thumb_02_r')
            pinky=weighted(mesh,source,'pinky_02_r')
            assert all(v is not None for v in (palm,middle,thumb,pinky)),'Missing hand skin-weight groups'
            fwd=middle-palm
            across=thumb-pinky
            assert fwd.length>.015 and across.length>.012,'Degenerate finger geometry'
            sign=1 if hand=='RIGHT' else -1
            target_fwd=Vector((-.13*sign,.06,-.989)).normalized()
            target_across=Vector((0,sign,0))
            rotate=basis(target_fwd,target_across) @ basis(fwd,across).transposed()
            factor=(.120 if hand=='RIGHT' else .127)/fwd.length
            factor=max(.48,min(1.45,factor))
            target=Vector(contact)+Vector((sign*.035,-.014,-.016))
            mesh.transform(Matrix.Translation(target) @ rotate.to_4x4() @ Matrix.Scale(factor,4) @ Matrix.Translation(-palm))
            name=weapon_id+' '+mode+' '+hand+' REAL ANATOMICAL CC0 HAND'
            ob=bpy.data.objects.new(name,mesh)
            bpy.context.collection.objects.link(ob)
            mesh.materials.clear();mesh.materials.append(materials['skin'])
            mesh.materials.append(materials['nail'])
            mesh.update()
            # Nail-color polygons on the actual skinned fingertip mesh, not
            # extra primitive-shaped artificial fingers. Keep it subtle.
            for tip_bone in ('index_03_r','middle_03_r','ring_03_r','pinky_03_r','thumb_03_r'):
                tip=weighted(mesh,source,tip_bone)
                if tip is None:continue
                viable=sorted(mesh.polygons,key=lambda p:(p.center-tip).length_squared)
                # One or two small faces per digit are sufficient to convey
                # natural bare nails without overly contrasting blocks.
                for face in viable[:2]:face.material_index=1
            for poly in mesh.polygons:poly.use_smooth=True
            ob.parent=parent
            ob['fingers']='five bone-posed, connected fingers'
            slender_forearm(weapon_id+' '+mode+' '+hand,tuple(target-target_fwd*.045),hand,
                            materials['arm'],parent,pistol)
            count+=1
            print('REAL_HAND_CONTACT',weapon_id,mode,hand,'vertices',len(mesh.vertices),
                  'factor',round(factor,3),'position',tuple(round(v,3) for v in target),flush=True)
    for obj in incoming:
        bpy.data.objects.remove(obj,do_unlink=True)
    assert count==3
    print('CC0_REAL_ANATOMICAL_HANDS_OK',weapon_id,'hand_meshes',count,flush=True)
