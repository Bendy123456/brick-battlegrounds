import * as THREE from 'three';
import {createEnvironment,createFighter,animateFighter,terrainHeight,LANDMARKS,ISLAND_RADIUS,createBuild,weaponMesh,box,orb,M} from './fartnite-world.js';
import './fartnite.css';

// FARTNITE: an original browser battle royale, not a port of third-party art or code.
const root=document.getElementById('app');
root.innerHTML=[
'<div id="world"></div><div id="skywash"></div>',
'<section id="home" class="screen"><div class="home-top"><div class="logo">FART<span>NITE</span><small>ORIGINAL BATTLE ROYALE</small></div><div class="home-right">SEASON ZERO <i></i> SOLO SURVIVAL</div></div>',
'<div class="home-center"><div class="eyebrow">WELCOME TO THE ISLAND</div><div class="hero-title">DROP IN.<br><em>OUTLAST.</em><br>WIN.</div><p>Explore a huge original island, scavenge for gear, construct cover, and survive a changing storm. Every match is a fresh run.</p>',
'<div class="home-actions"><button id="play" class="play-button"><span>▶</span> PLAY SOLO</button><button id="how" class="outline-button">HOW TO PLAY</button></div><div class="home-note">SOLO PREVIEW • 19 AI RIVALS • DESKTOP / CONTROLLER</div></div>',
'<div class="home-side"><div class="side-count">20<small>CONTENDERS</small></div><div class="side-sep"></div><span>6 UNIQUE LOCATIONS</span><span>5 WEAPON CLASSES</span><span>BUILD • LOOT • SURVIVE</span></div>',
'<div class="home-footer">FARTNITE // 01 <span>ALL MAP, ART &amp; BRANDING ARE ORIGINAL</span> READY TO DROP</div></section>',
'<section id="instructions" class="screen hidden"><div class="instruction-card"><div class="eyebrow">FIELD MANUAL / 01</div><h2>THE RULES ARE SIMPLE.</h2><p>Choose your landing spot, grab weapons, fight other contenders and stay within the moving safe zone. Be the last one standing.</p>',
'<div class="controls-grid"><div><b>MOVEMENT</b><span>WASD move · Shift sprint · Space jump · C crouch</span></div><div><b>FIGHTING</b><span>Left click shoot · Right click aim · R reload</span></div><div><b>GEAR</b><span>E loot · Q harvesting tool · 1–5 weapon slots</span></div><div><b>BUILDING</b><span>V build toggle · F wall · G ramp · H floor · click place</span></div><div><b>OTHER</b><span>M map · Esc pause · gamepad supported</span></div><div><b>CONTROLLER</b><span>Left move · Right look · triggers fire / aim · A/X jump</span></div></div>',
'<button id="backFromHow" class="play-button">BACK TO LOBBY</button></div></section>',
'<section id="hud" class="hidden"><div class="top-left"><div class="match-pill"><b>FART<span>NITE</span></b><span id="phaseText">DROP PHASE</span></div><div class="match-meta"><span>♙ <b id="aliveText">20</b> LEFT</span><span>✕ <b id="elimText">0</b> ELIMS</span><span id="stormText">STORM FORMING</span></div><div id="locationName">THE ISLAND</div></div>',
'<div class="top-right"><div id="miniWrap"><canvas id="minimap" width="240" height="240"></canvas><div class="mini-compass">N</div></div><div class="map-line">M • OPEN MAP <span id="coords">0 / 0</span></div></div>',
'<div id="compass"><span>NW</span><span>N</span><span>NE</span><span>E</span></div>',
'<div id="reticle"><div class="r-l"></div><div class="r-r"></div><div class="r-t"></div><div class="r-b"></div></div>',
'<div id="lootHint" class="hidden">E • PICK UP</div>',
'<div id="midMessage"></div>',
'<div class="bottom-left"><div id="healthBlock"><div class="barrow"><span>✚</span><div class="bar"><div id="healthFill" class="fill"></div></div><b id="healthValue">100</b></div><div class="barrow shield-row"><span>◈</span><div class="bar"><div id="shieldFill" class="fill"></div></div><b id="shieldValue">0</b></div></div><div id="materials">WOOD <b id="woodText">40</b> <i>•</i> STONE <b id="stoneText">0</b></div></div>',
'<div class="bottom-center"><div id="selectedWeapon"><b id="weaponName">HARVEST TOOL</b><span id="ammoText">BREAK OBJECTS FOR MATERIALS</span></div><div id="hotbar"></div><div id="buildBar" class="hidden">BUILD MODE <span id="buildChoice">WALL</span> • 10 MATERIALS • V TO EXIT</div></div>',
'<div class="bottom-right"><div class="tip">WASD MOVE <span>SHIFT SPRINT</span></div><div class="tip">E PICK UP <span>V BUILD</span></div></div>',
'<div id="damageFlash"></div><div id="stormTint"></div></section>',
'<section id="bigmap" class="screen hidden"><div class="map-modal"><div class="map-heading"><div><small>TACTICAL MAP / ISLAND 01</small><h2>ISLAND OVERVIEW</h2></div><button id="closeMap" class="outline-button">CLOSE • M</button></div><canvas id="fullmap" width="600" height="600"></canvas><p>White ring = safe zone. You are the bright arrow. Keep moving toward safety.</p></div></section>',
'<section id="pause" class="screen hidden"><div class="dialog"><small>FARTNITE / SESSION</small><h2>PAUSED</h2><p>The island will be here when you return.</p><button id="resume" class="play-button">RESUME GAME</button><button id="leave" class="outline-button">BACK TO LOBBY</button></div></section>',
'<section id="end" class="screen hidden"><div class="dialog end-dialog"><small id="endSmall">MATCH COMPLETE</small><h2 id="endTitle">WELL PLAYED</h2><p id="endSummary">You made a run for it.</p><div class="result-metrics"><div><b id="finalPlace">#1</b><span>PLACEMENT</span></div><div><b id="finalElims">0</b><span>ELIMINATIONS</span></div></div><button id="again" class="play-button">PLAY AGAIN</button><button id="endHome" class="outline-button">RETURN TO LOBBY</button></div></section>',
'<div id="notifications"></div>'
].join('');

const $=id=>document.getElementById(id);
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const rand=(a,b)=>a+Math.random()*(b-a);
const dist=(a,b)=>Math.hypot(a.x-b.x,a.z-b.z);
const TAU=Math.PI*2;
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(72,window.innerWidth/window.innerHeight,.1,1200);
const renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5));
renderer.setSize(window.innerWidth,window.innerHeight);
renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.toneMapping=THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure=1.12;
$('world').appendChild(renderer.domElement);
const world=createEnvironment(scene);
const player=createFighter();
scene.add(player);
const glider=new THREE.Group();
for(let i=-2;i<=2;i++){
 const wing=orb(glider,i*1.45,6.8+(2-Math.abs(i))*.28,0,1.25,.3,2.25,i%2===0?M.blue:M.cream);
 wing.rotation.z=i*.06;
}
for(const x of [-2.4,2.4]){
 const pts=[new THREE.Vector3(x,6.6,0),new THREE.Vector3(x*.25,3.0,0)];
 const rope=new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts),new THREE.LineBasicMaterial({color:0xffffff}));
 glider.add(rope)
}
player.add(glider);
const ringGeo=new THREE.TorusGeometry(1,.1,5,156);
const ring=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:'#a363ed',transparent:true,opacity:.86,depthWrite:false}));
ring.rotation.x=-Math.PI/2;scene.add(ring);
const stormWall=new THREE.Mesh(new THREE.CylinderGeometry(1,1,90,128,1,true),new THREE.MeshBasicMaterial({color:'#9058c9',transparent:true,opacity:.16,side:THREE.DoubleSide,depthWrite:false}));
scene.add(stormWall);
const WEAPONS=[
 {id:'ar',name:'TRAILBLAZER AR',rate:.14,damage:22,mag:30,reload:2.1,range:115,spread:.019},
 {id:'shotgun',name:'FIELD SCATTERGUN',rate:.83,damage:11,pellets:8,mag:6,reload:2.7,range:43,spread:.078},
 {id:'smg',name:'ZIPLINE SMG',rate:.075,damage:12,mag:32,reload:1.8,range:68,spread:.033},
 {id:'sniper',name:'RIDGE RIFLE',rate:1.28,damage:72,mag:4,reload:2.9,range:210,spread:.006},
 {id:'pistol',name:'SCOUT PISTOL',rate:.27,damage:28,mag:14,reload:1.7,range:91,spread:.017}
];
const RARITY=[{name:'COMMON',color:'#dfede5',mult:1},{name:'UNCOMMON',color:'#7bcb74',mult:1.12},{name:'RARE',color:'#4baff9',mult:1.25},{name:'EPIC',color:'#b77dfa',mult:1.42},{name:'LEGENDARY',color:'#fbc164',mult:1.58}];
const state={
 mode:'home',last:performance.now(),time:0,health:100,shield:0,wood:40,stone:0,elims:0,
 position:new THREE.Vector3(4,terrainHeight(4,32),32),yaw:2.2,pitch:.06,vy:0,grounded:true,
 gliding:false,speed:0,selected:0,inventory:[null,null,null,null,null,null],
 fireAt:0,reloadAt:0,ads:false,mouseFire:false,build:false,buildKind:'wall',
 storm:{center:{x:0,z:0},radius:224,phase:0,elapsed:0,wait:40,shrinking:false,from:224,to:224,nextCenter:{x:0,z:0}},
 loot:[],bots:[],builds:[],obstacles:[],hurtUntil:0,nearest:null,toastUntil:0,flashAt:0,
 settingsOpen:false,gamepadFire:false,gamepadAim:false,padPrev:{},padJump:false
};
const inputs=new Set();
const aimDir=new THREE.Vector3(),ray=new THREE.Ray(),tmp=new THREE.Vector3();
let worldTime=0;
const notification=(txt)=>{
 const n=document.createElement('div');n.className='notify';n.textContent=txt;$('notifications').appendChild(n);
 window.setTimeout(()=>n.remove(),3100)
};
function message(text,duration=2.1){
 $('midMessage').textContent=text;
 state.toastUntil=state.time+duration
}
const mkItem=(kind,weaponId,rarity=0)=>({kind,weaponId,rarity,ammo:kind==='gun'?WEAPONS[weaponId].mag:0,reserve:kind==='gun'?WEAPONS[weaponId].mag*3:0});
function createLoot(x,z,item){
 const y=terrainHeight(x,z);
 const g=new THREE.Group();g.position.set(x,y+.6,z);
 const color=item.kind==='gun'?RARITY[item.rarity].color:item.kind==='shield'?'#63d4ee':item.kind==='heal'?'#8bea86':'#f2d487';
 const material=new THREE.MeshBasicMaterial({color,transparent:true,opacity:.86});
 const base=new THREE.Mesh(new THREE.TorusGeometry(.65,.075,8,28),material);base.rotation.x=Math.PI/2;g.add(base);
 const core=orb(g,0,.5,0,.42,.39,.42,material);
 if(item.kind==='gun'){core.scale.set(.48,.25,.86);weaponMesh(g,WEAPONS[item.weaponId].id)}
 if(item.kind==='shield'){core.scale.set(.42,.57,.42);box(g,0,.91,0,.25,.12,.25,M.cream)}
 if(item.kind==='heal'){box(g,0,.58,0,.36,.15,.65,M.white);box(g,0,.58,0,.65,.15,.22,M.white)}
 const beam=new THREE.Mesh(new THREE.CylinderGeometry(.33,.52,2.5,12,1,true),new THREE.MeshBasicMaterial({color,transparent:true,opacity:.10,depthWrite:false,side:THREE.DoubleSide}));
 beam.position.y=1.2;g.add(beam);scene.add(g);
 const entry={x,z,item,mesh:g,t:rand(0,6)};state.loot.push(entry);return entry
}
function spawnLoot(){
 for(const l of state.loot)scene.remove(l.mesh);
 state.loot=[];
 for(let i=0;i<125;i++){
  const loc=LANDMARKS[i%LANDMARKS.length];
  let x=loc.x+rand(-35,35),z=loc.z+rand(-35,35);
  if(Math.hypot(x,z)>240){x*=.8;z*=.8}
  const kindRoll=Math.random();
  const kind=kindRoll<.70?'gun':kindRoll<.82?'shield':kindRoll<.92?'heal':'ammo';
  let rarity=Math.random()<.035?4:Math.random()<.14?3:Math.random()<.31?2:Math.random()<.58?1:0;
  const item=mkItem(kind,Math.floor(rand(0,WEAPONS.length)),rarity);
  createLoot(x,z,item)
 }
 for(let i=0;i<10;i++){
  const x=rand(-24,24),z=rand(1,58);createLoot(x,z,mkItem('gun',i%5,i===2?2:0))
 }
}
function pickup(){
 const p=state.nearest;if(!p)return;
 const item=p.item;
 if(item.kind==='gun'){
  let slot=state.inventory.findIndex((v,i)=>i>0&&!v);
  if(slot<0)slot=state.selected>0?state.selected:1;
  const previous=state.inventory[slot];
  state.inventory[slot]=structuredClone(item);state.selected=slot;state.build=false;
  if(previous)createLoot(state.position.x+2,state.position.z,previous);
  notification('EQUIPPED '+RARITY[item.rarity].name+' '+WEAPONS[item.weaponId].name)
 }else if(item.kind==='shield'){
  state.shield=Math.min(100,state.shield+50);notification('+50 SHIELD')
 }else if(item.kind==='heal'){
  state.health=Math.min(100,state.health+50);notification('+50 HEALTH')
 }else{
  for(const it of state.inventory)if(it)it.reserve+=42;
  notification('+42 AMMO')
 }
 scene.remove(p.mesh);state.loot.splice(state.loot.indexOf(p),1);state.nearest=null;
 renderHUD()
}
function buildHUD(){
 const hot=$('hotbar');hot.innerHTML='';
 const tools=[{name:'HARVEST',id:0}];
 for(let i=1;i<=5;i++)tools.push({name:state.inventory[i] ? WEAPONS[state.inventory[i].weaponId].name : 'EMPTY',id:i});
 for(const item of tools){
  const el=document.createElement('button');
  el.className='slot'+(item.id===state.selected?' active':'');
  el.style.setProperty('--rarity',item.id===0?'#a9cfb8':state.inventory[item.id]?RARITY[state.inventory[item.id].rarity].color:'#708398');
  el.innerHTML='<small>'+(item.id===0?'Q':item.id)+'</small><span>'+(item.id===0?'⛏':!state.inventory[item.id]?'＋':WEAPONS[state.inventory[item.id].weaponId].id==='shotgun'?'▰':'⌁')+'</span><b>'+item.name+'</b>';
  el.onclick=()=>{state.selected=item.id;state.build=false;renderHUD()};
  hot.appendChild(el)
 }
}
function renderHUD(){
 const h=state.inventory[state.selected];
 $('healthFill').style.width=clamp(state.health,0,100)+'%';
 $('shieldFill').style.width=clamp(state.shield,0,100)+'%';
 $('healthValue').textContent=Math.ceil(state.health);
 $('shieldValue').textContent=Math.ceil(state.shield);
 $('woodText').textContent=state.wood;$('stoneText').textContent=state.stone;
 $('aliveText').textContent=state.bots.filter(b=>b.alive).length+(state.health>0?1:0);
 $('elimText').textContent=state.elims;
 $('weaponName').textContent=state.build?'BUILD: '+state.buildKind.toUpperCase():h?RARITY[h.rarity].name+' '+WEAPONS[h.weaponId].name:'HARVEST TOOL';
 $('ammoText').textContent=state.reloadAt>state.time?'RELOADING...':h?h.ammo+' / '+h.reserve+'  •  R TO RELOAD':'BREAK TREES AND ROCKS';
 $('phaseText').textContent=state.gliding?'GLIDER DEPLOYED':'ISLAND SURVIVAL';
 $('buildBar').classList.toggle('hidden',!state.build);
 $('buildChoice').textContent=state.buildKind.toUpperCase();
 buildHUD()
}
function showOnly(name){
 for(const id of ['home','instructions','hud','bigmap','pause','end'])$(id).classList.toggle('hidden',id!==name);
 if(name==='hud')$('hud').classList.remove('hidden')
}
function cameraToPlayer(dt){
 const p=state.position;
 const fx=Math.sin(state.yaw),fz=Math.cos(state.yaw);
 const rightX=Math.cos(state.yaw),rightZ=-Math.sin(state.yaw);
 const shoulder=state.ads?1.0:1.65,back=state.ads?4.3:8.3;
 const target=new THREE.Vector3(p.x+rightX*shoulder-fx*back,p.y+(state.ads?3.7:5.3)+state.pitch*5.2,p.z+rightZ*shoulder-fz*back);
 camera.position.lerp(target,Math.min(1,dt*15));
 camera.lookAt(p.x+fx*24,p.y+2.2+state.pitch*22,p.z+fz*24);
}
function homeCamera(t){
 player.position.set(3,terrainHeight(3,30),30);player.rotation.y=.35;
 animateFighter(player,t,0,0);
 glider.visible=false;
 camera.position.set(16+Math.sin(t*.12)*2,8,52+Math.cos(t*.12)*2);
 camera.lookAt(-8,4,0);
}
function reset(){
 for(const entry of state.loot)scene.remove(entry.mesh);
 for(const bot of state.bots)scene.remove(bot.mesh);
 for(const b of state.builds)scene.remove(b.mesh);
 state.bots=[];state.builds=[];state.loot=[];
 Object.assign(state,{mode:'playing',time:0,health:100,shield:0,wood:40,stone:0,elims:0,
  position:new THREE.Vector3(rand(-65,65),95,rand(-65,65)),yaw:Math.PI*.4,pitch:-.03,vy:0,grounded:false,gliding:true,speed:0,
  selected:0,inventory:[null,null,null,null,null,null],fireAt:0,reloadAt:0,ads:false,mouseFire:false,build:false,buildKind:'wall',
  storm:{center:{x:0,z:0},radius:224,phase:0,elapsed:0,wait:40,shrinking:false,from:224,to:224,nextCenter:{x:0,z:0}},nearest:null});
 spawnLoot();spawnBots();
 player.visible=true;glider.visible=true;
 $('notifications').innerHTML='';showOnly('hud');camera.position.set(state.position.x+10,state.position.y+8,state.position.z+12);
 renderHUD();message('STEER YOUR GLIDER • LAND AND FIND A WEAPON',5);
 try{renderer.domElement.requestPointerLock()}catch{}
}
function toMenu(){
 state.mode='home';state.mouseFire=false;state.build=false;inputs.clear();
 if(document.pointerLockElement)document.exitPointerLock();
 showOnly('home');
}
function spawnBots(){
 for(let i=0;i<19;i++){
  const loc=LANDMARKS[i%LANDMARKS.length];
  const x=loc.x+rand(-30,30),z=loc.z+rand(-30,30);
  const mesh=createFighter(undefined,true);mesh.position.set(x,terrainHeight(x,z),z);scene.add(mesh);
  state.bots.push({x,z,mesh,alive:true,hp:75+Math.round(rand(0,30)),shield:Math.random()<.25?25:0,yaw:rand(0,TAU),
   wanderAt:0,heading:rand(0,TAU),fireAt:rand(.2,2),lastHit:0,shotCount:0,aim:rand(.35,.73)})
 }
}
function lose(){
 if(state.mode!=='playing')return;
 state.health=0;endMatch(false)
}
function endMatch(win){
 state.mode='ended';state.mouseFire=false;if(document.pointerLockElement)document.exitPointerLock();
 $('endSmall').textContent=win?'LAST SURVIVOR':'YOU WERE ELIMINATED';
 $('endTitle').textContent=win?'ISLAND CHAMPION!':'BACK TO THE LOBBY';
 $('endSummary').textContent=win?'You outlasted every rival. The island is yours.':'You fought your way through the island. Drop back in and try again.';
 $('finalPlace').textContent='#'+(win?1:state.bots.filter(b=>b.alive).length+1);
 $('finalElims').textContent=state.elims;showOnly('end')
}
const collision=(x,z,r=.75)=>{
 if(Math.hypot(x,z)>ISLAND_RADIUS-8)return true;
 for(const o of world.obstacles){
  if(o.object&&!o.object.visible)continue;
  if(o.kind==='house'){if(Math.abs(x-o.x)<o.radius+r&&Math.abs(z-o.z)<o.radius+r)return true}
  else if(Math.hypot(x-o.x,z-o.z)<o.radius+r)return true
 }
 for(const b of state.builds){
  if(b.kind==='wall'&&Math.hypot(x-b.x,z-b.z)<3.3+r)return true
 }
 return false
};
function playerMove(dt){
 const keys=inputs;
 let forward=(keys.has('KeyW')?1:0)-(keys.has('KeyS')?1:0);
 let right=(keys.has('KeyD')?1:0)-(keys.has('KeyA')?1:0);
 const gp=navigator.getGamepads?navigator.getGamepads().find(p=>p&&p.connected):null;
 if(gp){
  const dz=v=>Math.abs(v)>.17?v:0;
  forward+=-dz(gp.axes[1]||0);right+=dz(gp.axes[0]||0);
  state.yaw+=dz(gp.axes[2]||0)*dt*2.8;
  state.pitch=clamp(state.pitch-dz(gp.axes[3]||0)*dt*1.9,-.8,.8);
  if(gp.buttons[0]?.pressed&&!state.padJump&&state.grounded){state.vy=9.5;state.grounded=false}
  state.padJump=Boolean(gp.buttons[0]?.pressed);
  state.gamepadFire=Boolean(gp.buttons[7]?.pressed);state.gamepadAim=Boolean(gp.buttons[6]?.pressed);
  if(gp.buttons[2]?.pressed&&!state.padPrev.reload)reload();
  if(gp.buttons[3]?.pressed&&!state.padPrev.pickup)pickup();
  if(gp.buttons[4]?.pressed&&!state.padPrev.prev){state.selected=(state.selected+5)%6;renderHUD()}
  if(gp.buttons[5]?.pressed&&!state.padPrev.next){state.selected=(state.selected+1)%6;renderHUD()}
  state.padPrev={reload:Boolean(gp.buttons[2]?.pressed),pickup:Boolean(gp.buttons[3]?.pressed),prev:Boolean(gp.buttons[4]?.pressed),next:Boolean(gp.buttons[5]?.pressed)}
 }else{state.gamepadFire=false;state.gamepadAim=false}
 state.ads=inputs.has('MouseRight')||state.gamepadAim;
 const mag=Math.hypot(forward,right);
 if(mag>1){forward/=mag;right/=mag}
 const sneaking=keys.has('KeyC'),running=keys.has('ShiftLeft')||keys.has('ShiftRight');
 const speed=state.gliding?13:sneaking?3.7:running?10.4:6.5;
 const vx=(Math.sin(state.yaw)*forward+Math.cos(state.yaw)*right)*speed;
 const vz=(Math.cos(state.yaw)*forward-Math.sin(state.yaw)*right)*speed;
 state.speed=Math.hypot(vx,vz);
 let x=state.position.x+vx*dt,z=state.position.z+vz*dt;
 if(!collision(x,state.position.z,.65))state.position.x=x;
 if(!collision(state.position.x,z,.65))state.position.z=z;
 const surface=terrainHeight(state.position.x,state.position.z);
 if(state.gliding){
  state.position.y=Math.max(surface, state.position.y-dt*(keys.has('Space')?21:13));
  if(state.position.y<=surface+.08){state.gliding=false;state.grounded=true;state.position.y=surface;notification('TOUCHDOWN • SEARCH FOR LOOT')}
 }else{
  state.vy-=24*dt;state.position.y+=state.vy*dt;
  if(state.position.y<=surface){state.position.y=surface;state.vy=0;state.grounded=true}
 }
 player.position.copy(state.position);player.rotation.y=state.yaw;
 glider.visible=state.gliding;
 animateFighter(player,state.time,state.speed,state.yaw,state.pitch);
 if((state.mouseFire||state.gamepadFire)&&state.mode==='playing')fire();
 let nearest=null,d=3.6;
 for(const entry of state.loot){const dd=dist(state.position,entry);if(dd<d){nearest=entry;d=dd}}
 state.nearest=nearest;
 $('lootHint').classList.toggle('hidden',!nearest);
 if(nearest)$('lootHint').textContent='[ E ]  '+(nearest.item.kind==='gun'?RARITY[nearest.item.rarity].name+' '+WEAPONS[nearest.item.weaponId].name:nearest.item.kind.toUpperCase());
 cameraToPlayer(dt)
}
function projectileLine(a,b,color='#fbe2a0'){
 const points=[new THREE.Vector3(a.x,a.y,a.z),new THREE.Vector3(b.x,b.y,b.z)];
 const geom=new THREE.BufferGeometry().setFromPoints(points);
 const line=new THREE.Line(geom,new THREE.LineBasicMaterial({color,transparent:true,opacity:.85}));
 scene.add(line);window.setTimeout(()=>{scene.remove(line);geom.dispose();line.material.dispose()},95)
}
function shotBlocked(ax,az,bx,bz){
 const steps=Math.max(1,Math.ceil(Math.hypot(ax-bx,az-bz)/3));
 for(let k=1;k<steps;k++){
  const t=k/steps,x=ax+(bx-ax)*t,z=az+(bz-az)*t;
  for(const o of world.obstacles)if(o.kind==='house'&&Math.abs(x-o.x)<o.radius&&Math.abs(z-o.z)<o.radius)return true;
  for(const b of state.builds)if(b.kind==='wall'&&Math.hypot(x-b.x,z-b.z)<3.1)return true
 }
 return false
}
function damageBot(bot,dmg){
 if(!bot.alive)return;
 let leftover=dmg;
 if(bot.shield>0){const absorb=Math.min(bot.shield,leftover);bot.shield-=absorb;leftover-=absorb}
 bot.hp-=leftover;
 notification('HIT '+Math.round(dmg)+' DAMAGE');
 bot.lastHit=state.time;
 if(bot.hp<=0){
  bot.alive=false;bot.mesh.visible=false;state.elims++;
  notification('ELIMINATED A CONTENDER • +1');
  if(Math.random()<.85)createLoot(bot.x,bot.z,mkItem('gun',Math.floor(rand(0,5)),Math.floor(rand(0,4))));
  if(state.bots.every(b=>!b.alive))endMatch(true)
 }
}
function swingTool(){
 const fx=Math.sin(state.yaw),fz=Math.cos(state.yaw);
 let candidate=null,closest=5.5;
 for(const ob of world.harvest){
  if(ob.userData.health<=0||!ob.visible)continue;
  const ox=ob.position.x-state.position.x,oz=ob.position.z-state.position.z;
  const dd=Math.hypot(ox,oz),alignment=(ox*fx+oz*fz)/Math.max(.001,dd);
  if(dd<closest&&alignment>.45){candidate=ob;closest=dd}
 }
 if(candidate){
  candidate.userData.health--;
  const kind=candidate.userData.material==='stone'?'stone':'wood';
  state[kind]+=10;notification('+10 '+kind.toUpperCase());
  candidate.scale.multiplyScalar(.93);
  if(candidate.userData.health<=0){candidate.visible=false;state[kind]+=20;notification('+20 BONUS '+kind.toUpperCase())}
 }else{
  for(const bot of state.bots)if(bot.alive&&dist(bot,state.position)<3.6){damageBot(bot,20);break}
 }
}
function shoot(){
 const item=state.inventory[state.selected];
 if(state.time<state.fireAt||state.gliding||state.reloadAt>state.time||state.build)return;
 if(!item){state.fireAt=state.time+.48;swingTool();renderHUD();return}
 const config=WEAPONS[item.weaponId];
 if(item.ammo<=0){reload();return}
 state.fireAt=state.time+config.rate;
 item.ammo--;
 const origin=camera.position.clone(),dir=new THREE.Vector3();
 camera.getWorldDirection(dir);
 const pelletCount=config.pellets||1;
 for(let p=0;p<p<pelletCount;p++){
  const v=dir.clone();
  const spread=config.spread*(state.ads?.46:1);
  v.x+=rand(-spread,spread);v.y+=rand(-spread,spread);v.z+=rand(-spread,spread);v.normalize();
  ray.set(origin,v);
  let target=null,closest=config.range;
  for(const bot of state.bots){
   if(!bot.alive)continue;
   const hit=ray.intersectSphere(new THREE.Sphere(new THREE.Vector3(bot.x,terrainHeight(bot.x,bot.z)+1.8,bot.z),1.1),tmp);
   if(hit){const d=origin.distanceTo(hit);if(d<closest&&!shotBlocked(state.position.x,state.position.z,bot.x,bot.z)){target=bot;closest=d}}
  }
  const end=origin.clone().addScaledVector(v,Math.min(closest,config.range));
  if(target){
   const dmg=config.damage*RARITY[item.rarity].mult;
   damageBot(target,dmg)
  }
  if(p===0)projectileLine(origin,end,'#ffe9a8')
 }
 $('reticle').classList.add('firing');window.setTimeout(()=>$('reticle').classList.remove('firing'),65);
 renderHUD()
}
function reload(){
 const item=state.inventory[state.selected];if(!item||state.reloadAt>state.time||state.gliding)return;
 const gun=WEAPONS[item.weaponId];if(item.ammo>=gun.mag||item.reserve<=0)return;
 state.reloadAt=state.time+gun.reload;
 message('RELOADING '+gun.name,1.2)
}
function finishReload(){
 const item=state.inventory[state.selected];if(!item)return;
 const mag=WEAPONS[item.weaponId].mag,load=Math.min(item.reserve,mag-item.ammo);
 item.ammo+=load;item.reserve-=load;state.reloadAt=0;renderHUD()
}
function createStructure(){
 const kind=state.buildKind,need=10;
 if(state.wood+state.stone<need){notification('NOT ENOUGH MATERIALS');return}
 const fx=Math.sin(state.yaw),fz=Math.cos(state.y),x=Math.round((state.position.x+fx*7)/3)*3,z=Math.round((state.position.z+fz*7)/3)*3;
 if(Math.hypot(x,z)>ISLAND_RADIUS-10){notification('BUILD INSIDE THE ISLAND');return}
 const g=createBuild(scene,x,z,state.yaw,kind);
 state.builds.push({x,z,kind,mesh:g});
 const wood=Math.min(need,state.wood);state.wood-=wood;state.stone-=need-wood;
 notification(kind.toUpperCase()+' PLACED');renderHUD()
}
function hitPlayer(amount){
 if(state.mode!=='playing')return;
 let remaining=amount;
 if(state.shield>0){const used=Math.min(state.shield,remaining);state.shield-=used;remaining-=used}
 state.health=Math.max(0,state.health-remaining);
 state.hurtUntil=state.time+.27;
 if(state.health<=0)lose();else renderHUD()
}
function botsTick(dt){
 let alive=0;
 for(const b of state.bots){
  if(!b.alive)continue;alive++;
  const d=dist(b,state.position);
  const outside=Math.hypot(b.x-state.storm.center.x,b.z-state.storm.center.z)>state.storm.radius;
  if(outside){b.hp-=dt*(2+state.storm.phase*.9);if(b.hp<=0){b.alive=false;b.mesh.visible=false;continue}}
  if(state.time>b.wanderAt){
   b.heading=d<56?Math.atan2(state.position.x-b.x,state.position.z-b.z)+rand(-.3,.3):rand(0,TAU);
   if(outside)b.heading=Math.atan2(state.storm.center.x-b.x,state.storm.center.z-b.z);
   b.wanderAt=state.time+rand(1.2,3.8)
  }
  b.yaw=b.heading;
  const sprint=d>20&&d<75;
  const move=sprint?2.7:1.4;
  const nx=b.x+Math.sin(b.heading)*dt*move,nz=b.z+Math.cos(b.heading)*dt*move;
  if(!collision(nx,nz,.55)){b.x=nx;b.z=nz}
  else b.wanderAt=0;
  b.mesh.position.set(b.x,terrainHeight(b.x,b.z),b.z);
  b.mesh.rotation.y=b.yaw;
  if(d<65&&!state.gliding&&state.time>b.fireAt){
   b.fireAt=state.time+rand(.35,.9);
   b.heading=Math.atan2(state.position.x-b.x,state.position.z-b.z);
   if(!shotBlocked(b.x,b.z,state.position.x,state.position.z)){
    const pos={x:b.x,y:terrainHeight(b.x,b.z)+2.4,z:b.z},end={x:state.position.x,y:state.position.y+1.7,z:state.position.z};
    projectileLine(pos,end,'#ffc69a');
    if(Math.random()<b.aim*clamp(1-d/180,.25,1))hitPlayer(rand(5,11))
   }
  }
  animateFighter(b.mesh,state.time+b.x*.3,d<55?3:1.5,b.heading,0)
 }
 if(alive===0&&state.mode==='playing')endMatch(true)
}
const STORM_TIMES=[55,64,67,58,48];
const STORM_RADII=[224,153,102,57,22,0];
function stormTick(dt){
 const s=state.storm;
 s.elapsed+=dt;
 const duration=STORM_TIMES[Math.min(s.phase,4)];
 const wait=duration*.41,shrink=duration-wait;
 if(s.phase<5){
  if(s.elapsed>wait&&!s.shrinking){
   s.shrinking=true;s.from=s.radius;s.to=STORM_RADII[Math.min(5,s.phase+1)];
   s.nextCenter={x:clamp(s.center.x+rand(-20,20),-45,45),z:clamp(s.center.z+rand(-20,20),-45,45)};
   notification('STORM IS SHRINKING!')
  }
  if(s.shrinking){
   const t=clamp((s.elapsed-wait)/shrink,0,1);
   s.radius=s.from+(s.to-s.from)*t;
   s.center.x+=(s.nextCenter.x-s.center.x)*Math.min(1,dt*1.2);
   s.center.z+=(s.nextCenter.z-s.center.z)*Math.min(1,dt*1.2)
  }
  if(s.elapsed>=duration){s.phase++;s.elapsed=0;s.shrinking=false}
 }
 ring.position.set(s.center.x,terrainHeight(s.center.x,s.center.z)+1.4,s.center.z);
 ring.scale.set(s.radius,s.radius,1);
 stormWall.position.set(s.center.x,40,s.center.z);
 stormWall.scale.set(s.radius,1,s.radius);
 const outside=Math.hypot(state.position.x-s.center.x,state.position.z-s.center.z)>s.radius;
 $('stormTint').style.opacity=outside?'.29':'0';
 if(outside&&!state.gliding)hitPlayer(dt*(2+s.phase*1.5));
 $('stormText').textContent=s.phase>=5?'FINAL ZONE':s.shrinking?'STORM CLOSING '+Math.max(0,Math.ceil(duration-s.elapsed))+'S':'STORM IN '+Math.max(0,Math.ceil(wait-s.elapsed))+'S';
 if(s.radius<=1){if(state.health>0&&state.bots.some(b=>b.alive))hitPlayer(dt*25)}
}
function drawMap(canvas,full=false){
 const ctx=canvas.getContext('2d'),w=canvas.width;
 ctx.clearRect(0,0,w,w);
 ctx.fillStyle='#357aa0';ctx.fillRect(0,0,w,w);
 const pt=(x,z)=>[w/2+x/520*w,w/2+z/520*w];
 const [cx,cy]=pt(0,0);ctx.beginPath();ctx.arc(cx,cy,245/520*w,0,TAU);ctx.fillStyle='#76b65a';ctx.fill();
 ctx.strokeStyle='#ddc89f';ctx.lineWidth=full?6:3;
 for(let i=1;i<LANDMARKS.length;i++){
  const [ax,ay]=pt(LANDMARKS[0].x,LANDMARKS[0].z),[bx,by]=pt(LANDMARKS[i].x,LANDMARKS[i].z);
  ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(bx,by);ctx.stroke()
 }
 for(const l of LANDMARKS){
  const [x,y]=pt(l.x,l.z);ctx.fillStyle='#f0dcb3';ctx.fillRect(x-4,y-4,8,8);
  if(full){ctx.font='bold 10px sans-serif';ctx.fillStyle='#183d4c';ctx.textAlign='center';ctx.fillText(l.name,x,y+17)}
 }
 const [sx,sy]=pt(state.storm.center.x,state.storm.center.z);
 ctx.beginPath();ctx.arc(sx,sy,state.storm.radius/520*w,0,TAU);
 ctx.strokeStyle='#f4f0ff';ctx.lineWidth=full?5:3;ctx.stroke();
 const [px,py]=pt(state.position.x,state.position.z);
 ctx.save();ctx.translate(px,py);ctx.rotate(-state.yaw);
 ctx.fillStyle='#ffffff';ctx.strokeStyle='#173b56';ctx.lineWidth=2;
 ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(-6,7);ctx.lineTo(0,4);ctx.lineTo(6,7);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();
}
function updateUI(){
 $('locationName').textContent='WILDERNESS';
 for(const l of LANDMARKS)if(dist(state.position,l)<46){$('locationName').textContent=l.name;break}
 $('coords').textContent=Math.round(state.position.x)+' / '+Math.round(state.position.z);
 $('damageFlash').style.opacity=state.time<state.hurtUntil?'.42':'0';
 if(state.time>state.toastUntil)$('midMessage').textContent='';
 $('reticle').style.transform='translate(-50%,-50%) scale('+(state.ads?.77:1)+')';
 if(Math.floor(state.time*4)%3===0){drawMap($('minimap'));$('aliveText').textContent=state.bots.filter(b=>b.alive).length+1}
 for(const l of state.loot){l.t+=.013;l.mesh.position.y=terrainHeight(l.x,l.z)+.62+Math.sin(state.time*2+l.t)*.17;l.mesh.rotation.y+=.012}
}
function gameTick(dt){
 state.time+=dt;
 if(state.reloadAt&&state.time>=state.reloadAt)finishReload();
 playerMove(dt);botsTick(dt);stormTick(dt);updateUI()
}
function frame(now){
 const dt=Math.min(.045,Math.max(.001,(now-state.last)/1000));state.last=now;worldTime+=dt;
 if(state.mode==='playing'){gameTick(dt)}
 else if(state.mode==='home'||state.mode==='how'){homeCamera(worldTime)}
 renderer.render(scene,camera);
 requestAnimationFrame(frame)
}
function pauseGame(){
 if(state.mode!=='playing')return;
 state.mode='paused';state.mouseFire=false;if(document.pointerLockElement)document.exitPointerLock();showOnly('pause')
}
function resumeGame(){
 if(state.mode!=='paused')return;
 state.mode='playing';showOnly('hud');try{renderer.domElement.requestPointerLock()}catch{}
}
function toggleMap(){
 if(state.mode==='playing'){state.mode='map';state.mouseFire=false;drawMap($('fullmap'),true);showOnly('bigmap');if(document.pointerLockElement)document.exitPointerLock()}
 else if(state.mode==='map'){state.mode='playing';showOnly('hud');try{renderer.domElement.requestPointerLock()}catch{}}
}
$('play').onclick=reset;
$('how').onclick=()=>{state.mode='how';showOnly('instructions')};
$('backFromHow').onclick=toMenu;
$('resume').onclick=resumeGame;
$('leave').onclick=toMenu;
$('again').onclick=reset;
$('endHome').onclick=toMenu;
$('closeMap').onclick=toggleMap;
renderer.domElement.addEventListener('click',()=>{if(state.mode==='playing'&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock().catch(()=>{})});
window.addEventListener('contextmenu',e=>e.preventDefault());
window.addEventListener('keydown',e=>{
 if(['Space','ArrowUp','ArrowDown'].includes(e.code))e.preventDefault();
 if(e.code==='Escape'){if(state.mode==='playing')pauseGame();else if(state.mode==='paused')resumeGame();else if(state.mode==='map')toggleMap();return}
 if(e.code==='KeyM'){toggleMap();return}
 if(state.mode!=='playing')return;
 if(e.repeat&&['KeyV','KeyE','KeyF','KeyG','KeyH','KeyR'].includes(e.code))return;
 inputs.add(e.code);
 if(e.code==='KeyE')pickup();
 if(e.code==='KeyQ'){state.selected=0;state.build=false;renderHUD()}
 if(e.code==='KeyR')reload();
 if(e.code==='KeyV'){state.build=!state.build;renderHUD();notification(state.build?'BUILD MODE ENABLED':'BUILD MODE DISABLED')}
 if(['KeyF','KeyG','KeyH'].includes(e.code)&&state.build){
  state.buildKind=e.code==='KeyF'?'wall':e.code==='KeyG'?'ramp':'floor';renderHUD()
 }
 if(e.code.startsWith('Digit')&&e.code.length===6){
  const n=Number(e.code.slice(5));if(n>=1&&n<=5){state.selected=n;state.build=false;state.reloadAt=0;renderHUD()}
 }
 if(e.code==='Space'&&state.grounded&&!state.gliding){state.vy=9.5;state.grounded=false}
});
window.addEventListener('keyup',e=>inputs.delete(e.code));
window.addEventListener('blur',()=>{inputs.clear();state.mouseFire=false;state.ads=false});
window.addEventListener('mousemove',e=>{
 if(state.mode!=='playing'||document.pointerLockElement!==renderer.domElement)return;
 state.yaw+=e.movementX*.0023;state.pitch=clamp(state.pitch-e.movementY*.0018,-.75,.70)
});
renderer.domElement.addEventListener('mousedown',e=>{
 if(state.mode!=='playing')return;
 if(e.button===2){inputs.add('MouseRight');return}
 if(e.button===0){if(state.build)createStructure();else{state.mouseFire=true;fire()}}
});
window.addEventListener('mouseup',e=>{
 if(e.button===0)state.mouseFire=false;
 if(e.button===2)inputs.delete('MouseRight')
});
window.addEventListener('resize',()=>{
 camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
 renderer.setSize(window.innerWidth,window.innerHeight);renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5))
});
homeCamera(0);
renderHUD();
requestAnimationFrame(frame);
