"""Airsoft Arena ORIGINAL Blender asset generator.
Run: blender --background --python art/build_airsoft.py
Dimensions and positions use meters; produces source .blend plus optimized GLB.
Each design element is generated with Blender mesh primitives, applied modifiers,
named parts and physically based materials, NOT third-party store assets.
"""
import bpy,math,random,os
from mathutils import Vector
random.seed(17)
ROOT=os.getcwd()
OUT=os.path.join(ROOT,'client','public','assets')
ART=os.path.join(ROOT,'art')
os.makedirs(OUT,exist_ok=True);os.makedirs(ART,exist_ok=True)
def clear():
 bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
 for mat in bpy.data.materials: bpy.data.materials.remove(mat)
def mat(name,hexcode,metal=0.0,rough=.55,emiss=0):
 m=bpy.data.materials.new(name);m.diffuse_color=tuple(int(hexcode[i:i+2],16)/255 for i in (0,2,4))+(1,)
 m.use_nodes=True;p=m.node_tree.nodes.get('Principled BSDF')
 p.inputs['Base Color'].default_value=m.diffuse_color
 p.inputs['Metallic'].default_value=metal;p.inputs['Roughness'].default_value=rough
 if emiss:
  p.inputs['Emission Color'].default_value=m.diffuse_color
  p.inputs['Emission Strength'].default_value=emiss
 return m
def worldpos(x,y,z):return (x,-z,y)
def add_mat(o,m):
 o.data.materials.append(m);return o
def bevel(o,amount=.04,segments=2):
 if amount:
  b=o.modifiers.new('Rounded machined edges','BEVEL');b.width=amount;b.segments=segments;b.affect='EDGES'
  try:bpy.context.view_layer.objects.active=o;bpy.ops.object.modifier_apply(modifier=b.name)
  except Exception:pass
  n=o.modifiers.new('Weighted face normals','WEIGHTED_NORMAL')
  try:bpy.ops.object.modifier_apply(modifier=n.name)
  except Exception:pass
 return o
def cube(name,pos,dim,material,rounding=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=worldpos(*pos))
 o=bpy.context.object;o.name=name;o.dimensions=(dim[0],dim[2],dim[1])
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 add_mat(o,material);bevel(o,rounding);return o
def cylinder(name,pos,r,depth,material,axis='y',verts=14):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=depth,location=worldpos(*pos))
 o=bpy.context.object;o.name=name
 if axis=='x':o.rotation_euler[1]=math.pi/2
 if axis=='z':o.rotation_euler[0]=math.pi/2
 bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 add_mat(o,material);bevel(o,.016,2);return o
def tube(name,a,b,r,material,verts=9):
 A=Vector(worldpos(*a));B=Vector(worldpos(*b));d=B-A
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=d.length,location=(A+B)*.5)
 o=bpy.context.object;o.name=name;o.rotation_euler=d.to_track_quat('Z','Y').to_euler()
 bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 add_mat(o,material);return o
def text_label(label,pos,size,material,name=None,rotation=None):
 bpy.ops.object.text_add(location=worldpos(*pos))
 o=bpy.context.object;o.name=name or 'ZONE_'+label
 o.data.body=label;o.data.size=size;o.data.extrude=.001;o.data.bevel_depth=.0004
 o.data.align_x='CENTER';o.data.materials.append(material)
 # Text rests along game-side walls, normal towards the field.
 o.rotation_euler=(math.pi/2,0,rotation if rotation is not None else 0)
 bpy.context.view_layer.objects.active=o;bpy.ops.object.convert(target='MESH')
 return o
def mesh_group(name):
 c=bpy.data.collections.new(name);bpy.context.scene.collection.children.link(c);return c
def set_scene():
 bpy.context.scene.unit_settings.system='METRIC';bpy.context.scene.unit_settings.scale_length=1
 bpy.context.scene.render.engine='CYCLES';bpy.context.scene.cycles.samples=16
def save_and_export(fname,blend,objects=None):
 bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ART,blend))
 bpy.ops.object.select_all(action='DESELECT')
 targets=objects if objects is not None else [o for o in bpy.context.scene.objects if o.type=='MESH']
 for o in targets:o.select_set(True)
 bpy.context.view_layer.objects.active=next(iter(targets))
 bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,fname),export_format='GLB',use_selection=True,
  export_yup=True,export_apply=True,export_normals=True,export_materials='EXPORT')
 bpy.ops.object.select_all(action='DESELECT')

clear();set_scene()
concrete=mat('Sandblasted concrete','535e61',.02,.88)
concreteLight=mat('Concrete seam and trim','718080',.08,.74)
floor=mat('Polymer non-slip flooring','3c4e52',.10,.84)
floorline=mat('Lane safety lime','c5db5f',.1,.63)
black=mat('Rubber and shadow gaps','1c272b',.05,.86)
steel=mat('Gunmetal powdercoat','33474e',.82,.39)
edge=mat('Brushed galvanized steel','80999a',.64,.3)
wood=mat('Warm plywood panel','ae875b',.02,.75)
woodDark=mat('Dark plywood grain','645039',.03,.85)
rubber=mat('Olive inflatable fabric','758b56',0,.93)
rubberDark=mat('Inflatable seams','445b3b',0,.86)
blue=mat('Team blue accents','3d8894',.18,.5)
red=mat('Team coral accents','b65f49',.15,.57)
orange=mat('High-vis safety markings','edaa49',.0,.52)
white=mat('Illuminated sign paint','cfe7dc',.12,.44,emiss=1.6)
glow=mat('Overhead fluorescent diffuser','adf2df',.03,.25,emiss=2)
# Full architecturally modeled envelope. The original Rapier collision volumes
# are still used from shared/map.ts and remain independent of visible GLB geometry.
cube('FLOOR_POLISHED_CONCRETE',(0,-.41,0),(119.9,.82,79.9),floor,.02)
for x in [-59.8,59.8]:
 cube('EXTERIOR_WALL',(x,5.92,0),(.42,11.84,79.6),concrete,.04)
for z in [-39.8,39.8]:
 cube('EXTERIOR_WALL',(0,5.92,z),(119.8,11.84,.42),concrete,.04)
cube('METAL_ROOF',(0,12.32,0),(119.7,.30,79.4),steel,.07)
# Floor expansion seams + training lines + yellow caution line.
for z in range(-36,39,6):
 cube('FLOOR_SEAM',(0,.015,z),(118,.008,.028),black)
for x in range(-54,57,6):
 cube('FLOOR_SEAM',(x,.015,0),(.028,.008,78),black)
for x in [-9,9,-25,25]:
 cube('PAINTED_LANE_LINE',(x,.026,0),(.11,.016,77),floorline)
for z in [-34,34]:
 cube('ENDZONE_LANE_MARK',(0,.027,z),(92,.02,.12),orange)
for x in [-18,18]:
 c=blue if x<0 else red
 cube('SPAWN_ZONE_RING',(x,.035,0),(3.8,.018,.10),c)
 for z in [-2,2]:cube('SPAWN_ZONE_MARK',(x,.035,z),(3.9,.018,.10),c)
# Corrugated steel wall panel rhythm with protection beams.
for x in range(-57,59,6):
 for z in [-39.35,39.35]:
  cube('WALL_CHANNEL',(x,5.9,z),(.17,11.3,.21),steel,.03)
  cube('WALL_INSULATION',(x+2.4,7.9,z),(.075,6.3,.095),concreteLight,.005)
for z in range(-37,39,6):
 for x in [-59.35,59.35]:
  cube('WALL_CHANNEL',(x,5.9,z),(.18,11.3,.16),steel,.03)
# Protective wall base and high industrial window strips.
for x in [-59.6,59.6]:
 cube('WALL_KICKPLATE',(x,.80,0),(.14,1.6,78),steel,.035)
for z in [-39.6,39.6]:
 cube('WALL_KICKPLATE',(0,.80,z),(118,1.6,.15),steel,.035)
for z in [-39.55,39.55]:
 for x in range(-48,52,8):
  cube('WINDOW_DARK_GLASS',(x,9.25,z),(6.3,1.55,.14),blue,.028)
  for xx in [-3.15,3.15]:
   cube('WINDOW_FRAME',(x+xx,9.25,z),(0.11,1.75,.2),steel)
  cube('WINDOW_LINTEL',(x,10.10,z),(6.5,.12,.2),edge)
  cube('WINDOW_SILL',(x,8.42,z),(6.5,.11,.22),edge)
# Cross-braced roof trusses at regular 12-meter bays.
for z in range(-36,38,12):
 for x in range(-48,50,12):
  tube('STRUCTURAL_TRUSS',(x,11.65,z),(x+12,11.65,z),.12,steel)
  tube('DIAGONAL_TRUSS',(x,11.45,z),(x+12,12.0,z),.08,edge)
  tube('DIAGONAL_TRUSS',(x+12,11.45,z),(x,12.0,z),.08,edge)
# Realistic overhead work-lamp housings (no scene lighting baked in this pass).
for z in [-32,-21,-10,1,12,23,34]:
 for x in [-35,-17,1,19,37]:
  cube('LAMP_BRACKET',(x,11.78,z),(.22,.45,.3),steel,.03)
  cube('LIGHT_HOUSING',(x,11.48,z),(3.0,.19,.54),steel,.05)
  cube('DIFFUSER',(x,11.35,z),(2.72,.035,.31),glow,.016)
# Mezzanines: vented decking, rail posts and tube handrails.
for s in [-1,1]:
 x=s*47
 cube('MEZZANINE_STRUCTURE',(x,4.15,0),(25,.40,39),steel,.045)
 for z in range(-18,20,3):
  cube('MEZZ_DECK_GRIP',(x,4.36,z),(24.3,.018,.07),edge)
 for z in range(-18,20,3):
  cylinder('GUARDRAIL_POST',(s*33.5,4.95,z),.052,1.18,edge)
 tube('MEZZ_TOP_RAIL',(s*33.5,5.55,-19),(s*33.5,5.55,19),.075,edge)
 tube('MEZZ_BOTTOM_RAIL',(s*33.5,4.98,-19),(s*33.5,4.98,19),.05,steel)
 for z in [-16,-5,6,17]:
  cube('MEZZ_SUPPORT_COLUMN',(s*38,1.92,z),(.42,3.8,.46),steel,.04)
  cube('COLUMN_BASEPLATE',(s*38,.09,z),(.85,.18,.85),edge,.04)
 # elevated crossing and safety cage
 cube('CATWALK_DECK',(s*18.4,6.45,0),(2.8,.28,25),steel,.035)
 for z in range(-12,14,2):
  cube('CATWALK_ANTI_SLIP',(s*18.4,6.61,z),(2.65,.017,.09),edge)
 for z in range(-12,14,3):
  tube('CATWALK_POST',(s*16.98,6.58,z),(s*16.98,7.73,z),.046,edge)
 tube('CATWALK_GUARD_RAIL',(s*16.98,7.72,-12),(s*16.98,7.72,12),.062,edge)
 for i in range(9):
  xx=s*(33+i*1.6);h=.45+i*.85;y=.22+i*.43
  cube('RAMP_STAIR_STRUCTURE',(xx,y,25),(2.95,h,4.96),steel,.02)
  cube('RAMP_STEP_TREAD',(xx,y+h/2+.022,25),(2.88,.044,4.88),edge,.025)
  for z in [22.9,27.1]:
   cube('RAMP_STEP_BUMPER',(xx,y+h/2+.06,z),(2.89,.055,.12),orange)
# Zone barricades: visibly layered wood construction rather than a blank box.
def barricade(name,x,y,z,w,h,d,material):
 cube(name+'_INNER',(x,y,z),(w,h,d),material,.055)
 for xx in [x-w*.44,x+w*.44]:
  cube(name+'_FRAME',(xx,y,z+d*.515),(.12,h*.94,.12),woodDark,.023)
 for yy in [y-h*.42,y+h*.42]:
  cube(name+'_BRACE',(x,yy,z+d*.52),(w*.96,.11,.09),wood,.016)
 for offset in range(4):
  zz=z-d*.51
  cube(name+'_BACKGAP',(x-w*.46+(offset+.5)*w/4,y,zz),(.015,h*.74,.02),woodDark)
 for boltX in [-w*.40,w*.40]:
  for boltY in [-h*.37,h*.37]:
   cylinder(name+'_BOLT',(x+boltX,y+boltY,z+d*.62),.034,.027,edge,'z',10)
def bunker(name,x,y,z,w,h,d):
 # Inflation ribbing + seam color conveys soft vinyl instead of untextured cube.
 cube(name+'_VINYL',(x,y,z),(w*.96,h*.96,d*.92),rubber,.30)
 for yy in [y-h*.32,y+h*.32]:
  cube(name+'_WELDED_BAND',(x,yy,z+d*.47),(w*.9,.08,.06),rubberDark,.04)
 for xx in [x-w*.36,x+w*.36]:
  cylinder(name+'_INFLATED_SIDE',(xx,y,z),h*.23,d*.78,rubber,axis='z',verts=18)
 for xx in [x-w*.40,x+w*.40]:
  cube(name+'_NYLON_PATCH',(xx,y,z+d*.50),(.28,.29,.016),floorline,.022)
def container(name,x,z,w=6.2,d=3.7,color=None):
 color=color or blue
 cube(name+'_MAIN',(x,1.4,z),(w,2.79,d),color,.065)
 for xx in range(-5,6):
  cube(name+'_CORRUGATION',(x+xx*w/12,1.4,z+d*.52),(w/35,2.44,.07),edge,.012)
 for yy in [.24,2.52]:
  cube(name+'_SIDE_RAIL',(x,yy,z+d*.525),(w,.12,.14),steel,.018)
 for ox in [-w/2+.12,w/2-.12]:
  for oz in [-d/2+.1,d/2-.1]:
   cube(name+'_CORNER',(x+ox,1.43,z+oz),(.2,2.87,.22),steel,.024)
 for yy in [.35,2.45]:
  for ox in [-w*.43,w*.43]:
   cylinder(name+'_LATCH',(x+ox,yy,z+d*.56),.075,.06,orange,'z',12)
 for i in range(3):
  cube(name+'_DOOR_RIB',(x+w*.47-i*.20,1.3,z-d*.515),(.08,2.5,.09),black,.018)
for s in [-1,1]:
 for i in range(12):
  z=-29+i*5.3
  if i%3==1:continue
  x=s*(12+(i%3)*5)
  if i%3==0:barricade('WOOD_COVER',x,.85,z,3.5,1.7,2.3,wood)
  else:bunker('FOAM_COVER',x,.85,z,3.5,1.7,2.3)
 for i in range(5):
  x=s*(38+(i%2)*9);z=-31+i*15
  container('SHIPPING_CONTAINER',x,z,color=blue if s<0 else red)
 for i in range(7):
  z=-26+i*8;x=s*(30+(i%2)*7)
  barricade('SAFETY_BARRIER',x,.92,z,4,1.84,.4,wood)
for i in range(8):
 x=((i%2)*2-1)*5.5;z=-31+i*8.8
 bunker('CENTRAL_INFLATABLE',x,1.15,z,2.9,2.30,1.9)
# Nest + central platform match the existing physical platforms.
cube('CENTRAL_HEX_STAGE',(0,2.50,0),(8,.44,8),steel,.13)
cube('CENTRAL_SAFETY_MAT',(0,2.73,0),(7.25,.035,7.2),floor,.05)
cube('OBSERVATION_SNIPER_NEST',(0,5.35,-32),(13,.34,6),steel,.065)
for i in range(10):
 z=-18-i*1.35;h=.36+i;y=.18+i*.5
 cube('ACCESS_STEPS',(0,y,z),(2.4,h,1.8),steel,.018)
 cube('ACCESS_GRIP',(0,y+h/2+.03,z),(2.34,.05,1.7),edge,.027)
# Arena brand and wing identity; Blender vector fonts convert to actual GLB meshes.
for s in [-1,1]:
 x=s*50.0
 cube('TEAM_WALL_SIGN',(x,3.3,-39.23),(13,3.0,.17),black,.14)
 text_label('BLUE TEAM' if s<0 else 'RED TEAM',(x,2.75,-39.07),1.35,blue if s<0 else red)
for z,word in [(-37,'NORTH LANE'),(36,'SOUTH LANE')]:
 cube('FIELD_SIGN',(0,3.5,z),(12,2.2,.13),steel,.12)
 text_label(word,(0,3.1,z+.12),.83,white)
# Wall conduit and junction boxes, break up uniform wall silhouette.
for s in [-1,1]:
 for z in range(-32,33,16):
  x=s*59.3
  tube('WALL_POWER_CONDUIT',(x,3.8,z-5),(x,3.8,z+5),.07,edge)
  cube('WALL_JUNCTION_BOX',(x-s*.22,3.8,z),(.3,.54,.62),steel,.07)
  cylinder('STATUS_LAMP',(x-s*.39,3.9,z),.065,.05,orange,'x')
save_and_export('arena.glb','airsoft_arena.blend')
print('ARENA_RENDER_SOURCE_DONE')
# -----------------------------------------------------------
# Original replica and LEGO hands. Geometry intentionally rounded and layered,
# with machined-looking details and an unmistakable bright airsoft barrel tip.
# -----------------------------------------------------------
clear();set_scene()
frame=mat('Anodized graphite frame','313b44',.6,.33)
receiver=mat('Receiver polymer','424c50',.15,.49)
rubber=mat('Matte black polymer','1f272c',.0,.78)
aluminum=mat('Brushed alloy highlights','9eada5',.84,.27)
lime=mat('Airsoft safety accents','d5e86b',.07,.47)
orange=mat('Orange training muzzle','ef8a3f',0,.32)
skin=mat('Classic yellow plastic hand','f6ca59',0,.27)
cloth=mat('Minifigure team uniform','307c87',.12,.48)
slate=mat('Control microdetails','161e25',.08,.52)
def rounded(name,pos,dim,m,rad=.03):return cube(name,pos,dim,m,rad)
# All viewmodel coordinates are local glTF/game coordinates, held at screen right
# and pointing toward negative Z.
rounded('AERO_POLYMER_RECEIVER',(0,0,-.34),(.21,.20,.69),frame,.052)
rounded('LOWER_RECEIVER',(0,-.125,-.16),(.19,.145,.44),receiver,.05)
rounded('CHEEK_STOCK',(0,-.03,.22),(.18,.19,.45),rubber,.06)
rounded('AIRSOFT_MAGAZINE',(0,-.26,-.22),(.14,.29,.18),receiver,.027)
rounded('MAGAZINE_BASE',(0,-.407,-.22),(.17,.035,.19),rubber,.012)
rounded('PISTOL_GRIP',(0,-.24,.05),(.14,.29,.14),rubber,.038)
rounded('TRIGGER_GUARD',(0,-.156,-.055),(.17,.030,.29),aluminum,.02)
rounded('UPPER_HANDGUARD',(0,.025,-.77),(.235,.19,.50),frame,.047)
rounded('LOWER_HANDGUARD',(0,-.104,-.78),(.19,.035,.47),receiver,.022)
cylinder('AIRSOFT_INNER_BARREL',(0,0,-1.24),.043,.64,aluminum,'z',20)
cylinder('SAFETY_ORANGE_MUZZLE',(0,0,-1.48),.086,.12,orange,'z',22)
cylinder('MUZZLE_BB_APERTURE',(0,0,-1.55),.042,.018,slate,'z',18)
# Compact hooded fiber sight, mount and optic.
rounded('SIGHT_RISER',(0,.147,-.28),(.09,.11,.12),frame,.018)
rounded('DOT_SIGHT_BODY',(0,.227,-.32),(.155,.13,.18),receiver,.027)
cylinder('SIGHT_LENS_FRONT',(0,.23,-.425),.053,.018,slate,'z',20)
cylinder('SIGHT_LENS_RING',(0,.23,-.437),.063,.026,aluminum,'z',20)
rounded('SIGHT_BACK_UP',(0,.151,.0),(.10,.055,.06),aluminum,.018)
# Lots of machined aesthetic details without modeling any branded gun.
for side in [-1,1]:
 x=side*.124
 for i in range(6):
  rounded('VENT_SLOT', (x,-.010,-.58-i*.073),(.014,.035,.043),slate,.010)
  cylinder('VENT_SCREW',(x,.034,-.55-i*.075),.016,.013,aluminum,'x',8)
 for i in range(5):
  rounded('GRIP_RIB',(side*.071,-.20-i*.039,.068),(.015,.018,.145),slate,.006)
 for zz in [-.53,-.83,-1.02]:
  cylinder('RAIL_BOLT',(side*.131,.097,zz),.024,.021,aluminum,'x',10)
for zz in [-.67,-.81,-.95]:
 rounded('TOP_ACCESSORY_RAIL',(0,.131,zz),(.15,.016,.065),aluminum,.011)
rounded('SAFETY_SELECT',( .117,-.075,-.28),(.016,.06,.12),lime,.013)
rounded('HOPUP_LABEL',(0,.106,-.40),(.13,.012,.075),lime,.01)
rounded('MAGAZINE_INDICATOR',(0,-.335,-.126),(.10,.06,.009),orange,.008)
# Matching classic-minifigure FPS forearms and curved C-shaped hands.
def arm(prefix,s):
 rounded(prefix+'_SLEEVE',(s*.275,-.39,.25),(.22,.25,.51),cloth,.078)
 rounded(prefix+'_CUFF',(s*.27,-.305,.004),(.235,.102,.16),receiver,.046)
 cylinder(prefix+'_WRIST',(s*.25,-.27,-.08),.092,.14,skin,'z',16)
 rounded(prefix+'_HAND_BASE',(s*.20,-.245,-.155),(.185,.175,.22),skin,.072)
 # C-shaped plastic LEGO hand via 16-sided partial ring.
 points=[]
 cx=s*.19;cy=-.23;cz=-.22
 for i in range(15):
  angle=(.18+i/14*1.57)*math.pi
  p=(cx+math.cos(angle)*.086,cy+math.sin(angle)*.085,cz-.055)
  points.append(p)
 for i in range(len(points)-1):tube(prefix+'_C_GRIP',points[i],points[i+1],.028,skin,10)
arm('LEFT',-1);arm('RIGHT',1)
# Decorative body detail: molded selector puck + bright BB counter.
cylinder('FIRE_SELECTOR_DIAL',(.113,-.066,-.31),.037,.022,aluminum,'x')
rounded('AEG_STATUS_LIGHT',(.125,.057,-.24),(.012,.028,.056),lime,.010)
save_and_export('aeg_viewmodel.glb','airsoft_aeg_viewmodel.blend')
print('VIEWMODEL_RENDER_SOURCE_DONE')
