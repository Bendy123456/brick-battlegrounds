// Shared arcade-FPS locomotion. Metres/sec, fixed-step physics; no client-only hitbox moves.
export const MOVE={
 walk:6.5,sprint:11.5,crouch:3.1,prone:1.5,
 slideBoost:14.5,slideDuration:.80,slideCooldown:.95,slideEnd:6.0,
 acceleration:29,braking:38,airAcceleration:9,steer:.26,
 minSlideEntry:6.8
} as const;
export type MoveControls={f:number,s:number,yaw:number,sprint:boolean,crouch:boolean,prone:boolean,ads:boolean,slide?:boolean,jump:boolean};
export type Motion={vx:number,vz:number,slideTime:number,cooldown:number,slideX:number,slideZ:number,slideSpeed:number};
export function newMotion():Motion{return{vx:0,vz:0,slideTime:0,cooldown:0,slideX:0,slideZ:0,slideSpeed:0}}
export function stepMotion(m:Motion,i:MoveControls,dt:number,grounded:boolean){
 const d=Math.min(Math.max(dt,0),.05);
 const f=Math.max(-1,Math.min(1,i.f)),s=Math.max(-1,Math.min(1,i.s));
 const size=Math.max(1,Math.hypot(f,s));
 const worldX=(Math.cos(i.yaw)*s-Math.sin(i.yaw)*f)/size;
 const worldZ=(-Math.sin(i.yaw)*s-Math.cos(i.yaw)*f)/size;
 const forward=f>.30&&!i.ads&&!i.prone;
 const running=i.sprint&&forward&&!i.crouch;
 const initialSpeed=Math.hypot(m.vx,m.vz);
 let started=false,ended=false;
 // Count from the previous tick: an edge-triggered press must not fire twice.
 if(i.slide&&!m.slideTime&&m.cooldown<=0&&grounded&&forward&&
    i.sprint&&initialSpeed>=MOVE.minSlideEntry){
  const forwardX=-Math.sin(i.yaw),forwardZ=-Math.cos(i.yaw);
  const x=m.vx/Math.max(.001,initialSpeed)*.73+forwardX*.27;
  const z=m.vz/Math.max(.001,initialSpeed)*.73+forwardZ*.27;
  const n=Math.hypot(x,z)||1;
  m.slideX=x/n;m.slideZ=z/n;
  m.slideSpeed=Math.max(MOVE.slideBoost,initialSpeed*1.13);
  m.slideTime=MOVE.slideDuration;
  m.cooldown=MOVE.slideCooldown;
  started=true;
 }
 if(m.slideTime>0&&i.jump){
  m.slideTime=0;ended=true;
 }
 const sliding=m.slideTime>0;
 if(sliding){
  const u=1-m.slideTime/MOVE.slideDuration;
  const v=MOVE.slideEnd+(m.slideSpeed-MOVE.slideEnd)*Math.pow(Math.max(0,1-u),.72);
  // Small steering allowance; direction primarily comes from sprint momentum.
  if(f*f+s*s>.10){
   const dirX=m.slideX*(1-MOVE.steer*d*2)+worldX*MOVE.steer*d*2;
   const dirZ=m.slideZ*(1-MOVE.steer*d*2)+worldZ*MOVE.steer*d*2;
   const n=Math.hypot(dirX,dirZ)||1;m.slideX=dirX/n;m.slideZ=dirZ/n;
  }
  m.vx=m.slideX*v;m.vz=m.slideZ*v;
  m.slideTime=Math.max(0,m.slideTime-d);
  if(m.slideTime===0)ended=true;
 }else{
  const target=i.prone?MOVE.prone:i.crouch?MOVE.crouch:running?MOVE.sprint:MOVE.walk;
  const horizontal=Math.hypot(worldX,worldZ);
  const desiredX=worldX*target,desiredZ=worldZ*target;
  const accel=!grounded?MOVE.airAcceleration:horizontal<.1?MOVE.braking:MOVE.acceleration;
  const difference=Math.hypot(desiredX-m.vx,desiredZ-m.vz);
  const weight=Math.min(1,accel*d/Math.max(.0001,difference));
  m.vx+=(desiredX-m.vx)*weight;m.vz+=(desiredZ-m.vz)*weight;
 }
 // A fresh slide gets its full cooldown; don't subtract its first frame.
 if(!started)m.cooldown=Math.max(0,m.cooldown-d);
 return{started,ended,sliding,sprinting:!sliding&&running,speed:Math.hypot(m.vx,m.vz)};
}
