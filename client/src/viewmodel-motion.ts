// Coherent first-person handling for all nine authored airsoft viewmodels.
// The Blender model, hands, fingers and muzzle socket move AS ONE; we never
// animate an individual finger independently of its weapon contact surface.
// Units: meters and radians. No Three.js dependency, so this stays testable.
export interface ViewmodelMotion {
 time:number; step:number; moveBlend:number; adsBlend:number;
 lookX:number;lookY:number;lookRotY:number;
 lastYaw:number;lastPitch:number;haveLook:boolean;wasAirborne:boolean;
 kickX:number;kickVX:number;kickZ:number;kickVZ:number;land:number;
 x:number;y:number;z:number;rx:number;ry:number;rz:number;
}
export interface ViewmodelInput{
 dt:number;weapon:number;yaw:number;pitch:number;
 forward:number;strafe:number;ads:boolean;sprint:boolean;
 slide:boolean;airborne:boolean;
}
export const VIEWMODEL_PROFILE=[
 {id:'vanguard',weight:1.00,kick:1.00},
 {id:'ranger',weight:1.16,kick:1.13},
 {id:'specter',weight:.92,kick:.92},
 {id:'atlas',weight:1.28,kick:1.20},
 {id:'whisper',weight:.76,kick:.77},
 {id:'breacher',weight:1.18,kick:1.56},
 {id:'watcher',weight:1.32,kick:1.34},
 {id:'echo',weight:.66,kick:.92},
 {id:'tempo',weight:.70,kick:1.03},
] as const;
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const ease=(old:number,next:number,speed:number,dt:number)=>
 old+(next-old)*(1-Math.exp(-speed*dt));
const wrapAngle=(d:number)=>Math.atan2(Math.sin(d),Math.cos(d));
const recoilSpring=(position:number,velocity:number,dt:number,frequency=21)=>{
 // Critically damped spring: snap at the muzzle, no indefinite camera shake.
 // Analytical solution is independent of the monitor frame rate.
 const decay=Math.exp(-frequency*dt);
 const b=velocity+frequency*position;
 return {p:(position+b*dt)*decay,
         v:(velocity-frequency*b*dt)*decay};
};
export function newViewmodelMotion():ViewmodelMotion{
 return {time:0,step:0,moveBlend:0,adsBlend:0,
  lookX:0,lookY:0,lookRotY:0,lastYaw:0,lastPitch:0,
  haveLook:false,wasAirborne:false,
  kickX:0,kickVX:0,kickZ:0,kickVZ:0,land:0,
  x:0,y:0,z:0,rx:0,ry:0,rz:0};
}
export function fireViewmodelMotion(s:ViewmodelMotion,weapon:number){
 const p=VIEWMODEL_PROFILE[weapon]??VIEWMODEL_PROFILE[0];
 // A heavier airsoft replica moves more and returns a little slower.
 // Cap rapid fire so the gun never snaps backwards through the FPS camera.
 s.kickVX=clamp(s.kickVX-2.15*p.kick,-6.2,0);
 s.kickVZ=clamp(s.kickVZ+1.65*p.kick,0,5.0);
}
export function stepViewmodelMotion(s:ViewmodelMotion,input:ViewmodelInput):ViewmodelMotion{
 const dt=clamp(Number.isFinite(input.dt)?input.dt:1/60,0,1/24);
 const profile=VIEWMODEL_PROFILE[input.weapon]??VIEWMODEL_PROFILE[0];
 const weight=profile.weight;
 s.time+=dt;
 const wantedMove=clamp(Math.hypot(input.forward,input.strafe),0,1);
 s.moveBlend=ease(s.moveBlend,wantedMove,11,dt);
 s.adsBlend=ease(s.adsBlend,input.ads?1:0,16,dt);
 const steady=1-.86*s.adsBlend;
 const sprint=input.sprint&&!input.ads&&!input.slide?1:0;
 const slide=input.slide?1:0;
 // Mouse-look inertial lag, shortest-angle yaw difference across +/-PI.
 const dyaw=s.haveLook?clamp(wrapAngle(input.yaw-s.lastYaw),-.10,.10):0;
 const dpitch=s.haveLook?clamp(input.pitch-s.lastPitch,-.10,.10):0;
 s.haveLook=true;s.lastYaw=input.yaw;s.lastPitch=input.pitch;
 // Blend the DELTA, not the raw mouse position. Never drift when still.
 s.lookX=ease(s.lookX,clamp(-dyaw*.45,-.036,.036)*steady,12,dt);
 s.lookY=ease(s.lookY,clamp(dpitch*.33,-.027,.027)*steady,12,dt);
 s.lookRotY=ease(s.lookRotY,clamp(-dyaw*.39,-.033,.033)*steady,13,dt);
 const pace=sprint?14.5:9.3;
 if(s.moveBlend>.007)s.step+=dt*pace*(.36+.64*s.moveBlend);
 const stride=s.moveBlend*(sprint?1.5:1)*steady;
 const breathe=Math.sin(s.time*1.65)*.0035*(1-s.moveBlend*.55);
 const travelX=Math.sin(s.step)*.025*stride/Math.sqrt(weight);
 const travelY=-Math.abs(Math.cos(s.step))*.017*stride+breathe;
 const travelZ=Math.sin(s.step)*.008*stride;
 const walkTilt=Math.sin(s.step)*.022*stride;
 // Recoil is a damped angular/linear impulse, not a permanent tilt.
 const a=recoilSpring(s.kickX,s.kickVX,dt,21/Math.sqrt(weight));
 s.kickX=a.p;s.kickVX=a.v;
 const b=recoilSpring(s.kickZ,s.kickVZ,dt,25/Math.sqrt(weight));
 s.kickZ=b.p;s.kickVZ=b.v;
 if(s.wasAirborne&&!input.airborne)s.land=Math.max(s.land,.034);
 s.wasAirborne=input.airborne;
 s.land=Math.max(0,s.land*Math.exp(-dt*11));
 const tx=s.lookX+travelX;
 const ty=s.lookY+travelY-s.land;
 const tz=travelZ+s.kickZ;
 const rx=s.kickX+Math.cos(s.step)*.011*stride
         +(sprint?-.09:0)+(slide?-.08:0);
 const ry=s.lookRotY+Math.sin(s.step)*.009*stride;
 const rz=walkTilt+(sprint?-.085:0)+Math.sin(s.step)*.009*stride;
 // Filter the animation, preventing abrupt stride start/stop and ADS snaps.
 const smoothing= s.adsBlend>.50?19:13;
 s.x=ease(s.x,tx,smoothing,dt);
 s.y=ease(s.y,ty,smoothing,dt);
 s.z=ease(s.z,tz,smoothing,dt);
 s.rx=ease(s.rx,rx,18,dt);
 s.ry=ease(s.ry,ry,16,dt);
 s.rz=ease(s.rz,rz,16,dt);
 return s;
}
