"""THE ARENA V2 — Original playable Blender environment for Airsoft Arena.
Generated from the EXACT JSON layout used by Rapier on both client and server.
1 Blender unit = 1 meter. All props designed and modeled here; no store assets.
The Blender source keeps named editable objects, runtime GLB merges by material.
Execute at repository root:
  blender --background --python art/build_arena_v2.py
"""
import bpy,math,random,json,os
from mathutils import Vector
random.seed(20261018)
ROOT=os.getcwd()
LAYOUT=json.load(open(os.path.join(ROOT,'shared','arena-layout.json')))
OUT=os.path.join(ROOT,'client','public','assets')
ART=os.path.join(ROOT,'art')
os.makedirs(OUT,exist_ok=True);os.makedirs(ART,exist_ok=True)
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
for old in list(bpy.data.materials):bpy.data.materials.remove(old)
bpy.context.scene.unit_settings.system='METRIC'
bpy.context.scene.unit_settings.scale_length=1
# Blender is Z-up; Three.js glTF is Y-up.
def coords(x,y,z):return(x,-z,y)
def color(hexcolor):
 return tuple(int(hexcolor[i:i+2],16)/255 for i in (0,2,4))+(1,)
def texture(name,tint,seed=1,style='grain',size=160):
 rng=random.Random(seed);img=bpy.data.images.new(name,width=size,height=size,alpha=False)
 base=color(tint);out=[]
 for y in range(size):
  for x in range(size):
   noise=rng.random()-.5
   if style=='concrete':
    dirt=math.sin(x*.12)*.035+math.sin((x+y)*.055)*.022
    v=noise*.10+dirt
    if x%40<2 or y%40<2:v-=.045
   elif style=='osb':
    grain=math.sin(x*.65+math.sin(y*.08)*2)*.075
    v=noise*.13+grain
   elif style=='steel':
    grain=math.sin(x*.24)*.014
    v=noise*.085+grain
   elif style=='rubber':
    v=noise*.07+math.sin(y*.3)*.006
   else:v=noise*.065
   out.extend([max(.014,min(1,base[0]+v)),max(.014,min(1,base[1]+v)),max(.014,min(1,base[2]+v)),1])
 img.pixels.foreach_set(out);img.pack();return img
def mat(name,hexcode,metal=0,rough=.7,emiss=0,pattern=None,seed=1):
 m=bpy.data.materials.new(name);m.use_nodes=True;m.diffuse_color=color(hexcode)
 n=m.node_tree.nodes;p=n.get('Principled BSDF')
 p.inputs['Metallic'].default_value=metal
 p.inputs['Roughness'].default_value=rough
 p.inputs['Base Color'].default_value=m.diffuse_color
 if pattern:
  im=texture(name+'_COLOR_BAKED',hexcode,seed,pattern)
  node=n.new('ShaderNodeTexImage');node.image=im
  m.node_tree.links.new(node.outputs['Color'],p.inputs['Base Color'])
 if emiss:
  p.inputs['Emission Color'].default_value=m.diffuse_color
  p.inputs['Emission Strength'].default_value=emiss
 return m
M={
 'floor':mat('01_WORN_CONCRETE_PBR','676e6c',0,.94,pattern='concrete',seed=31),
 'wall':mat('02_OLD_CONCRETE_PANEL','575c5a',.02,.84,pattern='concrete',seed=41),
 'steel':mat('03_POWDERCOATED_GUNMETAL','252b2d',.68,.51,pattern='steel',seed=72),
 'edge':mat('04_BRUSHED_ALUMINIUM','7b8585',.65,.36,pattern='steel',seed=12),
 'rust':mat('05_RUSTED_STEEL','86523a',.61,.7,pattern='steel',seed=48),
 'osb':mat('06_OSB_PLYWOOD_SHEETS','92734f',0,.87,pattern='osb',seed=94),
 'wood':mat('07_SOLID_PLYWOOD_FRAMING','5b402d',.02,.79,pattern='osb',seed=47),
 'paint':mat('08_SAFETY_ORANGE','f27430',.18,.52),
 'black':mat('09_DEEP_BLACK_MESH','13191a',.1,.86),
 'rubber':mat('10_INFLATABLE_VINYL','34393a',0,.93,pattern='rubber',seed=15),
 'blue':mat('11_BLUE_TEAM','2e5d72',.26,.55,pattern='steel',seed=41),
 'red':mat('12_RED_TEAM','853b32',.26,.58,pattern='steel',seed=36),
 'light':mat('13_FROSTED_WORKLIGHT_EMISSIVE','ecedcd',.01,.32,emiss=3.5),
 'sign':mat('14_SIGNAGE_TEXT','d4d4bd',.05,.67,emiss=.36),
 'shade':mat('15_WARM_BLACK_TRIM','1d2020',.17,.86),
 'tarp':mat('16_THICK_NYLON_TARP','292f2f',.01,.96,pattern='rubber',seed=22),
 'yellow':mat('17_WARNING_STRIPE','c29c4b',.07,.59),
 'grill':mat('18_LED_BLUE_PANEL','214653',.36,.31,emiss=.55),
 'neon_red':mat('19_LED_RED_TEAM','fe4e43',.1,.38,emiss=3.8),
 'neon_blue':mat('20_LED_CYAN_TEAM','36cbff',.1,.38,emiss=3.8),
 'neon_orange':mat('21_ARENA_ORANGE_NEON','ffad45',.07,.38,emiss=4.2),
 'dark_floor':mat('22_ANTI_SLIP_BLACK_FLOOR','202729',0,.82,pattern='rubber',seed=23),
 'safety_white':mat('23_GLOWING_SAFETY_SIGN','f7efd3',0,.6,emiss=2.2),
}
def apply(obj,name,ma,bevel=0):
 obj.name=name;obj.data.materials.append(ma)
 if bevel:
  mod=obj.modifiers.new('Factory rounded edges','BEVEL')
  mod.width=bevel;mod.segments=2;mod.limit_method='ANGLE'
  bpy.context.view_layer.objects.active=obj
  try:bpy.ops.object.modifier_apply(modifier=mod.name)
  except:pass
  weighted=obj.modifiers.new('Weighted normals','WEIGHTED_NORMAL')
  try:bpy.ops.object.modifier_apply(modifier=weighted.name)
  except:pass
 return obj
def cube(name,x,y,z,w,h,d,ma,bevel=0):
 bpy.ops.mesh.primitive_cube_add(size=1,location=coords(x,y,z))
 obj=bpy.context.object;obj.dimensions=(w,d,h)
 bpy.ops.object.transform_apply(location=False,rotation=False,scale=True)
 return apply(obj,name,ma,bevel)
def tube(name,a,b,r,ma,verts=8):
 av=Vector(coords(*a));bv=Vector(coords(*b));v=bv-av
 if v.length<.0001:return
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=v.length,location=(av+bv)*.5)
 obj=bpy.context.object;obj.rotation_euler=v.to_track_quat('Z','Y').to_euler()
 bpy.ops.object.transform_apply(location=False,rotation=True,scale=True)
 return apply(obj,name,ma)
def cylinder(name,x,y,z,r,h,ma,verts=14):
 bpy.ops.mesh.primitive_cylinder_add(vertices=verts,radius=r,depth=h,location=coords(x,y,z))
 return apply(bpy.context.object,name,ma,.012)
def sign(name,letters,x,y,z,size,ma=M['sign'],back=False):
 bpy.ops.object.text_add(location=coords(x,y,z))
 obj=bpy.context.object;obj.name=name;obj.data.body=letters
 obj.data.size=size;obj.data.extrude=.002;obj.data.bevel_depth=.0003
 obj.data.align_x='CENTER';obj.data.materials.append(ma)
 # Rotation faces down the main arena +/-Z direction.
 obj.rotation_euler=(math.pi/2,0,math.pi if back else 0)
 bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
 return bpy.context.object
def plane_billboard(name,x,y,z,w,h,ma):
 return cube(name,x,y,z,w,h,.028,ma,.006)
def bolts(name,x,y,z,wd,ht,ma,spacing=1):
 for dx in [-wd*.41,wd*.41]:
  for dy in [-ht*.41,ht*.41]:
   cylinder(name+'_BOLT',x+dx,y+dy,z+.02,.019,.018,ma,8)
def pallet(x,z):
 for j in [-.40,0,.40]:
  cube('PALLET_LOWER_SLATS',x,.10,z+j,1.33,.10,.20,M['wood'],.015)
 for dx in [-.52,0,.52]:
  cube('PALLET_CROSSBEAMS',x+dx,.055,z,.13,.11,1.3,M['wood'],.014)
def industrial_container(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 team=M['blue'] if x>0 else M['red']
 if b['id'].startswith('central'):team=M['steel']
 cube(b['id']+'_CORRUGATED_CARGO',x,y,z,w,h,d,team,.060)
 # Corrugated sheets and container recess lines on four faces.
 for dx in range(-12,13):
  pos=x+dx*w/26
  cube('CARGO_VERTICAL_RIB',pos,y,z+d/2+.032,.044,h*.89,.044,M['steel'],.008)
  cube('CARGO_VERTICAL_RIB',pos,y,z-d/2-.032,.044,h*.89,.044,M['steel'],.008)
 for dz in range(-5,6):
  pos=z+dz*d/12
  for side in [-1,1]:
   cube('CARGO_SIDE_CHANNEL',x+side*(w/2+.034),y,pos,.047,h*.87,.045,M['steel'],.008)
 for xx in [x-w/2+.10,x+w/2-.10]:
  for zz in [z-d/2+.10,z+d/2-.10]:
   cube('STRUCTURAL_CONTAINER_CORNER',xx,y,zz,.20,h+.04,.19,M['edge'],.016)
 for dy in [-h*.46,h*.46]:
  cube('METAL_CONTAINER_TRACK',x,y+dy,z+d/2+.038,w+.08,.12,.10,M['edge'],.013)
 for xx in [x-w*.24,x+w*.24]:
  tube('CARGO_LATCH_LEVER',(xx,.35,z+d/2+.09),(xx,h-.1,z+d/2+.09),.025,M['edge'])
 for zz in [z-d/2-.055,z+d/2+.055]:
  plane_billboard('TEAM_CONTAINER_MARK',x,y+.20,zz,1.6,.62,M['black'])
  sign('ASSET_CONTAINER_LOGO','AIRSOFT  /  6MM',x,y+.06,zz+(0.040 if zz>z else -.04),.25,M['sign'],back=zz<z)
def plywood_cover(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('BALLISTIC_PLYWOOD_OSB',x,y,z,w,h,d,M['osb'],.045)
 for face in [-1,1]:
  zz=z+face*(d/2+.016)
  for xx in [x-w*.43,x+w*.43]:
   cube('WOODEN_CORNER_JOIST',xx,y,zz,.135,h*.93,.095,M['wood'],.01)
  for yy in [y-h*.39,y+h*.39]:
   cube('WOODEN_HORIZONTAL_BRACE',x,yy,zz,w*.91,.10,.095,M['wood'],.008)
  # Rivets, panel seams, hand-painted rental field warning stripe.
  for xx in [x-w*.33,x+w*.33]:
   for yy in [y-h*.27,y+h*.27]:
    cylinder('OSB_PANEL_RIVET',xx,yy,zz+face*.07,.019,.013,M['shade'],8)
  cube('AIRSOFT_PANEL_ORANGE_TOP',x,y+h*.50-.05,zz,w*.92,.06,.025,M['paint'])
def concrete_cover(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('MODULAR_CONCRETE_ROAD_BLOCK',x,y,z,w,h,d,M['wall'],.065)
 for side in [-1,1]:
  zz=z+side*(d/2+.026)
  cube('CONCRETE_STAINED_PANEL',x,y,zz,w*.78,h*.81,.025,M['floor'],.014)
  for xx in [x-w*.42,x+w*.42]:
   tube('HOIST_ANCHOR',(xx,y+h*.35,zz+.014),(xx,y+h*.46,zz+.014),.029,M['rust'],10)
 cube('HAZARD_ORANGE_TOP',x,y+h/2+.005,z,w*.95,.024,d*.82,M['paint'],.008)
def inflatable(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('COMPRESSED_VINYL_BUNKER',x,y,z,w*.94,h*.95,d*.96,M['rubber'],.27)
 for dy in [-h*.30,h*.30]:
  cube('WELDED_INFLATABLE_SEAM',x,y+dy,z+d*.48,w*.85,.085,.05,M['shade'],.03)
 for dx in [-w*.36,w*.36]:
  tube('INFLATED_END_CAP',(x+dx,y-h*.34,z-d*.40),
   (x+dx,y+h*.34,z+d*.40),.094,M['rubber'],16)
 for side in [-1,1]:
  zz=z+side*(d/2+.018)
  plane_billboard('ORANGE_AIRSOFT_TRIANGLE_BASE',x,y,zz,.43,.48,M['paint'])
def metal_roof(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('INDUSTRIAL_ROOF_STRUCTURE',x,y,z,w,h,d,M['shade'],.03)
 # Lower slatted acoustic tiles lit by blue accent strips; underside visible.
 for xx in range(-55,60,11):
  for zz in range(-36,39,12):
   cube('ROOF_DROP_PANEL',xx,11.97,zz,10.3,.09,11.25,M['steel'],.016)
 for zz in range(-34,35,10):
  for xx in [-42,-14,14,42]:
   cube('LONG_LED_HOUSING',xx,11.72,zz,4.2,.21,.70,M['steel'],.04)
   cube('LED_DIFFUSER',xx,11.56,zz,3.87,.04,.46,M['light'],.018)
 # Cross-braced industrial high-bay trusses span the warehouse.
 for zz in range(-35,39,10):
  for xx in range(-54,54,12):
   tube('TRUSS_LOWER_CHORD',(xx,11.54,zz),(xx+12,11.54,zz),.13,M['edge'],9)
   tube('TRUSS_UPPER_CHORD',(xx,12.05,zz),(xx+12,12.05,zz),.075,M['steel'],9)
   tube('TRUSS_DIAGONAL',(xx,11.55,zz),(xx+12,12.04,zz),.067,M['edge'])
   tube('TRUSS_REVERSE',(xx+12,11.55,zz),(xx,12.04,zz),.065,M['steel'])
 # Main large central strip fixtures every 12m.
 for zz in range(-34,37,12):
  cylinder('HANGING_LIGHT_SOCKET',0,11.68,zz,.16,.26,M['edge'])
  cube('HANGING_LIGHT_DIFFUSER',0,11.47,zz,3.5,.075,.72,M['light'],.02)
def walls(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube(b['id']+'_CONCRETE_SHELL',x,y,z,w,h,d,M['wall'],.02)
 side='x' if w<d else 'z'
 if side=='z':
  zz=z+(-.04 if z>0 else .04)
  for xx in range(-54,56,6):
   cube('STEEL_VERTICAL_WALL_RIB',xx,5.80,zz,.14,11.3,.12,M['steel'],.014)
  for xx in range(-52,55,9):
   cube('HIGH_WINDOW_GLASS',xx,9.20,zz+(0.10 if z>0 else -.10),
     7.0,1.50,.11,M['grill'],.017)
   cube('GLASS_WINDOW_LINTEL',xx,9.97,zz,7.1,.09,.12,M['edge'],.009)
  for xx in range(-48,55,12):
   cube('INSET_WALL_CONTROL_PANEL',xx,2.20,zz,1.13,1.25,.08,M['steel'],.022)
 else:
  xx=x+(.06 if x<0 else -.06)
  for zz in range(-34,37,7):
   cube('WAREHOUSE_SIDE_WALL_BEAM',xx,5.9,zz,.17,11.8,.16,M['steel'],.015)
   cube('WAREHOUSE_SIDE_HIGH_WINDOW',xx+(0.095 if x<0 else -.095),9.15,zz,
     .065,1.4,5.0,M['grill'],.019)
  for zz in range(-32,33,16):
   cube('BAY_JUNCTION_BOX',xx,3.2,zz,.19,.70,.86,M['edge'],.035)
   tube('EXPOSED_INDUSTRIAL_CABLE',(xx,3.6,zz-6),(xx,3.6,zz+6),
    .036,M['black'])
 # Low collision walls have decorative protection panels and corner trim.
def upper_mezz(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('CATWALK_STRUCTURAL_DECK',x,y,z,w,h,d,M['steel'],.04)
 cube('ANTI_SLIP_PLATE',x,y+h/2+.013,z,w-.15,.014,d-.18,M['edge'],.017)
 for zz in range(-33,19,1):
  cube('CATWALK_DRAINAGE_GRATE',x,y+h/2+.024,zz,w-.4,.006,.045,M['shade'])
 for zz in [-33,-19,-5,9,18]:
  tube('DECK_SUPPORT_CROSS_MEMBER',(x-w/2,y-h/2-.30,zz),
   (x+w/2,y-h/2-.30,zz),.13,M['steel'],8)
 # Fence posts and visible mesh match the solid waist-high Rapier railing.
 inn=x-7 if x>0 else x+7
 for zz in range(-33,20,3):
  tube('CATWALK_CAGE_POST',(inn,4.42,zz),(inn,5.58,zz),.045,M['edge'],10)
 tube('CATWALK_HANDRAIL',(inn,5.55,-34),(inn,5.55,19),.058,M['edge'],10)
 tube('LOW_CAGE_RAIL',(inn,4.89,-34),(inn,4.89,19),.035,M['shade'],8)
 for zz in range(-33,18,3):
  for dy in range(3):
   tube('WOVEN_NET_GUARD',(inn,4.68+dy*.23,zz),
    (inn,4.68+dy*.23,zz+2.8),.010,M['black'],6)
def stair(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('HEAVY_STAIR_STRUCTURE',x,y,z,w,h,d,M['steel'],.011)
 cube('RUBBERIZED_GRIP_STEP',x,h+.012,z,w-.12,.025,d-.07,M['edge'],.011)
 cube('STAIR_ORANGE_NOSING',x,h+.031,z+d/2-.052,w-.10,.025,.082,M['paint'],.007)
 # Horizontal grooves across anti-slip tread.
 if 'central-stair' in b['id'] or b['id'].endswith(('-4','-8','-12','-15')):
  for dz in [-d*.25,0,d*.25]:
   cube('TREAD_GRIP_LINES',x,h+.029,z+dz,w*.85,.008,.023,M['shade'])
def rail(b):
 # Visually open rail and net (rather than a fake opaque slab).
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 if d>w:
  for zz in [z-d/2+i*2.3 for i in range(int(d/2.3)+1)]:
   tube('GUARD_RAIL_VERTICAL',(x,y-h*.48,zz),(x,y+h*.46,zz),.039,M['edge'])
  for yy in [y-h*.45,y+h*.42]:
   tube('GUARD_RAIL_LONG',(x,yy,z-d/2),(x,yy,z+d/2),.050,M['steel'])
 else:
  for xx in [x-w/2+i*2.3 for i in range(int(w/2.3)+1)]:
   tube('GUARD_RAIL_VERTICAL',(xx,y-h*.48,z),(xx,y+h*.46,z),.039,M['edge'])
  for yy in [y-h*.45,y+h*.42]:
   tube('GUARD_RAIL_LONG',(x-w/2,yy,z),(x+w/2,yy,z),.050,M['steel'])
def netting(b):
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 for zz in [z-d/2+i*.75 for i in range(int(d/.75)+1)]:
  tube('NYLON_VERTICAL_NETTING',(x,y-h/2,zz),(x,y+h/2,zz),.010,M['black'],6)
 for yy in [y-h/2+i*.60 for i in range(int(h/.60)+1)]:
  tube('NYLON_HORIZONTAL_NETTING',(x,yy,z-d/2),(x,yy,z+d/2),.010,M['black'],6)
 for zz in [z-d/2,z+d/2]:
  tube('NET_SUPPORT_POLE',(x,y-h/2,zz),(x,y+h/2,zz),.035,M['steel'])
def wear_floor():
 # These tiny shapes are visual only and don't add obstacles to the server.
 for xx in range(-54,58,6):
  cube('FLOOR_MOVEMENT_JOINT',xx,.016,0,.020,.008,75,M['shade'])
 for zz in range(-36,37,6):
  cube('FLOOR_MOVEMENT_JOINT',0,.016,zz,113,.008,.02,M['shade'])
 for side in [-1,1]:
  cube('TEAM_CENTERLINE_BOUNDARY',side*19,.027,0,.084,.009,72,M['paint'])
  for zz in [-33,33]:
   cube('FIELD_ZONE_MARKER',side*40,.027,zz,21,.009,.08,M['yellow'])
  cube('FLOOR_TEAM_BASE',side*51,.027,2,7.2,.013,.10,M['blue'] if side>0 else M['red'])
 for zz in [-30,30]:
  cube('ORANGE_CENTRAL_GUIDE',0,.025,zz,35,.012,.095,M['paint'])
 # Center marker has platform above it; floor stamp is visible at its edge.
 for dx in [-9,9]:
  cube('MIDFIELD_STOP_LINE',dx,.029,0,.08,.012,19,M['yellow'])
def worklight(name,x,y,z):
 cube(name+'_OVERHEAD_HOUSING',x,y,z,3.10,.19,.70,M['steel'],.055)
 cube(name+'_LED_LUMINESCENT_PANEL',x,y-.126,z,2.82,.043,.43,M['light'],.015)
 for xx in [x-1.45,x+1.45]:
  tube(name+'_SUPPORT_ROD',(xx,y+.08,z),(xx,y+.67,z),.031,M['edge'])
def cargo_detail():
 for side in [-1,1]:
  sx=side*52
  # Raised upper-level team doors are decorative, remain at back of walkways.
  for zz in [-26,3]:
   cube('UPPER_STORAGE_ROOM_DOOR',sx,6.78,zz,3.7,3.00,.15,
    M['blue'] if side>0 else M['red'],.025)
   cube('OVERDOOR_ESCAPE_LAMP',sx,8.52,zz,1.10,.11,.20,M['light'],.023)
  for zz in [-28,-18,-8,2,12]:
   cube('LOW_WALL_WORKLIGHT',side*58.97,4.4,zz,.12,.6,.18,M['light'],.02)
def hanging_banner(word,x,z,team=None):
 ma=M['blue'] if team=='blue' else M['red'] if team=='red' else M['shade']
 cube(word+'_BRANDED_HANGING_BANNER',x,8.0,z,5.5,2.7,.08,ma,.08)
 cube('BANNER_ORANGE_ACCENT',x,6.92,z+.067,5.1,.075,.07,M['paint'])
 sign('BANNER_TEXT_'+word,word,x,7.70,z+.09,.56,M['sign'])
 for xx in [x-2.4,x+2.4]:
  tube('BANNER_CABLE',(xx,9.30,z),(xx,11.28,z),.022,M['edge'])
def safety_details():
 # Decor only, away from ground-level traversable lanes.
 for side in [-1,1]:
  for zz in [-31,31]:
   # Stacks of foam-filled barricade modules in the far enclosure corners.
   x=side*56
   for j in range(3):
    cube('WALL_PAD_STAGGERED_STACK',x,.24+j*.50,zz,
      1.05,.46,1.9,M['rubber'],.08)
   cube('BASE_ORANGE_ANGLE_PAD',x,1.73,zz,1.05,.16,1.9,M['paint'],.03)
  for zz in [-32,0,32]:
   # Cable ducts above reach height—no player ghost collisions.
   tube('POWER_CEILING_PIPE',(side*55,10.85,zz-5),
    (side*55,10.85,zz+5),.052,M['edge'])
   cylinder('WARNING_BEACON',side*55,9.3,zz,.10,.25,M['paint'],12)
 # Floor pallet details only at positions covered by actual collider crates.
 for x,z in [(-31.5,-27),(31.5,-27),(-31.5,27),(31.5,27)]:
  pallet(x,z+3)
def brand_environment():
 # The viewpoint map illustration emphasizes orange lines and large team signs.
 for side in [-1,1]:
  x=side*49.5
  cube('TEAM_BASE_HUGE_BANNER',x,7.40,-39.10,15,3.30,.16,
   M['blue'] if side>0 else M['red'],.045)
  sign('RED_BASE_SIGN' if side<0 else 'BLUE_BASE_SIGN',
   'RED BASE' if side<0 else 'BLUE BASE',x,7.10,-38.97,.98,M['sign'])
  # Enlarged wall mark with safe low-poly backing for readability.
  cube('TEAM_SIGN_FRAME',x,5.75,-39.06,14,.07,.14,M['paint'])
 # Central branding above the end wall, with wall spotlights.
 cube('ARENA_LOGO_PANEL',0,7.45,-39.12,25,5.1,.17,M['shade'],.08)
 sign('ARENA_MASTER_NAME','THE ARENA',0,7.55,-38.97,1.25,M['sign'])
 sign('ARENA_MASTER_STRAPLINE','PLAY  -  MOVE  -  OUTSMART',0,6.50,-38.94,.34,M['paint'])
 for xx in [-28,28]:
  sign('TEAM_SIDE_MARKER','WEST SIDE' if xx<0 else 'EAST SIDE',
   xx,3.6,-38.96,.62,M['sign'])
 for word,xx in [('PLAY',-21),('MOVE',-12),('OUTSMART',12),('RESPAWN',21)]:
  hanging_banner(word,xx,-33)
 # Visible overhead mezzanine sign, hanging between the wings.
 cube('MEZZANINE_BRAND_BOX',0,8.35,-22.1,20,1.45,.14,M['steel'],.04)
 sign('MEZZANINE_ZONE_TEXT','MEZZANINE',0,8.12,-21.99,.67,M['sign'])
 for xx in [-26,26]:
  sign('SIDE_LANE_CATEGORY','ALPHA LANE' if xx<0 else 'BRAVO LANE',
   xx,4.0,38.95,.72,M['sign'],back=True)
 # Decorative central brand on the raised center-platform west-facing rib.
 cube('CENTRAL_ORANGE_LOGO',0,2.38,3.76,3.1,.60,.06,M['paint'],.02)
 sign('MIDFIELD_CENTRAL_TEXT','CENTRAL',0,.05,20.80,1.0,M['sign'])
def support_frame():
 # Upper platform cross supports and post bases—aligned with mezz colliders.
 for side in [-1,1]:
  for zz in [-30,-14,6,17]:
   x=side*44.3
   cube('PLATFORM_SUPPORT_GUSSET',x,3.52,zz,.80,.38,1.35,M['steel'],.04)
   cube('COLUMN_FOOT_STEEL_SHOE',x,.12,zz,.74,.24,.74,M['rust'],.018)
  for zz in [-25,-8,10]:
   for xx in [side*48,side*55]:
    cube('MEZZANINE_GROUND_ANCHOR',xx,4.10,zz,.23,.21,.23,M['edge'],.012)
 # Rollup door markings high on outer walls—purely decorative.
 for side in [-1,1]:
  x=side*58.98
  for z in [-18,14]:
   cube('ROLLUP_SERVICE_BAY',x,5.55,z,.09,3.75,6.5,M['steel'],.04)
   for y in [4.1,4.7,5.3,5.9,6.5,7.1]:
    cube('ROLLUP_DOOR_HORIZONTAL_SLAT',x-side*.08,y,z,.035,.055,6.28,M['edge'])

def sign_facing_x(name,word,x,y,z,size,positive=False,ma=None):
 # Custom airsoft arena text aligned in the Y-Z wall plane to face both
 # teams running along the X axis. The old arena signs only faced Z, so
 # neither spawn could actually read its title while looking forward.
 if ma is None:ma=M['safety_white']
 bpy.ops.object.text_add(location=coords(x,y,z))
 obj=bpy.context.object;obj.name=name;obj.data.body=word
 obj.data.size=size;obj.data.extrude=.0025;obj.data.bevel_depth=.0004
 obj.data.align_x='CENTER';obj.data.materials.append(ma)
 obj.rotation_euler=(math.pi/2,0,math.pi/2 if positive else -math.pi/2)
 bpy.context.view_layer.objects.active=obj;bpy.ops.object.convert(target='MESH')
 return bpy.context.object

def elevated_team_gateway(x,team):
 """Suspended competition entrance with vivid angular steel canopy.
 All elements are above y=4m, outside the player's collider and aiming path;
 no client/server collision disparity or invisible blocking.
 """
 color=M['neon_red'] if team=='red' else M['neon_blue']
 paint=M['red'] if team=='red' else M['blue']
 for zz in [-12,12]:
  # Beam hangers grow from roof, not from floor and cannot trap a player.
  tube('ARENA_SUSPENDED_TRUSS', (x,11.5,zz),(x,6.65,zz),.13,M['steel'],12)
  cube('GATEWAY_VERTICAL_TEAM_RIB',x,6.8,zz,.50,4.5,.66,paint,.045)
  cube('TEAM_NEON_VERTICAL_TUBE',x,6.8,zz+(.365 if zz>0 else -.365),
   .22,4.0,.09,color,.025)
  cube('UPPER_BRACED_KNEE',x,10.0,zz,.70,.50,1.55,M['edge'],.05)
 # Top horizontal span creates a dramatic iconic frame and visible point
 # of interest from the exact first-person spawn direction.
 cube('PANORAMIC_TEAM_GATEWAY_HEADER',x,9.3,0,.64,1.40,26,paint,.065)
 cube('FRONT_TEAM_GATEWAY_NEON',x-.39 if team=='red' else x+.39,
  9.9,0,.09,.14,24.4,color,.028)
 cube('BASE_GATEWAY_ORANGE_CROWN',x,10.23,0,.48,.12,24.8,M['neon_orange'],.025)
 # Reinforced diagonal X panel geometry evokes professional arena scaffolds.
 for side in [-1,1]:
  z=side*12
  tube('GATEWAY_X_HERITAGE_BRACE',(x,7.3,z),
    (x,9.9,side*9.0),.094,M['edge'],10)
  tube('GATEWAY_X_REVERSE_BRACE',(x,9.9,z),
    (x,7.3,side*9.0),.094,M['steel'],10)
 # A true 3D geometry logo rather than another 2D generated picture.
 cube('GATEWAY_ICON_BACKPLATE',x,8.5,0,.34,1.4,8.7,M['black'],.04)
 for k in [-1,1]:
  at=x-.21 if team=='red' else x+.21
  sign_facing_x('GATEWAY_BASE_SIGN_'+team,'RED BASE' if team=='red'
   else 'BLUE BASE',at,8.28,k*.0, .73,positive=(team=='blue'))
 # Dangerous in-game platforms are never implied: access is only on
 # physically matched mezzanines, central stairs and raised container roof.

def center_command_pavilion():
 """Iconic competition centerpiece visible from both spawn directions.
 High hanging panels, orange neon ribbon and four-sided arena identities.
 """
 # Two rows of central suspended outriggers, far above playable head room.
 for sx in [-7.0,7.0]:
  for zz in [-10.0,10.0]:
   tube('COMMAND_PAVILION_ROOF_HANGER',(sx,11.5,zz),
    (sx,7.5,zz),.12,M['edge'],10)
 for z in [-10,10]:
  cube('CENTRAL_LED_RIB',0,8.0,z,18,.38,.62,M['neon_orange'],.035)
  cube('CENTRAL_RIB_INNER_STEEL',0,7.7,z,17.3,.28,.40,M['steel'],.025)
 for x in [-8,8]:
  cube('CENTRAL_BRANDED_BULKHEAD',x,8.10,0,.34,2.8,18.2,M['shade'],.06)
  cube('CENTRAL_BULKHEAD_TOP_LIGHT',x,9.56,0,.36,.15,17.8,
   M['neon_orange'],.04)
  cube('CENTRAL_BULKHEAD_LOWER_STRIPE',x,6.69,0,.36,.08,17.8,
   M['neon_orange'],.018)
 # The huge illuminated title is readable by the players approaching
 # the center from either side of the warehouse.
 for face in [-1,1]:
  x=face*8.22
  sign_facing_x('MAIN_CENTRAL_TITLE', 'THE ARENA',x,8.10,-5.1,
   .90,positive=face>0,ma=M['safety_white'])
  sign_facing_x('MAIN_CENTRAL_VERSION', 'INDUSTRIAL V2',x,7.16,-5.0,
   .30,positive=face>0,ma=M['neon_orange'])
 # Distinctive overhead cross-rib bridge frame connecting the original
 # mezzanine towers without adding falsely walkable surfaces.
 for z in [-8,8]:
  tube('DISTANT_CENTRAL_ANGLE_BRACE',(-31,9.4,z),
   (0,7.1,z),.11,M['edge'],10)
  tube('DISTANT_CENTRAL_ANGLE_BRACE',(31,9.4,z),
   (0,7.1,z),.11,M['edge'],10)

def dramatic_floor_zones():
 """Oversized angular tournament lane floor treatment, unique to Arena V2.
 Decals are only 1cm high: visual, not simulation collision obstacles.
 """
 # Distinct asphalt-black competition lanes replace a sea of bare concrete.
 cube('CENTRAL_BATTLE_FLOOR_BLACK',0,.024,0,20,.021,40,M['dark_floor'],.012)
 for side in [-1,1]:
  teamColor=M['red'] if side==-1 else M['blue']
  neon=M['neon_red'] if side==-1 else M['neon_blue']
  cube('TEAM_DARK_RUBBER_RUNNING_LANE',side*35,.023,0,38,.015,12,
   M['dark_floor'],.012)
  cube('GLOWING_TEAM_SPRINT_TRACK',side*33,.041,-6.2,44,.020,.18,
   neon,.01)
  cube('TEAM_TRACK_PAIRED_BORDER',side*33,.041,6.2,44,.020,.18,
   neon,.01)
  for pos in range(4):
   x=side*(17+pos*9)
   for z in [-4.0,4.0]:
    cube('TEAM_SPEED_STENCIL',x,.041,z,1.5,.014,1.1,teamColor,.05)
  # Approaching the center players see the large color-coded capture
  # thresholds even at low graphics settings.
  cube('GATEWAY_TOUCHLINE',side*15,.052,0,.35,.020,31,neon,.011)
 for z in [-17,17]:
  cube('MIDFIELD_BRIGHT_ORANGE_HAZARD_BORDER',0,.055,z,20,.021,.22,
   M['neon_orange'],.011)
 for x in [-9,9]:
  cube('MIDFIELD_BRIGHT_ORANGE_HAZARD_BORDER',x,.055,0,.22,.021,34,
   M['neon_orange'],.011)
 # Perforated-looking decals to denote the raised central objective.
 for dx in [-1,0,1]:
  for zz in [-24,-21,21,24]:
   cube('CONCRETE_INSET_WARNING_RAIL',dx*2.7,.040,zz,2.4,.016,.10,
    M['yellow'],.009)


def cover_circuit_panel(b):
 """Original Blender-modeled airsoft plywood obstacles with visible OSB grain,
 layered frame rails, reinforced corners, screwed steel shoes and impact marks.
 No detail protrudes enough to act as misleading invisible/hittable cover:
 the shared collision cuboid encloses the dominant solid bunker volume.
 """
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 ident=b['id'];is_upper='cover-mezz-' in ident
 is_corner='corner' in ident
 is_low='cover-low-' in ident
 kind='UPPER_WALKWAY' if is_upper else 'SLIDE_BARRICADE' if is_low else 'MODULAR_AIRSOFT_WALL'
 cube(kind+'_LAYERED_OSB_'+ident,x,y,z,w*.96,h*.96,d*.96,M['osb'],.024)
 # Design both long-side broad faces. "thin X" panels point at players
 # sprinting east/west; cover must have its detail on that visible side.
 if w<d*.64:
  for direction in [-1,1]:
   xx=x+direction*w*.50
   cube('REINFORCED_METAL_FACE_TRIM',xx,y,z,.065,h*.95,d*.91,M['wood'],.014)
   # Paint a few wide OSB sheet panels on the outward face.
   for zz in [z-d*.31,z,z+d*.31]:
    cube('WOODEN_PLYWOOD_REPLACEMENT_SHEET',xx+direction*.048,y,zz,
     .026,h*.83,d*.27,M['osb'],.007)
   for zz in [z-d*.43,z+d*.43]:
    cube('FIELD_FRAME_OUTER_VERTICAL',xx+direction*.068,y,zz,
     .060,h*.96,.092,M['steel'],.012)
   for yy in [y-h*.42,y+h*.42]:
    cube('FIELD_FRAME_WELDED_HORIZONTAL',xx+direction*.069,yy,z,
     .060,.095,d*.93,M['edge'],.011)
   for zz in [z-d*.37,z,z+d*.37]:
    for yy in [y-h*.28,y+h*.28]:
     tube('PANEL_SAFETY_BOLT',(xx+direction*.10,yy,zz),
      (xx+direction*.122,yy,zz),.013,M['shade'],8)
  # A realistic visible hazard cap and scuffed base foot.
  cube('FIELD_WALL_ORANGE_MARKER',x,y+h*.47,z,w*.99,.058,d*.92,M['paint'],.008)
  cube('MODULAR_SUPPORT_SKID',x,y-h*.48,z,w*.99,.065,d*.88,M['grip'] if 'grip' in M else M['rubber'],.012)
 else:
  # Squat waist-high blocks: authentic stacked OSB and rental field frame
  # braces; ideal endpoints for a crouch or slide.
  for direction in [-1,1]:
   zz=z+direction*d*.50
   cube('LOW_COVER_FRONT_SHEET',x,y,zz,w*.91,h*.84,.040,M['osb'],.011)
   for xx in [x-w*.43,x+w*.43]:
    cube('LOW_COVER_STEEL_SIDE_FRAME',xx,y,zz+direction*.036,
     .085,h*.95,.052,M['steel'],.013)
   for yy in [y-h*.42,y+h*.42]:
    cube('REINFORCED_LOW_COVER_CROSSBAR',x,yy,zz+direction*.052,
     w*.91,.083,.057,M['wood'],.009)
   for xx in [x-w*.29,x+w*.29]:
    for yy in [y-h*.25,y+h*.25]:
     tube('LOW_PANEL_FASTENER',(xx,yy,zz+direction*.07),
      (xx,yy,zz+direction*.094),.013,M['shade'],8)
  cube('FIELD_ORANGE_SLIDE_STRIPE',x,y+h*.46,z,w*.90,.063,d*.91,M['paint'],.01)
 # Light decal numbers give the cover the look of a tournament facility.
 # Reuse embossed geometry rather than importing store assets.
 if int(sum(ord(c) for c in ident))%3==0:
  if w<d*.64:sign_facing_x('FIELD_LANE_STENCIL','6MM - AIRSOFT',
   x+w*.54,y-.18,z-.60,.18,positive=x>0,ma=M['sign'])
  else:sign('FIELD_LANE_STENCIL','AIRSOFT',
   x,y-.08,z+d*.54,.18,M['sign'])

def cover_circuit_pallet(b):
 """Low stacks made from handmade slats/frames and bolt hardware,
 positioned exactly over their shared server-side wooden collision boxes.
 """
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('BURIED_COLLISION_MATCHED_PALLET_CRATE_CORE',x,y,z,w*.95,h*.93,d*.94,M['wood'],.042)
 for yy in [y-h*.34,y,y+h*.34]:
  for dx in [-w*.41,0,w*.41]:
   cube('REFINISHED_PALLET_VERTICAL_SLAT',x+dx,yy,z+d*.48,.16,h*.28,.073,
    M['osb'],.015)
   cube('REAR_PALLET_SLAT',x+dx,yy,z-d*.48,.16,h*.28,.073,
    M['osb'],.015)
  for zz in [-d*.43,d*.43]:
   cube('PRACTICE_FIELD_PALLET_PLANK',x,yy,z+zz,w*.94,.11,.16,
    M['edge'] if yy>y else M['wood'],.015)
 for xx in [x-w*.45,x+w*.45]:
  for zz in [z-d*.41,z+d*.41]:
   cube('PALLET_BOLT_AND_CORNER_POST',xx,y,zz,.105,h*.95,.10,M['steel'],.014)
 cube('PALLET_AIRSOFT_ORANGE_LANE_BAND',x,y+h*.48,z,w*.92,.052,d*.90,
  M['paint'],.009)
 for xx in [x-w*.42,x+w*.42]:
  tube('PALLET_TIE_ROD',(xx,y-h*.32,z+d*.51),
   (xx,y+h*.35,z+d*.51),.022,M['shade'],10)

def cover_circuit_foam(b):
 """Airsoft tournament inflatable bunker: formed vinyl shell, weld seams,
 endcaps, anchor eyes and safety number decals. Solid for BB hits in Rapier.
 """
 x,y,z,w,h,d=(b[k] for k in ('x','y','z','w','h','d'))
 cube('AIRFILLED_MOLDED_VINYL_CORE',x,y,z,w*.97,h*.97,d*.97,M['rubber'],.30)
 # Molded tube-shaped seams sit on the four exposed sides of the foam bunkers.
 for sy in [-1,1]:
  y1=y+sy*h*.36
  for sz in [-1,1]:
   tube('INFLATABLE_WELDED_DOME_SEAM',(x-w*.40,y1,z+sz*d*.44),
    (x+w*.40,y1,z+sz*d*.44),.051,M['shade'],14)
 for xx in [x-w*.35,x+w*.35]:
  tube('INFLATABLE_REINFORCED_CORNER',(xx,y-h*.40,z+d*.42),
   (xx,y+h*.40,z+d*.42),.085,M['rubber'],14)
 for sz in [-1,1]:
  zz=z+sz*d*.49
  cube('SOFT_FIELD_TEAM_PATCH',x,y+.11,zz,w*.45,h*.39,.027,M['paint'],.040)
  cube('SOFT_FIELD_RUBBER_RAISED_NUMERAL_BACK',x,y-.21,zz+sz*.034,
   w*.24,h*.22,.025,M['shade'],.023)
 for sx in [-1,1]:
  tube('INFLATABLE_LASHING_RING',(x+sx*w*.39,y-h*.38,z-d*.30),
   (x+sx*w*.39,y-h*.38,z+d*.30),.023,M['edge'],10)
 # Tactile rubber bands around the bumper and a visible air-valve enclosure.
 cube('VINYL_BUMPER_REINFORCEMENT',x,y-h*.44,z,w*.87,.069,d*.88,M['shade'],.034)
 cube('AIRSOFT_FILL_VALVE',x+w*.44,y,z,.04,.19,.16,M['steel'],.028)

# Generate all shared collider visuals (no separate collision objects in GLB).
count=0
for b in LAYOUT['obstacles']:
 ident=b['id'];matkind=b['material']
 if ident=='arena-floor':
  cube('GROUND_PHYSICS_MATCHED_WORN_CONCRETE',b['x'],b['y'],b['z'],b['w'],b['h'],b['d'],M['floor'],.009)
 elif ident=='arena-roof':metal_roof(b)
 elif ident.startswith('perimeter-wall'):walls(b)
 elif ident.startswith('upper-mezz'):upper_mezz(b)
 elif ident.startswith(('team-stair','central-stair')):stair(b)
 elif ident.endswith('rail-1') or ident.endswith('rail--1') or 'rail' in ident:rail(b)
 elif matkind=='net':netting(b)
 elif ident.startswith(('lane-container','short-container','central-shipping-container')):industrial_container(b)
 elif ident.startswith('central-container-roof'):
  cube('CENTRAL_VANTAGE_RAISED_ROOF',b['x'],b['y'],b['z'],b['w'],b['h'],b['d'],M['steel'],.06)
  cube('ORANGE_ROOF_SAFETY_ZONE',b['x'],b['y']+b['h']/2+.008,b['z'],b['w']*.92,.013,b['d']*.89,M['edge'])
 elif ident.startswith('cover-pallet-'):cover_circuit_pallet(b)
 elif ident.startswith('cover-foam-'):cover_circuit_foam(b)
 elif ident.startswith('cover-'):cover_circuit_panel(b)
 elif matkind=='wood':plywood_cover(b)
 elif matkind=='foam':inflatable(b)
 elif matkind=='concrete':concrete_cover(b)
 elif matkind=='metal':
  cube(ident+'_PAINTED_STEEL',b['x'],b['y'],b['z'],b['w'],b['h'],b['d'],M['steel'],.032)
 count+=1
wear_floor();cargo_detail();safety_details();brand_environment();support_frame()
# Three unmistakable architectural landmarks replace the old flat vista.
dramatic_floor_zones()
elevated_team_gateway(-34,'red')
elevated_team_gateway(34,'blue')
center_command_pavilion()
# Oversized branded steel roof beams and a few painted safety stencils.
for xx in [-41,41]:
 for zz in [-26,0,26]:
  worklight('LOWER_BAY_LIGHT',xx,10.9,zz)
# Stage source: preserve individually editable objects, names and material nodes.
bpy.context.scene.render.engine='CYCLES'
bpy.context.scene.cycles.samples=16
bpy.context.scene.world.color=(.04,.05,.06)
# Default camera is a helpful elevated room-editor overview, not rendered art.
bpy.ops.object.camera_add(location=coords(1,25,56))
cam=bpy.context.object;cam.name='ARENA_EDITOR_CAMERA'
camera_target=Vector(coords(0,2,0))
cam.rotation_euler=(camera_target-cam.location).to_track_quat('-Z','Y').to_euler()
bpy.context.scene.camera=cam
bpy.ops.object.light_add(type='AREA',location=coords(0,10,0))
sun=bpy.context.object;sun.name='EDITOR_PREVIEW_AREA_LIGHT';sun.data.energy=1900
sun.data.shape='RECTANGLE';sun.data.size=44;sun.data.size_y=26
sun.rotation_euler=(camera_target-sun.location).to_track_quat('-Z','Y').to_euler()
# Only scene geometry is exported, not editor cameras/lamps.
bpy.ops.file.pack_all()
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(ART,'the_arena_v2.blend'))
by_material={}
for obj in [o for o in bpy.context.scene.objects if o.type=='MESH']:
 key=obj.active_material.name if obj.active_material else '_DEFAULT'
 by_material.setdefault(key,[]).append(obj)
for key,objects in by_material.items():
 if len(objects)<2:continue
 bpy.ops.object.select_all(action='DESELECT')
 for o in objects:o.select_set(True)
 bpy.context.view_layer.objects.active=objects[0]
 bpy.ops.object.join()
 bpy.context.object.name='BATCH_'+key
meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
assert len(meshes)<=50,(len(meshes),sorted(by_material))
bpy.ops.object.select_all(action='DESELECT')
for o in meshes:o.select_set(True)
bpy.context.view_layer.objects.active=meshes[0]
bpy.ops.export_scene.gltf(filepath=os.path.join(OUT,'arena.glb'),export_format='GLB',
 use_selection=True,export_yup=True,export_apply=True,
 export_normals=True,export_materials='EXPORT')
out=os.path.join(OUT,'arena.glb')
assert os.path.getsize(out)>180000,os.path.getsize(out)
print('THE_ARENA_V2_BUILD_SUCCESS',len(LAYOUT['obstacles']),
 'colliders',len(meshes),'draw_batched_materials',
 os.path.getsize(out),'GLB_BYTES',flush=True)
