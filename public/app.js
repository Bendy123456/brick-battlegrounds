// The menu must work even if 3D graphics fail to load.
let arena=null;
const gameEvents={onState:null,onAttack:null,onHit:null,onEnd:null,onDisconnect:null};
const stopFight=()=>arena?.stopFight();
const receivePeerState=d=>arena?.receivePeerState(d);
const receivePeerAttack=d=>arena?.receivePeerAttack(d);
const receiveDamage=d=>arena?.receiveDamage(d);
async function loadArena(){
  if(arena)return arena;
  try{arena=await import('./arena.js');Object.assign(arena.gameEvents,gameEvents);return arena;}
  catch(err){console.error('3D initialization failed:',err);throw new Error('3D engine could not load. Please refresh, or try Chrome/Brave with WebGL enabled.');}
}
const $=id=>document.getElementById(id);
// Hoisted declaration: select(0) below must be able to call send during bootstrap.
function send(m){if(ws?.readyState===1)ws.send(JSON.stringify(m))}

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
let chosen=0,peerChoice=1,mode='solo',ws=null,room='',slot=0,peerReady=false,myReady=false,peerCount=0,screen='lobby',inFight=false;const elements=[...document.querySelectorAll('.page')];
const show=(id)=>{screen=id;document.body.classList.toggle('in-match',id==='none');elements.forEach(e=>e.classList.toggle('show',e.id===id));$('grain').style.display=id==='none'?'none':'block';$('hud').classList.toggle('hidden',id!=='none');$('gameHelp').classList.toggle('hidden',id!=='none');$('quit').classList.toggle('hidden',id!=='none');$('reticle').style.display=id==='none'?'block':'none'};
const toast=t=>{$('lobbyMsg').textContent=t;};
const emblems=['✦','🔥','❖','☽','♛','❄','▲','✧','✿'];
function avatar(i){const c=chars[i];return `<div class="avatar ninja-portrait fighter-${i}" style="--cloth:${c[1]};--glow:${c[2]}"><div class="hood"></div><div class="face"><i class="brow"></i><i class="eyes"></i></div><div class="mask"></div><div class="chest"><span class="sigil">${emblems[i]}</span></div></div>`}
$('rosterGrid').innerHTML=chars.map((c,i)=>`<button type="button" title="${c[0]}" aria-label="Select ${c[0]}" class="roster-item" data-index="${i}">${avatar(i)}</button>`).join('');
function select(i){chosen=(i+chars.length)%chars.length;for(const b of $('rosterGrid').children)b.classList.toggle('active',Number(b.dataset.index)===chosen);$('portraitLarge').innerHTML=avatar(chosen);$('fighterName').textContent=chars[chosen][0];$('fighterClass').textContent=chars[chosen][3];$('fighterDescription').textContent=chars[chosen][4];$('roomStatus').textContent=mode==='online'?`ROOM ${room} · ${peerCount}/2 CONNECTED${myReady?' · READY':''}`:'SOLO TRAINING · CPU OPPONENT';send({type:'select',character:chosen})}
$('rosterGrid').addEventListener('click',e=>{let b=e.target.closest('.roster-item');if(b)select(Number(b.dataset.index))});
function connect(){return new Promise((resolve,reject)=>{const url=(location.protocol==='https:'?'wss':'ws')+'://'+location.host;let sock=new WebSocket(url);let settled=false;sock.onopen=()=>{ws=sock;$('connection').textContent='ONLINE SERVER CONNECTED';settled=true;resolve(sock)};sock.onerror=()=>{if(!settled)reject(new Error('Online server unavailable. This preview needs the Node server.'))};sock.onclose=()=>{$('connection').textContent='LOCAL PLAY READY';if(ws===sock){ws=null;if(mode==='online'){peerCount=0;$('waitStatus').textContent='Connection lost. Return to menu and try again.';if(inFight)gameEvents.onDisconnect?.();}}};sock.onmessage=e=>{let m;try{m=JSON.parse(e.data)}catch{return}onMessage(m)}})}

function onMessage(m){if(m.type==='error'){toast(m.message);$('waitStatus').textContent=m.message;return}if(m.type==='joined'){room=m.code;slot=m.slot;peerCount=slot+1;mode='online';myReady=false;peerReady=false;$('copyCode').innerHTML=`${room} <span>⧉ COPY</span>`;$('waitStatus').textContent='Waiting for your opponent to join...';show('waiting');return}if(m.type==='players'){peerCount=m.count;$('waitStatus').textContent=m.count===2?'Opponent joined! Pick your fighters.':'Waiting for another player...';if(screen==='selectScreen')select(chosen);return}if(m.type==='peerSelect'){peerChoice=m.character;return}if(m.type==='peerReady'){peerReady=m.ready;if(screen==='selectScreen')$('roomStatus').textContent=`ROOM ${room} · OPPONENT ${peerReady?'READY':'CHOOSING'} · YOU ${myReady?'READY':'CHOOSING'}`;return}if(m.type==='begin'){myReady=false;peerReady=false;launch();return}if(m.type==='peerLeft'){peerCount=1;peerReady=false;myReady=false;if(inFight){stopFight();inFight=false;$('resultTitle').textContent='OPPONENT LEFT';$('resultText').textContent='Your opponent disconnected from the match.';$('result').classList.remove('hidden')}else{$('waitStatus').textContent='Your opponent left. Waiting for another player.';show('waiting')}return}if(m.type==='peerState'){receivePeerState(m.data);return}if(m.type==='peerAttack'){receivePeerAttack(m.kind);return}if(m.type==='damage'){receiveDamage(m.damage);return}}
function lobby(){stopFight();inFight=false;send({type:'leave'});mode='solo';room='';peerCount=0;myReady=false;$('result').classList.add('hidden');show('lobby')}
function selectScreen(){show('selectScreen');select(chosen);$('confirm').textContent='CONFIRM FIGHTER →'}
async function launch(){
  $('confirm').disabled=true;
  $('confirm').textContent='LOADING 3D ARENA...';
  try{const a=await loadArena();a.setMode(mode,slot);a.setCharacters(chars[chosen],chars[peerChoice]);show('none');$('result').classList.add('hidden');inFight=true;a.startFight();}
  catch(e){show('selectScreen');$('roomStatus').textContent=e.message;inFight=false;}
  finally{$('confirm').disabled=false;$('confirm').textContent='CONFIRM FIGHTER →';}
}
$('solo').onclick=()=>{mode='solo';peerChoice=1;selectScreen()};$('create').onclick=async()=>{try{if(!ws||ws.readyState!==1)await connect();send({type:'create'})}catch(e){toast(e.message)}};$('join').onclick=async()=>{const code=$('roomInput').value.trim().toUpperCase();if(code.length!==6){toast('Enter a 6-character room code.');return}try{if(!ws||ws.readyState!==1)await connect();send({type:'join',code})}catch(e){toast(e.message)}};
$('roomInput').addEventListener('keydown',e=>{if(e.key==='Enter')$('join').click()});$('copyCode').onclick=async()=>{try{await navigator.clipboard.writeText(room);$('waitStatus').textContent='Room code copied!'}catch{$('waitStatus').textContent='Your room code: '+room}};$('waitingSelect').onclick=selectScreen;$('cancelRoom').onclick=lobby;$('backHome').onclick=()=>{if(mode==='online')show('waiting');else lobby()};$('confirm').onclick=()=>{if(mode==='solo'){launch();return}if(peerCount<2){$('roomStatus').textContent='Waiting for your opponent to join...';return}myReady=!myReady;send({type:'ready',ready:myReady});$('confirm').textContent=myReady?'CANCEL READY':'READY TO FIGHT →';$('roomStatus').textContent=myReady?'READY! Waiting for your opponent...':'Select your fighter and ready up.'};$('quit').onclick=lobby;$('resultExit').onclick=lobby;$('again').onclick=()=>{if(mode==='solo'){launch()}else{stopFight();inFight=false;myReady=false;selectScreen()}};
let menuPadCooldown=0,oldButtons=[];function menus(){requestAnimationFrame(menus);const p=Array.from(navigator.getGamepads?.()||[]).find(Boolean);if(!p)return;const now=performance.now();const buttons=p.buttons.map(b=>b.pressed);const edge=n=>buttons[n]&&!oldButtons[n];if(screen==='selectScreen'){const horizontal=(p.axes[0]>.55?1:p.axes[0]<-.55?-1:0);const vertical=(p.axes[1]>.55?3:p.axes[1]<-.55?-3:0);if(now>menuPadCooldown&&(horizontal||vertical||edge(14)||edge(15)||edge(12)||edge(13))){const step=(edge(14)?-1:0)+(edge(15)?1:0)+(edge(12)?-3:0)+(edge(13)?3:0)+horizontal+vertical;select(chosen+step);menuPadCooldown=now+180}if(edge(0))$('confirm').click();if(edge(1))$('backHome').click()}if(screen==='lobby'&&edge(0))$('solo').click();if(screen==='waiting'&&edge(0))$('waitingSelect').click();oldButtons=buttons}menus();
gameEvents.onState=data=>send({type:'state',data});gameEvents.onAttack=kind=>send({type:'attack',kind});gameEvents.onHit=damage=>send({type:'hit',damage});gameEvents.onEnd=win=>{inFight=false;$('resultTitle').textContent=win?'VICTORY':'DEFEAT';$('resultText').textContent=win?'You conquered the battleground.':'Your opponent took the round.';$('result').classList.remove('hidden')};gameEvents.onDisconnect=()=>{};
show('lobby');select(0);

window.addEventListener('error',e=>console.error('Game error:',e.message));

// Fullscreen works in the menus as well as during combat.
const fullBtn=$('fullscreenToggle');
function updateFullscreenButton(){fullBtn.textContent=document.fullscreenElement?'⛶ EXIT FULLSCREEN':'⛶ FULLSCREEN';fullBtn.setAttribute('aria-pressed',String(!!document.fullscreenElement))}
fullBtn.addEventListener('click',async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await document.documentElement.requestFullscreen();}catch(err){console.warn('Fullscreen unavailable',err);toast('Fullscreen was blocked. Try F11.')}});
document.addEventListener('fullscreenchange',updateFullscreenButton);
updateFullscreenButton();
