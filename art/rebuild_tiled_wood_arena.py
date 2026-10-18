"""Professional arena wall-plank and completed-tile overlay for Brick Battlegrounds.

This updates the ACTUAL deployed arena.glb and saves a small editable .blend for
the extra geometry. Existing cover collision/BB mechanics are unchanged.
Run from the project root:
 blender -b --python-exit-code 1 --python art/rebuild_tiled_wood_arena.py
"""
import bpy, math, random, json, os
from mathutils import Vector

ROOT=os.getcwd()
LAYOUT=json.load(open(os.path.join(ROOT,"shared","arena-layout.json"),encoding="utf8"))
ASSET=os.path.join(ROOT,"client/public/assets/arena.glb")
SOURCE=os.path.join(ROOT,"art/arena_tiled_wood_upgrade.blend")
assert LAYOUT["coverEdition"]=="COVER_CIRCUIT_C_03"
assert os.path.getsize(ASSET)>1000000
bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=ASSET)
originals={o for o in bpy.context.scene.objects}
original_meshes=sum(o.type=="MESH" for o in originals)
assert original_meshes>=10
print("KEEPING_EXISTING_ARENA_WITHOUT_COLLISION_CHANGES",original_meshes,flush=True)

def coords(x,y,z):
    # Game: Y-up. Blender: Z-up.
    return (x,-z,y)

def image_tex(name,base,seed,style):
    rng=random.Random(seed)
    w,h=(512,128) if style=="wood" else (256,256)
    im=bpy.data.images.new(name,width=w,height=h,alpha=False)
    pixels=[]
    knots=[(rng.uniform(.15,.85),rng.uniform(.27,.75)) for _ in range(3)]
    for v in range(h):
        for u in range(w):
            xx=u/float(w);yy=v/float(h)
            grain=math.sin(yy*88+math.sin(xx*12)*.9)*.035
            grain+=math.sin(yy*230+math.sin(xx*30)*.8)*.018
            grain+=math.sin(yy*18+xx*3)*.018
            if style=="wood":
                knotsignal=0
                for kx,ky in knots:
                    distance=((xx-kx)/.065)**2+((yy-ky)/.19)**2
                    knotsignal+=math.exp(-distance*1.3)*-.075
                    grain+=math.sin(yy*63+math.exp(-((xx-kx)/.14)**2)*math.sin((yy-ky)*12)*6)*.010
                shade=grain+knotsignal+(rng.random()-.5)*.027
            else:
                shade=(rng.random()-.5)*.09+math.sin(xx*9+yy*7)*.014+math.sin(yy*43)*.009
            pixels.extend([max(.012,min(1.,p+shade)) for p in base]+[1.0])
    im.pixels.foreach_set(pixels)
    im.pack()
    return im

def material(name,rgb,seed,style):
    m=bpy.data.materials.new(name)
    m.use_nodes=True
    m.diffuse_color=(*rgb,1)
    m.use_backface_culling=False
    bsdf=m.node_tree.nodes.get("Principled BSDF")
    bsdf.inputs["Roughness"].default_value=.87 if style=="wood" else .94
    bsdf.inputs["Metallic"].default_value=0
    bsdf.inputs["Base Color"].default_value=(*rgb,1)
    tex=m.node_tree.nodes.new("ShaderNodeTexImage")
    tex.image=image_tex(name+"_ALBEDO",rgb,seed,style)
    tex.interpolation="Linear"
    m.node_tree.links.new(tex.outputs["Color"],bsdf.inputs["Base Color"])
    return m

WOODS=[
 material("24_AGED_PINE_PLANK_GRAIN_A",(0.46,0.284,0.164),21,"wood"),
 material("25_WARM_OAK_PLANK_GRAIN_B",(0.56,0.369,0.224),22,"wood"),
 material("26_SMOKED_TIMBER_PLANK_GRAIN_C",(0.365,0.235,0.144),23,"wood"),
 material("27_HONEY_FIELD_PLANK_GRAIN_D",(0.51,0.329,0.195),24,"wood")
]
TILES=[
 material("28_FULL_CERAMIC_CONCRETE_TILE_A",(0.385,0.416,0.414),31,"concrete"),
 material("29_FULL_CERAMIC_CONCRETE_TILE_B",(0.420,0.447,0.433),32,"concrete"),
 material("30_FULL_CERAMIC_CONCRETE_TILE_C",(0.355,0.392,0.388),33,"concrete")
]
GROUT=bpy.data.materials.new("31_DEEP_CONTINUOUS_TILE_JOINTS")
GROUT.diffuse_color=(.15,.17,.17,1)
GROUT.use_nodes=True
GROUT.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value=(.15,.17,.17,1)
GROUT.node_tree.nodes.get("Principled BSDF").inputs["Roughness"].default_value=.96
NAILS=bpy.data.materials.new("32_WALL_PLANK_FIXING_HEADS")
NAILS.diffuse_color=(.11,.09,.072,1)
NAILS.use_nodes=True
NAILS.node_tree.nodes.get("Principled BSDF").inputs["Base Color"].default_value=(.11,.09,.072,1)
NAILS.node_tree.nodes.get("Principled BSDF").inputs["Metallic"].default_value=.28

class MeshBatch:
    def __init__(self,name,mat):
        self.name=name;self.mat=mat;self.v=[];self.f=[];self.uv=[]
    def quad(self,points,uvs=None):
        offset=len(self.v)
        self.v.extend(coords(*p) for p in points)
        self.f.append(tuple(offset+k for k in range(4)))
        self.uv.append(uvs or [(0,0),(1,0),(1,1),(0,1)])
    def box(self,x0,x1,y0,y1,z0,z1,wood=False):
        if x1-x0<.001 or z1-z0<.001 or y1-y0<.0005:return
        p=[(x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
           (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)]
        for face in ((0,3,2,1),(4,5,6,7),(0,1,5,4),
                     (3,7,6,2),(1,2,6,5),(0,4,7,3)):
            verts=[p[j] for j in face]
            if wood:
                # Horizontal length receives wood grain U; plank height V.
                horizontal=max(x1-x0,z1-z0)
                uaxis=0 if x1-x0>=z1-z0 else 2
                uv=[((v[uaxis]- (x0 if uaxis==0 else z0))/max(.001,horizontal),
                     (v[1]-y0)/max(.001,y1-y0)) for v in verts]
            else:
                uv=[((v[0]-x0)/max(.001,x1-x0),
                     (v[2]-z0)/max(.001,z1-z0)) for v in verts]
            self.quad(verts,uv)
    def build(self):
        if not self.f:return None
        mesh=bpy.data.meshes.new(self.name+"_MESH")
        mesh.from_pydata(self.v,[],self.f);mesh.update()
        obj=bpy.data.objects.new(self.name,mesh)
        bpy.context.collection.objects.link(obj)
        mesh.materials.append(self.mat)
        uv_layer=mesh.uv_layers.new(name="Board and Tile Grain UV")
        for poly,uv in zip(mesh.polygons,self.uv):
            for li,point in zip(poly.loop_indices,uv):
                uv_layer.data[li].uv=point
        return obj

plank_batches=[MeshBatch("BATCH_NEW_ALL_WALLS_WOOD_PLANKS_"+str(i),mat) for i,mat in enumerate(WOODS)]
tile_batches=[MeshBatch("BATCH_COMPLETE_FLOOR_TILES_"+str(i),mat) for i,mat in enumerate(TILES)]
joint=MeshBatch("BATCH_COMPLETE_FLOOR_TILE_GROUT",GROUT)
nail=MeshBatch("BATCH_WOOD_PLANK_NAIL_HEADS",NAILS)
wood_count=0
tile_count=0
wall_ids=set()
rng=random.Random(108)

def clad(face_axis,plane,u0,u1,y0,y1,normal,identifier,offset=.037):
    """Exactly edge-to-edge staggered plank courses, both ends always clipped.
    Plank geometry sits millimeters in front of collision-matched wall faces.
    """
    global wood_count
    if u1<=u0 or y1<=y0:return
    rows=math.ceil((y1-y0)/.325)
    for row in range(rows):
        bottom=y0+row*.325
        top=min(y1,bottom+.325)
        if top-bottom<.025:continue
        offset_u=(row%2)*1.48
        u=u0-2.96+offset_u
        while u<u1:
            left=max(u0,u);right=min(u1,u+2.96)
            u+=2.96
            if right-left<.032:continue
            gap=.010 if right-left>.040 else .001
            left+=gap;right-=gap
            if left>=right:continue
            board_bottom=bottom+.006
            board_top=top-.007
            if board_bottom>=board_top:continue
            r=rng.randrange(len(plank_batches))
            b=plank_batches[r]
            # Board center stands out 4 cm from face, nearly flush with
            # existing cover; the original solid collider remains intact.
            face=plane+normal*offset
            back=face-normal*.026
            if face_axis=="x":
                b.box(min(back,face),max(back,face),board_bottom,board_top,left,right,True)
            else:
                b.box(left,right,board_bottom,board_top,min(back,face),max(back,face),True)
            wood_count+=1
            # Subtle dark fixing heads at either end of the individual plank.
            if right-left>.33 and row%2==0:
                for pos in (left+.095,right-.095):
                    cy=bottom+.145
                    s=.012
                    front=face+normal*.002
                    if face_axis=="x":
                        nail.quad([(front,cy-s,pos-s),(front,cy+s,pos-s),
                                   (front,cy+s,pos+s),(front,cy-s,pos+s)])
                    else:
                        nail.quad([(pos-s,cy-s,front),(pos+s,cy-s,front),
                                   (pos+s,cy+s,front),(pos-s,cy+s,front)])
    wall_ids.add(identifier)

# Base tile grout completely replaces the patchy old joint layout at y<0.021.
# Existing black running lanes, high-vis stripes and obstacle collisions stay
# above the new tiled surface and therefore keep their original appearance.
floor_w=119.6
floor_d=79.4
x0=-floor_w/2
x1=floor_w/2
z0=-floor_d/2
z1=floor_d/2
joint.box(x0,x1,.020,.022,z0,z1)
tile_pitch=2.0
columns=math.ceil(floor_w/tile_pitch)
rows=math.ceil(floor_d/tile_pitch)
for col in range(columns):
    for row in range(rows):
        xa=x0+col*tile_pitch
        xb=min(x1,xa+tile_pitch)
        za=z0+row*tile_pitch
        zb=min(z1,za+tile_pitch)
        if xb-xa<.02 or zb-za<.02:continue
        # Trim seams by only 9mm on every edge, never omit end-of-row tiles.
        inset=.012
        tile_batches[(col*7+row*13+(col*row)%3)%3].box(
            xa+inset,xb-inset,.022,.028,za+inset,zb-inset)
        tile_count+=1
assert tile_count==columns*rows
assert abs(x0+columns*tile_pitch-x1)<tile_pitch+.0001
print("COMPLETE_FLOOR_TILE_GRID",columns,rows,tile_count,
      "extents",(x0,x1,z0,z1),flush=True)

for wall in LAYOUT["obstacles"]:
    name=wall["id"]
    x,y,z,w,h,d=(wall[k] for k in ("x","y","z","w","h","d"))
    low=y-h*.5;high=y+h*.5
    if name.startswith("perimeter-wall-"):
        # Plank-clad FULL HEIGHT inner surfaces of all four warehouse walls.
        if w>d:
            sign=-1 if z>0 else 1
            clad("z",z+sign*(d*.5),x-w*.5,x+w*.5,low,high,sign,name)
        else:
            sign=-1 if x>0 else 1
            clad("x",x+sign*(w*.5),z-d*.5,z+d*.5,low,high,sign,name)
    elif (wall["material"] in ("wood","concrete") and
          name!="arena-floor" and h>=.85 and
          not name.startswith("cover-pallet-")):
        # All playable freestanding walls and slide barricades are genuine
        # wood-clad surfaces, front/back/end. Retain their collision boxes.
        for side in (-1,1):
            clad("x",x+side*(w*.5),z-d*.5,z+d*.5,low,high,side,name)
            clad("z",z+side*(d*.5),x-w*.5,x+w*.5,low,high,side,name)

assert len([a for a in wall_ids if a.startswith("perimeter-wall-")])==4
assert wood_count>4500
overlay=[]
for group in [joint,*tile_batches,*plank_batches,nail]:
    obj=group.build()
    if obj is not None:overlay.append(obj)
assert len(overlay)>=9
print("ALL_WALLS_WOOD_PLANKS",wood_count,"WALLS_COVERED",len(wall_ids),
      "OVERLAY_MESH_BATCHES",len(overlay),flush=True)

# The original arena is already optimized into material draw batches. Export
# original + overlay meshes as-is, with no additional thousands of draw calls.
allmeshes=[o for o in bpy.context.scene.objects if o.type=="MESH"]
assert len(allmeshes)<100,len(allmeshes)
bpy.ops.object.select_all(action="DESELECT")
for obj in allmeshes:obj.select_set(True)
bpy.context.view_layer.objects.active=allmeshes[0]
bpy.ops.export_scene.gltf(filepath=ASSET,export_format="GLB",
    use_selection=True,export_yup=True,export_apply=True,
    export_normals=True,export_materials="EXPORT")
assert os.path.getsize(ASSET)>1000000
print("COMPLETE_TILED_AND_WOOD_WALL_ARENA_GLTF",os.path.getsize(ASSET),
      "RUNTIME_MESHES",len(allmeshes),flush=True)

# Preserve a small editable Blender source for the NEW detail objects rather
# than duplicating the ~100MB original source scene and hitting GitHub's limit.
for obj in list(originals):
    if obj.name in bpy.data.objects:
        bpy.data.objects.remove(obj,do_unlink=True)
# Remove the old unused Blender imports/material textures before packing.
try:bpy.ops.outliner.orphans_purge(do_recursive=True)
except Exception:pass
bpy.context.scene.unit_settings.system="METRIC"
bpy.context.scene.unit_settings.scale_length=1
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=SOURCE,compress=True)
print("EDITABLE_WOOD_TILE_SOURCE",os.path.getsize(SOURCE),flush=True)
print("WOOD_TILE_ARENA_BUILD_SUCCESS",flush=True)
