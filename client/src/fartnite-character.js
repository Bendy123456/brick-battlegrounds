import * as THREE from 'three';
import {skinAt} from './fartnite-skins.js';
import {makeWeaponArtwork} from './fartnite-art.js';

// Real articulated geometry, not a flat image, colored cube character or branded asset.
// A single stylized-anatomy rig drives lobby, Locker, AI and actual 3rd person matches.
const GEO={
 head:new THREE.SphereGeometry(1,18,14),
 cloth:new THREE.SphereGeometry(1,14,10),
 detail:new THREE.SphereGeometry(1,9,7),
 rounded:new THREE.BoxGeometry(1,1,1,1,1,1),
 tube:new THREE.CylinderGeometry(1,1,1,12),
 cone:new THREE.ConeGeometry(1,1,9),
 hair:new THREE.ConeGeometry(1,1,7),
 torus:new THREE.TorusGeometry(1,.12,6,28)
};
const mats=new Map();
function material(color,metalness=0,roughness=.82){
 const key=color+'-'+metalness+'-'+roughness;
 if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness,metalness}));
 return mats.get(key)
}
function mesh(group,geo,color,x,y,z,sx,sy,sz,rx=0,ry=0,rz=0,metal=0){
 const m=new THREE.Mesh(geo,material(color,metal));m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.rotation.set(rx,ry,rz);m.castShadow=true;m.receiveShadow=true;group.add(m);return m
}
function oval(p,c,x,y,z,a,b,d,rx=0,ry=0,rz=0,geo=GEO.cloth){
 if(rx?.isBufferGeometry){geo=rx;rx=0}
 return mesh(p,geo,c,x,y,z,a,b,d,rx,ry,rz)
}
function block(p,c,x,y,z,w,h,d,rx=0,ry=0,rz=0){
 return mesh(p,GEO.rounded,c,x,y,z,w,h,d,rx,ry,rz)
}
function cylinder(p,c,x,y,z,a,h,b,rx=0,ry=0,rz=0){
 return mesh(p,GEO.tube,c,x,y,z,a,h,b,rx,ry,rz)
}
function taper(p,c,x,y,z,top,bottom,len,rx=0,ry=0,rz=0){
 const shape=new THREE.CylinderGeometry(top,bottom,len,12,1);
 const m=new THREE.Mesh(shape,material(c));m.position.set(x,y,z);m.rotation.set(rx,ry,rz);m.castShadow=true;group.add(m);return m
}
function band(p,c,a,b,r=.05){
 const from=new THREE.Vector3(...a),to=new THREE.Vector3(...b),delta=to.clone().sub(from);
 const center=from.clone().add(to).multiplyScalar(.5);
 const obj=mesh(p,GEO.tube,c,center.x,center.y,center.z,r,delta.length(),r);
 obj.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),delta.normalize());return obj
}
function capsule(p,c,x,y,z,r,span,scaleZ=1){
 const geo=new THREE.CapsuleGeometry(r,span,5,12);
 const obj=new THREE.Mesh(geo,material(c));obj.position.set(x,y,z);obj.scale.z=scaleZ;obj.castShadow=true;p.add(obj);return obj
}
function headModel(parent,s,light){
 const root=new THREE.Group();root.position.set(0,1.43,.015);parent.add(root);
 const tone=s.skinTone,eye='#29363e',hair=s.hairColor;
 // Stylized-human anatomy: narrow jaw, smaller eyes, real nose bridge, discrete ears.
 oval(root,tone,0,.065,0,.300,.365,.270,0,0,0,GEO.head);
 oval(root,tone,0,-.180,.042,.240,.18,.225);
 for(const side of [-1,1]){
  oval(root,tone,side*.297,-.085,-.01,.064,.109,.064);
  oval(root,'#a96e61',side*.301,-.095,.047,.025,.060,.009);
  oval(root,'#e1c5af',side*.105,.016,.247,.071,.031,.018);
  oval(root,eye,side*.106,.012,.267,.028,.029,.014);
  oval(root,'#dceef0',side*.102,.025,.279,.010,.009,.007);
  band(root,hair,[side*.047,.104,.259],[side*.184,.118,.220],.019);
 }
 // These tiny details stay subtle at gameplay distance.
 oval(root,tone,0,-.066,.259,.052,.095,.084,0,0,0,GEO.detail);
 oval(root,'#b07564',0,-.146,.322,.040,.015,.013,0,0,0,GEO.detail);
 oval(root,s.gender==='female'?'#975b59':'#885e52',0,-.240,.242,.090,.019,.014,0,0,0,GEO.detail);
 // Hair base close to the scalp, built from tapered swept shapes rather than spheres.
 oval(root,hair,0,.344,-.043,.313,.132,.275,0,0,0,GEO.head);
 const h=s.hair;
 if(h==='bob'){
  for(const sign of [-1,1]){
   oval(root,hair,sign*.251,.015,-.045,.071,.275,.110,0,0,sign*.1);
  }
  for(let j=0;j<6;j++){
   const xx=(j-2.5)*.087;
   oval(root,hair,xx,.356,.154,.061,.125,.082,-.28,0,xx*.5)
  }
 }else if(h==='bun'||h==='ponytail'||h==='braid'){
  oval(root,hair,0,.473,-.135,.168,.139,.163);
  if(h==='ponytail'){
   oval(root,hair,.115,.388,-.305,.106,.177,.117,0,0,-.23);
   oval(root,hair,.150,.174,-.379,.085,.192,.100,0,0,-.13)
  }
  if(h==='braid')for(let i=0;i<4;i++)
   oval(root,hair,-.13-(i%2)*.047,.265-i*.135,-.300,.069,.087,.071);
  for(let i=0;i<5;i++){
   const x=(i-2)*.114;
   oval(root,hair,x,.357,.162,.065,.114,.071,-.24,0,x*.55)
  }
 }else{
  for(let i=0;i<7;i++){
   const xx=(i-3)*.095;
   const tuft=oval(root,hair,xx,.403+(i%3)*.024,.104,.068,.14+(i%3)*.024,.081,-.18,0,xx*.75);
   tuft.rotation.z+=(i%2?-.1:.1)
  }
 }
 if(s.gear==='tech')band(root,s.accent,[-.225,.320,-.125],[.225,.320,-.125],.026);
 return root;
}
function boot(p,colors,sign){
 // Flat ankle, reinforced hiking toe, sole, stitched tongue and fine laces.
 oval(p,colors.boot,0,-1.302,.014,.170,.235,.163);
 oval(p,colors.boot,0,-1.448,.110,.193,.098,.294);
 oval(p,'#34343a',0,-1.474,.161,.200,.080,.280);
 block(p,'#242b31',0,-1.54,.105,.403,.069,.55);
 block(p,colors.accent,0,-1.387,.317,.160,.039,.032);
 for(let j=0;j<3;j++)band(p,j%2?colors.accent:'#cabdb0',[-.091,-1.27-j*.061,.174],[.091,-1.27-j*.061,.174],.012)
}
function bodyShell(p,s,width){
 const female=s.gender==='female',levels=[
  [0.07,width*.68,.252],[.20,width*.72,.264],[.41,width*.76,.27],
  [.68,width*.94,.29],[.87,width,.285],[1.01,width*.86,.24],
  [1.15,width*.46,.18]
 ];
 const xyz=[],norm=[],uv=[],segments=18;
 for(let k=0;k<levels.length;k++){
  const [y,rx,rz]=levels[k];
  for(let i=0;i<=segments;i++){
   const a=i/segments*Math.PI*2;
   xyz.push(Math.cos(a)*rx,y,Math.sin(a)*rz);
   uv.push(i/segments,k/(levels.length-1))
  }
 }
 const inds=[];for(let k=0;k<levels.length-1;k++)for(let i=0;i<segments;i++){
  const a=k*(segments+1)+i,b=a+segments+1;
  inds.push(a,b,a+1,a+1,b,b+1)
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(xyz,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex(inds);geo.computeVertexNormals();
 const body=new THREE.Mesh(geo,material(s.top));body.castShadow=true;body.receiveShadow=true;p.add(body);
 return body
}
export function createDetailedFighter(variant=0,enemy=false){
 const skin=skinAt(variant);
 const female=skin.gender==='female',bodyScale=female?.91:1.05;
 const color={...skin,cloth:skin.top,pant:skin.pants,accent:skin.accent,
  seam:skin.gear==='tech'?'#d9e7e8':'#d0bea1',boot:skin.gear==='tech'?'#2c3440':'#453b37'};
 const root=new THREE.Group();
 const torso=new THREE.Group();torso.position.y=1.60;root.add(torso);
 const chestW=(female?.45:.55)*bodyScale,hipW=(female?.475:.44)*bodyScale;
 // Rounded anatomy with vest layers and waist taper; no cube-torso silhouette.
 bodyShell(torso,skin,chestW);
 oval(torso,skin.pants,0,-.024,0,hipW,.193,.264);
 oval(torso,color.boot,0,.085,0,hipW*1.09,.077,.319);
 oval(torso,color.accent,0,.104,.31,.12,.105,.08,0,0,0,GEO.detail);
 // Fabric panels, tiny seam highlights, body armor and utility shoulder harness.
 for(let sign of [-1,1]){
  band(torso,'#594c42',[sign*.3,.99,.23],[sign*.23,.15,.28],.055);
  oval(torso,skin.top,sign*.24,.83,.125,.185,.37,.165,0,0,sign*.08);
  oval(torso,skin.pants,sign*.22,-.12,0,.24,.26,.275);
  oval(torso,color.boot,sign*.35,.10,.05,.12,.09,.19);
  if(!enemy){
   // belt pouches with rounded edges, little stitching and buckle hardware
   oval(torso,'#695b4e',sign*.36,.025,.275,.155,.18,.12,0,0,-sign*.09);
   block(torso,skin.accent,sign*.36,.12,.389,.14,.04,.035);
   oval(torso,skin.accent,sign*.23,.60,.29,.075,.21,.024,0,0,sign*.09,GEO.detail)
  }
 }
 if(skin.outfit==='jacket'||skin.outfit==='tech'){
  oval(torso,skin.top,-.23,.70,.22,.28,.42,.17,0,0,-.06);
  oval(torso,skin.top,.23,.70,.22,.28,.42,.17,0,0,.06);
  band(torso,color.accent,[0,.25,.39],[0,1.08,.31],.024);
  if(!enemy)for(let j=0;j<4;j++)oval(torso,color.accent,.35,.48+j*.13,.31,.034,.033,.018,0,0,0,GEO.detail)
 }else if(skin.outfit==='armor'){
  oval(torso,'#394d54',0,.64,.305,chestW*1.10,.44,.12);
  oval(torso,skin.accent,0,.68,.40,.18,.19,.028,GEO.detail);
  if(!enemy)for(let sign of [-1,1])oval(torso,skin.top,sign*.31,.80,.33,.17,.23,.10)
 }else if(skin.outfit==='scarf'){
  oval(torso,skin.accent,0,1.08,.0,.49,.195,.34);
  oval(torso,skin.accent,.25,.69,.30,.16,.43,.095,0,0,-.12);
  oval(torso,skin.accent,-.24,.92,.32,.16,.23,.09,0,0,.12)
 }else{
  oval(torso,skin.accent,0,.87,.29,.28,.10,.05);
 }
 if(!enemy&&skin.gear==='wraps'){
  for(let i=0;i<3;i++)band(torso,'#c7b9a5',[-.33,.60+i*.13,.27],[-.05,.59+i*.13,.37],.021)
 }
 headModel(torso,skin,skin.theme==='coastal'||skin.theme==='aurora');
 // Arms pivot naturally at both shoulders. Upper arms taper into forearms.
 const armL=new THREE.Group(),armR=new THREE.Group();
 armL.position.set(-chestW-.13,1.0,-.005);armR.position.set(chestW+.13,1.0,-.005);
 for(const [arm,side] of [[armL,-1],[armR,1]]){
  torso.add(arm);
  oval(arm,skin.top,0,-.107,0,.181,.19,.193,0,0,side*.12);
  capsule(arm,skin.skinTone,side*.01,-.423,0,.131,.42,1.0).rotation.z=side*.06;
  oval(arm,skin.skinTone,side*.015,-.715,.014,.125,.118,.115);
  capsule(arm,skin.skinTone,side*.02,-.996,.011,.111,.32,.89);
  oval(arm,'#454a50',side*.02,-1.12,.03,.126,.158,.122);
  oval(arm,skin.skinTone,side*.02,-1.284,.034,.116,.125,.083);
  // Distinct five-finger hand rather than a mitten or cube.
  for(let i=0;i<4;i++)oval(arm,skin.skinTone,side*.02+(i-1.5)*.057,-1.421,.088,.034,.115,.045,0,0,(i-1.5)*.08,GEO.detail);
  oval(arm,skin.skinTone,side*.17,-1.30,.12,.059,.13,.058,0,0,side*.43,GEO.detail);
  if(!enemy){
   band(arm,skin.accent,[-.16,-.30,.12],[.16,-.28,.12],.033);
   for(let i=0;i<2;i++)band(arm,skin.gear==='tech'?skin.accent:'#ab967c',[-.13,-.88-i*.10,.13],[.13,-.89-i*.10,.13],.022)
  }
 }
 // Each leg has capsule thighs and shins, belts, sculpted knee armor and laced boots.
 const legL=new THREE.Group(),legR=new THREE.Group();
 for(const [leg,side] of [[legL,-1],[legR,1]]){
  leg.position.set(side*hipW*.54,1.56,0);root.add(leg);
  oval(leg,skin.pants,0,-.364,0,.211,.425,.193,0,0,side*.05);
  oval(leg,skin.pants,0,-.75,0,.171,.145,.17);
  capsule(leg,skin.pants,0,-1.080,0,.143,.46,.94);
  oval(leg,color.boot,0,-.785,.158,.145,.143,.061,0,0,0,GEO.detail);
  oval(leg,skin.accent,0,-.765,.207,.094,.096,.026,0,0,0,GEO.detail);
  for(let i=0;i<(enemy?0:3);i++)band(leg,i===1?skin.accent:'#574e45',[-.19,-.35-i*.13,.19],[.19,-.35-i*.13,.19],.030);
  if(!enemy){
   oval(leg,'#756351',side*.22,-.42,.08,.112,.19,.14);
   block(leg,skin.accent,side*.22,-.29,.20,.10,.043,.07);
  }
  boot(leg,color,side)
 }
 if(skin.gear==='tech'&&!enemy){
  for(let sign of [-1,1]){
   block(torso,skin.accent,sign*.43,.79,.16,.085,.18,.10);
   oval(torso,'#ccd7e4',sign*.25,.43,.38,.05,.18,.02,GEO.detail)
  }
 }else if(skin.gear==='field'&&!enemy){
  // Front waist pack and rear rolled travel kit, each independent silhouette.
  oval(torso,'#5b4b42',0,-.005,.36,.22,.16,.145);
  oval(torso,skin.accent,0,.056,.49,.14,.045,.027,GEO.detail);
  oval(torso,'#63574b',0,.69,-.35,.39,.42,.17)
 }
 const weapon=new THREE.Group();weapon.position.set(.40,2.22,.48);torso.add(weapon);
 weapon.add(makeWeaponArtwork('ar'));weapon.userData.visualKind='ar';
 root.userData={torso,armL,armR,legL,legR,weapon,enemy,variant,skin,profile:skin.gender};
 return root
}
