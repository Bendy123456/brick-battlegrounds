// CHANGED: Four independently keyed directional dash animations.
// All rotations are degrees. Elapsed dash progress is normalized 0..1.
// V: visual-only full-body XYZ rotation; L: visual-only upward offset.
// Backflip rotates the visual about center mass, never the root/hitbox.
// Each move ends in the current fighter's normal stance (classic relaxed or standard guard).
import {fightingStance,applyCombatPose} from './combat-poses.js';

const K=(t,e,j={},v=[0,0,0],lift=0)=>({t,e,j,v,lift});
export const DASH_ANIMATIONS={
 forward:{duration:.36,speed:13.8,frames:[
  K(0,'sine',{},[0,0,0]),
  K(.12,'sine',{LS:[-39,-15,-26],LE:[135,0,0],RS:[55,9,13],RE:[103,0,0],LH:[-35,0,-8],RH:[20,0,8],T:[-22,19,-7]},[-8,0,-1]),
  K(.32,'outCubic',{LS:[34,-17,-13],LE:[102,0,0],RS:[65,7,12],RE:[108,0,0],LH:[-36,0,-10],RH:[22,0,7],T:[-25,-17,4]},[-11,0,0]),
  // CHANGED: The fist rockets forward as the shoulders and waist follow.
  K(.52,'outCubic',{LS:[133,-12,-8],LE:[1,0,0],RS:[76,8,14],RE:[111,0,0],LH:[-27,0,-6],RH:[13,0,8],T:[18,-38,11]},[-6,0,0]),
  K(.68,'sine',{LS:[123,-10,-7],LE:[7,0,0],RS:[68,7,13],RE:[106,0,0],LH:[-17,0,-4],RH:[9,0,6],T:[13,-25,6]},[-4,0,0]),
  K(.85,'sine',{LS:[57,-6,-11],LE:[50,0,0],RS:[41,5,12],RE:[61,0,0],T:[-3,-8,0]},[0,0,0]),
  K(1,'sine')
 ]},
 left:{duration:.32,speed:12.6,frames:[
  K(0,'sine'),
  K(.13,'sine',{LS:[48,-7,-23],LE:[108,0,0],RS:[42,9,19],RE:[104,0,0],LH:[-22,0,-16],RH:[22,0,7],LK:[12,0,0],T:[-10,0,-19]},[0,-10,14]),
  K(.38,'outCubic',{LS:[53,-6,-23],LE:[107,0,0],RS:[43,9,18],RE:[106,0,0],LH:[-31,0,-23],RH:[26,0,12],LK:[17,0,0],T:[-7,8,-26]},[0,-13,21]),
  K(.67,'sine',{LS:[35,-6,-17],LE:[84,0,0],RS:[32,6,14],RE:[84,0,0],LH:[-13,0,-10],RH:[13,0,8],T:[-3,5,-14]},[0,-6,10]),
  K(.86,'sine',{LS:[15,-5,-12],LE:[34,0,0],RS:[16,5,12],RE:[35,0,0],T:[1,-3,-4]},[0,0,0]),
  K(1,'sine')
 ]},
 right:{duration:.32,speed:12.6,frames:[
  K(0,'sine'),
  K(.13,'sine',{LS:[42,-9,-19],LE:[104,0,0],RS:[48,7,23],RE:[108,0,0],LH:[22,0,-7],RH:[-22,0,16],RK:[12,0,0],T:[-10,0,19]},[0,10,-14]),
  K(.38,'outCubic',{LS:[43,-9,-18],LE:[106,0,0],RS:[53,6,23],RE:[107,0,0],LH:[26,0,-12],RH:[-31,0,23],RK:[17,0,0],T:[-7,-8,26]},[0,13,-21]),
  K(.67,'sine',{LS:[32,-6,-14],LE:[84,0,0],RS:[35,6,17],RE:[84,0,0],LH:[13,0,-8],RH:[-13,0,10],T:[-3,-5,14]},[0,6,-10]),
  K(.86,'sine',{LS:[16,-5,-12],LE:[35,0,0],RS:[15,5,12],RE:[34,0,0],T:[1,-3,4]},[0,0,0]),
  K(1,'sine')
 ]},
 back:{duration:.48,speed:11.6,frames:[
  K(0,'sine'),
  K(.12,'sine',{LS:[-30,-7,-23],LE:[102,0,0],RS:[-28,7,23],RE:[102,0,0],LH:[40,0,-11],RH:[41,0,11],LK:[-65,0,0],RK:[-65,0,0],T:[-32,0,0]},[-20,0,0],.10),
  K(.26,'outCubic',{LS:[-42,-8,-27],LE:[76,0,0],RS:[-40,8,27],RE:[76,0,0],LH:[48,0,-13],RH:[51,0,13],LK:[-70,0,0],RK:[-70,0,0],T:[-17,0,0]},[106,0,0],.16),
  K(.50,'sine',{LS:[21,-6,-17],LE:[72,0,0],RS:[23,6,17],RE:[72,0,0],LH:[55,0,-13],RH:[57,0,13],LK:[-96,0,0],RK:[-95,0,0],T:[-16,0,0]},[206,0,0],.22),
  K(.75,'sine',{LS:[47,-6,-13],LE:[65,0,0],RS:[45,6,13],RE:[66,0,0],LH:[43,0,-10],RH:[40,0,10],LK:[-52,0,0],RK:[-52,0,0],T:[-12,0,0]},[301,0,0],.13),
  K(.91,'sine',{LS:[22,-5,-11],LE:[34,0,0],RS:[21,5,11],RE:[34,0,0],LH:[10,0,-4],RH:[9,0,4],LK:[-14,0,0],RK:[-14,0,0],T:[3,0,0]},[354,0,0],.02),
  K(1,'sine',{},[360,0,0])
 ]}
};
const ease={
 sine:t=>(1-Math.cos(Math.PI*t))/2,
 outCubic:t=>1-(1-t)**3
};
const clamp=t=>Math.max(0,Math.min(1,t));
const KEYS=['LS','RS','LE','RE','LH','RH','LK','RK','T','H'];
const lerp=(a,b,t)=>a+(b-a)*t;
function sample(frames,progress,stance){
 const u=clamp(progress);
 const result=(frame)=>{
  const joints={};
  for(const key of KEYS)joints[key]=frame.j[key]||stance[key]||[0,0,0];
  return {joints,visual:frame.v,lift:frame.lift};
 };
 if(u<=0)return result(frames[0]);
 for(let i=1;i<frames.length;i++){
  const left=frames[i-1],right=frames[i];
  if(u<=right.t){
   const alpha=ease[right.e](clamp((u-left.t)/(right.t-left.t)));
   const p={},la=result(left),rb=result(right);
   for(const k of KEYS)p[k]=la.joints[k].map((x,n)=>lerp(x,rb.joints[k][n],alpha));
   return {joints:p,visual:la.visual.map((x,n)=>lerp(x,rb.visual[n],alpha)),lift:lerp(la.lift,rb.lift,alpha)};
  }
 }
 return result(frames.at(-1));
}
// CHANGED: Evaluates dash without allocating or updating attack objects/hitboxes.
export function sampleDashPose(f){
 const type=f.dashKind||'forward',animation=DASH_ANIMATIONS[type]||DASH_ANIMATIONS.forward;
 const progress=clamp(1-(f.dodge||0)/animation.duration);
 return {...sample(animation.frames,progress,fightingStance(f,false)),progress,type};
}
export function applyDashPose(f,pose){
 applyCombatPose(f,pose.joints);
 const rad=Math.PI/180,v=pose.visual;
 const flip=pose.type==='back';
 const a=v[0]*rad,center=1.24;
 f.visual.rotation.set(a,v[1]*rad,v[2]*rad);
 // CHANGED: Backflip revolves around visual center mass while world root stays grounded.
 f.visual.position.set(0,pose.lift+(flip?center*(1-Math.cos(a)):0),flip?-center*Math.sin(a):0);
}
export function clearDashVisual(f){
 f.visual.rotation.set(0,0,0);
 f.visual.position.set(0,0,0);
}
