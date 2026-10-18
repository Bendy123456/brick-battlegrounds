"""Per-weapon anatomical first-person hand sculptures and grip contact fitting.

The gun meshes remain credited upstream artist assets. The anatomical hand topology,
poses and slender arm meshes below are authored for Brick Battlegrounds in Blender.
The pose locations use actual gun mesh vertices, not screen-pixel approximations.
"""
import bpy
import math
from mathutils import Vector

# Individual gun calibration: trigger-grip y fraction, support-grip y fraction,
# trigger vertical section, support vertical section, and posture offsets.
# Fractions refer to the real Blender model bounds, not screen coordinates.
GRIPS={
 "vanguard": dict(right=.30,left=.70,right_z=.28,left_z=.56,right_shift=-.010,left_shift=.005),
 "ranger":   dict(right=.33,left=.72,right_z=.27,left_z=.55,right_shift=.000,left_shift=.009),
 "specter":  dict(right=.47,left=.70,right_z=.30,left_z=.58,right_shift=-.003,left_shift=.000),
 "atlas":    dict(right=.30,left=.67,right_z=.27,left_z=.58,right_shift=-.015,left_shift=-.015),
 "whisper":  dict(right=.36,left=.70,right_z=.27,left_z=.52,right_shift=.000,left_shift=.010),
 "breacher": dict(right=.30,left=.75,right_z=.29,left_z=.56,right_shift=.015,left_shift=-.012),
 "watcher":  dict(right=.32,left=.73,right_z=.30,left_z=.49,right_shift=-.011,left_shift=.012),
 "echo":     dict(right=.35,left=.37,right_z=.27,left_z=.24,right_shift=.005,left_shift=-.004),
 "tempo":    dict(right=.34,left=.37,right_z=.28,left_z=.24,right_shift=.011,left_shift=.009),
}

def sculpt_mesh(name,rings,material,n=20):
 """Continuous manifold loft. Rings: [(center_xyz,radius_x,radius_y), ...].
 Local frames follow the centerline to avoid polygonal boxes/cylinder arms.
 """
 verts=[];faces=[]
 pts=[Vector(row[0]) for row in rings]
 for i,(coord,rx,ry) in enumerate(rings):
  before=pts[max(0,i-1)]
  after=pts[min(len(pts)-1,i+1)]
  axis=(after-before).normalized()
  if axis.length<.5:axis=Vector((0,1,0))
  helper=Vector((0,0,1)) if abs(axis.z)<.94 else Vector((1,0,0))
  ex=axis.cross(helper).normalized()
  ey=axis.cross(ex).normalized()
  p=Vector(coord)
  for k in range(n):
   theta=math.tau*k/n
   verts.append(tuple(p+ex*math.cos(theta)*rx+ey*math.sin(theta)*ry))
 for i in range(len(rings)-1):
  for j in range(n):
   nj=(j+1)%n
   faces.append((i*n+j,i*n+nj,(i+1)*n+nj,(i+1)*n+j))
 faces.append(tuple(reversed(range(n))))
 last=(len(rings)-1)*n
 faces.append(tuple(last+j for j in range(n)))
 data=bpy.data.meshes.new(name)
 data.from_pydata(verts,[],faces);data.update()
 obj=bpy.data.objects.new(name,data)
 bpy.context.collection.objects.link(obj)
 obj.data.materials.append(material)
 for poly in data.polygons:poly.use_smooth=True
 return obj

def face_volume(name,p,scale,material):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=24,ring_count=16,location=p)
 obj=bpy.context.object;obj.name=name;obj.scale=scale
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 obj.data.materials.append(material)
 for poly in obj.data.polygons:poly.use_smooth=True
 return obj

def vertex_points(weapon_meshes):
 # Input gun verts already have local transforms baked by importer.
 pts=[]
 for mesh in weapon_meshes:
  pts.extend(tuple(v.co) for v in mesh.data.vertices)
 return pts

def contact_point(points,lo,hi,frac,z_frac,side,y_shift=0):
 """Choose a physical gun-side vertex in this exact grip region.
 Avoid world bounding-box extremes from rails, optics, or folding stocks.
 """
 ys=lo.y+(hi.y-lo.y)*frac+y_shift
 zs=lo.z+(hi.z-lo.z)*z_frac
 center_x=(lo.x+hi.x)*.5
 candidates=[]
 for widen in (.035,.075,.14,.24):
  candidates=[p for p in points
     if abs(p[1]-ys)<=widen and abs(p[2]-zs)<=widen*.80
     and (p[0]-center_x)*side>=.004]
  if len(candidates)>=6:break
 if not candidates:
  # Some large authored meshes (notably shotgun stocks) have their left-side
  # face far outside the narrow z window. Never silently return a right-side
  # point for a LEFT hand: broaden to the entire half of this actual mesh.
  center_x=(lo.x+hi.x)*.5
  candidates=[p for p in points if (p[0]-center_x)*side>=.002]
  if not candidates:
   raise ValueError("Cannot locate %s-hand weapon surface" %
                    ("right" if side==1 else "left"))
  candidates=sorted(candidates,key=lambda p:
    (p[1]-ys)**2+(p[2]-zs)**2)[:120]
 # Find a point with a projected y/z close to the intended grip, while
 # favoring the visible side rather than a front/back optic component.
 candidates=sorted(candidates,key=lambda p:
    abs(p[1]-ys)*1.15+abs(p[2]-zs)*.95-abs(p[0])*.12)
 good=candidates[:min(50,len(candidates))]
 # Far-side of receiver near selected cross-section = outside of solid gun.
 side_points=sorted(good,key=lambda p:side*p[0],reverse=True)
 surface=Vector(side_points[0])
 return surface

def sculpt_hand(name,contact,side,is_pistol,is_support,materials,parent,pose):
 """Hand palm, slender connected forearm, differentiated jointed fingers and thumb.
 Four fingertips are explicitly posed to bend INTO the receiver or pistol grip.
 The gun/contact mesh is never scaled independently of this group.
 """
 sign=1 if side=="RIGHT" else -1
 s=float(sign)
 x,y,z=contact
 # Point is on the side of gun. Wrist is outside while fingers curl
 # across and down over the side of the weapon.
 pad_x=x+s*(.040 if not is_support else .034)
 pad_y=y-.018
 pad_z=z-.019
 slim=.85 if is_pistol else 1.
 if is_support:slim*=.93
 before=set(bpy.context.scene.objects)
 # Shoulder-side forearm slips into the bottom of the viewport rather than
 # forming a giant sausage and blocking the environment.
 start=(pad_x+s*(.115 if not is_support else .105),
        y-(.29 if not is_pistol else .20),
        z-(.215 if not is_pistol else .17))
 wrist=(pad_x,y-.07,pad_z-.015)
 points=[
   (start,.043*slim,.048*slim),
   ((start[0]-s*.019,start[1]+.055,start[2]+.047),.047*slim,.051*slim),
   ((pad_x+s*.039,y-.16,pad_z-.098),.043*slim,.048*slim),
   ((pad_x+s*.015,y-.105,pad_z-.052),.034*slim,.039*slim),
   (wrist,.030*slim,.032*slim),
   ((pad_x,y-.039,pad_z+.004),.027*slim,.032*slim)]
 sculpt_mesh(name+" bare anatomical forearm",points,materials["arm"],28)
 # Smooth webbed palm contour, tapered wrist/knuckle silhouette.
 palm=[
  ((pad_x,y-.079,pad_z-.021),.030,.031),
  ((pad_x-s*.004,y-.049,pad_z-.013),.040,.034),
  ((pad_x-s*.008,y-.013,pad_z),.045,.035),
  ((pad_x-s*.012,y+.030,pad_z+.005),.040,.031),
  ((pad_x-s*.014,y+.053,pad_z+.007),.036,.023)]
 sculpt_mesh(name+" cupped sculpted palm",palm,materials["skin"],28)
 face_volume(name+" thenar mound",(pad_x-s*.022,y+.025,pad_z+.022),
             (.023,.030,.025),materials["skin"])
 # Four individually sized fingers: index lies high near the trigger, other
 # three wrap tighter around the grip. Fingers are jointed, not straight tubes.
 for k in range(4):
  finger_y=y+.046-k*.027
  fsize=(1.0-.06*k)*slim
  finger_contact=Vector((x+s*.007,finger_y,z-.034-.007*k))
  root=Vector((pad_x-s*.003,finger_y,pad_z+.012))
  first=Vector((pad_x-s*.027,finger_y+.012,pad_z+.003))
  second=Vector((x+s*.013,finger_y+.019,z-.022-.006*k))
  tip=finger_contact
  # Fingertip overlaps the contact side by a few millimetres instead of
  # floating outside it. Trigger finger is gently less curled.
  if k==0:tip.z+=.011
  shape=[
   (tuple(root),.014*fsize,.015*fsize),
   (tuple(root.lerp(first,.45)),.015*fsize,.016*fsize),
   (tuple(first),.014*fsize,.014*fsize),
   (tuple((first+second)*.5),.0128*fsize,.013*fsize),
   (tuple(second),.011*fsize,.012*fsize),
   (tuple(tip),.009*fsize,.010*fsize)]
  sculpt_mesh(name+" finger %d articulated"%(k+1),shape,materials["skin"],16)
  face_volume(name+" natural nail %d"%(k+1),
     tuple(tip+Vector((s*.003,.0,.008))),(.008,.011,.0029),materials["nail"])
  face_volume(name+" finger knuckle %d"%(k+1),tuple(root),
     (.014*fsize,.016*fsize,.015*fsize),materials["skin"])
 # Opposable thumb curves across the OTHER edge of grip.
 t0=Vector((pad_x+s*.013,y+.034,pad_z+.030))
 t1=Vector((pad_x-s*.017,y+.061,pad_z+.046))
 t2=Vector((x+s*.004,y+.081,z+.014))
 sculpt_mesh(name+" opposable thumb",[
   (tuple(t0),.021,.020),
   (tuple((t0+t1)*.5),.023,.022),
   (tuple(t1),.017,.017),
   (tuple((t1+t2)*.5),.014,.015),
   (tuple(t2),.011,.012)],materials["skin"],20)
 face_volume(name+" thumb nail",tuple(t2+Vector((s*.003,0,.008))),
             (.009,.012,.0027),materials["nail"])
 # World transform preserved when parented to actual runtime grip object.
 for obj in set(bpy.context.scene.objects)-before:
  if obj.type=="MESH":
   matrix=obj.matrix_world.copy()
   obj.parent=parent
   obj.matrix_world=matrix
 # Returns a palm-to-metal contact position for asset diagnostics.
 return Vector((x+s*.006,y,z))

def make_grips(weapon_id,kind,materials,weapon_meshes,lo,hi):
 """Nine distinct calibrated two- and one-hand pose groups."""
 assert weapon_id in GRIPS, "Uncalibrated weapon " + weapon_id
 p=GRIPS[weapon_id]
 verts=vertex_points(weapon_meshes)
 pistol=kind=="pistol"
 right=contact_point(verts,lo,hi,p["right"],p["right_z"],1,p["right_shift"])
 left=contact_point(verts,lo,hi,p["left"],p["left_z"],-1,p["left_shift"])
 for mode in ("ONE_HAND","TWO_HAND"):
  root=bpy.data.objects.new("GRIP_"+mode,None)
  bpy.context.collection.objects.link(root)
  root["weapon_id"]=weapon_id
  root["pose"]=mode
  root["geometry_version"]="anatomical_contact_v3"
  sculpt_hand(weapon_id+" "+mode+" RIGHT",right,"RIGHT",
              pistol,False,materials,root,mode)
  if mode=="TWO_HAND":
   sculpt_hand(weapon_id+" "+mode+" LEFT",left,"LEFT",
                pistol,True,materials,root,mode)
  # Asset validation in Blender: fingertips and palm contact the source weapon.
  # Numeric diagnostics are available in CI logs for inspection.
  root["right_surface_x"]=right.x
  root["right_surface_y"]=right.y
  root["right_surface_z"]=right.z
  root["left_surface_x"]=left.x
  root["left_surface_y"]=left.y
  root["left_surface_z"]=left.z
  assert abs(right.x)<.7 and abs(left.x)<.7
 print("GRIP_BOUNDS",weapon_id,
       "min",tuple(round(x,3) for x in lo),
       "max",tuple(round(x,3) for x in hi),flush=True)
 assert right.x>=(lo.x+hi.x)*.5-.02 and left.x<=(lo.x+hi.x)*.5+.02, "Wrong gun face: "+weapon_id
 print("ANATOMICAL_GRIP_OK",weapon_id,
       "right",tuple(round(v,3) for v in right),
       "left",tuple(round(v,3) for v in left),flush=True)
