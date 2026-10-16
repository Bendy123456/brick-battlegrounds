import * as THREE from '/vendor/three.module.js';

const $ = id => document.getElementById(id);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x142637);
scene.fog = new THREE.FogExp2(0x142637,0.0095);
const renderer = new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.4));
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
// Original nine-fighter ninja model system. All fighters use the same rig; outfit colors and trims vary.
const plasticSkin=mat(0xf4c86f,.37),eyes=mat(0x11191d,.9),steel=mat(0xd9e3e8,.28,.72),strap=mat(0x2a2728,.8),armGold=mat(0xb99554,.38,.42);
function fighter(color,x,z){
 const root=new THREE.Group();root.position.set(x,0,z);scene.add(root);
 const visual=new THREE.Group();root.add(visual);
 const cloth=mat(color,.43), accent=mat(0xdbb46a,.4,.24),pants=mat(color,.49);
 const body=new THREE.Group();visual.add(body);
 // Tapered torso with physical layered armor and printed folds.
 const tg=new THREE.CylinderGeometry(.69,.55,1.12,4,1);tg.rotateY(Math.PI/4);
 const torso=mesh(body,tg,cloth,0,1.54,0);torso.scale.z=.82;
 box(body,1.05,.15,.72,0,.98,0,strap);
 box(body,.92,.105,.12,0,1.91,-.37,accent);
 box(body,.15,.69,.065,-.25,1.58,-.435,accent);
 box(body,.08,.69,.065,.23,1.59,-.435,strap);
 box(body,.37,.19,.095,0,1.22,-.45,accent);
 box(body,.41,.15,.12,0,1.5,-.46,strap);
 // Shoulder guards and collar give the model a distinct minifigure ninja silhouette.
 for(const sx of [-1,1]){
  const shoulder=box(body,.46,.22,.85,sx*.70,2.08,0,accent);shoulder.rotation.z=sx*.15;
  box(body,.10,.32,.08,sx*.45,1.62,-.44,accent);
 }
 cyl(body,.40,.39,.18,0,2.2,0,strap,18);
 const head=new THREE.Group();head.position.set(0,2.54,0);body.add(head);
 cyl(head,.41,.41,.67,0,0,0,plasticSkin,24);
 cyl(head,.44,.44,.11,0,.43,0,cloth,24);
 cyl(head,.48,.46,.34,0,.43,.065,cloth,24);
 cyl(head,.42,.39,.48,0,.02,.25,cloth,20);
 box(head,.83,.18,.16,0,-.23,-.34,cloth);
 box(head,.83,.12,.15,0,.18,-.39,strap);
 box(head,.76,.065,.1,0,-.34,-.40,accent);
 for(const sx of [-1,1]){
  const ey=box(head,.155,.095,.055,sx*.18,.032,-.414,eyes,false);
  ey.rotation.z=sx*.08;
  const eyebrow=box(head,.19,.035,.056,sx*.18,.12,-.42,eyes,false);eyebrow.rotation.z=-sx*.18;
 }
 const arms=[],legs=[];
 for(const sx of [-1,1]){
  const shoulder=new THREE.Group();shoulder.position.set(sx*.74,2.02,0);body.add(shoulder);
  const upper=cyl(shoulder,.24,.24,.54,0,-.28,0,cloth,12);
  upper.rotation.z=sx*.06;
  cyl(shoulder,.25,.23,.19,0,-.56,0,accent,12);
  const elbow=new THREE.Group();elbow.position.set(0,-.56,-.02);shoulder.add(elbow);
  cyl(elbow,.20,.21,.36,0,-.18,0,cloth,12);
  const palm=cyl(elbow,.195,.195,.22,0,-.48,-.02,plasticSkin,14);
  // Inset gap between curved clamp fingers preserves the distinctive claw-hand silhouette.
  box(elbow,.15,.15,.21,sx*.17,-.55,-.10,plasticSkin);
  box(elbow,.15,.15,.21,-sx*.17,-.55,-.10,plasticSkin);
  shoulder.userData.elbow=elbow;arms.push(shoulder);
  const hip=new THREE.Group();hip.position.set(sx*.29,.93,0);visual.add(hip);
  box(hip,.52,.73,.59,0,-.39,0,pants);
  box(hip,.53,.25,.67,0,-.70,-.065,strap);
  box(hip,.42,.09,.09,0,-.20,-.31,accent);
  legs.push(hip);
 }
 // Katana is holstered on the back, leaving fists visible during hand-to-hand combo attacks.
 const sheath=new THREE.Group();body.add(sheath);sheath.position.set(.33,1.78,.48);sheath.rotation.z=-.4;
 cyl(sheath,.12,.12,1.42,0,.12,0,strap,10);
 box(sheath,.44,.12,.27,0,.79,0,accent);
 cyl(sheath,.095,.095,.55,0,1.07,0,armGold,10);
 cyl(sheath,.17,.17,.12,0,1.36,0,accent,10);
 visual.userData={arms,legs,body,head,cloth,pants,accent,baseColor:color};
 return {root,visual,hp:150,guard:100,v:new THREE.Vector3(),onGround:true,yVel:0,face:0,attack:null,attackTime:0,attackCooldown:0,iframes:0,stun:0,dodge:0,block:false,specialCooldown:0,combo:0,comboWindow:0,queuedLight:false,score:0,moving:0,runTime:0,hitFlash:0,prevAction:{},name:'NINJA'};
}
const p=fighter(0x1186ca,-3.8,0),cpu=fighter(0xc83d39,3.8,0);
export const gameEvents={onState:null,onAttack:null,onHit:null,onEnd:null,onDisconnect:null};
let gameMode='solo',remoteState=null,netTick=0,playerSlot=0;
export function setMode(m,slot=0){gameMode=m;playerSlot=slot;remoteState=null;netTick=0}
const fighterSymbols={AZURE:'✦',CRIMSON:'◆',VERDANT:'❖',SHADE:'☽',GOLDEN:'♛',IVORY:'❄',CINDER:'▲',ORCHID:'✧',ROSE:'✿'};
function dressFighter(f,c){
 f.name=c[0];
 const ud=f.visual.userData;
 ud.cloth.color.set(c[1]);ud.pants.color.set(c[1]);
 ud.accent.color.set(c[2]||0x987654);
 if(ud.custom){
  ud.custom.traverse(o=>{if(o.geometry)o.geometry.dispose();if(o.material){if(o.material.map)o.material.map.dispose();o.material.dispose()}});
  ud.custom.parent.remove(ud.custom);
 }
 const g=new THREE.Group();ud.body.add(g);ud.custom=g;
 // Individually drawn costume crest, directly attached to the animated chest rig.
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const ctx=canvas.getContext('2d');
 ctx.clearRect(0,0,128,128);
 ctx.strokeStyle='#171b21';ctx.lineWidth=6;
 ctx.beginPath();ctx.moveTo(16,21);ctx.lineTo(112,21);ctx.lineTo(101,112);ctx.lineTo(27,112);ctx.closePath();ctx.stroke();
 ctx.fillStyle='#edc676';ctx.textAlign='center';ctx.textBaseline='middle';
 ctx.font='bold 75px Georgia, serif';ctx.fillText(fighterSymbols[c[0]]||'✦',64,67);
 const texture=new THREE.CanvasTexture(canvas);texture.colorSpace=THREE.SRGBColorSpace;
 const decal=new THREE.Mesh(new THREE.PlaneGeometry(.52,.55),new THREE.MeshBasicMaterial({map:texture,transparent:true,side:THREE.DoubleSide,depthWrite:false}));
 decal.position.set(0,1.62,-.49);decal.rotation.y=Math.PI;g.add(decal);
 // Nine distinctive helmet and armor details, deliberately lightweight for WebGL.
 const idx=Object.keys(fighterSymbols).indexOf(c[0]);
 const badgeMat=mat(idx===5?0xb9e7fa:idx===3?0x7485a0:0xe8b869,.4,.25);
 if(idx===4){ // champion: twin gold crown prongs
  for(const dx of [-.26,.26])box(g,.14,.30,.13,dx,3.1,-.25,badgeMat);
 }else if(idx===3){ // shadow: dark angular side guards
  for(const dx of [-.51,.51])box(g,.16,.47,.26,dx,2.8,0,badgeMat);
 }else if(idx===5){ // frost: crystalline forehead crest
  const gem=box(g,.23,.33,.10,0,2.94,-.5,badgeMat);gem.rotation.z=Math.PI/4;
 }else if(idx===6){ // ember: high plume
  const crest=cyl(g,.14,.10,.32,0,3.19,.16,badgeMat,9);crest.rotation.z=-.25;
 }else if(idx===7){ // arcane: floating twin side stud shapes
  sphere(g,.14,-.47,2.9,.06,badgeMat);sphere(g,.14,.47,2.9,.06,badgeMat);
 }else if(idx===8){ // blossom: pale headpiece
  const crest=sphere(g,.16,.20,3.12,-.02,badgeMat);crest.scale.set(1.4,.55,1);
 }else if(idx===2){ // verdant: side wrap
  box(g,.13,.44,.44,-.46,2.65,.14,badgeMat);
 }else if(idx===1){ // crimson: V-shaped brow armor
  for(const sign of [-1,1]){const crest=box(g,.34,.09,.12,sign*.15,2.99,-.43,badgeMat);crest.rotation.z=-sign*.37}
 }else{ // azure: angular forehead stripe
  const crest=box(g,.17,.37,.12,0,3.06,-.42,badgeMat);crest.rotation.z=.25;
 }
}
export function setCharacters(local,opponent){
 dressFighter(p,local);dressFighter(cpu,opponent);
 $('p1name').textContent=local[0];$('p2name').textContent=opponent[0];
}
export function startFight(){startGame()}
export function stopFight(){running=false;finished=false;roundWait=0}
export function receivePeerState(state){remoteState=state}
export function receivePeerAttack(kind){if(gameMode==='online')tryAttack(cpu,kind)}
export function receiveDamage(damage){if(gameMode==='online'&&running){p.hp=Math.max(0,p.hp-damage);p.stun=.24;p.hitFlash=.2;fx(p.root.position.clone().add(new THREE.Vector3(0,1.75,0)),0xff9977,11)}}
cpu.root.rotation.y=Math.PI/2;p.root.rotation.y=-Math.PI/2;
let running=false,finished=false,time=120,round=1,roundWait=0,lock=true,camYaw=-Math.PI/2,camPitch=.16;
const keys=new Set(),mouse={drag:false,px:0,py:0};
addEventListener('keydown',e=>{if(['Space','Tab','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();keys.add(e.code);if(e.code==='KeyR'&&finished)startGame()});
addEventListener('keyup',e=>keys.delete(e.code));
addEventListener('blur',()=>keys.clear());
renderer.domElement.addEventListener('pointerdown',e=>{mouse.drag=true;mouse.px=e.clientX;mouse.py=e.clientY});
addEventListener('pointerup',()=>mouse.drag=false);
addEventListener('pointermove',e=>{if(!mouse.drag)return;camYaw-=(e.clientX-mouse.px)*.005;camPitch=THREE.MathUtils.clamp(camPitch+(e.clientY-mouse.py)*.004,-.28,.75);mouse.px=e.clientX;mouse.py=e.clientY});
const gpPrev=[];
function pollInput(){
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
 const light=press('light','KeyJ',2),heavy=press('heavy','KeyK',3),dodge=press('dodge','ShiftLeft',1),jump=press('jump','Space',0),special=press('special','KeyQ',5),target=press('target','Tab',7);
 let mx=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0)+lx,my=(keys.has('KeyS')?1:0)-(keys.has('KeyW')?1:0)+ly;
 const m=Math.hypot(mx,my);if(m>1){mx/=m;my/=m}
 for(const [name,key] of [['light','KeyJ'],['heavy','KeyK'],['dodge','ShiftLeft'],['jump','Space'],['special','KeyQ'],['target','Tab']])p.prevAction[name]=keys.has(key);
 return {mx,my,light:light.edge,heavy:heavy.edge,dodge:dodge.edge,jump:jump.edge,special:special.edge,block:keys.has('KeyL')||down(4),target:target.edge};
}
const MAX_HEALTH=150,LIGHT_DAMAGE=10,HEAVY_DAMAGE=20;
function resetFighter(f,x){
 f.root.position.set(x,0,0);f.v.set(0,0,0);f.hp=MAX_HEALTH;f.guard=100;
 f.onGround=true;f.yVel=0;f.attack=null;f.attackTime=0;f.attackCooldown=0;
 f.combo=0;f.comboWindow=0;f.queuedLight=false;f.stun=0;f.dodge=0;f.iframes=0;
 f.specialCooldown=0;f.hitFlash=0;f.block=false;f.visual.position.set(0,0,0);
 f.visual.rotation.set(0,0,0);f.runTime=0;
}
function startGame(){p.score=cpu.score=0;round=1;finished=false;newRound();running=true}
function newRound(){resetFighter(p,gameMode==='online'&&playerSlot===1?3.8:-3.8);resetFighter(cpu,gameMode==='online'&&playerSlot===1?-3.8:3.8);time=120;showToast('ROUND '+round,1.2);updateHUD()}
let toastT=0;function showToast(txt,secs){$('toast').textContent=txt;toastT=secs}
function aimAt(f,op){const d=new THREE.Vector3().subVectors(op.root.position,f.root.position);f.face=Math.atan2(-d.x,-d.z);f.root.rotation.y=f.face}
// Light: three *separate* button presses. Heavy: one press plays a two-impact combo.
const ATTACKS={
 light:[
  {name:'LEFT JAB',len:.48,dmg:LIGHT_DAMAGE,range:2.8,arc:1.9,hits:[.48]},
  {name:'RIGHT CROSS',len:.48,dmg:LIGHT_DAMAGE,range:2.85,arc:1.9,hits:[.48]},
  {name:'RIGHT KICK',len:.69,dmg:LIGHT_DAMAGE,range:3.25,arc:1.9,hits:[.55]}
 ],
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,dmg:HEAVY_DAMAGE,range:3.5,arc:1.85,hits:[.30,.72]},
 special:{name:'SPECIAL',len:1.02,dmg:24,range:4.5,arc:2.4,hits:[.49]}
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
  f.combo=f.comboWindow>0?(f.combo%3)+1:1;
  f.comboWindow=1.17;
 }else{f.combo=0;f.comboWindow=0;f.queuedLight=false}
 const base=kind==='light'?ATTACKS.light[f.combo-1]:ATTACKS[kind];
 if(!base)return;
 f.attack={kind,stage:kind==='light'?f.combo:0,...base,hitIndex:0};
 f.attackTime=0;f.attackCooldown=base.len+.065;
 if(kind==='special')f.specialCooldown=8;
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
 if(gameMode==='online'&&att===p)gameEvents.onHit?.(damage);
 if(blocked){
  def.guard=Math.max(0,def.guard-attack.dmg*2.1);
  if(def.guard<=0){def.stun=.65;def.block=false;showToast('GUARD BREAK',.35)}
  else showToast('BLOCKED',.21);
 }else{
  def.stun=attack.kind==='heavy'?.37:attack.kind==='light'?.14:.42;
  def.hitFlash=.19;
  showToast(attack.kind==='light'?attack.name+' · 10':attack.kind==='heavy'?'HEAVY · 20':'SPECIAL HIT!',.29);
 }
 const knock=new THREE.Vector3().subVectors(b,a).setY(0).normalize();
 def.v.addScaledVector(knock,blocked?1.0:attack.kind==='heavy'?4.4:2.6);
 fx(b.clone().add(new THREE.Vector3(0,1.55,0)),blocked?0xffde97:att===p?0x71dfff:0xff8970,blocked?8:13);
}
// Individually authored combat poses, smoothly eased between windup, extension and recovery.
// Angles rotate real shoulder/hip pivots, rather than moving a whole rigid limb mesh.
const LIGHT_POSES=[
 [
  [0,{}],[.25,{l:-.92,r:-.25,ly:.22,bodyY:.27,bodyZ:.12}],
  [.53,{l:1.63,r:-.50,el:-.33,bodyY:-.30,bodyZ:-.12,lean:.21}],
  [.77,{l:1.40,r:.1,bodyY:-.12,lean:.10}],[1,{}]
 ],
 [
  [0,{}],[.24,{r:-.96,l:.20,bodyY:-.27,bodyZ:-.12}],
  [.52,{r:1.74,l:-.5,er:-.40,bodyY:.29,bodyZ:.14,lean:.21}],
  [.81,{r:1.1,l:0,lean:.08}],[1,{}]
 ],
 [
  [0,{}],[.26,{legR:-.48,legL:.18,l:1.07,r:1.1,bodyZ:.26,lean:-.14}],
  [.58,{legR:1.56,legL:-.10,l:1.3,r:.85,bodyZ:.42,lean:-.26,lift:.28}],
  [.76,{legR:1.40,bodyZ:.32,lift:.18}],[1,{}]
 ]
];
const HEAVY_POSES=[
 [0,{}],
 [.16,{l:-1.05,r:.45,bodyY:.45,bodyZ:.27,lean:-.12}],
 [.33,{l:1.92,r:.22,el:-.5,bodyY:-.48,bodyZ:-.22,lean:.3}],
 [.46,{l:1.3,bodyY:-.12}],
 [.55,{legR:-.53,legL:.15,l:1.0,r:1.2,bodyY:1.02,bodyZ:.27,lean:-.18}],
 [.76,{legR:1.72,legL:-.16,l:1.35,r:.86,bodyY:1.18,bodyZ:.44,lift:.33,lean:-.28}],
 [.89,{legR:.9,bodyY:.55,bodyZ:.24,lift:.1}],
 [1,{}]
];
const SPECIAL_POSES=[[0,{}],[.19,{l:1.55,r:1.55,lift:.18,lean:-.12}],[.53,{l:2.25,r:2.25,bodyY:2.1,bodyZ:.24,lift:.35}],[.8,{l:1,r:1,bodyY:3.1}],[1,{}]];
const ease=t=>{t=THREE.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
function keyPose(frames,t){
 let i=1;while(i<frames.length-1&&frames[i][0]<t)i++;
 const a=frames[i-1],b=frames[i],k=ease((t-a[0])/(b[0]-a[0]||1));
 const pose={};
 for(const key of new Set([...Object.keys(a[1]),...Object.keys(b[1])]))pose[key]=(a[1][key]||0)*(1-k)+(b[1][key]||0)*k;
 return pose;
}
function poseFighter(f){
 const {arms,legs,body,head}=f.visual.userData;
 const stride=Math.sin(f.runTime),walk=Math.min(1,f.moving),idle=Math.sin(performance.now()*.0028)*.026;
 const pose=f.attack?keyPose(f.attack.kind==='light'?LIGHT_POSES[f.attack.stage-1]:f.attack.kind==='heavy'?HEAVY_POSES:SPECIAL_POSES,THREE.MathUtils.clamp(f.attackTime/f.attack.len,0,1)):{};
 const gp=key=>pose[key]||0;
 legs[0].rotation.x=stride*.43*walk+gp('legL');
 legs[1].rotation.x=-stride*.43*walk+gp('legR');
 arms[0].rotation.x=-stride*.22*walk+.15+gp('l');
 arms[1].rotation.x=stride*.22*walk+.15+gp('r');
 arms[0].rotation.z=-.14+gp('lz');
 arms[1].rotation.z=.14+gp('rz');
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
 for(const k of ['stun','attackCooldown','specialCooldown','iframes','dodge','comboWindow','hitFlash'])f[k]=Math.max(0,f[k]-dt);
 f.guard=Math.min(100,f.guard+dt*(f.block?2:15));
 f.block=controls.block&&f.stun<=0&&f.guard>0&&f.dodge<=0&&!f.attack;
 if(controls.jump&&f.onGround&&f.stun<=0){f.yVel=8;f.onGround=false}
 if(controls.dodge&&f.dodge<=0&&f.stun<=0&&f.attackCooldown<=0){
  f.dodge=.34;f.iframes=.26;const dir=new THREE.Vector3(controls.mx,0,controls.my);
  if(dir.lengthSq()<.01)dir.set(0,0,-1);
  if(f===p)dir.applyAxisAngle(new THREE.Vector3(0,1,0),camYaw);
  f.v.addScaledVector(dir.normalize(),12);
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
 f.v.x=THREE.MathUtils.damp(f.v.x,dir.x*sp,8,dt);
 f.v.z=THREE.MathUtils.damp(f.v.z,dir.z*sp,8,dt);
 f.root.position.addScaledVector(f.v,dt);
 const radial=Math.hypot(f.root.position.x,f.root.position.z);
 if(radial>16.25){f.root.position.x*=16.25/radial;f.root.position.z*=16.25/radial}
 f.yVel-=21*dt;f.root.position.y+=f.yVel*dt;
 if(f.root.position.y<=0){f.root.position.y=0;f.yVel=0;f.onGround=true}
 f.moving=Math.min(1,dir.length());f.runTime+=dt*f.moving*12;
 if(lock||f===cpu)aimAt(f,op);
 else if(f.moving>.12){f.face=Math.atan2(-dir.x,-dir.z);f.root.rotation.y=f.face}
 if(f.attack){
  f.attackTime+=dt;
  const t=Math.min(1,f.attackTime/f.attack.len);
  while(f.attack.hitIndex<f.attack.hits.length&&t>=f.attack.hits[f.attack.hitIndex]){
   f.attack.hitIndex++;
   if(f===p||gameMode==='solo')hit(f,op,f.attack);
  }
  if(t>=1){
   const lightQueued=f.queuedLight&&f.attack.kind==='light';
   f.attack=null;f.queuedLight=false;
   if(lightQueued){f.attackCooldown=0;tryAttack(f,'light')}
  }
 }
 poseFighter(f);
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
   if(netTick>.05){netTick=0;gameEvents.onState?.({x:p.root.position.x,y:p.root.position.y,z:p.root.position.z,rot:p.root.rotation.y,hp:p.hp,guard:p.guard})}
   if(remoteState){
    cpu.root.position.lerp(new THREE.Vector3(remoteState.x,remoteState.y,remoteState.z),Math.min(1,dt*14));
    cpu.root.rotation.y=remoteState.rot;cpu.hp=remoteState.hp;cpu.guard=remoteState.guard;
   }
   cpu.attackCooldown=Math.max(0,cpu.attackCooldown-dt);
   if(cpu.attack){cpu.attackTime+=dt;if(cpu.attackTime>=cpu.attack.len)cpu.attack=null}
   cpu.runTime+=dt*3;poseFighter(cpu);
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
