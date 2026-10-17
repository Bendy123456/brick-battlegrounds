// CHANGED: Visual-only combat pose table. All times are seconds; all rotations
// are degrees as [x,y,z]. Easing is applied on the segment ending at each frame.
// Joints: LS/RS shoulder, LE/RE elbow, LH/RH hip, LK/RK knee, T torso, H head.
// Strike overshoot peaks line up with UNCHANGED combat hit fractions:
// light1 .48*.48=.2304, light2 .2304, light3 .69*.55=.3795,
// light4 .50*.48=.2400; heavy 1.25*.30=.375 and 1.25*.72=.900.
const F=(t,e,j={})=>({t,e,j});
export const COMBAT_POSES={
 light:[
  {name:'LEFT JAB',len:.48,blend:.075,frames:[
   F(0,'sine'),F(.105,'sine',{LS:[-27,-8,-13],LE:[132,0,0],RS:[65,0,13],RE:[110,0,0],T:[-5,12,-5]}),
   F(.205,'outCubic',{LS:[91,-8,-11],LE:[18,0,0],RS:[77,0,12],RE:[113,0,0],T:[9,-16,7],LH:[-13,0,0],RH:[8,0,0],RK:[-8,0,0]}),
   F(.2304,'outCubic',{LS:[107,-9,-9],LE:[0,0,0],RS:[73,0,12],RE:[110,0,0],T:[13,-18,9],LH:[-17,0,0],RH:[8,0,0]}),
   F(.28,'sine',{LS:[88,-6,-9],LE:[12,0,0],RS:[68,0,10],RE:[115,0,0],T:[7,-10,4]}),
   F(.38,'sine',{LS:[53,0,-6],LE:[92,0,0],RS:[53,0,9],RE:[102,0,0],T:[2,-3,0]}),F(.48,'sine')
  ]},
  {name:'RIGHT CROSS',len:.48,blend:.075,frames:[
   F(0,'sine'),F(.11,'sine',{RS:[-30,8,13],RE:[135,0,0],LS:[64,0,-12],LE:[108,0,0],T:[-6,-15,5]}),
   F(.207,'outCubic',{RS:[92,7,11],RE:[18,0,0],LS:[76,0,-10],LE:[110,0,0],T:[10,17,-8],RH:[-13,0,0],LH:[7,0,0],LK:[-9,0,0]}),
   F(.2304,'outCubic',{RS:[109,7,10],RE:[0,0,0],LS:[73,0,-10],LE:[110,0,0],T:[13,19,-9],RH:[-16,0,0]}),
   F(.285,'sine',{RS:[87,4,8],RE:[13,0,0],LS:[69,0,-9],LE:[109,0,0],T:[7,10,-4]}),
   F(.39,'sine',{RS:[51,0,5],RE:[94,0,0],LS:[53,0,-8],LE:[98,0,0],T:[2,3,0]}),F(.48,'sine')
  ]},
  {name:'RIGHT KICK',len:.69,blend:.08,frames:[
   F(0,'sine'),F(.145,'sine',{RH:[94,0,4],RK:[-96,0,0],LH:[6,0,-6],LK:[-11,0,0],LS:[68,0,-12],LE:[108,0,0],RS:[66,0,12],RE:[108,0,0],T:[-14,6,-9]}),
   F(.335,'outCubic',{RH:[94,0,7],RK:[-12,0,0],LH:[12,0,-9],LK:[-15,0,0],LS:[74,0,-13],LE:[110,0,0],RS:[72,0,13],RE:[109,0,0],T:[-17,8,-12]}),
   F(.3795,'outCubic',{RH:[109,0,8],RK:[0,0,0],LH:[12,0,-9],LK:[-15,0,0],LS:[73,0,-13],LE:[110,0,0],RS:[73,0,13],RE:[110,0,0],T:[-14,9,-12]}),
   F(.46,'sine',{RH:[91,0,6],RK:[-86,0,0],LH:[7,0,-8],LK:[-12,0,0],LS:[62,0,-9],RS:[62,0,9],T:[-13,5,-8]}),
   F(.56,'sine',{RH:[31,0,2],RK:[-43,0,0],LH:[2,0,-2],T:[-5,0,-3]}),F(.69,'sine')
  ]},
  // CHANGED: Fourth light hit uses the existing LIGHT_DAMAGE and hit() function.
  {name:'LEFT HOOK',len:.50,blend:.08,frames:[
   F(0,'sine'),F(.115,'sine',{LS:[-37,-14,-27],LE:[129,0,0],RS:[70,0,12],RE:[110,0,0],T:[-7,20,-10]}),
   F(.215,'outCubic',{LS:[89,-37,-30],LE:[27,0,0],RS:[76,0,11],RE:[113,0,0],T:[13,-21,12],LH:[-14,0,0],RH:[7,0,0]}),
   F(.24,'outCubic',{LS:[109,-43,-32],LE:[9,0,0],RS:[77,0,12],RE:[110,0,0],T:[16,-25,14],LH:[-17,0,0]}),
   F(.30,'sine',{LS:[86,-33,-24],LE:[33,0,0],RS:[69,0,9],RE:[110,0,0],T:[8,-13,7]}),
   F(.41,'sine',{LS:[50,0,-8],LE:[100,0,0],RS:[55,0,8],RE:[102,0,0],T:[2,-3,0]}),F(.50,'sine')
  ]}
 ],
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,blend:.085,frames:[
  F(0,'sine'),F(.245,'sine',{LS:[-44,-19,-22],LE:[140,0,0],RS:[73,0,13],RE:[115,0,0],T:[-10,26,-12]}),
  F(.345,'outCubic',{LS:[98,-30,-26],LE:[15,0,0],RS:[78,0,14],RE:[115,0,0],T:[20,-24,15],LH:[-16,0,0],RH:[10,0,0]}),
  F(.375,'outCubic',{LS:[116,-33,-27],LE:[0,0,0],RS:[80,0,14],RE:[115,0,0],T:[22,-28,17],LH:[-18,0,0]}),
  F(.47,'sine',{LS:[67,0,-10],LE:[105,0,0],RS:[68,0,10],RE:[110,0,0],T:[3,-7,4]}),
  F(.675,'sine',{RH:[99,8,11],RK:[-100,0,0],LH:[8,0,-10],LK:[-14,0,0],LS:[80,0,-13],LE:[110,0,0],RS:[79,0,12],RE:[114,0,0],T:[-18,24,-13]}),
  F(.858,'outCubic',{RH:[101,15,15],RK:[-11,0,0],LH:[13,0,-12],LK:[-17,0,0],LS:[81,0,-15],LE:[113,0,0],RS:[86,0,14],RE:[115,0,0],T:[-23,29,-16]}),
  F(.90,'outCubic',{RH:[115,16,14],RK:[0,0,0],LH:[13,0,-12],LK:[-17,0,0],LS:[83,0,-15],LE:[113,0,0],RS:[86,0,15],RE:[115,0,0],T:[-21,29,-16]}),
  F(1.00,'sine',{RH:[91,9,9],RK:[-92,0,0],LH:[9,0,-8],LK:[-12,0,0],T:[-15,18,-11],LS:[75,0,-9],RS:[73,0,9]}),
  F(1.14,'sine',{RH:[34,0,3],RK:[-47,0,0],LH:[3,0,-3],T:[-6,5,-4]}),
  F(1.25,'sine')
 ]}
};

// CHANGED: Isolated elapsed-time blending, joint rest capture and restoration.
const NAMES=['LS','RS','LE','RE','LH','RH','LK','RK','T','H'];
const RAD=Math.PI/180, OUT=.085, saved=new WeakMap(),state=new WeakMap();
const clamp=x=>Math.max(0,Math.min(1,x));
const EASE={sine:t=>(1-Math.cos(Math.PI*clamp(t)))/2,
 outCubic:t=>1-(1-clamp(t))**3,
 backOut:t=>{const x=clamp(t)-1;return 1+2.70158*x*x*x+1.70158*x*x;}};
function getNodes(f){
 const {arms,legs,body,head}=f.visual.userData;
 return {LS:arms[0],RS:arms[1],LE:arms[0]?.userData.elbow,RE:arms[1]?.userData.elbow,
  LH:legs[0],RH:legs[1],LK:legs[0]?.userData.knee,RK:legs[1]?.userData.knee,T:body,H:head};
}
export function captureCombatRest(f){
 const nodes=getNodes(f),rest={};
 for(const n of NAMES){
  if(!nodes[n])throw Error('Missing combat pose pivot: '+n);
  const r=nodes[n].rotation;rest[n]=[r.x,r.y,r.z];
 }
 saved.set(f.visual,{nodes,rest});state.delete(f);
}
function interpolate(a={},b={},weight){
 const out={};
 for(const n of NAMES){
  const x=a[n]||[0,0,0],y=b[n]||[0,0,0];
  out[n]=[0,1,2].map(k=>x[k]+(y[k]-x[k])*weight);
 }
 return out;
}
function atTime(frames,time){
 for(let i=1;i<frames.length;i++){
  const a=frames[i-1],b=frames[i];
  if(time<=b.t){
   const k=EASE[b.e||'sine'](clamp((time-a.t)/(b.t-a.t)));
   return interpolate(a.j,b.j,k);
  }
 }
 return frames[frames.length-1].j;
}
export function sampleCombatPose(f,dt){
 const attack=f.attack;
 if(attack?.kind==='special'){state.delete(f);return null;}
 const data=attack?.kind==='light'?COMBAT_POSES.light[attack.stage-1]:
  attack?.kind==='heavy'?COMBAT_POSES.heavy:null;
 let s=state.get(f);
 if(!s){s={attack:null,last:{},from:{},releaseFrom:{},release:OUT};state.set(f,s);}
 if(data){
  if(s.attack!==attack){s.from=s.last;s.attack=attack;}
  const target=atTime(data.frames,Math.min(attack.attackTime??f.attackTime,data.len));
  s.last=interpolate(s.from,target,EASE.sine(clamp(f.attackTime/data.blend)));
  return s.last;
 }
 if(s.attack){s.attack=null;s.release=0;s.releaseFrom=s.last;}
 if(s.release<OUT){
  s.release=Math.min(OUT,s.release+Math.max(0,dt||0));
  s.last=interpolate(s.releaseFrom,{},EASE.sine(s.release/OUT));
  return s.last;
 }
 s.last={};return null;
}
export function applyCombatPose(f,pose){
 const rig=saved.get(f.visual);
 if(!rig)throw Error('Call captureCombatRest before applying combat poses');
 const torso=pose.T||[0,0,0],head=pose.H||[0,0,0];
 for(const n of NAMES){
  const v=n==='H'?[-torso[0]*.75+head[0],-torso[1]*.9+head[1],-torso[2]*.8+head[2]]:(pose[n]||[0,0,0]);
  const r=rig.rest[n];rig.nodes[n].rotation.set(r[0]+v[0]*RAD,r[1]+v[1]*RAD,r[2]+v[2]*RAD);
 }
}
export function resetCombatPose(f){
 const rig=saved.get(f.visual);
 if(rig)for(const n of NAMES){const r=rig.rest[n];rig.nodes[n].rotation.set(r[0],r[1],r[2]);}
 state.delete(f);
}
