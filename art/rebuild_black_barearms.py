"""Rebuild nine editable Blender airsoft viewmodels with the approved visual spec.

Mostly black weapons, bright orange airsoft muzzle tips; no mounted accessories.
Plain dark-skinned hands and bare forearms (no gloves, no sleeves), individually
posed on each weapon's existing trigger / front support grip locations.
Run from repo root: blender --background --python art/rebuild_black_barearms.py
"""
from pathlib import Path
import re

original=Path("art/build_airsoft_weapons.py").read_text(encoding="utf-8")

def change(old,new):
 global original
 assert original.count(old)==1,(old[:70],original.count(old))
 original=original.replace(old,new)

# Black polymer, satin-black metal, dark grip rubbers. No decorative team
# coloring; maintain the high-visibility orange safety muzzle on every gun.
for old,new in [
 ("'30363c'","'181b1d'"), ("'48515a'","'252a2d'"),
 ("'78848b'","'373b3e'"), ("'1e272b'","'121416'"),
 ("'10191f'","'0a0d0e'"), ("'edb94b'","'332219'"),
 ("'3d768a'","'37251c'"), ("'ed7f32'","'fc7a20'")
]:
 change(old,new)
change("'accent':material('CUSTOM_TEAM_ACCENT_06',accent_hex,.29,.40)",
       "'accent':material('FACTORY_DARK_GRAPHITE_06','35393b',.20,.55)")
change("'hand':material('YELLOW_MINIFIG_HAND_09','332219',0,.33)",
       "'hand':material('DEEP_EBONY_BARE_SKIN_09','332219',0,.68)")
change("'sleeve':material('TEAM_UNIFORM_SLEEVE_10','37251c',0,.58)",
       "'sleeve':material('BARE_DARK_SKIN_FOREARMS_10','37251c',0,.72)")
change(" 'sleeve':material('BARE_DARK_SKIN_FOREARMS_10','37251c',0,.72),",
       " 'sleeve':material('BARE_DARK_SKIN_FOREARMS_10','37251c',0,.72),\n 'nail':material('NATURAL_DARK_FINGERNAIL_11','493429',0,.60),")
original=original.replace("DEEP_EBONY_BARE_SKIN_09","DEEP_EBONY_BARE_SKIN_09")
original=original.replace("YELLOW_MINIFIG_HAND_09","BARE_SKIN_09")
start=original.index("def hand_arm(")
end=original.index("\ndef stock(",start)
replacement=r'''
def tapered_forearm(name,first,last,base,tip,skin):
 a=Vector(p(*first));b=Vector(p(*last));direction=b-a
 bpy.ops.mesh.primitive_cone_add(vertices=20,radius1=base,radius2=tip,
   depth=direction.length,location=(a+b)*.5)
 part=bpy.context.object;part.name=name
 part.rotation_euler=direction.to_track_quat('Z','Y').to_euler()
 return finish(part,skin,.009,2)

def hand_arm(prefix,m,x,y,z,side,forearm=.38,grip='support'):
 """Anatomical bare forearm extends into view from below the camera.
 Each weapon supplies its own custom x/y/z contacts; fingertips close on
 the receiver, trigger grip, shotgun pump or pistol frame. No floating claws,
 sleeves or gloves: the hand and both forearm segments share skin materials.
 """
 trigger=grip=='trigger'
 pistol=grip=='pistol_support'
 elbow=(side*(.35 if trigger else .39),-.76,z+(.54 if pistol else .69))
 arm_mid=(side*(.24 if trigger else .27),-.47,z+.26)
 wrist=(x,y-.013,z+.03)
 tapered_forearm(prefix+'_BARE_ELBOW',elbow,arm_mid,.121,.095,m['sleeve'])
 sphere(prefix+'_ELBOW_JOINT',arm_mid,(.10,.095,.099),m['sleeve'])
 tapered_forearm(prefix+'_BARE_WRIST',arm_mid,wrist,.095,.061,m['hand'])
 sphere(prefix+'_SKIN_WRIST',wrist,(.068,.069,.070),m['hand'])
 px=x-side*.045
 py=y+.036
 pz=z-.072
 sphere(prefix+'_PALM_IN_CONTACT',(px,py,pz),(.093,.068,.104),m['hand'])
 sphere(prefix+'_THUMB_MUSCLE',(px-side*.04,py-.008,pz-.019),
   (.051,.050,.065),m['hand'])
 # Human fingers: individually jointed and bent over the near side of each
 # weapon. Thumb opposes the fingers rather than pointing outward.
 for i in range(4):
  x0=px+(i-1.5)*.034
  curl=x0-side*(.044 if not trigger else .026)
  nodes=[(x0,py+.009,pz-.021),
   (x0+side*.008,py+.025,pz-.075),
   (curl,py-.044,pz-.112),
   (curl-side*.012,py-.060,pz-.082)]
  curve(prefix+'_BARE_FINGER_'+str(i),nodes,
   .018 if i<3 else .016,m['hand'],4)
  sphere(prefix+'_FINGERTIP_'+str(i),nodes[-1],
   (.017,.016,.017),m['hand'])
  sphere(prefix+'_NATURAL_NAIL_'+str(i),
   (nodes[-1][0],nodes[-1][1]+.013,nodes[-1][2]),
   (.011,.003,.014),m['nail'])
 thumb=[(px-side*.061,py,pz+.029),
  (px-side*.091,py+.023,pz-.038),
  (px-side*.059,py-.01,pz-.088),
  (px-side*.029,py-.048,pz-.09)]
 curve(prefix+'_OPPOSING_BARE_THUMB',thumb,.025,m['hand'],4)
 sphere(prefix+'_THUMB_TIP',thumb[-1],(.022,.021,.021),m['hand'])
'''
original=original[:start]+replacement+original[end:]
# Remove only mounted accessories; factory iron sights, rails, receivers and
# internal airsoft BB barrel geometry remain as part of each base replica.
original=re.sub(r";red_dot\(m,[^\n;]*\)","",original)
original=re.sub(r"(?m)^\s*red_dot\(m,[^\n]*\)\s*\n","\n",original)
for text in [
 "tube('Angled airsoft foregrip'",
 "box('Wide accessory light'",
 "ring('Light lens'",
 "tube('Short stabilizer underbarrel'",
 "box('Carry-bridge optics'",
 "tube('Accessory training light'",
 "ring('Training light face'",
]:
 original=re.sub(r"(?m)^ +"+re.escape(text)+r"[^\n]*\n","",original)
# Scope + folded bipod are attachments, not part of the bare sniper.
a=original.index("  # Contoured 3D optic with rings, lenses and mounts.")
b=original.index("  hand_arm('LEFT'",a)
original=original[:a]+"  # No sniper optic or bipod until the future attachments menu.\n  iron_sight(m,-1.14)\n"+original[b:]
# Integrated top rail/handguard is part of the base gun. Tempo slide has an
# uncovered factory port, but absolutely no added red dot or light.
original=original.replace("  # Competition-inspired elongated barrel and original optic housing.",
 "  # Unmounted extended slide, clean iron-sight airsoft pistol.")
# Custom trigger and support hand placements already differ for all 9 weapons.
# Attach right-hand grip firmly to trigger area rather than rendering as claw.
original=re.sub(r"(hand_arm\('RIGHT',m,[^\n\)]*)\)",
 lambda m:m.group(1)+",grip='trigger')",original)
original=original.replace("hand_arm('MAIN',m,.10,-.25,.04,1,forearm=.37)",
 "hand_arm('MAIN',m,.10,-.25,.04,1,forearm=.37,grip='trigger')")
original=original.replace("hand_arm('SUPPORT',m,-.145,-.25,-.20,-1,forearm=.38)",
 "hand_arm('SUPPORT',m,-.145,-.25,-.20,-1,forearm=.38,grip='pistol_support')")
assert "orange" in original.lower()
assert original.count("def hand_arm(")==1
assert "red_dot(m," not in original[original.index("def gun_body("):]
assert "Scope optic main body" not in original[original.index("def gun_body("):]
# Fail before launch if any generated syntax is invalid.
compile(original,"art/build_airsoft_weapons.py","exec")
print("GENERATED_BAREARMS_SOURCE_VALID",len(original),flush=True)
exec(compile(original,"art/build_airsoft_weapons.py","exec"),
 {"__name__":"__main__","__file__":"art/build_airsoft_weapons.py"})
