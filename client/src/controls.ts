import type {Input} from '../../shared/config.ts';
export type Settings={fov:number,sensitivity:number,padSensitivity:number,deadzone:number,response:'linear'|'exponential',vibration:boolean,volume:number};
export const defaults:Settings={fov:88,sensitivity:.22,padSensitivity:2.5,deadzone:.13,response:'exponential',vibration:true,volume:.55};
export const defaultBinds:Record<string,string>={
 forward:'KeyW',back:'KeyS',left:'KeyA',right:'KeyD',sprint:'ShiftLeft',jump:'Space',
 crouch:'KeyC',prone:'KeyZ',reload:'KeyR',leanLeft:'KeyQ',leanRight:'KeyE',
 slot1:'Digit1',slot2:'Digit2',grenade:'KeyG',melee:'KeyV',score:'Tab'
};
const load=<T>(name:string,fallback:T):T=>{try{return {...fallback,...JSON.parse(localStorage.getItem(name)||'{}')}}catch{return fallback}};
export let settings=load('airsoft_settings',defaults);
export let binds=load('airsoft_binds',defaultBinds);
export const saveSettings=()=>{try{localStorage.setItem('airsoft_settings',JSON.stringify(settings));localStorage.setItem('airsoft_binds',JSON.stringify(binds))}catch{}};
export const resetBinds=()=>{binds={...defaultBinds};saveSettings()};
const keys=new Set<string>(),once=new Set<string>();
let mouse0=false,mouse2=false,dx=0,dy=0,mouseX=0,mouseY=0,controllerPrev:number[]=[];
let gamepadName='',padSeen=false,activePad=false;
const down=(a:string)=>keys.has(binds[a]);
window.addEventListener('keydown',e=>{
 if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
 if(!keys.has(e.code))once.add(e.code);
 keys.add(e.code)
});
window.addEventListener('keyup',e=>keys.delete(e.code));
window.addEventListener('blur',()=>{keys.clear();once.clear();mouse0=false;mouse2=false});
document.addEventListener('mousemove',e=>{if(document.pointerLockElement){dx+=e.movementX;dy+=e.movementY;mouseX=e.movementX;mouseY=e.movementY}});
document.addEventListener('mousedown',e=>{if(e.button===0)mouse0=true;if(e.button===2)mouse2=true});
document.addEventListener('mouseup',e=>{if(e.button===0)mouse0=false;if(e.button===2)mouse2=false});
document.addEventListener('contextmenu',e=>e.preventDefault());
const axis=(v:number,dead:number,curve:string)=>{
 const a=Math.abs(v);if(a<=dead)return 0;
 const n=(a-dead)/(1-dead);
 return Math.sign(v)*(curve==='exponential'?n*n:n);
};
export class Controls{
 yaw=0;pitch=0;lean=0;lastInput:Input|null=null;padLabel='XBOX';gamepadActive=false;
 sample(dt:number,inGame:boolean):Input{
  const pads=navigator.getGamepads?.()||[];
  const pad=Array.from(pads).find(p=>p&&p.mapping==='standard')||null;
  if(pad){
   this.padLabel=/DualSense|DualShock|Wireless Controller|PLAYSTATION|PS[45]/i.test(pad.id)?'PS5':'XBOX';
   if(pad.buttons.some(b=>b.pressed)||pad.axes.some(x=>Math.abs(x)>.35))activePad=true;
   this.gamepadActive=activePad;
  }else{activePad=false;this.gamepadActive=false}
  const btn=(n:number)=>!!pad?.buttons[n]?.pressed,edge=(n:number)=>{
   const x=btn(n),v=x&&!controllerPrev[n];controllerPrev[n]=+x;return v
  };
  const lX=pad?axis(pad.axes[0]||0,settings.deadzone,settings.response):0;
  const lY=pad?axis(pad.axes[1]||0,settings.deadzone,settings.response):0;
  const rX=pad?axis(pad.axes[2]||0,settings.deadzone,settings.response):0;
  const rY=pad?axis(pad.axes[3]||0,settings.deadzone,settings.response):0;
  if(inGame){
   this.yaw-=dx*settings.sensitivity*.008+rX*settings.padSensitivity*dt;
   this.pitch-=dy*settings.sensitivity*.008+rY*settings.padSensitivity*dt;
   this.pitch=Math.max(-1.25,Math.min(1.25,this.pitch));
   this.lean+=( ((down('leanRight')?1:0)-(down('leanLeft')?1:0))*.16-this.lean )*Math.min(1,dt*9);
  }
  dx=0;dy=0;
  const input:Input={
   f:(down('forward')?1:0)-(down('back')?1:0)-lY,
   s:(down('right')?1:0)-(down('left')?1:0)+lX,
   yaw:this.yaw,pitch:this.pitch,
   jump:down('jump')||edge(0),
   crouch:down('crouch')||btn(1),
   prone:down('prone'),
   sprint:down('sprint')||btn(10),
   fire:mouse0||btn(7),
   ads:mouse2||btn(6),
   reload:down('reload')||edge(2),
   grenade:once.has(binds.grenade)||edge(5),
   melee:once.has(binds.melee)||edge(11)
  };
  if(once.has(binds.slot1))input.swap=0;
  if(once.has(binds.slot2)||edge(3))input.swap=7;
  if(!inGame){input.f=0;input.s=0;input.fire=false;input.jump=false;input.reload=false}
  once.clear();
  const length=Math.hypot(input.f,input.s);
  if(length>1){input.f/=length;input.s/=length}
  this.lastInput=input;return input;
 }
 vibrate(strength=.45){
  if(!settings.vibration)return;
  const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean);
  try{(pad as any)?.vibrationActuator?.playEffect?.('dual-rumble',{duration:65,strongMagnitude:strength,weakMagnitude:strength*.55})}catch{}
 }
}
export function anyPadConnected(){return Array.from(navigator.getGamepads?.()||[]).some(Boolean)}
export function padHasActivity(){return activePad}
export function updateSetting<K extends keyof Settings>(key:K,value:Settings[K]){(settings as any)[key]=value;saveSettings()}
export function rebind(action:string,code:string){binds[action]=code;saveSettings()}
