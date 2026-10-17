// BRICK BATTLEGROUNDS — v0.8.19 full-body directional momentum and leaning.
// CHANGED: Animation-only pass with eased first guard raise, stronger leg push-off,
// CHANGED: Body pitch now follows punch travel, sidesteps lean INWARD to their
// CHANGED: movement side instead of canceling the body roll, and flip launch/landing
// CHANGED: follow the hips. Backflip timing and distance remain identical.
// CHANGED: ALL durations and speed values stay identical to v0.8.17; dodge physics,
// CHANGED: dash i-frames, controls, collision, travel, and networking are untouched.
// Angles = XYZ Euler degrees. Normalized time 0..1, keys refer to actual rig joints.
// V rotates only the cosmetic visual Group; lift never moves the gameplay root.
import {fightingStance,applyCombatPose} from './combat-poses.js';

const K=(t,e,j={},v=[0,0,0],lift=0)=>({t,e,j,v,lift});
export const DASH_ANIMATIONS={
 // CHANGED: Aggressive short punch-lunge — shoulder lifts to guard, elbow cocks
 // CHANGED: behind cheek, supporting foot kicks backward, then front fist snaps
 // CHANGED: forward at the peak of the dash while the other hand stays guarding.
 forward:{duration:.36,speed:17.25,frames:[
  K(0,'sine'),
  K(.075,'sine',{LS:[54,-11,-15],LE:[64,0,0],RS:[56,9,15],RE:[65,0,0],
    LH:[-16,0,-9],RH:[19,0,7],LK:[12,0,0],RK:[-9,0,0],T:[-17,19,-8]},[-13,0,-2],.015),
  K(.20,'inOutCubic',{LS:[49,-21,-19],LE:[144,0,0],RS:[89,11,17],RE:[123,0,0],
    LH:[-31,0,-12],RH:[38,0,11],LK:[17,0,0],RK:[-28,0,0],T:[-26,34,-13]},[-22,0,-3],.03),
  K(.34,'sine',{LS:[69,-17,-16],LE:[102,0,0],RS:[93,12,17],RE:[128,0,0],
    LH:[-45,0,-13],RH:[49,0,13],LK:[18,0,0],RK:[-30,0,0],T:[-29,8,-10]},[-24,0,-2],.065),
  K(.49,'sine',{LS:[112,-16,-13],LE:[6,0,0],RS:[94,12,18],RE:[128,0,0],
    LH:[-38,0,-11],RH:[41,0,12],LK:[16,0,0],RK:[-24,0,0],T:[-22,-29,10]},[-20,0,0],.09),
  K(.59,'sine',{LS:[118,-15,-12],LE:[3,0,0],RS:[92,11,17],RE:[124,0,0],
    LH:[-32,0,-10],RH:[32,0,10],LK:[13,0,0],RK:[-17,0,0],T:[-23,-37,12]},[-18,0,1],.08),
  K(.70,'inOutCubic',{LS:[101,-12,-13],LE:[45,0,0],RS:[81,10,15],RE:[116,0,0],
    LH:[-16,0,-8],RH:[16,0,8],LK:[8,0,0],RK:[-10,0,0],T:[-11,-16,4]},[-12,0,0],.05),
  K(.86,'sine',{LS:[53,-7,-12],LE:[71,0,0],RS:[51,7,12],RE:[79,0,0],
    LH:[9,0,-5],RH:[-8,0,5],LK:[6,0,0],RK:[5,0,0],T:[-3,2,-2]},[-3,0,0],.005),
  K(1,'sine')
 ]},
 // CHANGED: Left weave sidestep — push off right foot, lead left knee toward
 // CHANGED: travel, low lateral torso angle, hands held near face, strong stop.
 left:{duration:.32,speed:15.75,frames:[
  K(0,'sine'),
  K(.10,'sine',{LS:[52,-16,-22],LE:[65,0,0],RS:[53,9,20],RE:[64,0,0],
    LH:[-16,0,-13],RH:[25,0,11],LK:[13,0,0],RK:[-11,0,0],T:[-13,-13,7]},[-6,-7,7],.015),
  K(.27,'sine',{LS:[92,-15,-27],LE:[130,0,0],RS:[85,10,23],RE:[125,0,0],
    LH:[-41,0,-22],RH:[35,0,14],LK:[28,0,0],RK:[-25,0,0],T:[-18,-20,13]},[-11,-17,19],.055),
  K(.44,'sine',{LS:[89,-17,-30],LE:[123,0,0],RS:[79,11,24],RE:[120,0,0],
    LH:[-47,0,-25],RH:[40,0,16],LK:[33,0,0],RK:[-28,0,0],T:[-19,-25,15]},[-12,-20,20],.055),
  K(.62,'inOutCubic',{LS:[71,-12,-24],LE:[113,0,0],RS:[69,8,19],RE:[106,0,0],
    LH:[-25,0,-16],RH:[25,0,11],LK:[20,0,0],RK:[-18,0,0],T:[-11,-9,9]},[-8,-12,14],.045),
  K(.79,'sine',{LS:[49,-8,-17],LE:[91,0,0],RS:[47,7,14],RE:[87,0,0],
    LH:[16,0,-5],RH:[-17,0,7],LK:[-3,0,0],RK:[14,0,0],T:[3,5,-4]},[2,0,-4],.018),
  K(.91,'sine',{LS:[20,-5,-12],LE:[39,0,0],RS:[23,5,11],RE:[39,0,0],
    LH:[1,0,-3],RH:[0,0,4],T:[2,2,-2]},[1,0,-2],.003),
  K(1,'sine')
 ]},
 // CHANGED: Right sidestep mirrors the left weave (lead foot, hip angle,
 // CHANGED: shoulder counter-twist), so both have the same sense of momentum.
 right:{duration:.32,speed:15.75,frames:[
  K(0,'sine'),
  K(.10,'sine',{LS:[53,-9,-20],LE:[64,0,0],RS:[52,16,22],RE:[65,0,0],
    LH:[25,0,-11],RH:[-16,0,13],LK:[-11,0,0],RK:[13,0,0],T:[-13,13,-7]},[-6,7,-7],.015),
  K(.27,'sine',{LS:[85,-10,-23],LE:[125,0,0],RS:[92,15,27],RE:[130,0,0],
    LH:[35,0,-14],RH:[-41,0,22],LK:[-25,0,0],RK:[28,0,0],T:[-18,20,-13]},[-11,17,-19],.055),
  K(.44,'sine',{LS:[79,-11,-24],LE:[120,0,0],RS:[89,17,30],RE:[123,0,0],
    LH:[40,0,-16],RH:[-47,0,25],LK:[-28,0,0],RK:[33,0,0],T:[-19,25,-15]},[-12,20,-20],.055),
  K(.62,'inOutCubic',{LS:[69,-8,-19],LE:[106,0,0],RS:[71,12,24],RE:[113,0,0],
    LH:[25,0,-11],RH:[-25,0,16],LK:[-18,0,0],RK:[20,0,0],T:[-11,9,-9]},[-8,12,-14],.045),
  K(.79,'sine',{LS:[47,-7,-14],LE:[87,0,0],RS:[49,8,17],RE:[91,0,0],
    LH:[-17,0,-7],RH:[16,0,5],LK:[14,0,0],RK:[-3,0,0],T:[3,-5,4]},[2,0,4],.018),
  K(.91,'sine',{LS:[23,-5,-11],LE:[39,0,0],RS:[20,5,12],RE:[39,0,0],
    LH:[0,0,-4],RH:[1,0,3],T:[2,-2,2]},[1,0,2],.003),
  K(1,'sine')
 ]},
 // CHANGED: Backflip has clear crouch, powerful launch, tight double-knee
 // CHANGED: tuck at inversion, deliberate untuck, and grounded landing/guard.
 // CHANGED: Rotates only cosmetic visual about approximate center mass.
 // CHANGED: Increase retreat distance ~34.5% without changing backflip timing.
 back:{duration:.48,speed:19.5,frames:[
  K(0,'sine'),
  K(.085,'sine',{LS:[35,-14,-20],LE:[55,0,0],RS:[35,14,20],RE:[55,0,0],
    LH:[48,0,-13],RH:[48,0,13],LK:[-70,0,0],RK:[-70,0,0],T:[-32,0,0]},[-19,0,0],.014),
  K(.17,'inOutCubic',{LS:[-25,-20,-31],LE:[120,0,0],RS:[-25,20,31],RE:[120,0,0],
    LH:[57,0,-12],RH:[57,0,12],LK:[-95,0,0],RK:[-95,0,0],T:[-16,0,0]},[24,0,0],.15),
  K(.32,'sine',{LS:[-42,-17,-29],LE:[119,0,0],RS:[-42,17,29],RE:[119,0,0],
    LH:[102,0,-13],RH:[104,0,13],LK:[-127,0,0],RK:[-128,0,0],T:[-8,0,0]},[118,0,0],.20),
  K(.51,'inOutCubic',{LS:[17,-12,-15],LE:[110,0,0],RS:[17,12,15],RE:[110,0,0],
    LH:[112,0,-12],RH:[112,0,12],LK:[-138,0,0],RK:[-138,0,0],T:[-5,0,0]},[219,0,0],.25),
  K(.69,'sine',{LS:[52,-8,-17],LE:[120,0,0],RS:[52,8,17],RE:[120,0,0],
    LH:[91,0,-13],RH:[91,0,13],LK:[-115,0,0],RK:[-115,0,0],T:[-10,0,0]},[306,0,0],.16),
  K(.82,'inOutCubic',{LS:[80,-8,-18],LE:[129,0,0],RS:[80,8,18],RE:[129,0,0],
    LH:[52,0,-10],RH:[52,0,10],LK:[-66,0,0],RK:[-66,0,0],T:[-21,0,0]},[342,0,0],.085),
  K(.94,'sine',{LS:[38,-6,-16],LE:[49,0,0],RS:[38,6,16],RE:[49,0,0],
    LH:[14,0,-5],RH:[14,0,5],LK:[-11,0,0],RK:[-11,0,0],T:[8,0,0]},[356,0,0],.014),
  K(1,'sine',{},[360,0,0])
 ]}
};
// CHANGED: Directional curves — a punch should accelerate off the cocked elbow,
 // CHANGED: sidesteps hit their traveling pose quickly but land smoothly.
const ease={
 sine:t=>(1-Math.cos(Math.PI*t))/2,
 outCubic:t=>1-(1-t)**3,
 outQuint:t=>1-(1-t)**5,
 inOutCubic:t=>t<.5?4*t*t*t:1-(-2*t+2)**3/2
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
