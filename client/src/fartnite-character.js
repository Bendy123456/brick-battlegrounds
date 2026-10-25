import * as THREE from 'three';
import {skinAt} from './fartnite-skins.js';
import {makeWeaponArtwork} from './fartnite-art.js';
import {smoothSurface,makeNeck,BODY_BASE_VERSION,BODY_PROPORTIONS} from './fartnite-body-base.js';

// Bare, neutral, NON-ANATOMICAL humanoid mannequins for all 25 character slots.
// No clothing, hair, face, armor, pouches, backpack, footwear, or body details.
// The boy and girl templates have subtle silhouette differences only.
// This is intentionally a featureless stylized model, not a nude human.
const materialCache=new Map();
const headShape=new THREE.SphereGeometry(1,24,18);
const handShape=new THREE.SphereGeometry(1,16,12);
const footShape=new THREE.SphereGeometry(1,16,12);
function finishFor(index){
 // Small neutral-tone variations make each of 25 slots a separate blank mannequin
 // while deliberately avoiding outfit colors and skin-like materials.
 const shades=['#bec6d0','#c3cad3','#b8c1cb','#ccd1d9','#bfc8d2'];
 const color=shades[index%shades.length];
 if(!materialCache.has(color)){
  materialCache.set(color,new THREE.MeshStandardMaterial({
   color,metalness:0,roughness:.86,flatShading:false
  }));
 }
 return materialCache.get(color);
}
function part(group,geometry,mat,x,y,z,sx,sy,sz){
 const obj=new THREE.Mesh(geometry,mat);
 obj.position.set(x,y,z);
 obj.scale.set(sx,sy,sz);
 obj.castShadow=true;
 obj.receiveShadow=true;
 group.add(obj);
 return obj;
}
export function createDetailedFighter(variant=0,enemy=false){
 const skin=skinAt(variant),gender=skin.gender;
 const cfg=BODY_PROPORTIONS[gender],mat=finishFor(skin.id);
 const root=new THREE.Group();
 // Only the two body bases differ in width/shoulder-to-hip proportions.
 const torso=new THREE.Group();torso.position.y=1.60;root.add(torso);
 const torsoMesh=smoothSurface(torso,gender,'body',mat);
 makeNeck(torso,gender,mat);

 // Entirely blank face/head: no hair, eyes, facial features, helmets or accessories.
 const head=part(torso,headShape,mat,0,1.54,.010,
  gender==='male'?.305:.295,.388,gender==='male'?.288:.273);
 // Tiny bridge rounds the head-to-neck transition, not a facial feature.
 const armL=new THREE.Group(),armR=new THREE.Group();
 armL.position.set(-cfg.shoulder,1.025,-.005);
 armR.position.set(cfg.shoulder,1.025,-.005);
 for(const [arm,side] of [[armL,-1],[armR,1]]){
  torso.add(arm);
  // One seamless arm surface, instead of a separate muscular upper-arm mesh.
  smoothSurface(arm,gender,'arm',mat);
  part(arm,handShape,mat,0,-1.293,.027,.095,.145,.090);
  part(arm,handShape,mat,side*.105,-1.266,.113,.041,.082,.053);
 }
 const legL=new THREE.Group(),legR=new THREE.Group();
 for(const [leg,side] of [[legL,-1],[legR,1]]){
  leg.position.set(side*cfg.hip,1.56,0);root.add(leg);
  smoothSurface(leg,gender,'leg',mat);
  // Featureless feet blend with the legs; no boots or clothing lines.
  part(leg,footShape,mat,0,-1.426,.10,.147,.101,.268);
 }

 // The weapon remains a separate gameplay-only attachment. It is hidden in
 // showroom/Locker/Shop and does not form part of any mannequin's body.
 const weapon=new THREE.Group();
 weapon.position.set(.40,.62,.48);
 torso.add(weapon);
 weapon.add(makeWeaponArtwork('ar'));
 weapon.userData.visualKind='ar';

 // All 25 remain selectable IDs, with small individual scale differences and
 // both real gender shapes; no prior costume material or accessory survives.
 const scale=[.99,1.015,1.0,.985,1.025][skin.id%5];
 root.scale.setScalar(scale);
 root.userData={
  torso,armL,armR,legL,legR,weapon,head,torsoMesh,enemy,
  variant:skin.id,skin,profile:gender,bodyBase:BODY_BASE_VERSION,
  appearance:'blank-humanoid',accessoryCount:0,
  // Keep rendering tests and game stats able to identify the active template.
  materialColor:mat.color.getHexString()
 };
 return root;
}
