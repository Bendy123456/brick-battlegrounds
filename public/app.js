// The menu must work even if 3D graphics fail to load.
let arena=null;
const gameEvents={onState:null,onAttack:null,onHit:null,onEnd:null,onDisconnect:null};
const stopFight=()=>arena?.stopFight();
const receivePeerState=d=>arena?.receivePeerState(d);
const receivePeerAttack=d=>arena?.receivePeerAttack(d);
const receiveDamage=(d,knockdown,stun,spinjitzuFinisher,impactKind)=>arena?.receiveDamage(d,knockdown,stun,spinjitzuFinisher,impactKind);
async function loadArena(){
  if(arena)return arena;
  try{arena=await import('./arena.js');Object.assign(arena.gameEvents,gameEvents);return arena;}
  catch(err){console.error('3D initialization failed:',err);throw new Error('3D engine could not load. Please refresh, or try Chrome/Brave with WebGL enabled.');}
}
const $=id=>document.getElementById(id);
// Hoisted declaration: select(0) below must be able to call send during bootstrap.
function send(m){
 if(ws?.readyState!==1)return false;
 if(m.type==='state'&&ws.bufferedAmount>96000)return false;
 try{ws.send(JSON.stringify(m));return true}catch{return false}
}

const chars=[
 ['AZURE','#137db8','#163e57','STORM BLADE','Balanced speed and electric blade techniques.'],
 ['CRIMSON','#c63633','#63222b','FIRE BLADE','Aggressive strikes and relentless pressure.'],
 ['VERDANT','#238550','#15442e','WIND BLADE','Swift footwork and spinning strikes.'],
 ['SHADE','#333c49','#181f2a','SHADOW BLADE','Patient counters and silent movement.'],
 ['GOLDEN','#c7a134','#635022','CHAMPION BLADE','Steady defense and radiant technique.'],
 ['IVORY','#d7dce1','#567587','FROST BLADE','Precise attacks and unshakable focus.'],
 ['CINDER','#d56c2a','#723c24','EMBER BLADE','Powerful blows and explosive momentum.'],
 ['ORCHID','#783ca3','#412858','ARCANE BLADE','Mysterious movement and charged attacks.'],
 ['ROSE','#ce577c','#6e2d4c','BLOSSOM BLADE','Fast dodges and graceful combos.']
];
let chosen=0,peerChoice=1,mode='solo',ws=null,room='',slot=0,peerReady=false,myReady=false,peerCount=0,screen='lobby',inFight=false;
let resumeToken='',reconnectTimer=null,reconnectStarted=0,reconnectTries=0,lastPong=0,lastPing=0,lastPeerFrame=0,networkPaused=false;
const elements=[...document.querySelectorAll('.page')];
const show=(id)=>{screen=id;document.body.classList.toggle('in-match',id==='none');elements.forEach(e=>e.classList.toggle('show',e.id===id));$('grain').style.display=id==='none'?'none':'block';$('hud').classList.toggle('hidden',id!=='none');$('gameHelp').classList.toggle('hidden',id!=='none');$('quit').classList.toggle('hidden',id!=='none');$('audioToggle').classList.toggle('hidden',id!=='none');if(id!=='none')$('netStatus').classList.add('hidden');$('reticle').style.display=id==='none'?'block':'none'};
const toast=t=>{$('lobbyMsg').textContent=t;};
// CHANGED: Roster icons show the SAME plain-colored classic LEGO heads as the in-game fighters.
// CHANGED: No torso, hands, legs, head mask, or decorative emblems remain in the portrait.
function avatar(i){
 const c=chars[i];
 return `<div class="avatar lego-head-portrait fighter-${i}" style="--cloth:${c[1]};--glow:${c[2]}"><div class="lego-head-stud" aria-hidden="true"></div><div class="lego-head-neck" aria-hidden="true"></div><div class="lego-head-shell" aria-hidden="true"></div></div>`;
}
$('rosterGrid').innerHTML=chars.map((c,i)=>`<button type="button" title="${c[0]}" aria-label="Select ${c[0]}" class="roster-item" data-index="${i}">${avatar(i)}</button>`).join('');
function select(i){
  chosen=(i+chars.length)%chars.length;
  // CHANGED: Selected fighter name and real (shared) ability appear below the centered roster.
  for(const b of $('rosterGrid').children){
    const active=Number(b.dataset.index)===chosen;
    b.classList.toggle('active',active);
    b.setAttribute('aria-pressed',String(active));
  }
  $('fighterName').textContent=chars[chosen][0];
  $('fighterName').style.color=chars[chosen][1];
  // CHANGED: Color the premium title and subtle brushstroke using the chosen fighter's original shade.
  $('fighterName').parentElement?.style.setProperty('--fighter-accent',chars[chosen][1]);
  $('fighterAbility').textContent='Elemental Spinjitzu'; // CHANGED: Real 2s moving tornado ability
  $('roomStatus').textContent=mode==='online'?`ROOM ${room} · ${peerCount}/2 CONNECTED${myReady?' · READY':''}`:'SOLO TRAINING · CPU OPPONENT';
  send({type:'select',character:chosen});
}
$('rosterGrid').addEventListener('click',e=>{let b=e.target.closest('.roster-item');if(b)select(Number(b.dataset.index))});
function onlineStatus(paused,message=''){
 networkPaused=paused;
 arena?.setNetworkPaused?.(paused);
 const banner=$('netStatus');
 banner.textContent=message||'CONNECTION RECOVERED';
 banner.classList.toggle('hidden',!inFight||!paused||mode!=='online');
}
function finishLostConnection(message){
 if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null}
 stopFight();inFight=false;room='';resumeToken='';mode='solo';peerCount=0;
 $('result').classList.add('hidden');show('lobby');
 toast(message||'Connection lost. Create a new online room.');
}
function reconnectSoon(delay=800){
 if(mode!=='online'||!room||!resumeToken||reconnectTimer)return;
 if(!reconnectStarted)reconnectStarted=Date.now();
 if(Date.now()-reconnectStarted>29000){
  finishLostConnection('Could not restore the match. Please create a new online room.');return;
 }
 reconnectTimer=setTimeout(async()=>{
  reconnectTimer=null;if(mode!=='online'||!room)return;
  try{await connect(true)}
  catch{reconnectTries++;reconnectSoon(Math.min(3000,700+reconnectTries*500))}
 },delay);
}
function connect(resuming=false){
 return new Promise((resolve,reject)=>{
  const url=(location.protocol==='https:'?'wss':'ws')+'://'+location.host;
  const sock=new WebSocket(url);let settled=false;
  sock.onopen=()=>{
   ws=sock;settled=true;lastPong=performance.now();lastPing=0;
   if(resuming)send({type:'resume',code:room,token:resumeToken});
   resolve(sock);
  };
  sock.onerror=()=>{
   if(!settled){settled=true;reject(new Error('Could not connect to the online server.'))}
  };
  sock.onclose=()=>{
   if(!settled){settled=true;reject(new Error('Connection closed before opening.'))}
   if(ws!==sock)return;
   ws=null;
   if(mode==='online'&&room){
    onlineStatus(true,'CONNECTION INTERRUPTED · RECONNECTING…');
    reconnectSoon();
   }
  };
  sock.onmessage=e=>{
   let m;try{m=JSON.parse(e.data)}catch{return}
   if(ws===sock)onMessage(m);
  };
 });
}
setInterval(()=>{
 if(mode!=='online'||!room)return;
 const t=performance.now();
 if(ws?.readyState===1){
  if(lastPong&&t-lastPong>15000){
   onlineStatus(true,'NETWORK TIMEOUT · RECONNECTING…');
   ws.close();return;
  }
  if(t-lastPing>4000){lastPing=t;send({type:'ping',t:Date.now()})}
  if(inFight&&lastPeerFrame&&t-lastPeerFrame>4500){
   onlineStatus(true,'OPPONENT SIGNAL LOST · CHECKING CONNECTION…');
  }
 }
},1000);

function onMessage(m){
 if(m.type==='pong'){lastPong=performance.now();return}
 if(m.type==='resumeFailed'){finishLostConnection(m.message);return}
 if(m.type==='resumed'){
  room=m.code;slot=m.slot;resumeToken=m.resumeToken||resumeToken;
  peerCount=m.peerCount||1;
  if(Number.isInteger(m.peerCharacter))peerChoice=m.peerCharacter;
  reconnectStarted=0;reconnectTries=0;
  lastPeerFrame=performance.now();
  onlineStatus(peerCount<2,peerCount<2?'WAITING FOR OPPONENT TO RECONNECT…':'');
  return;
 }
 if(m.type==='peerPaused'){
  onlineStatus(true,'OPPONENT DISCONNECTED · HOLDING MATCH FOR RECONNECT…');return;
 }
 if(m.type==='peerStalled'){
  onlineStatus(true,'OPPONENT GAME IS NOT RESPONDING…');return;
 }
 if(m.type==='peerActive'||m.type==='peerResumed'){
  lastPeerFrame=performance.now();
  onlineStatus(false);return;
 }
 if(m.type==='error'){toast(m.message);$('waitStatus').textContent=m.message;return}
 if(m.type==='joined'){
  room=m.code;slot=m.slot;resumeToken=m.resumeToken||'';
  reconnectStarted=0;reconnectTries=0;peerCount=slot+1;mode='online';
  myReady=false;peerReady=false;
  $('copyCode').innerHTML=room+' <span>⧉ COPY</span>';
  $('waitStatus').textContent='Waiting for your opponent to join...';
  show('waiting');return
 }
 if(m.type==='players'){
  peerCount=m.count;
  if(!inFight)$('waitStatus').textContent=m.count===2?'Opponent joined! Pick your fighters.':'Waiting for another player...';
  if(screen==='selectScreen')select(chosen);
  return
 }
 if(m.type==='peerSelect'){peerChoice=m.character;return}
 if(m.type==='peerReady'){
  peerReady=m.ready;
  if(screen==='selectScreen')$('roomStatus').textContent=
   'ROOM '+room+' · OPPONENT '+(peerReady?'READY':'CHOOSING')+' · YOU '+(myReady?'READY':'CHOOSING');
  return
 }
 if(m.type==='begin'){
  myReady=false;peerReady=false;lastPeerFrame=performance.now();
  launch();return
 }
 if(m.type==='peerLeft'){
  peerCount=1;peerReady=false;myReady=false;
  if(inFight){
   stopFight();inFight=false;onlineStatus(false);
   $('resultTitle').textContent='OPPONENT LEFT';
   $('resultText').textContent='Your opponent disconnected from the match.';
   $('result').classList.remove('hidden');
  }else{
   $('waitStatus').textContent='Your opponent left. Waiting for another player.';
   show('waiting')
  }
  return
 }
 if(m.type==='peerState'){
  lastPeerFrame=performance.now();
  receivePeerState(m.data);
  if(networkPaused&&ws?.readyState===1&&inFight&&peerCount===2)onlineStatus(false);
  return
 }
 if(m.type==='peerAttack'){receivePeerAttack(m.kind);return}
 if(m.type==='damage'){receiveDamage(m.damage,m.knockdown===true,m.stun===true,m.spinjitzuFinisher===true,m.impactKind);return}
}
function lobby(){if(reconnectTimer){clearTimeout(reconnectTimer);reconnectTimer=null}stopFight();inFight=false;send({type:'leave'});mode='solo';room='';resumeToken='';reconnectStarted=0;peerCount=0;myReady=false;networkPaused=false;$('result').classList.add('hidden');show('lobby')}
function selectScreen(){show('selectScreen');select(chosen);$('confirm').textContent='CONFIRM FIGHTER →'}
async function launch(){
  $('confirm').disabled=true;
  $('confirm').textContent='LOADING 3D ARENA...';
  try{const a=await loadArena();a.setMode(mode,slot);a.setCharacters(chars[chosen],chars[peerChoice]);show('none');$('result').classList.add('hidden');inFight=true;a.startFight();onlineStatus(mode==='online'&&peerCount<2,'WAITING FOR OPPONENT CONNECTION…');}
  catch(e){show('selectScreen');$('roomStatus').textContent=e.message;inFight=false;}
  finally{$('confirm').disabled=false;$('confirm').textContent='CONFIRM FIGHTER →';}
}
$('solo').onclick=()=>{mode='solo';peerChoice=1;selectScreen()};$('create').onclick=async()=>{try{if(!ws||ws.readyState!==1)await connect();send({type:'create'})}catch(e){toast(e.message)}};$('join').onclick=async()=>{const code=$('roomInput').value.trim().toUpperCase();if(code.length!==6){toast('Enter a 6-character room code.');return}try{if(!ws||ws.readyState!==1)await connect();send({type:'join',code})}catch(e){toast(e.message)}};
$('roomInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('join').click()});$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room);$('waitStatus').textContent='Room code copied!'}catch{$('waitStatus').textContent='Your room code: '+room}};$('waitingSelect').onclick=selectScreen;$('cancelRoom').onclick=lobby;$('backHome').onclick=()=>{if(mode==='online')show('waiting');else lobby()};$('confirm').onclick=()=>{if(mode==='solo'){launch();return}if(peerCount<2){$('roomStatus').textContent='Waiting for your opponent to join...';return}myReady=!myReady;send({type:'ready',ready:myReady});$('confirm').textContent=myReady?'CANCEL READY':'READY TO FIGHT →';$('roomStatus').textContent=myReady?'READY! Waiting for your opponent...':'Select your fighter and ready up.'};$('quit').onclick=lobby;$('resultExit').onclick=lobby;$('again').onclick=()=>{if(mode==='solo'){launch()}else{stopFight();inFight=false;myReady=false;selectScreen()}};
let menuPadCooldown=0,oldButtons=[];function menus(){requestAnimationFrame(menus);const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(!p)return;const now=performance.now();const buttons=p.buttons.map(b=>b.pressed);const edge=n=>buttons[n]&&!oldButtons[n];if(screen==='selectScreen'){const horizontal=(p.axes[0]>.55?1:p.axes[0]<-.55?-1:0);const vertical=(p.axes[1]>.55?3:p.axes[1]<-.55?-3:0);if(now>menuPadCooldown&&(horizontal||vertical||edge(14)||edge(15)||edge(12)||edge(13))){const step=(edge(14)?-1:0)+(edge(15)?1:0)+(edge(12)?-3:0)+(edge(13)?3:0)+horizontal+vertical;select(chosen+step);menuPadCooldown=now+180}if(edge(0))$('confirm').click();if(edge(1))$('backHome').click()}if(screen==='lobby'&&edge(0))$('solo').click();if(screen==='waiting'&&edge(0))$('waitingSelect').click();oldButtons=buttons}menus();
gameEvents.onState=data=>send({type:'state',data});gameEvents.onAttack=kind=>send({type:'attack',kind});gameEvents.onHit=(damage,effects={})=>send({type:'hit',damage,knockdown:effects.knockdown===true,stun:effects.stun===true,impactKind:effects.impactKind,spinjitzuFinisher:effects.spinjitzuFinisher===true});gameEvents.onEnd=win=>{inFight=false;$('resultTitle').textContent=win?'VICTORY':'DEFEAT';$('resultText').textContent=win?'You conquered the battleground.':'Your opponent took the round.';$('result').classList.remove('hidden')};gameEvents.onDisconnect=()=>onlineStatus(true,'CONNECTION INTERRUPTED · RECONNECTING…');
show('lobby');select(0);
// CHANGED: Lazy-load the interactive cinematic dojo. An unsupported WebGL
// browser retains the styled fallback; menu buttons and the separate fighter
// roster always work regardless of the 3D scene loading successfully.
async function startMenuShowcase(){
 try{
  const {mountMenuShowcase}=await import('./menu-showcase.js');
  mountMenuShowcase(document.getElementById('menuScene'));
 }catch(error){
  console.warn('Cinematic dojo preview unavailable; main menu remains playable.',error);
  document.getElementById('menuScene')?.classList.add('menu-3d-unavailable');
 }
}
if('requestIdleCallback' in window)window.requestIdleCallback(startMenuShowcase,{timeout:900});
else window.setTimeout(startMenuShowcase,250);

window.addEventListener('error',e=>console.error('Game error:',e.message));
