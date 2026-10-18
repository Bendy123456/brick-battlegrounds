"""Import real artist-authored CC-licensed airsoft-style weapon meshes, then fit them
with dark bare-hand FPS poses and orange replica tips.

Source license + attribution: art/weapons/ASSET_SOURCES.md.
Do not confuse this asset integration with personally hand-sculpting these meshes.
Run with Blender 3.4+ from repo root after downloading source GLBs:
    blender -b --python art/import_authored_weapons.py
"""
import bpy
import os
import sys
import math
import re
from mathutils import Vector, Matrix
sys.path.insert(0, os.path.dirname(__file__))
from anatomical_grips import make_grips

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

def fit_muzzle(meshes,lo,hi):
    """Measure the front barrel's cross-section, not scope/stock bounding maxima.
    Blender barrel points toward +Y; exporter turns this into Three.js -Z.
    """
    # Prioritize actual manufactured muzzle/barrel mesh components; imported
    # packs may also contain long iron sights or folded display attachments.
    muzzle_meshes=[o for o in meshes if any(k in o.name.lower()
                    for k in ('muzzledevice','muzzle_device','barrel','suppressor'))]
    vertices=[v.co.copy() for ob in (muzzle_meshes or meshes)
              for v in ob.data.vertices]
    center_x=(lo.x+hi.x)*.5
    max_forward=max(p.y for p in vertices)
    front=[p for p in vertices if p.y>=max_forward-.065 and abs(p.x-center_x)<.10]
    if len(front)<4:
        front=[p for p in vertices if p.y>=max_forward-.10]
    assert front,"No forward barrel vertices"
    front.sort(key=lambda p:p.y)
    # The orange guard attaches at the outer end of the visible barrel,
    # while the cross-sectional median ignores the top rail and sights.
    face=[p for p in front if p.y>=front[-1].y-.045]
    muzzle_x=sorted(p.x for p in face)[len(face)//2]
    muzzle_z=sorted(p.z for p in face)[len(face)//2]
    muzzle_y=front[-1].y
    return Vector((muzzle_x,muzzle_y,muzzle_z))

def tip(material,meshes,lo,hi,weapon_id):
    """Real hollow orange airsoft barrel sleeve with a gameplay muzzle socket."""
    center=fit_muzzle(meshes,lo,hi)
    radius=.020 if weapon_id in ('echo','tempo','whisper') else .024
    inner=radius*.62
    length=.052
    segments=28
    # Tube instead of the old opaque capped cylinder/orange ball.
    verts=[];faces=[]
    for y,r in ((center.y-.014,radius),(center.y+length,radius),
                (center.y-.014,inner),(center.y+length,inner)):
        for i in range(segments):
            a=2*math.pi*i/segments
            verts.append((center.x+r*math.cos(a),y,center.z+r*math.sin(a)))
    for i in range(segments):
        j=(i+1)%segments
        faces.extend(((i,j,j+segments,i+segments),
                      (i+2*segments,i+3*segments,j+3*segments,j+2*segments),
                      (i+segments,j+segments,j+3*segments,i+3*segments),
                      (i,j,j+2*segments,i+2*segments)))
    mesh=bpy.data.meshes.new('Hollow orange replica tip geometry')
    mesh.from_pydata(verts,[],faces);mesh.update()
    o=bpy.data.objects.new('AIRSOFT_ORANGE_TIP_07 - fitted hollow muzzle sleeve',mesh)
    bpy.context.collection.objects.link(o)
    o.data.materials.append(material)
    for poly in o.data.polygons:poly.use_smooth=True
    # A named empty is exported in GLB and transformed with gun and recoil.
    socket=bpy.data.objects.new('FPS_MUZZLE_SOCKET',None)
    bpy.context.collection.objects.link(socket)
    socket.location=(center.x,center.y+length+.005,center.z)
    socket['weapon']=weapon_id
    print('MUZZLE_FIT',weapon_id,tuple(round(v,3) for v in socket.location),flush=True)

def mesh_extents(meshes):
    """Calculate actual vertex bounds, never Blender's sometimes stale bound_box
    cache. A few imported meshes (particularly the shotgun) use rotated axes.
    """
    lo=Vector((1e12,1e12,1e12));hi=Vector((-1e12,-1e12,-1e12))
    for ob in meshes:
        for vertex in ob.data.vertices:
            p=ob.matrix_world @ vertex.co
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
    # Upstream packs include an unmounted spare magazine displayed BESIDE the
    # firearm. This is the floating black bar in the player's screenshot.
    # Keep MagazineGeometry seated in the receiver; strip only spare copies.
    loose=[o for o in all_meshes if any(term in o.name.lower().replace("_","")
           for term in ("sparemagazine","sparemag","extramagazine","loosemagazine"))]
    all_meshes=[o for o in all_meshes if o not in loose]
    for ob in loose:
        print("REMOVED_FLOATING_SPARE_MAG",id,ob.name,flush=True)
        bpy.data.objects.remove(ob,do_unlink=True)
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
    # Align the ACTUAL longest mesh axis to Blender +Y (forward).
    # Upstream rifles are usually +Y, whereas the author's pump shotgun is
    # authored along +X. Without this, fitting and scaling explode thousands
    # of times and the hands are nowhere near the trigger and pump.
    major=max(range(3),key=lambda i:span[i])
    if major==0:
        rotation=Matrix.Rotation(math.pi/2,4,'Z') # +X becomes +Y
    elif major==2:
        rotation=Matrix.Rotation(-math.pi/2,4,'X') # +Z becomes +Y
    else:
        rotation=None
    if rotation is not None:
        for ob in all_meshes:
            ob.data.transform(rotation)
            ob.data.update()
        lo,hi=mesh_extents(all_meshes);span=hi-lo
    print('SOURCE_WEAPON_AXES',id,'axis',major,
          'span',tuple(round(v,3) for v in span),flush=True)
    assert span.y>.01,"Bad weapon length in "+src
    factor=length/span.y
    shift=Vector((-(lo.x+hi.x)*factor/2, -lo.y*factor-.18, -(lo.z+hi.z)*factor/2 + .035))
    transform=Matrix.Translation(shift) @ Matrix.Scale(factor,4)
    # Rebase in destination coordinates, keeping expected 1m-class weapon length.
    for ob in all_meshes:
        ob.data.transform(transform)
        ob.data.update()
        ob.name="AUTHORED "+src+" "+ob.name
    lo,hi=mesh_extents(all_meshes)
    assert .95*length <=hi.y-lo.y <=1.05*length, "Weapon length normalization failed "+id
    assert max(hi.x-lo.x,hi.z-lo.z)<length*2.5, "Gun still off-axis: "+id
    # Imported FPS meshes should be substantially richer than placeholder cubes.
    source_vertices=sum(len(o.data.vertices) for o in all_meshes)
    assert source_vertices>150, "Source too sparse for "+id
    m={
        "skin":mat("DEEP_EBONY_BARE_SKIN_09","140a08",0,.76),
        "arm":mat("BARE_DARK_SKIN_FOREARMS_10","160b08",0,.78),
        "nail":mat("NATURAL_DARK_FINGERNAIL_11","49312b",0,.68),
        "orange":mat("AIRSOFT_ORANGE_TIP_07","f66511",0,.48),
    }
    # Custom thin-forearm sculpture with nine unique gun-mesh surface contacts.
    make_grips(id,klass,m,all_meshes,lo,hi)
    if id=='vanguard':
        for ob in all_meshes:
            vlo,vhi=mesh_extents([ob])
            print('SOURCE_PART',id,ob.name,'verts',len(ob.data.vertices),
                  'center',tuple(round((vlo[i]+vhi[i])*0.5,3) for i in range(3)),
                  'span',tuple(round(vhi[i]-vlo[i],3) for i in range(3)),flush=True)
    tip(m["orange"],all_meshes,lo,hi,id)
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
