"""Import real artist-authored CC-licensed airsoft-style weapon meshes, then fit them
with dark bare-hand FPS poses and orange replica tips.

Source license + attribution: art/weapons/ASSET_SOURCES.md.
Do not confuse this asset integration with personally hand-sculpting these meshes.
Run with Blender 3.4+ from repo root after downloading source GLBs:
    blender -b --python art/import_authored_weapons.py
"""
import bpy
import os
import math
import re
from mathutils import Vector, Matrix

ROOT=os.getcwd()
INPUT=os.path.join(ROOT,"art","upstream_weapon_sources")
BLENDS=os.path.join(ROOT,"art","weapons")
OUTPUT=os.path.join(ROOT,"client","public","assets","weapons")
os.makedirs(BLENDS,exist_ok=True)
os.makedirs(OUTPUT,exist_ok=True)
SPECS=[
    ("vanguard","m4a1",1.06,"carbine"),
    ("ranger","scarl",1.13,"rifle"),
    ("specter","vss",.91,"rifle"),
    ("atlas","ak47",1.16,"rifle"),
    ("whisper","mp5a5",.80,"smg"),
    ("breacher","shotgun",1.14,"shotgun"),
    ("watcher","m24",1.40,"sniper"),
    ("echo","p226",.46,"pistol"),
    ("tempo","m1911",.48,"pistol"),
]
def mat(name,hex_value,metal=0,rough=.69):
    m=bpy.data.materials.new(name)
    rgb=tuple(int(hex_value[i:i+2],16)/255.0 for i in (0,2,4))
    m.diffuse_color=(*rgb,1)
    m.use_nodes=True
    p=m.node_tree.nodes.get("Principled BSDF")
    p.inputs["Base Color"].default_value=(*rgb,1)
    p.inputs["Roughness"].default_value=rough
    p.inputs["Metallic"].default_value=metal
    return m

def smooth_obj(o):
    if o.type=="MESH":
        for f in o.data.polygons:f.use_smooth=True

def ellipsoid(name,location,scale,material):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=14,location=location)
    ob=bpy.context.object;ob.name=name
    ob.scale=scale
    bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
    ob.data.materials.append(material)
    smooth_obj(ob)
    return ob

def organic_tube(name,centers,material,sides=16):
    """Variable-section organic loft. (x,y,z,radiusX,radiusZ), y points forward."""
    verts=[];faces=[]
    for x,y,z,rx,rz in centers:
        for j in range(sides):
            a=2*math.pi*j/sides
            verts.append((x+math.cos(a)*rx,y,z+math.sin(a)*rz))
    for i in range(len(centers)-1):
        for j in range(sides):
            n=(j+1)%sides
            faces.append((i*sides+j,i*sides+n,(i+1)*sides+n,(i+1)*sides+j))
    faces.append(tuple(range(sides-1,-1,-1)))
    last=(len(centers)-1)*sides
    faces.append(tuple(last+j for j in range(sides)))
    mesh=bpy.data.meshes.new(name)
    mesh.from_pydata(verts,[],faces)
    mesh.update()
    ob=bpy.data.objects.new(name,mesh)
    bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material)
    smooth_obj(ob)
    return ob

def capsule_between(name,a,b,radius,material,verts=14):
    a=Vector(a);b=Vector(b);d=b-a
    if d.length<.0001:return
    bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=radius,depth=d.length,location=(a+b)/2)
    ob=bpy.context.object;ob.name=name
    ob.rotation_euler=d.to_track_quat('Z','Y').to_euler()
    bevel=ob.modifiers.new("Soft rounded edges","BEVEL");bevel.width=radius*.35;bevel.segments=3
    ob.data.materials.append(material)
    smooth_obj(ob)
    return ob

def shaped_hands(klass,m):
    """Continuous dark bare arms; distinct palm, thumb, knuckles and individual fingers."""
    small=klass=="pistol"
    right_x=.205 if not small else .11
    left_x=-.18 if not small else -.105
    hand_depth=.08 if not small else .10
    support_depth=.50 if not small else .22
    for side,x,depth in [("RIGHT",right_x,hand_depth),("LEFT",left_x,support_depth)]:
        side_sign=1 if side=="RIGHT" else -1
        end_y=depth
        # Forearms enter from below and behind the camera. Low profile and no sleeve.
        start_x=x+side_sign*(.12 if not small else .075)
        organic_tube(side+" BARE FOREARM",[
            (start_x,-.48,-.52,.145,.120),
            (start_x-side_sign*.035,-.29,-.45,.130,.105),
            (x+side_sign*.025,-.08,-.34,.106,.093),
            (x,end_y-.11,-.24,.082,.073),
            (x,end_y-.03,-.205,.075,.070)],m["arm"],20)
        # Individual palm shaped around the replica grip and fore-end.
        ellipsoid(side+" exposed hand palm",(x,end_y,-.195),(.100,.112,.064),m["skin"])
        ellipsoid(side+" thumb pad",(x-side_sign*.045,end_y+.045,-.155),(.040,.078,.044),m["skin"])
        for i in range(4):
            fx=x+(-.055+i*.034)
            curve_sign=1 if side=="RIGHT" else -1
            root=(fx,end_y+.058,-.172)
            mid=(fx+curve_sign*.007,end_y+.099,-.205)
            tip=(fx+curve_sign*.012,end_y+.075,-.243)
            capsule_between(side+" finger%d proximal"%i,root,mid,.018,m["skin"],12)
            capsule_between(side+" finger%d curved tip"%i,mid,tip,.016,m["skin"],12)
            ellipsoid(side+" natural fingernail%d"%i,
                (fx+curve_sign*.013,end_y+.079,-.240),(.012,.017,.0055),m["nail"])
        # Anatomical thumb wraps toward the back of the weapon.
        capsule_between(side+" bent thumb", (x-side_sign*.063,end_y+.044,-.166),
                        (x-side_sign*.017,end_y+.108,-.185),.025,m["skin"])
        ellipsoid(side+" thumb nail",(x-side_sign*.017,end_y+.106,-.176),
                  (.014,.017,.006),m["nail"])

def tip(material,muzzle_y,z):
    """Bright orange, visible hollow airsoft muzzle guard."""
    bpy.ops.mesh.primitive_cylinder_add(vertices=28,radius=.036,depth=.085,
        location=(0,muzzle_y+.030,z))
    ob=bpy.context.object;ob.name="AIRSOFT_ORANGE_TIP_07 - fitted protective orange guard"
    ob.rotation_euler[0]=math.pi/2
    ob.data.materials.append(material)
    bevel=ob.modifiers.new("Rounded muzzle shroud","BEVEL")
    bevel.width=.006;bevel.segments=3
    smooth_obj(ob)
    bpy.ops.mesh.primitive_cylinder_add(vertices=28,radius=.014,depth=.088,
        location=(0,muzzle_y+.031,z))
    bore=bpy.context.object;bore.name="Orange tip / black inset bore"
    bore.rotation_euler[0]=math.pi/2
    bore.data.materials.append(mat("Dark replica bore","090c10",0,.80))

def mesh_extents(meshes):
    lo=Vector((1e12,1e12,1e12));hi=Vector((-1e12,-1e12,-1e12))
    for ob in meshes:
        for c in ob.bound_box:
            p=ob.matrix_world @ Vector(c)
            for i in range(3):
                lo[i]=min(lo[i],p[i]);hi[i]=max(hi[i],p[i])
    return lo,hi

def make(id,src,length,klass):
    path=os.path.join(INPUT,src+".glb")
    assert os.path.isfile(path), "Missing authored source "+path
    bpy.ops.wm.read_factory_settings(use_empty=True)
    bpy.ops.import_scene.gltf(filepath=path)
    all_meshes=[o for o in bpy.data.objects if o.type=="MESH"]
    assert all_meshes,"Source is empty: "+path
    # Imported upstream fallback files contain gun geometry but no skinned gloves.
    # Freeze hierarchy into mesh data while retaining ORIGINAL artist-authored geometry,
    # original UVs, and original material textures.
    for ob in all_meshes:
        ob.data=ob.data.copy()
        ob.data.transform(ob.matrix_world)
    for ob in all_meshes:
        ob.parent=None;ob.matrix_world=Matrix()
    for ob in list(bpy.data.objects):
        if ob.type!="MESH":bpy.data.objects.remove(ob,do_unlink=True)
    lo,hi=mesh_extents(all_meshes)
    span=hi-lo
    # Source barrel axis is +Y in upstream Blender coordinate frame.
    # If a release had z as dominant (different source origin), rotate it.
    if span.z>span.y*1.35:
        for ob in all_meshes:
            ob.data.transform(Matrix.Rotation(-math.pi/2,4,'X'))
        lo,hi=mesh_extents(all_meshes);span=hi-lo
    assert span.y>.01,"Bad weapon length in "+src
    factor=length/span.y
    shift=Vector((-(lo.x+hi.x)*factor/2, -lo.y*factor-.18, -(lo.z+hi.z)*factor/2 + .035))
    transform=Matrix.Translation(shift) @ Matrix.Scale(factor,4)
    # Rebase in destination coordinates, keeping expected 1m-class weapon length.
    for ob in all_meshes:
        ob.data.transform(transform)
        ob.name="AUTHORED "+src+" "+ob.name
    lo,hi=mesh_extents(all_meshes)
    # Imported FPS meshes should be substantially richer than placeholder cubes.
    source_vertices=sum(len(o.data.vertices) for o in all_meshes)
    assert source_vertices>150, "Source too sparse for "+id
    m={
        "skin":mat("DEEP_EBONY_BARE_SKIN_09","140a08",0,.76),
        "arm":mat("BARE_DARK_SKIN_FOREARMS_10","160b08",0,.78),
        "nail":mat("NATURAL_DARK_FINGERNAIL_11","49312b",0,.68),
        "orange":mat("AIRSOFT_ORANGE_TIP_07","f66511",0,.48),
    }
    shaped_hands(klass,m)
    tip(m["orange"],hi.y,hi.z-.07 if klass=="pistol" else hi.z-.095)
    bpy.ops.file.pack_all()
    bpy.ops.wm.save_as_mainfile(filepath=os.path.join(BLENDS,id+".blend"))
    bpy.ops.object.select_all(action="SELECT")
    bpy.ops.export_scene.gltf(filepath=os.path.join(OUTPUT,id+".glb"),
        export_format="GLB",export_yup=True,export_materials="EXPORT",
        export_apply=True,use_selection=True,export_normals=True)
    size=os.path.getsize(os.path.join(OUTPUT,id+".glb"))
    assert size>30000,(id,size)
    print("HAND_AUTHORED_SOURCE_IMPORTED",id,src,
          "source_vertices",source_vertices,"total_glb_bytes",size,flush=True)

for id,src,length,klass in SPECS:make(id,src,length,klass)
print("NINE_AUTHORED_REPLACEMENT_VIEWMODELS_COMPLETE",flush=True)
