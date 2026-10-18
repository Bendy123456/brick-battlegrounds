import {Engine} from './engine.ts';
import {Controls,settings,binds,defaultBinds,resetBinds,rebind,saveSettings,updateSetting,anyPadConnected,padHasActivity} from './controls.ts';
import {sfx,unlockAudio,setAudioVolume} from './audio.ts';
import {WEAPONS,type Actor,type Input,type Snapshot} from '../../shared/config.ts';
import {zoneName} from '../../shared/map.ts';
import {$,show,notify} from './screen.ts';

const controller=new Controls(),engine=new Engine();
let ws:WebSocket|null=null,connected=false,screen='menu',side=0,room='',token='',roomMode='bot';
let local:Actor|null=null,lastSnap:Snapshot|null=null,ready=false,paused=false,preferred=0;
let reconnectTime=0,reconnectAttempt=0,lastPing=0,ping=0,playerName='PLAYER';
const open=()=>{if(ws?.readyState===WebSocket.OPEN)return true;return false};
const send=(msg:any)=>{
 if(open()&&ws!.bufferedAmount<100000)ws!.send(JSON.stringify(msg));
};
const goto=(page:string)=>{screen=page;show(page);if(page!=='game'&&document.pointerLockElement)document.exitPointerLock()};
const status=(text:string)=>{$('menuMessage').textContent=text};
function leave(){
 send({type:'leave'});
 room='';token='';ready=false;connected=false;paused=false;lastSnap=null;local=null;
 ws?.close();ws=null;goto('menu');
}
function connect(handshake:any){
 if(ws&&ws.readyState!==WebSocket.CLOSED){ws.onclose=null;ws.close()}
 const url=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/ws';
 const socket=new WebSocket(url);ws=socket;
 socket.onopen=()=>{
  if(ws!==socket)return;
  connected=true;reconnectAttempt=0;send(handshake);
 };
 socket.onerror=()=>{if(ws===socket)status('Network error. The game server may be unavailable.')};
 socket.onclose=()=>{
  if(ws!==socket)return;
  connected=false;
  if(room&&token&&['game','pause','waiting'].includes(screen)){
   ready=false;
   $('waitTitle').textContent='RECONNECTING';
   $('waitDescription').textContent='Connection interrupted. Restoring your room...';
   goto('waiting');
   reconnectAttempt++;
   if(reconnectAttempt<=7)reconnectTime=performance.now()+Math.min(4000,700*reconnectAttempt);
   else{room='';token='';goto('menu');status('Connection could not be restored. Start a fresh room.')}
  }else if(screen==='waiting'){goto('menu');status('Connection lost. Check your network.')}
 };
 socket.onmessage=e=>{
  let m:any;try{m=JSON.parse(e.data)}catch{return}
  onMessage(m)
 };
}
function beginMatch(resumed=false){
 ready=true;paused=false;controller.yaw=side===0?-Math.PI/2:Math.PI/2;
 controller.pitch=0;
 if(!resumed){engine.createLocal(side);local=null}
 goto('game');
 $('zone').textContent='ENTRY CORRIDOR';
 $('killfeed').textContent='';
 unlockAudio();
 if(!controller.gamepadActive)engine.renderer.domElement.requestPointerLock?.().catch?.(()=>{});
}
function onMessage(m:any){
 switch(m.type){
  case 'queue':
   $('waitTitle').textContent='SEARCHING';
   $('waitDescription').textContent='Looking for one online opponent...';
   goto('waiting');return;
  case 'joined':
   room=m.code||room;side=m.side??side;token=m.token||token;roomMode=m.mode||roomMode;
   connected=true;
   if(roomMode==='online'){
    $('waitTitle').textContent='ROOM '+room;
    $('waitDescription').textContent='Share your room code, then wait for your friend to join.';
    goto('waiting');
   }
   return;
  case 'begin':
   beginMatch(Boolean(m.resumed));return;
  case 'snapshot':{
   const s=m as Snapshot;lastSnap=s;
   local=s.players.find(p=>p.side===side)||null;
   if(local&&ready){
    engine.applySnapshot(s,side);
    const w=WEAPONS[local.weapon];
    $('health').textContent=String(local.hp);
    $('weapon').textContent=w.name;
    $('weaponType').textContent=w.role;
    $('ammo').innerHTML=String(local.ammo)+' <small>/ '+w.mag+'</small>';
    $('stance').textContent=local.sliding?'SLIDING':local.sprinting?'SPRINTING':local.prone?'PRONE':local.crouch?'CROUCHED':local.ads?'ADS':'STANDING';
    $('zone').textContent=zoneName(local.x,local.z);
    $('score').innerHTML=s.score[side]+' <span>:</span> '+s.score[side===0?1:0];
    $('clock').textContent=String(Math.floor(s.timer/60)).padStart(2,'0')+':'+String(s.timer%60).padStart(2,'0');
   }
   return;
  }
  case 'fire':{
   if(m.side===side){engine.flash();controller.vibrate(.20)}
   sfx('fire',m.weapon||0);return
  }
  case 'hit':{
   $('hitmarker').classList.add('active');
   window.setTimeout(()=>$('hitmarker').classList.remove('active'),120);
   sfx(m.down?'elimination':'hit');
   notify((m.zone==='head'?'HEAD TAG':m.zone==='torso'?'BODY TAG':'LIMB TAG')+' · '+m.damage);
   controller.vibrate(.22);
   return;
  }
  case 'hurt':{
   $('flash').style.opacity='.14';
   window.setTimeout(()=>$('flash').style.opacity='0',170);
   sfx('hurt');controller.vibrate(.52);return;
  }
  case 'elimination':{
   const who=m.winner===side?'YOU':'RIVAL';
   $('killfeed').textContent=who+' TAGGED OPPONENT · '+String(m.zone||'BODY').toUpperCase();
   notify(who==='YOU'?'ELIMINATION CONFIRMED':'YOU WERE TAGGED');
   sfx('elimination');return;
  }
  case 'impact':sfx('impact');return;
  case 'respawn':notify('BACK IN · FIGHT ON');return;
  case 'matchEnd':{
   ready=false;
   const win=m.winner===side;
   $('resultTitle').textContent=win?'VICTORY':'MATCH COMPLETE';
   $('resultBody').textContent=win?'You won the first-to-five airsoft match.':'Your opponent reached five eliminations. Rematch to try again.';
   goto('results');document.exitPointerLock?.();return;
  }
  case 'peerPaused':notify('RIVAL RECONNECTING');return;
  case 'peerResumed':notify('RIVAL RECONNECTED');return;
  case 'peerLeft':ready=false;goto('results');$('resultTitle').textContent='OPPONENT LEFT';$('resultBody').textContent='Your opponent disconnected from the session.';return;
  case 'resumeFailed':room='';token='';goto('menu');status('Session expired. Create a new room.');return;
  case 'notice':notify(String(m.message||'Waiting...'));return;
  case 'pong':ping=Date.now()-(m.at||Date.now());$('net').textContent='PING '+Math.round(ping)+'ms · '+(ping<100?'EXCELLENT':ping<180?'FAIR':'POOR');return;
  case 'error':status(String(m.message));goto('menu');return;
 }
}
const bindButton=(id:string,fn:()=>void)=>{$(id).addEventListener('click',()=>{unlockAudio();sfx('ui');fn()})};
bindButton('vsBot',()=>{goto('waiting');$('waitTitle').textContent='LOADING MATCH';$('waitDescription').textContent='Setting up an authoritative bot arena.';connect({type:'bot',difficulty:($('difficulty') as HTMLSelectElement).value})});
bindButton('quick',()=>{goto('waiting');$('waitTitle').textContent='SEARCHING';$('waitDescription').textContent='Finding an online rival.';connect({type:'queue'})});
bindButton('private',()=>{goto('waiting');$('waitTitle').textContent='CREATING ROOM';connect({type:'private'})});
bindButton('join',()=>{
 const code=($('roomCode') as HTMLInputElement).value.toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6);
 if(code.length!==6){status('Enter a six-character room code.');return}
 goto('waiting');$('waitTitle').textContent='JOINING '+code;connect({type:'join',code});
});
bindButton('cancelWait',leave);
bindButton('copyRoom',async()=>{try{await navigator.clipboard.writeText(room);$('waitDescription').textContent='Copied '+room+' — send it to your friend.'}catch{$('waitDescription').textContent='Room code: '+room}});
bindButton('resume',()=>{paused=false;goto('game');engine.renderer.domElement.requestPointerLock?.().catch?.(()=>{})});
bindButton('leaveMatch',leave);
bindButton('rematch',()=>{send({type:'rematch'});$('resultBody').textContent='Rematch requested. Awaiting match start...'});
bindButton('resultMenu',leave);
function settingsPage(){returnFrom=screen;renderSettings();goto('settings')}
function loadoutPage(){returnFrom=screen;renderLoadout();goto('loadout')}
let returnFrom='menu';
for(const id of ['openSettings','pauseSettings'])bindButton(id,settingsPage);
for(const id of ['openLoadout','pauseLoadout'])bindButton(id,loadoutPage);
bindButton('settingsBack',()=>{saveSettings();goto(returnFrom);if(returnFrom==='game'){paused=true;goto('pause')}});
bindButton('loadoutBack',()=>{goto(returnFrom);if(returnFrom==='game'){paused=true;goto('pause')}});
bindButton('resetBinds',()=>{resetBinds();renderSettings()});
function renderSettings(){
 const sliders:{name:string,key:keyof typeof settings,min:number,max:number,step:number}[]=[
 {name:'Field of view',key:'fov',min:65,max:110,step:1},
 {name:'Mouse sensitivity',key:'sensitivity',min:.05,max:1,step:.01},
 {name:'Controller look sensitivity',key:'padSensitivity',min:.5,max:6,step:.1},
 {name:'Controller deadzone',key:'deadzone',min:.05,max:.35,step:.01},
 {name:'Audio volume',key:'volume',min:0,max:1,step:.05}
 ];
 $('sliders').innerHTML='';
 for(const c of sliders){
  const div=document.createElement('div');div.className='setting';
  const label=document.createElement('label');label.textContent=c.name;
  const input=document.createElement('input');input.type='range';input.min=String(c.min);input.max=String(c.max);
  input.step=String(c.step);input.value=String(settings[c.key]);
  const value=document.createElement('span');value.textContent=String(settings[c.key]);
  input.addEventListener('input',()=>{
   updateSetting(c.key,Number(input.value) as never);value.textContent=input.value;setAudioVolume();
   engine.camera.fov=settings.fov;engine.camera.updateProjectionMatrix();
  });
  div.append(label,input,value);$('sliders').append(div)
 }
 const extra=document.createElement('div');extra.className='setting';extra.innerHTML='<span>Controller vibration</span><input type="checkbox" id="vibrationSetting">';
 $('sliders').append(extra);
 const vibration=$('vibrationSetting') as HTMLInputElement;vibration.checked=settings.vibration;
 vibration.onchange=()=>updateSetting('vibration',vibration.checked);
 const response=document.createElement('div');response.className='setting';
 response.innerHTML='<span>Controller look curve</span><select id="curveSetting"><option value="exponential">Exponential</option><option value="linear">Linear</option></select>';
 $('sliders').append(response);
 const select=$('curveSetting') as HTMLSelectElement;select.value=settings.response;
 select.onchange=()=>updateSetting('response',select.value as 'linear'|'exponential');
 $('bindings').innerHTML='';
 for(const [name,key] of Object.entries(binds)){
  const wrap=document.createElement('div');wrap.className='binding';
  const title=document.createElement('span');title.textContent=name.toUpperCase().replace(/([A-Z])/g,' $1');
  const btn=document.createElement('button');btn.textContent=key.replace(/^(Key|Digit)/,'');
  btn.addEventListener('click',()=>{
   btn.textContent='PRESS A KEY...';
   const onKey=(event:KeyboardEvent)=>{
    event.preventDefault();event.stopPropagation();
    if(event.code!=='Escape')rebind(name,event.code);
    window.removeEventListener('keydown',onKey,true);
    renderSettings();
   };
   window.addEventListener('keydown',onKey,true);
  });wrap.append(title,btn);$('bindings').append(wrap);
 }
}
function renderLoadout(){
 $('loadoutButtons').innerHTML='';
 WEAPONS.forEach((w,i)=>{
  const b=document.createElement('button');
  b.innerHTML=w.name+'<small>'+w.role+' · '+w.mag+' BBS · '+w.rate+' RPM</small>';
  b.classList.toggle('selected',preferred===i);
  b.onclick=()=>{
   preferred=i;renderLoadout();
   if(ready){const last=controller.lastInput||{f:0,s:0,yaw:0,pitch:0,jump:false,crouch:false,sprint:false,prone:false,fire:false,ads:false,reload:false};send({type:'input',data:{...last,swap:i}})}
  };
  $('loadoutButtons').append(b);
 });
}
document.addEventListener('pointerlockchange',()=>{
 if(!document.pointerLockElement&&screen==='game'&&!controller.gamepadActive){paused=true;goto('pause')}
});
engine.renderer.domElement.addEventListener('click',()=>{
 unlockAudio();
 if(screen==='game'&&!controller.gamepadActive&&!document.pointerLockElement)
  engine.renderer.domElement.requestPointerLock?.().catch?.(()=>{})
});
window.addEventListener('keydown',e=>{
 if(e.code==='Escape'&&screen==='game'){paused=true;goto('pause')}
 if(e.code==='Tab'&&screen==='game'){$('killfeed').textContent='SCORE: '+(lastSnap?.score.join(' - ')||'0 - 0')}
});
if(new URLSearchParams(location.search).has('debug')){
 (window as any).__AIRSOFT_DEBUG__=()=>({
  screen,ready,paused,room,localHP:local?.hp,localAmmo:local?.ammo,
  socket:ws?.readyState,pointerLocked:!!document.pointerLockElement,
  frames:engine.frame,assetState:engine.assetState,lastInput:controller.lastInput,
   playerX:engine.localPos.x,playerY:engine.localPos.y,playerZ:engine.localPos.z,
   cameraY:engine.camera.position.y,serverError:engine.lastServerError,renderFPS:Math.round(measuredFPS),
   slideTime:engine.motion.slideTime,slideCooldown:engine.motion.cooldown,velocity:engine.strideSpeed,serverSlide:local?.sliding,serverSprint:local?.sprinting
 });
}
const mobile=/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent);
if(mobile)goto('mobile');else goto('menu');
let last=performance.now(),sendClock=0,stepClock=0,seq=0,pendingSlide=false,localSlideQueued=false;
let measuredFPS=60,fpsSamples=0,fpsWindow=performance.now();
async function start(){
 try{await engine.init();status('Ready. Pick a match mode to begin.')}
 catch(err){console.error('Arena initialization failed',err);status('3D physics could not load. Refresh with WebGL enabled.')}
 requestAnimationFrame(frame);
}
function frame(timestamp:number){
 requestAnimationFrame(frame);
 const elapsed=Math.max(.001,(timestamp-last)/1000||.016);last=timestamp;
 const dt=Math.min(.05,elapsed);
 // Use real elapsed time for physics, separately from animation's safe visual
 // clamp. Dropping 55ms of every 100ms frame made sprint prediction run at half
 // server speed and caused repeated correction jumps through the floor.
 const physicsElapsed=Math.min(.116,elapsed);
 fpsSamples++;
 if(timestamp-fpsWindow>=1100){
  measuredFPS=fpsSamples*1000/(timestamp-fpsWindow);
  engine.adjustQuality(measuredFPS);
  fpsWindow=timestamp;fpsSamples=0;
 }
 if(mobile||!engine.world)return;
 const active=screen==='game'&&!paused&&ready,inp=controller.sample(dt,active);
 if(anyPadConnected()&&!padHasActivity())$('gamepadPrompt').classList.remove('hidden');
 else $('gamepadPrompt').classList.add('hidden');
 if(active){
  if(inp.slide){pendingSlide=true;localSlideQueued=true}
  stepClock+=physicsElapsed;sendClock+=elapsed;
  let steps=0;
  while(stepClock>=1/60&&steps<7){
   const simInput=localSlideQueued?{...inp,slide:true}:{...inp,slide:false};
   engine.predict(1/60,simInput);
   localSlideQueued=false;stepClock-=1/60;steps++;
  }
  // Never build an unlimited backlog after changing windows / tab throttling.
  if(steps===7)stepClock=Math.min(stepClock,1/60);
  if(sendClock>=1/30){
   sendClock=0;send({type:'input',data:{...inp,slide:pendingSlide,seq:++seq,swap:inp.swap??(seq===1?preferred:undefined)}});
   pendingSlide=false;
  }
 }else{stepClock=0;sendClock=0;pendingSlide=false;localSlideQueued=false}
 if(local&&lastSnap){const me=lastSnap.players.find(p=>p.side===side);if(me)local=me}
 engine.frameDraw(dt,active?inp:controller.lastInput,local,side);
 if(open()&&timestamp-lastPing>3300){lastPing=timestamp;send({type:'ping',at:Date.now()})}
 if(!open()&&reconnectTime&&timestamp>=reconnectTime){reconnectTime=0;connect({type:'resume',code:room,token})}
}
start();
