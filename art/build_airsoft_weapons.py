"""Airsoft Arena | NINE ORIGINAL airsoft-replica FPS viewmodels.
Blender 3.4+ compatible. Run from repo root:
    blender --background --python art/build_airsoft_weapons.py
Each output is a genuine editable .blend and a fast game-ready .glb.
The models are fictional training replicas with orange muzzle tips; the
geometry is for game art, not functional mechanical manufacturing.
"""
import bpy, math, random, os
from mathutils import Vector
random.seed(35)
ROOT=os.getcwd()
DEST=os.path.join(ROOT,'client','public','assets','weapons')
SOURCES=os.path.join(ROOT,'art','weapons')
os.makedirs(DEST,exist_ok=True);os.makedirs(SOURCES,exist_ok=True)
# x=width, y=height, z=negative forward in Three.js
def p(x,y,z):return (x,-z,y)
def clear():
 bpy.ops.object.select_all(action='SELECT')
 bpy.ops.object.delete(use_global=False)
 for m in list(bpy.data.materials):bpy.data.materials.remove(m)
 bpy.context.scene.unit_settings.system='METRIC'
 bpy.context.scene.unit_settings.scale_length=1.0
def material(name,color,metal=.0,rough=.55,emission=0):
 m=bpy.data.materials.new(name);m.diffuse_color=tuple(int(color[i:i+2],16)/255 for i in (0,2,4))+(1,)
 m.use_nodes=True;node=m.node_tree.nodes.get('Principled BSDF')
 node.inputs['Base Color'].default_value=m.diffuse_color
 node.inputs['Metallic'].default_value=metal
 node.inputs['Roughness'].default_value=rough
 if emission:
  node.inputs['Emission Color'].default_value=m.diffuse_color
  node.inputs['Emission Strength'].default_value=emission
 return m
def finish(obj,mat,bevel=.0,segments=3):
 obj.data.materials.append(mat)
 if bevel:
  mod=obj.modifiers.new('Smooth CNC chamfers','BEVEL')
  mod.width=bevel;mod.segments=segments;mod.limit_method='ANGLE'
  bpy.context.view_layer.objects.active=obj
  try:bpy.ops.object.modifier_apply(modifier=mod.name)
  except Exception:pass
  normal=obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
  try:bpy.ops.object.modifier_apply(modifier=normal.name)
  except Exception:pass
 return obj
def box(name,where,dims,mat,bevel=.012):
 bpy.ops.mesh.primitive_cube_add(size=1,location=p(*where));obj=bpy.context.object
 obj.name=name;obj.dimensions=(dims[0],dims[2],dims[1])
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return finish(obj,mat,bevel)
def poly(name,outline,width,mat,x=0,bevel=.012):
 # Non-boxy closed side silhouette, extruded between left and right faces.
 # outline entries are (z,y), travelling around the manufactured side profile.
 n=len(outline);verts=[]
 for xx in [x-width/2,x+width/2]:
  verts.extend([p(xx,y,z) for z,y in outline])
 faces=[tuple(range(n-1,-1,-1)),tuple(range(n,2*n))]
 for i in range(n):j=(i+1)%n;faces.append((i,j,n+j,n+i))
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(verts,[],faces);mesh.update()
 ob=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(ob)
 return finish(ob,mat,bevel)
def tube(name,a,b,r,mat,segments=16,bevel=0):
 A=Vector(p(*a));B=Vector(p(*b));v=B-A
 if v.length<.0001:return None
 bpy.ops.mesh.primitive_cylinder_add(vertices=segments,radius=r,depth=v.length,location=(A+B)*.5)
 obj=bpy.context.object;obj.name=name
 obj.rotation_euler=v.to_track_quat('Z','Y').to_euler()
 return finish(obj,mat,bevel)
def ring(name,at,outer,inner,depth,mat,segments=28):
 # Orange replica tip or sight aperture, with a true open hole.
 z=at[2]-depth/2;vertices=[]
 for j in range(2):
  zz=z+depth*j
  for rr in [outer,inner]:
   for k in range(segments):
    a=2*math.pi*k/segments;vertices.append(p(at[0]+math.cos(a)*rr,at[1]+math.sin(a)*rr,zz))
 N=segments
 faces=[]
 for k in range(N):
  nx=(k+1)%N
  faces.extend([(k,nx,2*N+nx,2*N+k),
   (N+k,3*N+k,3*N+nx,N+nx),
   (k,N+k,N+nx,nx),
   (2*N+k,2*N+nx,3*N+nx,3*N+k)])
 mesh=bpy.data.meshes.new(name);mesh.from_pydata(vertices,[],faces);mesh.update()
 obj=bpy.data.objects.new(name,mesh);bpy.context.collection.objects.link(obj)
 return finish(obj,mat,.003)
def curve(name,points,r,mat,bevel=3):
 path=bpy.data.curves.new(name,'CURVE');path.dimensions='3D';path.resolution_u=10
 path.bevel_depth=r;path.bevel_resolution=bevel
 spline=path.splines.new('POLY');spline.points.add(len(points)-1)
 for i,a in enumerate(points):
  pos=p(*a);spline.points[i].co=(*pos,1)
 ob=bpy.data.objects.new(name,path);bpy.context.collection.objects.link(ob)
 bpy.ops.object.select_all(action='DESELECT');ob.select_set(True);bpy.context.view_layer.objects.active=ob
 bpy.ops.object.convert(target='MESH');ob=bpy.context.object
 ob.data.materials.append(mat);return ob
def sphere(name,where,dims,mat):
 bpy.ops.mesh.primitive_uv_sphere_add(segments=16,ring_count=10,location=p(*where))
 ob=bpy.context.object;ob.name=name;ob.scale=(dims[0],dims[2],dims[1])
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 ob.data.materials.append(mat);return ob
def label(name,word,pos,size,mat):
 bpy.ops.object.text_add(location=p(*pos))
 ob=bpy.context.object;ob.name=name;ob.data.body=word;ob.data.size=size
 ob.data.extrude=.0009;ob.data.bevel_depth=.00025;ob.data.materials.append(mat)
 ob.rotation_euler=(math.pi/2,0,0)
 bpy.context.view_layer.objects.active=ob;bpy.ops.object.convert(target='MESH')
 return ob
def batch_export(asset):
 # Retain every editable named part in the Blender file; only merge matching
 # materials into a few meshes in the game export. Export does not merge
 # collision geometry or alter the stage / original LEGO character models.
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(SOURCES,asset+'.blend'))
 bymat={}
 for obj in [o for o in bpy.context.scene.objects if o.type=='MESH']:
  key=obj.active_material.name if obj.active_material else '_OTHER'
  bymat.setdefault(key,[]).append(obj)
 for key,objects in bymat.items():
  if len(objects)<2:continue
  bpy.ops.object.select_all(action='DESELECT')
  for o in objects:o.select_set(True)
  bpy.context.view_layer.objects.active=objects[0];bpy.ops.object.join()
  bpy.context.object.name='BATCH_'+key
 bpy.ops.object.select_all(action='DESELECT')
 meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
 for o in meshes:o.select_set(True)
 bpy.context.view_layer.objects.active=meshes[0]
 bpy.ops.export_scene.gltf(filepath=os.path.join(DEST,asset+'.glb'),
   export_format='GLB',use_selection=True,export_yup=True,
   export_apply=True,export_normals=True,export_materials='EXPORT')
 file=os.path.join(DEST,asset+'.glb')
 size=os.path.getsize(file)
 assert size>15000,'Invalid tiny model: '+asset
 print('AIRSOFT_WEAPON_MODEL_OK',asset,size,'meshes',len(meshes),flush=True)
# All airsoft replicas are 6mm-BB fictional designs with a high-visibility
# orange muzzle and visible handguards. No real logos or copied assets.
def colors(accent_hex):
 return {
 'body':material('CERAMIC_POLYMER_01','30363c',.16,.52),
 'frame':material('MACHINED_GRAPHITE_02','48515a',.64,.34),
 'rail':material('BRUSHED_ALLOY_03','78848b',.73,.31),
 'grip':material('RUBBER_04','1e272b',.02,.77),
 'dark':material('SHADOW_GROOVES_05','10191f',.12,.76),
 'accent':material('CUSTOM_TEAM_ACCENT_06',accent_hex,.29,.40),
 'safety':material('AIRSOFT_ORANGE_TIP_07','ed7f32',.02,.39),
 'label':material('6MM_BB_ETCHED_08','c3d5c1',.3,.48),
 'hand':material('YELLOW_MINIFIG_HAND_09','edb94b',0,.33),
 'sleeve':material('TEAM_UNIFORM_SLEEVE_10','3d768a',0,.58),
 }
def core(parts,scale=1):
 m=parts
 # Receiver with polygonal contoured sides, beveled instead of boxy blocks.
 poly('Scalloped polymer upper housing',[
  (.16,.095),(-.07,.133),(-.34,.147),(-.50,.108),(-.52,.018),
  (-.42,-.055),(-.04,-.066),(.16,-.034)],.224*scale,m['frame'])
 poly('Tapered lower body with forward mag well',[
  (.10,-.055),(-.12,-.047),(-.20,-.165),(-.35,-.191),
  (-.44,-.128),(-.41,.002),(-.02,.005)],.203*scale,m['body'])
 poly('Chassis accent seam',[(.12,.054),(-.09,.085),(-.31,.09),(-.44,.060),
  (-.44,.046),(-.28,.075),(-.09,.070),(.12,.040)],.232*scale,m['dark'],bevel=.002)
 # Flush controls on both sides
 for sign in [-1,1]:
  x=sign*.118
  sphere('Safety selector control', (x,-.02,-.15),(.027,.027,.009),m['rail'])
  box('Trigger-side engraved marker',(x,-.103,-.22),(.013,.027,.11),m['accent'],.006)
  for j in range(5):
   box('Micro-grip dot',(sign*.080,-.218-j*.024,.015),(.008,.008,.018),m['dark'],.002)
 # Ergonomic swept-back grip + curved trigger guard
 poly('Rounded ergonomic angle grip',[
  (.067,-.128),(-.030,-.121),(-.055,-.248),(.000,-.404),
  (.134,-.410),(.185,-.345),(.13,-.210)],.134,m['grip'],bevel=.029)
 curve('Swept trigger guard',[(-.045,-.12,-.055),(-.050,-.215,-.05),
  (-.045,-.227,-.20),(-.045,-.13,-.235)],.014,m['rail'])
 box('Grip heel',(.0,-.397,.083),(.17,.027,.13),m['body'],.012)
def top_rail(m,z0,z1,y=.161,teeth=10):
 box('Low continuous rail spine',(0,y,(z0+z1)/2),(.126,.045,abs(z1-z0)),m['dark'],.008)
 for i in range(teeth):
  z=z0+(z1-z0)*(i+.5)/teeth
  box('Picatinny cosmetic bridge',(0,y+.031,z),(.162,.024,.026),m['rail'],.007)
def barrel(m,z0,z1,r=.034):
 tube('Concentric inner barrel',(0,.012,z0),(0,.012,z1),r,m['rail'],24)
 tube('Airsoft hop-up outer shroud',(0,.012,z0),(0,.012,z1+.080),r+.016,m['dark'],22)
 ring('Mandatory orange 6mm tip',(0,.012,z1-.018),r+.042,r-.005,.13,m['safety'],28)
 ring('Muzzle black bore insert',(0,.012,z1-.093),r+.018,r*.74,.015,m['dark'],28)
def red_dot(m,z=-.19,y=.20,large=False):
 h=.085 if not large else .122
 box('Optic QD base',(0,y,z),(.11,.043,.17),m['rail'],.009)
 box('Rounded sight housing',(0,y+h*.78,z-.025),(.15,.12 if large else .09,.17),m['body'],.026)
 ring('Optic glass surround',(0,y+h*.78,z-.122),.052 if not large else .060,.038 if not large else .045,.027,m['rail'],20)
 sphere('Dark glass emitter',(0,y+h*.78,z-.125),(.036,.036,.004),m['dark'])
def iron_sight(m,z=-.72):
 for x in [-.049,.049]:
  tube('Iron sight ear',(x,.16,z),(x,.235,z),.011,m['rail'],12)
 box('High visibility sight post',(0,.205,z),(.017,.078,.016),m['accent'],.006)
def hand_arm(prefix,m,x,y,z,side,forearm=.38):
 # Keep nostalgic LEGO-yellow claw fingers, but model the sleeve and
 # wrist independently of the airsoft gun with beveled plastic surfaces.
 poly(prefix+' tapered sleeve',[
  (z+forearm,-.48),(z+.11,y+.03),(z-.025,y-.035),
  (z+.01,y-.150),(z+forearm,-.66)],.17,m['sleeve'],x=x,bevel=.028)
 sphere(prefix+' cuff',(x,y-.024,z+.035),(.098,.088,.10),m['body'])
 tube(prefix+' molded wrist',(x,y,z+.01),(x,y,z-.076),.080,m['hand'],16)
 sphere(prefix+' rounded palm',(x,y+.012,z-.087),(.110,.10,.112),m['hand'])
 # Curved fingers wrapping around stock and front grip; C-claw silhouette.
 arc=[]
 for j in range(10):
  angle=(-.32+j/9*1.65)*math.pi
  arc.append((x+side*math.cos(angle)*.087,
   y+math.sin(angle)*.072,z-.112))
 curve(prefix+' C-hook fingers',arc,.034,m['hand'],4)
def stock(m,style='retractable',length=.46):
 if style=='folding':
  curve('Wire folding stock spine',[(0,.003,.12),(-.17,-.05,.18),(-.18,-.078,length)],.021,m['rail'])
  curve('Folding stock lower',[(0,-.09,.11),(-.14,-.16,length-.08),(-.18,-.078,length)],.019,m['rail'])
  box('Stock endpad',(-.18,-.074,length),(.13,.235,.075),m['grip'],.026)
 elif style=='skeleton':
  poly('Skeleton shoulder stock',[(.12,.10),(length-.045,.11),(length,.015),
    (length,-.20),(length-.065,-.23),(.10,-.105)],.13,m['frame'],bevel=.028)
  poly('Stock cutout shadow',[(.23,.027),(length-.095,.03),
    (length-.10,-.136),(.23,-.072)],.143,m['dark'],bevel=.012)
  box('Soft shoulder buttpad',(0,-.040,length),(.18,.31,.06),m['grip'],.026)
 elif style=='bullpup':
  poly('Integrated skeletal aft receiver',[(.03,.10),(length,.10),
    (length+.10,.005),(length+.075,-.21),(.15,-.22)],.235,m['body'],bevel=.052)
  poly('Stock inset vent',[(length-.12,.019),(length+.035,-.02),
    (length+.015,-.15),(length-.12,-.15)],.25,m['dark'],bevel=.021)
  box('Bullpup stock butt',(0,-.04,length+.095),(.28,.31,.065),m['grip'],.026)
 else:
  tube('Stock extension buffer',(0,-.035,.155),(0,-.035,length-.07),.07,m['rail'],20)
  poly('Adjustable cheek stock',[(length-.13,.075),(length+.035,.064),
    (length+.04,-.165),(length-.08,-.20),(length-.175,-.085)],.215,m['body'],bevel=.033)
  box('Rubber stock cheek',(0,.065,length-.06),(.18,.048,.21),m['grip'],.019)
  box('Textured recoil pad',(0,-.065,length+.045),(.225,.285,.065),m['grip'],.027)
def curved_mag(m,style='standard',z=-.30):
 if style=='drum':
  tube('Round 6mm BB winding magazine',(.0,-.28,z),(.0,-.32,z),.17,m['frame'],28)
  ring('Circular airsoft magazine rim',(.0,-.29,z),.158,.113,.06,m['dark'])
  box('Feeding neck',(0,-.18,z),(.14,.16,.09),m['body'],.018)
 elif style=='straight':
  poly('Lightweight straight BB magazine',[(z+.045,-.154),(z-.07,-.16),
    (z-.075,-.44),(z+.06,-.445)],.135,m['body'],bevel=.023)
  box('Magazine floorpad',(0,-.439,z),(.16,.04,.155),m['dark'],.018)
 else:
  poly('Curved polymer BB magazine',[(z+.08,-.159),(z-.07,-.160),
    (z-.095,-.31),(z-.045,-.50),(z+.12,-.53),(z+.13,-.495),
    (z+.037,-.30)],.166,m['body'],bevel=.024)
  box('Magazine bumper',(0,-.511,z+.035),(.195,.041,.16),m['grip'],.018)
 for side in [-1,1]:
  for j in range(3):
   box('Magazine count window',(side*.084,-.25-j*.056,z+.012),(.01,.017,.06),m['accent'],.003)
def vented_handguard(m,end=-.94,wide=.20,style='slots'):
 poly('Free-float sculpted airsoft handguard',[
  (-.45,.112),(end+.08,.102),(end,.058),(end,-.077),
  (end+.075,-.112),(-.46,-.103)],wide,m['body'],bevel=.025)
 for sign in [-1,1]:
  x=sign*(wide/2+.006)
  n=max(3,int(abs(end+.45)/.072))
  for j in range(n):
   z=-.50-j*(abs(end+.45)/n)
   if style=='slots':
    box('Deep air cooling slot',(x,.021,z),(.014,.034,.048),m['dark'],.012)
   elif style=='honeycomb':
    tube('Open vent grommet',(x,-.009,z),(x,.04,z),.023,m['dark'],8)
   else:
    box('Lengthwise fluted indent',(x,.0,z),(.012,.080,.022),m['dark'],.009)
 for z in [end+.08,-.48]:
  ring('Front rear ring collar',(0,.01,z),wide*.60,wide*.43,.037,m['rail'],20)
def gun_body(kind,m):
 if kind=='vanguard':
  core(m);vented_handguard(m,-.95,.225,'slots');stock(m,'retractable',.49)
  curved_mag(m,'standard',-.32);barrel(m,-.87,-1.16)
  top_rail(m,-.46,-.89);red_dot(m,-.17);iron_sight(m,-.93)
  box('Sling attachment',( .13,-.05,.34),(.031,.1,.08),m['rail'],.014)
  label('6MM_VX','VX4 / 6MM',( .118,.044,-.34),.038,m['label'])
  hand_arm('LEFT',m,-.175,-.21,-.70,-1);hand_arm('RIGHT',m,.18,-.255,.02,1)
 elif kind=='ranger':
  core(m);vented_handguard(m,-1.09,.24,'honeycomb');stock(m,'skeleton',.57)
  curved_mag(m,'standard',-.33);barrel(m,-1.04,-1.31,.037)
  top_rail(m,-.43,-1.08,teeth=15);red_dot(m,-.24,large=True)
  tube('Angled airsoft foregrip',(.0,-.10,-.84),(.04,-.35,-.77),.055,m['grip'],18)
  box('Receiver identification',( .13,.064,-.24),(.012,.035,.12),m['accent'],.005)
  hand_arm('LEFT',m,-.18,-.20,-.79,-1);hand_arm('RIGHT',m,.18,-.255,.02,1)
 elif kind=='specter':
  core(m);vented_handguard(m,-.67,.20,'flutes');stock(m,'bullpup',.48)
  curved_mag(m,'straight',.22);barrel(m,-.65,-.91,.035)
  top_rail(m,-.47,-.70,teeth=5)
  curve('Elevated integrated carry sight',[(-.10,.12,.29),(-.10,.245,.20),
   (-.10,.29,-.43),(-.10,.14,-.54)],.027,m['frame'])
  curve('Carry handle far side',[(.10,.12,.29),(.10,.245,.20),
   (.10,.29,-.43),(.10,.14,-.54)],.026,m['frame'])
  box('Carry-bridge optics',(0,.296,-.19),(.24,.07,.37),m['dark'],.022)
  label('SPECTER_LABEL','S12',( .12,.062,-.18),.041,m['accent'])
  hand_arm('LEFT',m,-.17,-.20,-.54,-1);hand_arm('RIGHT',m,.18,-.255,.03,1)
 elif kind=='atlas':
  core(m,1.13);vented_handguard(m,-1.02,.27,'honeycomb');stock(m,'skeleton',.63)
  curved_mag(m,'drum',-.32);barrel(m,-1.0,-1.28,.045)
  top_rail(m,-.45,-1.03,y=.16,teeth=12);red_dot(m,-.18,y=.205,large=True)
  box('Wide accessory light',( .17,.04,-.75),(.095,.105,.22),m['frame'],.018)
  ring('Light lens',( .17,.04,-.887),.041,.029,.018,m['label'])
  for z in [-.57,-.73,-.87]:
   box('Underside cross rail',(0,-.117,z),(.23,.034,.052),m['rail'],.011)
  hand_arm('LEFT',m,-.20,-.22,-.79,-1);hand_arm('RIGHT',m,.18,-.255,.02,1)
 elif kind=='whisper':
  core(m,.83);vented_handguard(m,-.68,.19,'slots');stock(m,'folding',.37)
  curved_mag(m,'straight',-.33);barrel(m,-.66,-.82,.031)
  top_rail(m,-.33,-.64,teeth=6);red_dot(m,-.18)
  tube('Short stabilizer underbarrel',(0,-.119,-.45),(0,-.119,-.64),.036,m['grip'],14)
  box('Side charging lever',(.145,.066,-.21),(.09,.037,.045),m['rail'],.013)
  hand_arm('LEFT',m,-.16,-.21,-.55,-1,forearm=.31)
  hand_arm('RIGHT',m,.18,-.25,.02,1,forearm=.33)
 elif kind=='breacher':
  # Unique smooth tubular pump shotgun rather than rifle furniture.
  poly('Shotgun receiver',[ (.13,.095),(-.14,.102),(-.30,.045),
   (-.28,-.13),(-.08,-.16),(.15,-.06)],.19,m['frame'],bevel=.03)
  stock(m,'skeleton',.61)
  barrel(m,-.27,-1.20,.045)
  tube('Bottom BB magazine tube',(0,-.105,-.35),(0,-.105,-1.105),.044,m['body'],24)
  tube('Pump rail tube',(0,-.10,-.49),(0,-.10,-.92),.056,m['rail'],22)
  poly('Sliding sculpted pump grip',[(-.50,-.040),(-.92,-.047),
    (-.95,-.15),(-.88,-.209),(-.55,-.20),(-.48,-.14)],.20,m['grip'],bevel=.035)
  for z in [-.55,-.61,-.67,-.73,-.79,-.85]:
   curve('PUMP FINGER RIB',[(-.113,-.065,z),(-.126,-.126,z),
    (-.10,-.173,z),(.10,-.173,z),(.126,-.126,z),(.113,-.065,z)],.012,m['dark'])
  poly('Rear grip',[ (.09,-.10),(-.04,-.11),(-.015,-.37),
    (.11,-.40),(.17,-.32)],.15,m['grip'],bevel=.029)
  curve('Shotgun open trigger guard',[(-.06,-.12,-.02),(-.06,-.20,-.08),
    (-.06,-.23,-.18),(-.06,-.10,-.26)],.013,m['rail'])
  for z in [-.03,.045,.12]:
   box('Shell texture stud',(.11,-.020,z),(.011,.06,.024),m['accent'],.006)
  iron_sight(m,-.95)
  hand_arm('LEFT',m,-.19,-.23,-.72,-1)
  hand_arm('RIGHT',m,.16,-.245,.015,1)
 elif kind=='watcher':
  # Distinct bolt-action silhouette: smooth fluted long barrel and optic.
  poly('Bedded sniper action',[(.21,.09),(-.24,.105),(-.37,.025),
    (-.28,-.14),(.18,-.145)],.195,m['frame'],bevel=.032)
  stock(m,'skeleton',.76)
  poly('Long thin free-float rail',[(-.28,.062),(-1.05,.047),
    (-1.08,-.04),(-.32,-.091)],.169,m['body'],bevel=.028)
  barrel(m,-.37,-1.71,.039)
  for angle in range(5):
   off=(angle-2)*.032
   tube('Fluted rifle barrel',(off,-.009,-1.09),(off,-.009,-1.56),.010,m['dark'],10)
  poly('Small flush mag well',[(-.09,-.12),(-.27,-.12),(-.25,-.255),
    (-.11,-.268)],.14,m['grip'],bevel=.015)
  tube('Decorative nonfunctional bolt arm',(.13,.05,-.24),(.26,.043,-.20),.024,m['rail'],12)
  sphere('Bolt knob',(.27,.045,-.19),(.035,.035,.035),m['body'])
  # Contoured 3D optic with rings, lenses and mounts.
  tube('Scope optic main body',(0,.29,.0),(0,.29,-.44),.061,m['frame'],24)
  for z in [.0,-.34,-.44]:
   ring('Scope adjustment rings',(0,.29,z),.079,.055,.041,m['rail'])
  ring('Front scope glass',(0,.29,-.46),.068,.048,.033,m['dark'])
  box('Scope clamp front',(0,.19,-.32),(.1,.14,.055),m['rail'],.015)
  box('Scope clamp rear',(0,.19,-.08),(.1,.14,.055),m['rail'],.015)
  tube('Airsoft bipod hinge',(-.12,-.09,-1.02),(.12,-.09,-1.02),.039,m['rail'])
  for sign in [-1,1]:
   tube('Folded bipod leg',(sign*.12,-.1,-1.03),(sign*.16,-.20,-.65),.016,m['dark'],12)
  hand_arm('LEFT',m,-.16,-.22,-.66,-1)
  hand_arm('RIGHT',m,.175,-.24,.02,1)
def pistol(kind,m):
 is_long=kind=='tempo'
 front=-.58 if is_long else -.47
 tail=.16 if is_long else .10
 # Anatomical-inspired slide outline with angled forward muzzle and rear bevel
 poly('Ergonomic gas blowback slide',[(tail,.09),(front+.10,.11),
   (front,.049),(front,-.045),(tail-.025,-.047),
   (tail+.027,-.008)],.164,m['frame'],bevel=.025)
 poly('Polymer pistol lower',[(.12,-.047),(front+.11,-.058),
   (front+.17,-.105),(.11,-.160)],.151,m['body'],bevel=.019)
 # Separate contoured rounded handle
 poly('Swept textured GBB grip',[(.10,-.12),(-.048,-.10),
   (-.08,-.265),(.002,-.438),(.14,-.442),(.195,-.36),
   (.15,-.20)],.143,m['grip'],bevel=.035)
 box('Palm swell texture',( .065,-.287,.076),(.155,.23,.025),m['body'],.034)
 # Visible recoil-guide rod under bore and distinct round barrel mouth
 tube('6mm airsoft inner barrel',(0,.024,front+.05),(0,.024,front-.056),.030,m['dark'],24)
 ring('Orange safety barrel tip',(0,.022,front-.073),.064,.026,.099,m['safety'])
 ring('Airsoft bore aperture',(0,.022,front-.128),.030,.020,.013,m['dark'])
 curve('Sculpted trigger guard',[(-.058,-.115,-.07),
   (-.068,-.210,-.12),(-.068,-.212,-.33),
   (-.058,-.115,-.36)],.014,m['frame'])
 box('Trigger shoe',(-.032,-.166,-.205),(.020,.08,.016),m['rail'],.009)
 # Front and rear contrasting fiber-optic sight dots.
 box('Rear sight blade',(0,.13,tail-.055),(.105,.065,.052),m['dark'],.015)
 box('High-visibility front sight',(0,.15,front+.08),(.019,.058,.026),m['accent'],.007)
 # Decorative slide serrations follow actual slide contour rather than 3D blocks.
 for side in [-1,1]:
  x=side*.088
  for j in range(7 if is_long else 5):
   z=tail-.13-j*.034
   curve('Fine slide grip serration',[(x,.047,z),(x,.010,z-.008),
    (x,-.037,z-.017)],.0044,m['dark'],2)
  for j in range(9):
   z=.045+(j%3)*.020
   y=-.22-(j//3)*.053
   sphere('Molded grip microtexture',(side*.080,y,z),(.006,.006,.009),m['dark'])
  box('Airsoft polymer identification',(side*.082,.00,front+.19),(.008,.014,.07),m['accent'],.004)
 box('Magazine baseplate',(0,-.436,.065),(.168,.034,.155),m['body'],.020)
 if is_long:
  # Competition-inspired elongated barrel and original optic housing.
  box('Flat ventilated slide port',(0,.112,-.285),(.11,.012,.12),m['dark'],.011)
  red_dot(m,z=-.045,y=.17)
  tube('Accessory training light',(0,-.165,-.35),(0,-.165,-.47),.052,m['body'],18)
  ring('Training light face',(0,-.165,-.493),.050,.035,.027,m['rail'])
 else:
  box('Small underrail',(0,-.14,-.345),(.094,.029,.15),m['frame'],.010)
  for z in [-.30,-.35]:
   box('Accessory rail tooth',(0,-.163,z),(.10,.012,.025),m['rail'],.003)
 # One hand around grip; offhand bracing the trigger-side frame.
 hand_arm('MAIN',m,.10,-.25,.04,1,forearm=.37)
 hand_arm('SUPPORT',m,-.145,-.25,-.20,-1,forearm=.38)
def premium_surface_detail(kind,m):
 """Extra nonfunctional, game-only sculpt passes for premium FPS readability."""
 is_sidearm=kind in ['echo','tempo']
 if is_sidearm:
  # Sidearm slide machining, subtle dimples and ergonomic grip seams.
  for sign in [-1,1]:
   x=sign*.091
   for j in range(5):
    z=-.15-j*.049
    curve('Angled slide relief %s %d'%(sign,j),[(x,.091,z),(x,.06,z-.013),(x,.007,z-.018)],.0028,m['dark'],2)
   for row in range(5):
    for col in range(3):
     sphere('Grip stipple', (sign*.083,-.241-row*.034,.015+col*.042),(.003,.005,.005),m['frame'])
   tube('Frame assembly pin',(sign*.084,-.065,-.01),(sign*.097,-.065,-.01),.016,m['rail'],12)
  return
 # Rifles / carbines: receiver controls, fitted rail furniture, recessed
 # pin heads and flush surface grooves. Purely decorative; no mechanics.
 for sign in [-1,1]:
  for z,y in [(-.15,.008),(-.42,-.014)]:
   tube('Receiver pin bezel',(sign*.129,y,z),(sign*.135,y,z),.018,m['dark'],16)
   tube('Receiver pin core',(sign*.136,y,z),(sign*.140,y,z),.010,m['rail'],12)
  # Small panel seam, with recessed-looking routed edges.
  curve('Upper receiver side seam',[(sign*.136,.097,-.06),(sign*.136,.115,-.28),(sign*.136,.086,-.43)],.0028,m['dark'],2)
  curve('Lower receiver side seam',[(sign*.138,-.075,-.09),(sign*.138,-.104,-.24),(sign*.138,-.084,-.39)],.0035,m['dark'],2)
  for j in range(5):
   z=-.56-j*.078
   curve('Handguard chamfer score',[(sign*.126,.056,z),(sign*.133,.028,z-.012),(sign*.127,-.024,z-.023)],.0035,m['dark'],2)
  # Molded logo-safe BB marking, not copied from any manufacturer.
  box('Stamped BB safety insert',(sign*.137,.041,-.27),(.006,.023,.078),m['accent'],.003)
 # Display-only front lens flare band; readable in normal field of view.
 for z in [-.60,-.82]:
  ring('Handguard polished collar',(0,.005,z),.105,.091,.009,m['rail'],20)

WEAPONS=[
 ('vanguard','d5d791'),('ranger','6caca7'),('specter','91adcf'),
 ('atlas','c0a56d'),('whisper','b0c68a'),('breacher','aa895f'),
 ('watcher','90a09d'),('echo','b0b7ac'),('tempo','b7a0bd'),
]
for key,accent in WEAPONS:
 clear()
 m=colors(accent)
 if key in ['echo','tempo']:pistol(key,m)
 else:gun_body(key,m)
 premium_surface_detail(key,m)
 # Every variant has unmistakable proportions and separately modeled
 # round tube, grip and sight details (no shared clone/scaled placeholder).
 batch_export(key)
print('ALL_NINE_ORIGINAL_BLENDER_AIRSOFT_REPLICAS_COMPLETE',flush=True)
