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
 const tone=s.skinTone,dark='#28242a',lip=s.gender==='female'?'#9b5b55':'#87584d';
 // Defined cranium, jaw, chin, ears, cheeks and a protruding nose give a clear profile.
 oval(root,tone,0,.055,0,.345,.395,.30,0,0,0,GEO.head);
 oval(root,tone,0,-.20,.06,.285,.20,.268);
 for(const sign of [-1,1]){
  oval(root,tone,sign*.343,-.08,-.012,.09,.15,.085);
  oval(root,'#8e5e59',sign*.345,-.08,.045,.026,.072,.012);
  oval(root,s.hairColor,sign*.235,.25,.22,.105,.048,.05,0,0,-sign*.10,GEO.detail);
  // white sclera + iris + dark pupil; eyebrow arc above eye.
  oval(root,'#f0e8d8',sign*.142,.005,.267,.095,.052,.026,0,sign*.08);
  oval(root,light? '#3e7369':'#526a82',sign*.142,.001,.296,.044,.049,.015,0,0,0,GEO.detail);
  oval(root,'#161d28',sign*.142,-.003,.308,.022,.033,.008,0,0,0,GEO.detail);
  oval(root,'#e9d8d2',sign*.154,.025,.32,.013,.014,.006,0,0,0,GEO.detail);
  band(root,s.hairColor,[sign*.058,.091,.284],[sign*.233,.099,.24],.023);
  oval(root,tone,sign*.20,-.13,.22,.11,.085,.07,GEO.detail);
 }
 oval(root,tone,0,-.104,.305,.079,.121,.105,0,0,0,GEO.detail);
 oval(root,'#976a5a',0,-.19,.365,.064,.024,.014,0,0,0,GEO.detail);
 oval(root,lip,0,-.287,.287,.117,.023,.018,0,0,0,GEO.detail);
 oval(root,'#e3a695',0,-.297,.299,.057,.009,.011,0,0,0,GEO.detail);
 const hair=s.hairColor;
 oval(root,hair,0,.345,-.025,.361,.165,.322,0,0,0,GEO.head);
 const h=s.hair;
 if(h==='bob'){
  oval(root,hair,-.30,.07,-.052,.105,.32,.19);
  oval(root,hair,.30,.06,-.052,.11,.29,.19);
  for(let j=0;j<7;j++)oval(root,hair,(j-3)*.088,.38,.13,.072,.21,.115,.15,0,j*.035);
 }else if(h==='bun'||h==='ponytail'||h==='braid'){
  oval(root,hair,0,.50,-.14,.19,.17,.18);
  if(h==='ponytail'){
   oval(root,hair,.13,.49,-.30,.15,.19,.16,0,0,-.36);
   oval(root,hair,.25,.31,-.39,.12,.23,.13,0,0,-.52)
  }
  if(h==='braid'){
   for(let j=0;j<5;j++)oval(root,hair,-.16-.07*Math.sin(j*1.7),.27-j*.16,-.32,.102,.118,.098,0,0,j*.13,GEO.detail)
  }
  for(let j=0;j<8;j++){
   const angle=j*.73;
   oval(root,hair,Math.sin(angle)*.24,.38+Math.cos(angle)*.07,.10+Math.cos(angle)*.06,.105,.17,.135,0,0,Math.sin(angle)*.25)
  }
 }else{
  for(let j=0;j<9;j++){
   const x=(j-4)*.09,yy=.42+Math.sin(j*1.53)*.07;
   oval(root,hair,x,yy,.07,.09,.16+(j%3)*.035,.13,.14,0,-x*.5)
  }
 }
 if(s.gear==='tech'){
  band(root,s.accent,[-.30,.25,-.17],[.30,.25,-.17],.048)
 }
 return root;
}
function boot(p,colors,sign){
 // Ankle, heel, sole, toe and individual lace eyelets: original chunky outdoors shoe.
 const c=colors.boot;
 oval(p,c,0,-1.285,.026,.198,.30,.225);
 oval(p,'#34343a',0,-1.494,.115,.227,.12,.36);
 oval(p,c,0,-1.434,.17,.224,.135,.30);
 oval(p,colors.accent,0,-1.403,.375,.18,.065,.10,GEO.detail);
 block(p,'#242b31',0,-1.54,.10,.46,.072,.69);
 for(let j=0;j<4;j++)band(p,j%2?colors.accent:'#b9afa0',[-.13,-1.21-j*.095,.256],[.13,-1.21-j*.095,.256],.017);
 band(p,'#434c52',[-.18,-1.29,-.11],[.18,-1.29,-.11],.044);
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
 oval(torso,skin.top,0,.70,0,chestW,.60,.305);
 oval(torso,skin.top,0,.25,0,(female?.325:.405)*bodyScale,.45,.285);
 oval(torso,skin.pants,0,-.04,0,hipW,.26,.30);
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
  oval(arm,skin.top,0,-.13,0,.245,.27,.245,0,0,side*.12);
  capsule(arm,skin.skinTone,side*.02,-.45,0,.158,.42,1.0).rotation.z=side*.08;
  oval(arm,skin.skinTone,side*.01,-.76,.02,.168,.18,.17);
  capsule(arm,skin.skinTone,side*.02,-1.02,.016,.135,.30,.95);
  oval(arm,'#454a50',side*.02,-1.12,.03,.156,.205,.161);
  oval(arm,skin.skinTone,side*.02,-1.29,.048,.143,.15,.095);
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
  oval(leg,skin.pants,0,-.37,0,.255,.49,.245,0,0,side*.05);
  oval(leg,skin.pants,0,-.78,0,.22,.21,.23);
  capsule(leg,skin.pants,0,-1.10,0,.185,.47,1.05);
  oval(leg,color.boot,0,-.78,.19,.192,.195,.084,0,0,0,GEO.detail);
  oval(leg,skin.accent,0,-.77,.256,.12,.13,.031,GEO.detail);
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
