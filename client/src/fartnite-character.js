import * as THREE from 'three';
import {skinAt} from './fartnite-skins.js';
import {makeWeaponArtwork} from './fartnite-art.js';
import {humanoidGeometry,createHumanoidSkeleton,BODY_BASE_VERSION} from './fartnite-body-base.js';

// The ENTIRE blank model — face, head, neck, chest, shoulders, arms, hands,
// pelvis, thighs, ankles and feet — is ONE continuous skinned 3D mesh.
// No stacked shapes, no exposed joint seams, no costume parts or fake skin textures.
const finishes=new Map();
function neutralMaterial(index){
 const key=index%25;
 if(!finishes.has(key)){
  const tone=new THREE.Color('#c5cbd1');
  tone.offsetHSL(0,0,((key*13)%25-12)*.0025);
  finishes.set(key,new THREE.MeshStandardMaterial({
   color:tone,roughness:.72,metalness:.015,flatShading:false,side:THREE.FrontSide
  }))
 }
 return finishes.get(key);
}
export function createDetailedFighter(variant=0,enemy=false){
 const skin=skinAt(variant);
 const geometry=humanoidGeometry(skin.gender);
 const mat=neutralMaterial(skin.id);
 const root=new THREE.Group();
 const rig=createHumanoidSkeleton(skin.gender);
 const body=new THREE.SkinnedMesh(geometry,mat);
 body.name='OnePieceSmoothHumanoid';
 body.frustumCulled=false; // GPU skin animation can move beyond static body bounds
 body.castShadow=true;
 body.receiveShadow=true;
 root.add(body);
 root.add(rig.root);
 root.updateMatrixWorld(true);
 body.bind(new THREE.Skeleton(rig.bones));
 body.normalizeSkinWeights();

 // Gameplay-only weapon, not part of the mannequin's visible anatomy.
 // The existing showroom and thumbnail generator already hide this attachment.
 const weapon=new THREE.Group();
 weapon.position.set(.40,.62,.48);
 rig.torso.add(weapon);
 weapon.add(makeWeaponArtwork('ar'));
 weapon.userData.visualKind='ar';

 // Twenty-five unique wardrobe IDs still exist, but every body is deliberately
 // blank: only the gender-specific base and tiny neutral height differences vary.
 const scale=.979+((skin.id*7)%25)*.0019;
 root.scale.setScalar(scale);
 root.userData={
  torso:rig.torso,armL:rig.armL,armR:rig.armR,
  legL:rig.legL,legR:rig.legR,weapon,body,rootBone:rig.root,
  variant:skin.id,skin,enemy,profile:skin.gender,
  bodyBase:BODY_BASE_VERSION,appearance:'seamless-blank-humanoid',
  accessoryCount:0,anatomyDrawMeshes:1,materialColor:mat.color.getHexString()
 };
 return root;
}
