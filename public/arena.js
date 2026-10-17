import * as THREE from '/vendor/three.module.js';
import {buildClassicNinja} from './classic-ninja.js';
import {setupTouchControls} from './touch-controls.js';
// CHANGED: Visual-only combat poses live independently of hit detection.
import {captureCombatRest,sampleCombatPose,applyCombatPose,resetCombatPose} from './combat-poses.js';
// CHANGED: Connected hit chains, one-second stun and ragdoll-style knockdowns.
import {HIT_STUN_SECONDS,KNOCKDOWN_SECONDS,clearHitChain,recordHitForKnockdown,startImpact,tickImpact,poseKnockdown} from './combat-impact.js';
// CHANGED: Custom forward-punch, left/right sidestep and backflip dash animations.
import {DASH_ANIMATIONS,sampleDashPose,applyDashPose,clearDashVisual} from './dash-poses.js';
// CHANGED: Procedural fighter-colored Spinjitzu: moving tornado, 5 hits, final ragdoll.
import {createSpinjitzu,setSpinjitzuColor,poseSpinjitzu,stopSpinjitzu,SPIN_DURATION,SPIN_COOLDOWN,SPIN_HITS,SPIN_DAMAGE,SPIN_SPEED,SPIN_RANGE} from './spinjitzu.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x142637);
scene.fog = new THREE.FogExp2(0x142637,0.0095);
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
const phoneBrowser=Boolean(navigator.userAgentData?.mobile)||/iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent||'');
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,phoneBrowser?1.1:1.4));
renderer.setSize(innerWidth,innerHeight);
renderer.shadowMap.enabled=true;
renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.34;
$('game').appendChild(renderer.domElement);
const camera = new THREE.PerspectiveCamera(50,innerWidth/innerHeight,.1,260);
scene.add(new THREE.HemisphereLight(0xa3c8e8,0x392920,2.3));
const sun=new THREE.DirectionalLight(0xffd1a1,3.0);
sun.position.set(-15,26,12);sun.castShadow=true;sun.shadow.mapSize.set(1024,1024);
sun.shadow.camera.left=-28;sun.shadow.camera.right=28;
sun.shadow.camera.top=28;sun.shadow.camera.bottom=-28;sun.shadow.bias=-.0003;
scene.add(sun);
const mat=(c,r=.65,m=.02,em=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m,emissive:em,emissiveIntensity:em?.2:0});
const stone=mat(0x74818a,.92), tileA=mat(0x819397,.91),tileB=mat(0x78898f,.91), tileDark=mat(0x53676d,.93);
const oxblood=mat(0x8e2929,.64), beamDark=mat(0x322728,.74), roof=mat(0x203b43,.72), gold=mat(0xd8a85c,.45,.5), lacquer=mat(0x9d4a30,.6), lanternPaper=mat(0xffce8b,.46,0,0xffb34f), water=mat(0x183b56,.41,.12);
function mesh(parent,geo,m,x=0,y=0,z=0,cast=true){const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);o.castShadow=cast;o.receiveShadow=true;parent.add(o);return o}
function box(parent,w,h,d,x,y,z,m,cast=true){return mesh(parent,new THREE.BoxGeometry(w,h,d),m,x,y,z,cast)}
function cyl(parent,rt,rb,h,x,y,z,m,seg=16){return mesh(parent,new THREE.CylinderGeometry(rt,rb,h,seg),m,x,y,z)}
function sphere(parent,r,x,y,z,m,w=16,h=12){return mesh(parent,new THREE.SphereGeometry(r,w,h),m,x,y,z)}
// NEW DOJO COURTYARD: octagonal raised platform with a framed, tiled combat zone.
cyl(scene,21.2,22.5,2.4,0,-1.35,0,tileDark,8);
cyl(scene,20.4,20.5,.2,0,-.07,0,stone,8);
const arenaTiles=new THREE.Group();scene.add(arenaTiles);
const tileGeo=new THREE.BoxGeometry(2.65,.06,2.65);
for(let ix=-6;ix<=6;ix++)for(let iz=-6;iz<=6;iz++){
 const x=ix*2.79,z=iz*2.79;if(Math.hypot(x,z)>17.6)continue;
 mesh(arenaTiles,tileGeo,(ix+iz)%2?tileA:tileB,x,.064,z,false);
}
const ring=new THREE.Mesh(new THREE.TorusGeometry(17.95,.19,8,96),gold);ring.rotation.x=Math.PI/2;ring.position.y=.15;scene.add(ring);
const smaller=new THREE.Mesh(new THREE.TorusGeometry(5.3,.07,6,70),tileDark);smaller.rotation.x=Math.PI/2;smaller.position.y=.125;scene.add(smaller);
// Geometric flower crest under the fighters, engraved rather than a flat blank arena.
const crestGroup=new THREE.Group();scene.add(crestGroup);
for(let i=0;i<8;i++){const a=i*Math.PI/4;const petal=box(crestGroup,.26,.025,3.1,Math.sin(a)*2.5,.14,Math.cos(a)*2.5,gold,false);petal.rotation.y=a}
cyl(crestGroup,.72,.72,.034,0,.16,0,gold,16);
const sea=mesh(scene,new THREE.PlaneGeometry(380,380),water,0,-2.7,0,false);sea.rotation.x=-Math.PI/2;
// Full roofline/gate shapes, not the placeholder forest of featureless pillars.
function torii(x,z,rot=0){const g=new THREE.Group();g.position.set(x,0,z);g.rotation.y=rot;scene.add(g);
 for(const dx of [-3.4,3.4]){
  box(g,.64,6.8,.72,dx,3.4,0,oxblood);
  cyl(g,.49,.49,.3,dx,6.65,0,gold,12);
  box(g,1.02,.3,1.05,dx,.35,0,stone);
 }
 box(g,8.7,.64,1.32,0,6.7,0,oxblood);
 box(g,10,.31,1.55,0,7.15,0,roof);
 box(g,8.2,.36,.8,0,5.45,0,beamDark);
 box(g,3,.68,.22,0,5.85,.5,gold);
 return g}
torii(0,-22.1,0);torii(0,22.1,0);
function dojo(x,z,rot=0){
 const g=new THREE.Group();g.position.set(x,-.18,z);g.rotation.y=rot;scene.add(g);
 box(g,10,1.1,7.2,0,.5,0,stone);
 box(g,10.5,.42,7.7,0,1.2,0,tileDark);
 for(const dx of [-4.2,0,4.2])for(const dz of [-2.7,2.7]){
  cyl(g,.25,.27,4.55,dx,3.45,dz,oxblood,12);
  box(g,.75,.35,.75,dx,5.65,dz,gold);
 }
 box(g,10,3.9,.23,0,3.3,3,beamDark);
 // Layered sloping roof, tuned to read as Japanese-inspired temple architecture.
 for(const side of [-1,1]){
  const slope=box(g,11.7,.4,5.25,0,6.45,side*1.32,roof);slope.rotation.x=side*.22;
 }
 box(g,12.3,.3,.72,0,7.0,0,gold);
 for(let j=-2;j<=2;j++)box(g,.08,3.25,.11,j*1.75,3.25,3.15,gold,false);
 for(let j=-2;j<=2;j++)box(g,1.4,1.5,.08,j*1.75,3.2,-3.04,oxblood,false);
}
dojo(-25,-24,Math.PI/4);dojo(25,-24,-Math.PI/4);
function lamp(x,z){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cyl(g,.24,.33,3.6,0,1.8,0,oxblood,10);
 box(g,1.2,.22,1.22,0,3.58,0,roof);
 const paper=box(g,.88,1,.88,0,4.1,0,lanternPaper);
 box(g,1.35,.23,1.35,0,4.68,0,roof);
 for(const dx of [-.44,.44])for(const dz of [-.44,.44])box(g,.055,1,.055,dx,4.1,dz,beamDark,false);
 // Only a few real point lights to limit the 60 FPS cost.
 if(Math.abs(x)>16){const light=new THREE.PointLight(0xffa14c,3.5,13);light.position.set(x,4.3,z);scene.add(light)}
}
for(let i=0;i<8;i++){const a=(i+.5)*Math.PI/4;lamp(Math.sin(a)*19.4,Math.cos(a)*19.4)}
function flag(x,z,color){const g=new THREE.Group();g.position.set(x,0,z);scene.add(g);
 cyl(g,.11,.11,6,0,3,0,beamDark,8);
 const cloth=box(g,1.6,2.5,.08,.85,4.5,0,mat(color,.95),false);cloth.rotation.z=-.08;
 box(g,1.88,.12,.13,.81,5.83,0,gold,false)}
for(const a of [Math.PI/4,3*Math.PI/4,5*Math.PI/4,7*Math.PI/4])flag(Math.sin(a)*24,Math.cos(a)*24,0x8d3d3a);
for(let i=0;i<18;i++){
 const a=i*2*Math.PI/18,x=Math.sin(a)*25,z=Math.cos(a)*25;
 cyl(scene,.72,.92,2.5+(i%3)*.55,x,1.1,z,tileDark,8);
}
// Combat stage contains no obstacles; all architecture is outside the fighting boundary.
// CHANGED: All nine playable characters now use the exact same classic LEGO
// CHANGED: minifigure body, rounded shoulders, hinged elbows, knees and waist.
// CHANGED: Each fighter receives its OWN material via buildClassicNinja(color).
function fighter(color,x,z){
 const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
 const visual=buildClassicNinja(new THREE.Color(color));
 root.add(visual);
 // CHANGED: Allocate the tornado once per fighter, not during each attack.
 const unit={root,visual};createSpinjitzu(unit);
 return {root,visual,spinjitzu:unit.spinjitzu,hp:150,guard:100,v:new THREE.Vector3(),onGround:true,yVel:0,face:0,attack:null,attackTime:0,attackCooldown:0,iframes:0,stun:0,dodge:0,dashCooldown:0,dashKind:null,dashDuration:0,dashDirection:new THREE.Vector3(),block:false,specialCooldown:0,combo:0,comboWindow:0,queuedLight:false,score:0,moving:0,runTime:0,hitFlash:0,ragdoll:0,ragdollTotal:0,ragdollSide:1,hitChain:null,combatClock:0,prevAction:{},name:'NINJA'};
}
const p=fighter(0x1186ca,-3.8,0),cpu=fighter(0xc83d39,3.8,0);
// CHANGED: Cache neutral joint rotations before the first animation frame.
captureCombatRest(p);captureCombatRest(cpu);
export const gameEvents={onState:null,onAttack:null,onHit:null,onEnd:null,onDisconnect:null};
let gameMode='solo',remoteState=null,netTick=0,playerSlot=0;
export function setMode(m,slot=0){gameMode=m;playerSlot=slot;remoteState=null;netTick=0}
// CHANGED: Every roster choice now recolors the same classic minifigure, and
// CHANGED: color changes are isolated to this fighter (no shared materials).
function dressFighter(f,c){
 resetCombatPose(f);
 clearDashVisual(f);stopSpinjitzu(f);
 const color=new THREE.Color(c[1]);
 f.visual.userData.cloth.color.copy(color);
 f.visual.userData.baseColor=color;
 setSpinjitzuColor(f,color); // CHANGED: Match elemental tornado to fighter color.
 f.name=c[0];
 // CHANGED: Snapshot neutral joints after choosing a fighter; no model swaps.
 captureCombatRest(f);
}
export function setCharacters(local,opponent){
 dressFighter(p,local);dressFighter(cpu,opponent);
 $('p1name').textContent=local[0];$('p2name').textContent=opponent[0];
}
export function startFight(){startGame()}
export function stopFight(){running=false;finished=false;roundWait=0;stopSpinjitzu(p);stopSpinjitzu(cpu);mobileTouch.reset()}
export function receivePeerState(state){remoteState=state}
export function receivePeerAttack(kind){if(gameMode==='online')tryAttack(cpu,kind)}
// CHANGED: Multiplayer reuses the original damage event with stun/knockdown flags.
export function receiveDamage(damage,knockdown=false,stun=true,spinjitzuFinisher=false){
 if(gameMode!=='online'||!running)return;
 p.hp=Math.max(0,p.hp-damage);
 if(stun){ // CHANGED: Interrupt incoming victim's attack, just like local combat.
  startImpact(p,!!knockdown);
  clearHitChain(p);
  if(knockdown)resetCombatPose(p);
 }else p.hitFlash=.12;
 // CHANGED: Apply confirmed finishing knockback on the remote victim's own client.
 if(knockdown&&spinjitzuFinisher){
  const away=new THREE.Vector3().subVectors(p.root.position,cpu.root.position).setY(0);
  if(away.lengthSq()>.001){
   away.normalize();p.root.position.addScaledVector(away,1.10);
   const edge=Math.hypot(p.root.position.x,p.root.position.z);
   if(edge>16.25){p.root.position.x*=16.25/edge;p.root.position.z*=16.25/edge}
  }
 }
 fx(p.root.position.clone().add(new THREE.Vector3(0,1.75,0)),0xff9977,11);
}
cpu.root.rotation.y=Math.PI/2;p.root.rotation.y=-Math.PI/2;
let running=false,finished=false,time=120,round=1,roundWait=0,lock=true,camYaw=-Math.PI/2,camPitch=.16;
const keys=new Set(),mouse={drag:false,px:0,py:0};
let mouseLightQueued=false;
const mobileTouch=setupTouchControls();
if(mobileTouch.enabled)renderer.domElement.style.touchAction='none';
addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code)});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>{keys.clear();mouse.drag=false;mouseLightQueued=false});
// M1 clicks trigger one light combo hit; M2 drag rotates the camera.
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('pointerdown',e=>{
 if(e.pointerType!=='mouse')return; // Mobile gestures use setupTouchControls.
 if(e.button===0){if(running&&!finished)mouseLightQueued=true;return}
 if(e.button===2){mouse.drag=true;mouse.px=e.clientX;mouse.py=e.clientY;e.preventDefault()}
});
addEventListener('pointerup',e=>{if(e.button===2)mouse.drag=false});
addEventListener('pointercancel',()=>mouse.drag=false);
addEventListener('pointermove',e=>{if(!mouse.drag||e.pointerType!=='mouse')return;camYaw-=(e.clientX-mouse.px)*.005;camPitch=THREE.MathUtils.clamp(camPitch+(e.clientY-mouse.py)*.004,-.28,.75);mouse.px=e.clientX;mouse.py=e.clientY});
const gpPrev=[];
function pollInput(){
 const mouseLight=mouseLightQueued;mouseLightQueued=false;
 const touch=mobileTouch.sample();
 if(mobileTouch.enabled){camYaw-=touch.lookX*.005;camPitch=THREE.MathUtils.clamp(camPitch+touch.lookY*.004,-.28,.75)}
 const pad=Array.from(navigator.getGamepads?.()||[]).find(Boolean);
 let lx=0,ly=0;const down=i=>!!pad?.buttons[i]?.pressed;
 const trigger=i=>{const was=gpPrev[i]||false,now=down(i);gpPrev[i]=now;return now&&!was};
 if(pad){
  $('controller').textContent='CONTROLLER: '+pad.id.split('(')[0].slice(0,32);
  lx=Math.abs(pad.axes[0]||0)>.15?pad.axes[0]:0;
  ly=Math.abs(pad.axes[1]||0)>.15?pad.axes[1]:0;
  let rx=Math.abs(pad.axes[2]||0)>.15?pad.axes[2]:0,ry=Math.abs(pad.axes[3]||0)>.15?pad.axes[3]:0;
  camYaw-=rx*.041;camPitch=THREE.MathUtils.clamp(camPitch+ry*.024,-.28,.75);
 }
 const press=(name,keyboard,button)=>({edge:(keys.has(keyboard)&&!p.prevAction[name])||trigger(button)});
 // CHANGED: Q / B / Circle = directional dash. Q formerly used Special; Special is now E.
 const light=trigger(2),heavy=press('heavy','KeyR',3),dodge=press('dodge','KeyQ',1),jump=press('jump','Space',0),special=press('special','KeyE',5),target=press('target','Tab',7);
 let mx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+lx+touch.mx,my=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)+ly+touch.my;
 const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m}
 for(const [name,key] of [['heavy','KeyR'],['dodge','KeyQ'],['jump','Space'],['special','KeyE'],['target','Tab']])p.prevAction[name]=keys.has(key);
 return {mx,my,light:mouseLight||light||touch.light,heavy:heavy.edge||touch.heavy,dodge:dodge.edge||touch.dodge,jump:jump.edge||touch.jump,special:special.edge||touch.special,block:keys.has('KeyL')||down(4)||touch.block,target:target.edge||touch.target};
}
const MAX_HEALTH=150,LIGHT_DAMAGE=10,HEAVY_DAMAGE=20;
function resetFighter(f,x){
 // CHANGED: Restore every animated joint before beginning a round.
 resetCombatPose(f);
 f.root.position.set(x,0,0);f.v.set(0,0,0);f.hp=MAX_HEALTH;f.guard=100;
 f.onGround=true;f.yVel=0;f.attack=null;f.attackTime=0;f.attackCooldown=0;
 f.combo=0;f.comboWindow=0;f.queuedLight=false;f.stun=0;f.dodge=0;f.dashCooldown=0;f.iframes=0; // CHANGED: reset dash cooldown each round
 // CHANGED: No lingering spin, air offset or sideways vector between rounds.
 f.dashKind=null;f.dashDuration=0;f.dashDirection.set(0,0,0);clearDashVisual(f);stopSpinjitzu(f);
 // CHANGED: Reset knockdown state and landed-hit counters on a new round.
 f.ragdoll=0;f.ragdollTotal=0;f.ragdollSide=1;f.combatClock=0;clearHitChain(f);
 f.specialCooldown=0;f.hitFlash=0;f.block=false;f.visual.position.set(0,0,0);
 f.visual.rotation.set(0,0,0);f.runTime=0;
}
function startGame(){p.score=cpu.score=0;round=1;finished=false;newRound();running=true}
function newRound(){resetFighter(p,gameMode==='online'&&playerSlot===1?3.8:-3.8);resetFighter(cpu,gameMode==='online'&&playerSlot===1?-3.8:3.8);time=120;showToast('ROUND '+round,1.2);updateHUD()}
let toastT=0;function showToast(txt,secs){$('toast').textContent=txt;toastT=secs}
function aimAt(f,op){const d=new THREE.Vector3().subVectors(op.root.position,f.root.position);f.face=Math.atan2(-d.x,-d.z);f.root.rotation.y=f.face}
// CHANGED: Four separately pressed light attacks. Heavy remains a two-hit combo.
const ATTACKS={
 light:[
  {name:'LEFT JAB',len:.48,dmg:LIGHT_DAMAGE,range:2.8,arc:1.9,hits:[.48]},
  {name:'RIGHT CROSS',len:.48,dmg:LIGHT_DAMAGE,range:2.85,arc:1.9,hits:[.48]},
  {name:'RIGHT KICK',len:.69,dmg:LIGHT_DAMAGE,range:3.25,arc:1.9,hits:[.55]},
  // CHANGED: Fourth combo attack, with existing LIGHT_DAMAGE and hit() logic.
  {name:'LEFT HOOK',len:.50,dmg:LIGHT_DAMAGE,range:2.85,arc:1.9,hits:[.48]}
 ],
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,dmg:HEAVY_DAMAGE,range:3.5,arc:1.85,hits:[.30,.72]},
 // CHANGED: Five timed hits over an advancing 2-second elemental vortex.
 special:{name:'SPINJITZU',len:SPIN_DURATION,dmg:SPIN_DAMAGE[0],range:SPIN_RANGE,
  arc:Math.PI*2,hits:SPIN_HITS}
};
function tryAttack(f,kind){
 if(f.stun>0||f.dodge>0)return;
 if(f.attack){
  // An early follow-up press is buffered so quick players don't lose the combo.
  if(kind==='light'&&f.attack.kind==='light'&&f.attackTime/f.attack.len>.20)f.queuedLight=true;
  return;
 }
 if(f.attackCooldown>0)return;
 if(kind==='special'&&f.specialCooldown>0)return;
 if(kind==='light'){
  f.combo=f.comboWindow>0?(f.combo%4)+1:1; // CHANGED: Four-hit sequence
  f.comboWindow=1.17;
 }else{f.combo=0;f.comboWindow=0;f.queuedLight=false}
 const base=kind==='light'?ATTACKS.light[f.combo-1]:ATTACKS[kind];
 if(!base)return;
 f.attack={kind,stage:kind==='light'?f.combo:0,...base,hitIndex:0};
 f.attackTime=0;f.attackCooldown=base.len+.065;
 if(kind==='special')f.specialCooldown=SPIN_COOLDOWN;
 if(f===p&&gameMode==='online')gameEvents.onAttack?.(kind);
}
// Low-cost pooled-ish particle bursts: only spawned on confirmed contact.
const sparkGeo=new THREE.BoxGeometry(.105,.105,.105),particles=[];
function fx(pos,color,n=12){
 const m=new THREE.MeshBasicMaterial({color});
 for(let i=0;i<n;i++){
  const o=new THREE.Mesh(sparkGeo,m);o.position.copy(pos);scene.add(o);
  particles.push({obj:o,v:new THREE.Vector3((Math.random()-.5)*7,Math.random()*5+1.2,(Math.random()-.5)*7),life:.34,material:m});
 }
}
function hit(att,def,attack){
 const a=att.root.position,b=def.root.position;
 const dist=a.distanceTo(b),dir=Math.atan2(-(b.x-a.x),-(b.z-a.z));
 const angle=Math.atan2(Math.sin(dir-att.face),Math.cos(dir-att.face));
 if(dist>attack.range||Math.abs(angle)>attack.arc/2||def.iframes>0)return;
 const blocked=def.block&&def.guard>0;
 const damage=blocked?Math.max(1,Math.round(attack.dmg*.1)):attack.dmg;
 def.hp=Math.max(0,def.hp-damage);
 let knockdown=false,stunApplied=false; // CHANGED: Effects do not alter damage.
 if(blocked){
  recordHitForKnockdown(att,attack,true); // CHANGED: Blocking breaks the hit chain.
  def.guard=Math.max(0,def.guard-attack.dmg*2.1);
  if(def.guard<=0){
   startImpact(def,false); // CHANGED: One-second stun on a broken guard.
   clearHitChain(def);
   stunApplied=true;
   showToast('GUARD BREAK',.35);
  }else showToast('BLOCKED',.21);
 }else{
  // CHANGED: Normal combo rules remain. Spinjitzu only knocks down on its
  // CHANGED: final confirmed, unblocked strike.
  knockdown=recordHitForKnockdown(att,attack,false)||
   (attack.kind==='special'&&attack.finisher===true);
  startImpact(def,knockdown); // CHANGED: 1s stun and attack interruption.
  clearHitChain(def); // CHANGED: Getting hit breaks your own combo.
  if(knockdown)resetCombatPose(def); // CHANGED: Hand control to knockdown pose.
  stunApplied=true;
  showToast(knockdown?'RAGDOLL KNOCKDOWN!':
   attack.kind==='light'?attack.name+' · 10':attack.kind==='heavy'?'HEAVY · 20':'SPECIAL HIT!',knockdown?.8:.29);
 }
 // CHANGED: Same multiplayer damage event; synchronize hitstun and knockdown.
 if(gameMode==='online'&&att===p)gameEvents.onHit?.(damage,{
  knockdown,stun:stunApplied,
  spinjitzuFinisher:knockdown&&attack.kind==='special'&&attack.finisher===true
 });
 const knock=new THREE.Vector3().subVectors(b,a).setY(0).normalize();
 const finisher=knockdown&&attack.kind==='special'&&attack.finisher===true;
 def.v.addScaledVector(knock,blocked?1.0:finisher?9.5:attack.kind==='heavy'?4.4:2.6);
 if(finisher){
  def.root.position.addScaledVector(knock,1.10);
  const edge=Math.hypot(def.root.position.x,def.root.position.z);
  if(edge>16.25){def.root.position.x*=16.25/edge;def.root.position.z*=16.25/edge}
 }
 fx(b.clone().add(new THREE.Vector3(0,1.55,0)),blocked?0xffde97:att===p?0x71dfff:0xff8970,blocked?8:13);
}
// CHANGED: All LIGHT/HEAVY keyframes, angle tables and interpolation are in combat-poses.js.
const SPECIAL_POSES=[[0,{}],[.19,{l:1.55,r:1.55,lift:.18,lean:-.12}],[.53,{l:2.25,r:2.25,bodyY:2.1,bodyZ:.24,lift:.35}],[.8,{l:1,r:1,bodyY:3.1}],[1,{}]];
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
function keyPose(frames,t){
 let i=1;while(i<frames.length-1&&frames[i][0]<t)i++;
 const a=frames[i-1],b=frames[i],k=ease((t-a[0])/(b[0]-a[0]||1));
 const pose={};
 for(const key of new Set([...Object.keys(a[1]),...Object.keys(b[1])]))pose[key]=(a[1][key]||0)*(1-k)+(b[1][key]||0)*k;
 return pose;
}
// CHANGED: Combat-only pose animation on shoulder/elbow/hip/knee/torso joints.
// The original idle, walk, jump, block, special, hit reactions and visual bob remain.
function poseFighter(f,dt=0){
 const {arms,legs,body,head}=f.visual.userData;
 const stride=Math.sin(f.runTime),walk=Math.min(1,f.moving),idle=Math.sin(performance.now()*.0028)*.026;
 // CHANGED: Hide the tornado instantly if interrupted, knocked down or finished.
 if(f.attack?.kind!=='special'||f.ragdoll>0)stopSpinjitzu(f);
 // CHANGED: Procedural limp-body fall takes priority over attack and idle poses.
 if(f.ragdoll>0){poseKnockdown(f);return;}
  // CHANGED: Dash animation overrides ordinary walking/attacking poses for its short duration.
  if(f.dodge>0&&f.dashKind){
   applyDashPose(f,sampleDashPose(f));
   return;
  }
  // CHANGED: Clear the previous backflip visual offset when dash ends/is interrupted.
  if(f.dashKind&&f.dodge<=0){clearDashVisual(f);f.dashKind=null;}
 if(f.attack?.kind==='special'){
  poseSpinjitzu(f); // CHANGED: Spinning classic minifigure and colored 3D vortex.
  return;
 }
 const combatPose=sampleCombatPose(f,dt);
 if(combatPose){
  // CHANGED: A small full-figure lean reinforces the already animated hip-height
  // CHANGED: torso pivot. This is cosmetic ONLY; root, collision, hits and speed stay put.
  // CHANGED: Forward punch lean is negative X; kick counterbalance leans positive X.
  // CHANGED: Keep the stance vertical when idle/blocking and after the clip ends.
  const striking=f.attack&&(f.attack.kind==='light'||f.attack.kind==='heavy');
  const pitch=striking?THREE.MathUtils.clamp((combatPose.T?.[0]||0)*Math.PI/180*.24,-.15,.15):0;
  const roll=striking?THREE.MathUtils.clamp((combatPose.T?.[2]||0)*Math.PI/180*.16,-.09,.09):0;
  f.visual.position.z=0;
  f.visual.rotation.set(pitch,0,roll);
  // CHANGED: Original shoulder/hip joint posing remains completely unchanged.
  applyCombatPose(f,combatPose);
  if(f.dodge>0){
   f.visual.rotation.x=-.30;
   body.rotation.z+=Math.sin((.34-f.dodge)/.34*Math.PI)*.35;
  }
  // CHANGED: Visible two-shoulder hit recoil, recovering while stunned.
  if(f.hitFlash>0){
   const recoil=Math.sin((1-f.hitFlash/.19)*Math.PI);
   body.rotation.x-=.21*recoil;
   body.rotation.z+=Math.sin(f.hitFlash*46)*.10;
   arms[0].rotation.x-=.15*recoil;
   arms[1].rotation.x-=.15*recoil;
   head.rotation.x+=.10*recoil;
  }
  // CHANGED: Lightweight grounded footstep bob, never translates fighter/hitbox.
  // CHANGED: Plant the support foot through strikes. Normal walk/idle keeps
  // CHANGED: its gentle bob, but committed hits settle the cosmetic rig.
  const bob=Math.abs(stride)*.028*walk+idle;
  const actionProgress=striking?THREE.MathUtils.clamp(f.attackTime/f.attack.len,0,1):0;
  const weight=striking?Math.sin(actionProgress*Math.PI)**2:0;
  const kicking=f.attack&&((f.attack.stage===3&&f.attack.kind==='light')||
    (f.attack.kind==='heavy'&&actionProgress>.50));
  f.visual.position.y=f.onGround?bob*(1-weight)-weight*(kicking?.09:.03):0;
  return;
 }
 // The existing special animation is deliberately kept as it was.
 const pose=f.attack?.kind==='special'?keyPose(SPECIAL_POSES,THREE.MathUtils.clamp(f.attackTime/f.attack.len,0,1)):{};
 const gp=key=>pose[key]||0;
 legs[0].rotation.x=stride*.43*walk+gp('legL');
 legs[1].rotation.x=-stride*.43*walk+gp('legR');
 // CHANGED: A neutral, unbent knee is the exact resting leg pose.
 legs[0].userData.knee.rotation.set(0,0,0);
 legs[1].userData.knee.rotation.set(0,0,0);
 arms[0].rotation.x=-stride*.22*walk+.15+gp('l');
 arms[1].rotation.x=stride*.22*walk+.15+gp('r');
 const idleArmSpread=f.visual.name.startsWith('PLAIN_CLASSIC_MINIFIG_')?.015:.14;
 arms[0].rotation.z=-idleArmSpread+gp('lz');
 arms[1].rotation.z=idleArmSpread+gp('rz');
 arms[0].userData.elbow.rotation.x=gp('el');
 arms[1].userData.elbow.rotation.x=gp('er');
 body.rotation.x=gp('lean');body.rotation.y=gp('bodyY');body.rotation.z=gp('bodyZ');
 head.rotation.y=Math.sin(f.runTime*.25)*.025;
 if(f.block){arms[0].rotation.x=1.50;arms[1].rotation.x=1.5;arms[0].rotation.z=-.22;arms[1].rotation.z=.22;body.rotation.x=.11}
 if(f.dodge>0){f.visual.rotation.x=-.30;body.rotation.z+=Math.sin((.34-f.dodge)/.34*Math.PI)*.35}
 else f.visual.rotation.x=0;
 if(f.hitFlash>0){body.rotation.z+=Math.sin(f.hitFlash*46)*.13;body.rotation.x-=.14}
 f.visual.position.y=gp('lift')+(f.onGround?Math.abs(stride)*.045*walk+idle:0);
}
let aiThink=0,aiMove={mx:0,my:0,block:false,light:false,heavy:false,dodge:false,special:false,jump:false};
function cpuInput(dt){
 const dist=cpu.root.position.distanceTo(p.root.position),toward=new THREE.Vector3().subVectors(p.root.position,cpu.root.position).setY(0).normalize();
 aiThink-=dt;
 if(aiThink<=0){
  aiThink=.18+Math.random()*.22;
  aiMove={
   mx:dist>2.45?toward.x:dist<1.5?-toward.x*.4:(Math.random()-.5)*.7,
   my:dist>2.45?toward.z:dist<1.5?-toward.z*.4:(Math.random()-.5)*.7,
   block:!!p.attack&&dist<3.5&&Math.random()<.38,
   light:dist<3.1&&Math.random()<.62,
   heavy:dist<3.2&&Math.random()<.15,
   dodge:!!p.attack&&dist<3&&Math.random()<.10,
   special:dist<4&&cpu.specialCooldown<=0&&Math.random()<.06,jump:false
  };
 }
 return aiMove;
}
function updateFighter(f,op,dt,controls){
 // CHANGED: Elapsed time drives knockdowns and landed-combo expiration.
 f.combatClock=(f.combatClock||0)+dt;tickImpact(f,dt);
 for(const k of ['stun','attackCooldown','specialCooldown','iframes','dodge','dashCooldown','comboWindow','hitFlash'])f[k]=Math.max(0,f[k]-dt);
 f.guard=Math.min(100,f.guard+dt*(f.block?2:15));
 f.block=controls.block&&f.stun<=0&&f.guard>0&&f.dodge<=0&&!f.attack;
 if(controls.jump&&f.onGround&&f.stun<=0){f.yVel=8;f.onGround=false}
 // CHANGED: Four proper directional dashes, selected on Q / B / Circle press.
 if(controls.dodge&&f.dodge<=0&&f.dashCooldown<=0&&f.stun<=0&&f.attackCooldown<=0&&!f.attack){ // CHANGED: shared dash cooldown gate
  const mx=controls.mx||0,my=controls.my||0;
  // CHANGED: W/stick-up (or no input) punches forward; A/D sidestep; S backflips.
  const type=f===cpu?'back':Math.abs(mx)>Math.abs(my)&&Math.abs(mx)>.18?(mx<0?'left':'right'):
   my>.18?'back':'forward';
  const settings=DASH_ANIMATIONS[type];f.dashKind=type;f.dashDuration=settings.duration;
   // CHANGED: Cooldown starts on dash activation. Side dashes = 1s; forward/back = 2s.
   f.dashCooldown=(type==='left'||type==='right')?1:2;
  f.dodge=settings.duration;f.iframes=.26; // CHANGED: Keep the existing dash i-frame window.
  // CHANGED: Character-local directions track the facing opponent, not screen pixels.
  const forward=new THREE.Vector3(-Math.sin(f.face),0,-Math.cos(f.face));
  const right=new THREE.Vector3(Math.cos(f.face),0,-Math.sin(f.face));
  f.dashDirection.copy(type==='left'?right.multiplyScalar(-1):type==='right'?right:
    type==='back'?forward.multiplyScalar(-1):forward).normalize();
  // CHANGED: Snap the dash velocity immediately; footwork slows into the recovery.
  f.v.copy(f.dashDirection).multiplyScalar(settings.speed);
 }
 if(controls.light)tryAttack(f,'light');
 if(controls.heavy)tryAttack(f,'heavy');
 if(controls.special)tryAttack(f,'special');
 const dir=new THREE.Vector3(controls.mx,0,controls.my);
 if(f===p)dir.applyAxisAngle(new THREE.Vector3(0,1,0),camYaw);
 let sp=f.block?3:8;
 if(f.stun>0)sp=0;
 if(f.attack)sp*=.27;
 if(f.dodge>0)sp*=.12;
 // CHANGED: Dash has a committed travel vector; normal movement resumes at the end.
 if(f.dodge>0&&f.dashKind){
  const progress=1-f.dodge/f.dashDuration;
  const decel=progress>.77?Math.max(.10,(1-progress)/.23):1;
  const speed=DASH_ANIMATIONS[f.dashKind].speed*decel;
  f.v.x=f.dashDirection.x*speed;f.v.z=f.dashDirection.z*speed;
 }else if(f.attack?.kind==='special'){
  // CHANGED: Advance toward the opponent instead of staying in the old fixed Special pose.
  const toTarget=new THREE.Vector3().subVectors(op.root.position,f.root.position).setY(0);
  const dist=toTarget.length();
  const finish=1-THREE.MathUtils.smoothstep(f.attackTime,1.58,SPIN_DURATION);
  const velocity=dist>1.75?Math.min(SPIN_SPEED,(dist-1.75)*6)*finish:0;
  if(dist>.001)toTarget.multiplyScalar(1/dist);
  f.v.x=toTarget.x*velocity;f.v.z=toTarget.z*velocity;
 }else{
  f.v.x=THREE.MathUtils.damp(f.v.x,dir.x*sp,8,dt);
  f.v.z=THREE.MathUtils.damp(f.v.z,dir.z*sp,8,dt);
 }
 f.root.position.addScaledVector(f.v,dt);
 const radial=Math.hypot(f.root.position.x,f.root.position.z);
 if(radial>16.25){f.root.position.x*=16.25/radial;f.root.position.z*=16.25/radial}
 f.yVel-=21*dt;f.root.position.y+=f.yVel*dt;
 if(f.root.position.y<=0){f.root.position.y=0;f.yVel=0;f.onGround=true}
 f.moving=Math.min(1,dir.length());f.runTime+=dt*f.moving*12;
 if(lock||f===cpu||f.attack?.kind==='special')aimAt(f,op);
 else if(f.moving>.12){f.face=Math.atan2(-dir.x,-dir.z);f.root.rotation.y=f.face}
 if(f.attack){
  f.attackTime+=dt;
  const t=Math.min(1,f.attackTime/f.attack.len);
  while(f.attack.hitIndex<f.attack.hits.length&&t>=f.attack.hits[f.attack.hitIndex]){
   const index=f.attack.hitIndex++;
   if(f.attack.kind==='special'){
    f.attack.dmg=SPIN_DAMAGE[index];
    f.attack.finisher=index===SPIN_HITS.length-1;
   }
   if(f===p||gameMode==='solo')hit(f,op,f.attack);
  }
  if(t>=1){
   const lightQueued=f.queuedLight&&f.attack.kind==='light';
   f.attack=null;f.queuedLight=false;
   if(lightQueued){f.attackCooldown=0;tryAttack(f,'light')}
  }
 }
 poseFighter(f,dt);
}
function updateHUD(){
 $('hp1').style.width=(100*p.hp/MAX_HEALTH)+'%';$('hp2').style.width=(100*cpu.hp/MAX_HEALTH)+'%';
 $('st1').textContent=`HP ${Math.ceil(p.hp)}/150 · GUARD ${Math.round(p.guard)}% · SPECIAL ${p.specialCooldown>0?Math.ceil(p.specialCooldown)+'s':'READY'}`;
 $('st2').textContent=`HP ${Math.ceil(cpu.hp)}/150 · GUARD ${Math.round(cpu.guard)}%`;
 $('timer').textContent=String(Math.floor(time/60)).padStart(2,'0')+':'+String(Math.ceil(time%60)).padStart(2,'0');
 $('roundLabel').textContent='BEST OF 3 · ROUND '+round;
 $('sc1').textContent='● '.repeat(p.score)+'○ '.repeat(2-p.score);
 $('sc2').textContent='○ '.repeat(2-cpu.score)+'● '.repeat(cpu.score);
}
function endRound(){
 running=false;const winner=p.hp===cpu.hp?(p.guard>=cpu.guard?p:cpu):(p.hp>cpu.hp?p:cpu);
 winner.score++;showToast(winner===p?'ROUND WON':'ROUND LOST',2);updateHUD();roundWait=2.4;
}
function nextRound(){
 if(p.score>=2||cpu.score>=2){finished=true;showToast(p.score>=2?'VICTORY!':'DEFEAT',10);gameEvents.onEnd?.(p.score>=2)}
 else{round++;newRound();running=true}
}
const clock=new THREE.Clock();let frames=0,frameWindow=0;
const fpsCounter=document.createElement('div');fpsCounter.id='fpsCounter';fpsCounter.style.cssText='position:fixed;bottom:54px;left:18px;z-index:8;padding:5px 9px;background:#071319c9;color:#a9f2a5;font:700 12px Arial;pointer-events:none';fpsCounter.textContent='FPS --';document.body.appendChild(fpsCounter);
function animate(){
 requestAnimationFrame(animate);
 const dt=Math.min(clock.getDelta(),.04);
 frames++;frameWindow+=dt;
 if(frameWindow>=1){fpsCounter.textContent='FPS '+Math.round(frames/frameWindow);frames=0;frameWindow=0}
 fpsCounter.style.display=$('hud').classList.contains('hidden')?'none':'block';
 const input=pollInput();
 if(input.target){lock=!lock;$('reticle').style.display=lock?'block':'none'}
 if(running){
  time=Math.max(0,time-dt);
  updateFighter(p,cpu,dt,input);
  if(gameMode==='solo')updateFighter(cpu,p,dt,cpuInput(dt));
  else{
   netTick+=dt;
   if(netTick>.05){netTick=0;gameEvents.onState?.({x:p.root.position.x,y:p.root.position.y,z:p.root.position.z,rot:p.root.rotation.y,hp:p.hp,guard:p.guard,
    // CHANGED: Dash animation piggybacks on existing synchronized state.
    dashKind:p.dodge>0?p.dashKind:null,dashProgress:p.dodge>0?1-p.dodge/p.dashDuration:1})}
   if(remoteState){
    cpu.root.position.lerp(new THREE.Vector3(remoteState.x,remoteState.y,remoteState.z),Math.min(1,dt*14));
    cpu.root.rotation.y=remoteState.rot;cpu.hp=remoteState.hp;cpu.guard=remoteState.guard;
    // CHANGED: The peer sees the same animation direction and spin.
    const kind=remoteState.dashKind;
    if(['forward','back','left','right'].includes(kind)&&Number.isFinite(remoteState.dashProgress)){
     const d=DASH_ANIMATIONS[kind];
     cpu.dashKind=kind;cpu.dashDuration=d.duration;
     cpu.dodge=Math.max(0,d.duration*(1-THREE.MathUtils.clamp(remoteState.dashProgress,0,1)));
    }else if(!kind){cpu.dashKind=null;cpu.dodge=0;}
   }
   cpu.attackCooldown=Math.max(0,cpu.attackCooldown-dt);
   // CHANGED: Advance remote dash between sync packets.
   cpu.dodge=Math.max(0,cpu.dodge-dt);
   // CHANGED: Animate the remote fighter's visual knockdown at local frame rate.
   tickImpact(cpu,dt);
   if(cpu.attack){cpu.attackTime+=dt;if(cpu.attackTime>=cpu.attack.len)cpu.attack=null}
   cpu.runTime+=dt*3;poseFighter(cpu,dt);
  }
  const delta=new THREE.Vector3().subVectors(cpu.root.position,p.root.position),dist=delta.length();
  if(dist<1.25&&dist>.0001){delta.normalize();p.root.position.addScaledVector(delta,-(1.25-dist)*.5);cpu.root.position.addScaledVector(delta,(1.25-dist)*.5)}
  if(p.hp<=0||cpu.hp<=0||time<=0)endRound();
  updateHUD();
 }else if(roundWait>0){roundWait-=dt;if(roundWait<=0)nextRound()}
 if(toastT>0){toastT-=dt;if(toastT<=0)$('toast').textContent=''}
 for(let i=particles.length-1;i>=0;i--){
  const q=particles[i];q.life-=dt;
  q.obj.position.addScaledVector(q.v,dt);q.v.y-=16*dt;q.obj.rotation.x+=dt*6;
  if(q.life<=0){scene.remove(q.obj);particles.splice(i,1);if(!particles.some(p=>p.material===q.material))q.material.dispose()}
 }
 // Combat framing: short camera distance, gentle zoom-out as opponents separate, smooth yaw.
 const midpoint=p.root.position.clone().lerp(cpu.root.position,.33).add(new THREE.Vector3(0,1.9,0));
 if(lock&&running){
  const delta=new THREE.Vector3().subVectors(cpu.root.position,p.root.position);
  const yawGoal=Math.atan2(-delta.x,-delta.z);
  const yawDiff=Math.atan2(Math.sin(yawGoal-camYaw),Math.cos(yawGoal-camYaw));
  camYaw+=yawDiff*(1-Math.exp(-3.4*dt));
 }
 const separation=p.root.position.distanceTo(cpu.root.position);
 const camDist=THREE.MathUtils.clamp(6.9+separation*.31,7.7,12.2);
 const offset=new THREE.Vector3(Math.sin(camYaw)*camDist,3.5+camPitch*4.1+separation*.06,Math.cos(camYaw)*camDist);
 camera.position.lerp(midpoint.clone().add(offset),1-Math.exp(-5.2*dt));
 camera.lookAt(midpoint.clone().lerp(cpu.root.position.clone().add(new THREE.Vector3(0,1.7,0)),.05));
 renderer.render(scene,camera);
}
addEventListener('resize',()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setSize(innerWidth,innerHeight)});
$('reticle').style.display='none';updateHUD();animate();
