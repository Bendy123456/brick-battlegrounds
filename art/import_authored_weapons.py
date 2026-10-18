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

def taper_limb(name,points,radii,material,sides=20):
    """Smooth tapered organic arm / finger following a curved 3D centerline."""
    center=[Vector(p) for p in points]
    vertices=[];faces=[]
    for i,c in enumerate(center):
        direction=(center[min(i+1,len(center)-1)]-center[max(0,i-1)]).normalized()
        ref=Vector((0,0,1)) if abs(direction.z)<.90 else Vector((1,0,0))
        u=direction.cross(ref).normalized();v=direction.cross(u).normalized()
        for k in range(sides):
            angle=math.tau*k/sides
            vertex=c+u*math.cos(angle)*radii[i][0]+v*math.sin(angle)*radii[i][1]
            vertices.append(tuple(vertex))
    for i in range(len(center)-1):
        for k in range(sides):
            j=(k+1)%sides
            faces.append((i*sides+k,i*sides+j,(i+1)*sides+j,(i+1)*sides+k))
    faces.extend((tuple(range(sides-1,-1,-1)),
                  tuple((len(center)-1)*sides+k for k in range(sides))))
    mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
    ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
    ob.data.materials.append(material);smooth_obj(ob)
    return ob

# Different weapons actually put the trigger and support hand at different
# positions. Fractions are measured relative to each adapted mesh's length.
GRIP_FRACTIONS={
    "vanguard":(.31,.72),"ranger":(.31,.74),"specter":(.44,.67),
    "atlas":(.31,.74),"whisper":(.35,.72),"breacher":(.31,.75),
    "watcher":(.34,.74),"echo":(.43,.47),"tempo":(.44,.48),
}

def build_grip_hand(label,anchor,side,style,m,group,secondary=False):
    """Pose a wrist/palm/knuckles/four articulated fingers ON the replica.
    Generated parts are separate named, sculpted meshes for subsequent Blender edits.
    """
    x,y,z=anchor
    sign=1 if side=="RIGHT" else -1
    start=len(bpy.context.scene.objects)
    before=set(bpy.context.scene.objects)
    # Narrow anatomical forearm tapers into the wrist; unlike the old sausages,
    # forearms are less than half as thick and emerge naturally from below.
    reach=.19 if style=="pistol" else .27
    base=(x+sign*(.13 if not secondary else .12), y-reach, z-.24)
    taper_limb(label+" bare anatomical forearm",
      [base,(x+sign*.082,y-reach*.79,z-.19),
       (x+sign*.041,y-reach*.47,z-.125),
       (x+sign*.019,y-.065,z-.058),
       (x,y-.028,z-.015)],
      [(.054,.059),(.061,.067),(.057,.060),(.046,.046),(.038,.041)],
      m["arm"],24)
    # Wrist / thenar eminence / cupped palm. These shapes join organically.
    ellipsoid(label+" wrist",(x,y-.029,z-.026),(.046,.046,.043),m["skin"])
    ellipsoid(label+" sculpted palm",(x-sign*.008,y+.008,z+.008),
              (.052,.072,.045),m["skin"])
    ellipsoid(label+" thumb mound",(x-sign*.036,y+.015,z+.018),
              (.036,.043,.034),m["skin"])
    # Index through pinky curl inward around the grip; each finger has a
    # distinct first/second phalanx and a rounded contact fingertip.
    for i in range(4):
        fy=y-.045+i*.027
        knuckle=(x-sign*.024,fy,z+.020)
        mid=(x-sign*(.055+i*.001),fy+.017,z-.009)
        fingertip=(x-sign*(.071-i*.003),fy+.009,z-.041)
        sizes=[(.019,.019),(.020,.020),(.017,.017)]
        taper_limb(label+" finger %d articulated"%(i+1),
          [knuckle,mid,fingertip],
          sizes,m["skin"],12)
        ellipsoid(label+" fingertip %d"%(i+1),fingertip,
                  (.016,.016,.016),m["skin"])
        ellipsoid(label+" natural nail %d"%(i+1),
                  (fingertip[0],fingertip[1]+.007,fingertip[2]+.011),
                  (.011,.012,.0035),m["nail"])
        # Subtle knuckle raised contour prevents the palm from looking like a claw.
        ellipsoid(label+" knuckle %d"%(i+1),knuckle,
                  (.017,.019,.015),m["skin"])
    taper_limb(label+" opposing bent thumb",
      [(x+sign*.027,y-.020,z+.027),
       (x-sign*.001,y+.030,z+.046),
       (x-sign*.033,y+.054,z+.014)],
      [(.027,.028),(.024,.025),(.017,.018)],m["skin"],16)
    ellipsoid(label+" thumb nail",(x-sign*.033,y+.054,z+.024),
              (.012,.015,.0035),m["nail"])
    # Group the parts into a real hierarchy for live switching in Three.js.
    for obj in set(bpy.context.scene.objects)-before:
        if obj.type=="MESH":
            original=obj.matrix_world.copy()
            obj.parent=group
            obj.matrix_world=original

def shaped_hands(id,klass,m,lo,hi):
    """Give each of nine guns its own grip anchors and both selectable poses."""
    length=max(.35,hi.y-lo.y)
    height=max(.12,hi.z-lo.z)
    width=max(.11,hi.x-lo.x)
    grip_t,support_t=GRIP_FRACTIONS[id]
    gun_size=1.31 if klass=="pistol" else 1.28
    # Asset render scaling happens only to guns at runtime. Bake the *same
    # position scaling*, not size scaling, into the hand pose anchor positions.
    gun_center=(hi.z+lo.z)*.5
    grip_z=(lo.z+height*.38)*gun_size
    support_z=(lo.z+height*.55)*gun_size
    reach_x=min(.12,max(.069,width*.42))
    right=(reach_x*gun_size,(lo.y+length*grip_t)*gun_size,grip_z)
    if klass=="pistol":
        left=(-reach_x*.53*gun_size,
              (lo.y+length*(support_t+.025))*gun_size,
              grip_z-.015)
    else:
        left=(-reach_x*gun_size,
              (lo.y+length*support_t)*gun_size,
              support_z)
    for mode in ("ONE_HAND","TWO_HAND"):
        parent=bpy.data.objects.new("GRIP_"+mode,None)
        bpy.context.collection.objects.link(parent)
        parent["weapon"]=id
        parent["grip_mode"]=mode
        build_grip_hand(id+" "+mode+" RIGHT",right,"RIGHT",klass,m,parent)
        if mode=="TWO_HAND":
            build_grip_hand(id+" "+mode+" LEFT",left,"LEFT",klass,m,parent,secondary=True)
    print("GRIP_CONTACTS",id,"right",tuple(round(x,3) for x in right),
          "left",tuple(round(x,3) for x in left),flush=True)

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
    shaped_hands(id,klass,m,lo,hi)
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
