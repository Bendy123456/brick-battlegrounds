// BRICK BATTLEGROUNDS v0.8.22 — genuine live 3D Spinjitzu.
// Original procedural elemental vortex, not an image or imported copyrighted model.
// Rig and effects are cosmetic; arena.js owns damage, root movement and networking.
import * as THREE from '/vendor/three.module.js';
import {applyCombatPose} from './combat-poses.js';
import {CLASSIC_RELAXED} from './classic-combat.js';

export const SPIN_DURATION=2.0;
export const SPIN_COOLDOWN=8.0;
export const SPIN_DAMAGE=[5,5,5,5,8];
export const SPIN_HITS=[.19,.37,.55,.73,.90];
export const SPIN_RANGE=2.85;
export const SPIN_SPEED=9.0;
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
// Readable stylized helix bands, with no per-frame geometry creation.
export function createSpinjitzu(f){
 const group=new THREE.Group();group.name='ElementalSpinjitzu';
 group.visible=false;f.root.add(group);
 const mats=[];
 const color=new THREE.Color(0xffffff);
 const lit=new THREE.Color(0xffffff);
 const ribbonMaterials=[];
 for(let i=0;i<5;i++){
  const mat=new THREE.MeshBasicMaterial({
   color,transparent:true,opacity:.70,depthWrite:false,
   blending:THREE.AdditiveBlending,side:THREE.DoubleSide
  });
  mats.push(mat);ribbonMaterials.push(mat);
 }
 const ribbons=[];
 for(let i=0;i<5;i++){
  const coords=[],phase=i*2*Math.PI/5;
  for(let j=0;j<=62;j++){
   const t=j/62,h=.18+t*3.42,r=.44+t*.98;
   const a=t*Math.PI*2*2.9+phase;
   coords.push(new THREE.Vector3(Math.cos(a)*r,h,Math.sin(a)*r));
  }
  const path=new THREE.CatmullRomCurve3(coords);
  const part=new THREE.Mesh(new THREE.TubeGeometry(path,124,.062+i*.005,4,false),ribbonMaterials[i]);
  part.rotation.y=i*.16;part.frustumCulled=false;group.add(part);ribbons.push(part);
 }
 const coreMat=new THREE.MeshBasicMaterial({
  color,transparent:true,opacity:.095,depthWrite:false,
  side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 });
 mats.push(coreMat);
 const core=new THREE.Mesh(new THREE.CylinderGeometry(1.48,.44,3.52,36,1,true),coreMat);
 core.position.y=1.94;group.add(core);
 const hoops=[],hoopMaterials=[];
 for(let i=0;i<4;i++){
  const mat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.36,depthWrite:false,blending:THREE.AdditiveBlending});
  mats.push(mat);hoopMaterials.push(mat);
  const hoop=new THREE.Mesh(new THREE.TorusGeometry(.57+i*.24,.027,4,38),mat);
  hoop.rotation.x=Math.PI/2;hoop.position.y=.40+i*.87;
  group.add(hoop);hoops.push(hoop);
 }
 const motes=[],moteMat=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.65,depthWrite:false,blending:THREE.AdditiveBlending});
 mats.push(moteMat);
 const moteGeo=new THREE.TetrahedronGeometry(.075,0);
 for(let i=0;i<20;i++){
  const m=new THREE.Mesh(moteGeo,moteMat);
  group.add(m);motes.push(m);
 }
 const light=new THREE.PointLight(0xffffff,0,5.7,2);
 light.position.y=1.9;group.add(light);
 const fx={group,ribbons,core,hoops,motes,light,mats,color:color.clone(),active:false};
 f.spinjitzu=fx;
 setSpinjitzuColor(f,f.visual.userData.baseColor);
}
export function setSpinjitzuColor(f,color){
 const fx=f.spinjitzu;if(!fx)return;
 fx.color.copy(color);
 const bright=color.clone().lerp(new THREE.Color(0xffffff),.39);
 for(const material of fx.mats)material.color.copy(bright);
 fx.core.material.color.copy(fx.color);
 fx.light.color.copy(bright);
}
export function stopSpinjitzu(f){
 const fx=f.spinjitzu;if(!fx)return;
 fx.active=false;fx.group.visible=false;fx.light.intensity=0;
 // The normal combat pose and knockdown pipelines own resetting visual rotation.
}
export function poseSpinjitzu(f){
 const fx=f.spinjitzu,attack=f.attack;
 if(!fx||attack?.kind!=='special'){stopSpinjitzu(f);return}
 const t=Math.min(SPIN_DURATION,Math.max(0,f.attackTime));
 const start=ease(t/.24),finish=1-ease((t-1.77)/.23);
 const glow=start*finish;
 const spinTime=Math.max(0,t-.10),rotation=spinTime*2*Math.PI*5.6;
 const swirl=rotation+Math.sin(t*14)*.12;
 // The minifig keeps arms tucked close, knees lifted alternately, and turns
 // inside the glowing vortex. Only visual yaw spins; movement root does not.
 const rad=Math.PI/180;
 const legWave=Math.sin(rotation*1.25)*27*glow;
 const stance={...CLASSIC_RELAXED,
  LS:[77,-18,-24],LE:[120,0,0],RS:[78,18,24],RE:[121,0,0],
  LH:[14+legWave,0,-8],RH:[14-legWave,0,8],
  LK:[-32-14*Math.max(0,Math.sin(rotation))*glow,0,0],
  RK:[-32-14*Math.max(0,-Math.sin(rotation))*glow,0,0],
  T:[-10*glow,Math.sin(rotation*.5)*9*glow,Math.sin(rotation)*7*glow],
  H:[0,0,0]};
 applyCombatPose(f,stance);
 const progress=ease(t/.18);
 // No jump in visual orientation when attack starts; ease spin away on exit.
 f.visual.rotation.set(-.12*glow,rotation*progress,Math.sin(rotation)*.08*glow);
 f.visual.position.set(0,.06*glow+Math.abs(Math.sin(rotation*.85))*.11*glow,0);
 fx.active=true;fx.group.visible=glow>.015;
 fx.group.scale.setScalar(.20+.80*glow);
 fx.core.rotation.y=-swirl*1.27;
 fx.ribbons.forEach((part,i)=>{part.rotation.y=-swirl*(i%2?.94:1.17)+i*.42;part.material.opacity=(.48+i*.05)*glow});
 fx.hoops.forEach((part,i)=>{part.rotation.z=(i%2?-1:1)*swirl*.85;part.rotation.y=swirl*.4+i*.8;part.material.opacity=.33*glow});
 fx.core.material.opacity=.085*glow;
 fx.motes.forEach((m,i)=>{
  const phase=i*2.3999632297,progress=(t*(.48+i%4*.05)+(i*.177))%1;
  const a=phase+swirl*(i%2?1:-1)*.82,radial=.48+progress*.98;
  m.position.set(Math.cos(a)*radial,.15+progress*3.25,Math.sin(a)*radial);
  m.rotation.set(a,a*.7,phase);
  m.scale.setScalar((.4+.8*(1-progress))*glow);
 });
 fx.mats.at(-1).opacity=.63*glow;
 fx.light.intensity=2.7*glow;
}
