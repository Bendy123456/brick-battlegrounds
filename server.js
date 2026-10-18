import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {randomBytes} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';

const root=resolve('public'),PORT=process.env.PORT||3000;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.svg':'image/svg+xml','.png':'image/png'};
const server=http.createServer(async(req,res)=>{try{
 let path=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(path==='/')path='/index.html';
 const file=path==='/vendor/three.module.js'?resolve('node_modules/three/build/three.module.js'):resolve(root,'.'+path);
 if(path!=='/vendor/three.module.js'&&file!==root&&!file.startsWith(root+sep)){res.writeHead(403).end();return}
 const st=await stat(file);if(!st.isFile())throw Error('not file');
 res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache'});
 res.end(await readFile(file));
}catch{res.writeHead(404).end('Not found')}});

const wss=new WebSocketServer({server}),rooms=new Map();
const RECONNECT_GRACE=30000,STALE_PLAYER_MS=4500,SOCKET_DEAD_MS=27000;
const now=()=>Date.now();
const send=(ws,msg)=>{
 if(!ws||ws.readyState!==WebSocket.OPEN)return false;
 if(msg.type==='peerState'&&ws.bufferedAmount>96000)return false;
 try{ws.send(JSON.stringify(msg));return true}catch{return false}
};
const peerOf=s=>rooms.get(s?.room)?.slots.find(p=>p&&p!==s)||null;
function livePlayers(room){return room.slots.filter(s=>s?.ws?.readyState===WebSocket.OPEN).length}
function updatePlayers(room){
 for(const s of room.slots)send(s?.ws,{type:'players',count:livePlayers(room)});
}
function roomCode(){
 const abc='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
 let code;do{code=Array.from(randomBytes(6),x=>abc[x%abc.length]).join('')}while(rooms.has(code));
 return code;
}
function clearEmptyRoom(room){if(room.slots.every(s=>!s))rooms.delete(room.code)}
function depart(ws,explicit=false){
 const s=ws.member;if(!s||s.ws!==ws)return;
 const room=rooms.get(s.room);ws.member=null;s.ws=null;
 if(!room)return;
 const peer=peerOf(s);
 if(explicit){
  room.slots[s.slot]=null;
  send(peer?.ws,{type:'peerLeft'});
 }else{
  s.expiresAt=now()+RECONNECT_GRACE;
  send(peer?.ws,{type:'peerPaused',seconds:Math.ceil(RECONNECT_GRACE/1000)});
 }
 updatePlayers(room);
 clearEmptyRoom(room);
}
function makeSession(ws,room,slot){
 const s={room:room.code,slot,token:randomBytes(24).toString('hex'),ws,
  ready:false,character:null,expiresAt:0,lastState:0,stalled:false};
 room.slots[slot]=s;ws.member=s;ws.lastState=0;ws.lastAttack=0;ws.lastHit=0;
 send(ws,{type:'joined',code:room.code,slot,resumeToken:s.token});
 updatePlayers(room);
 const peer=peerOf(s);
 if(Number.isInteger(peer?.character))send(ws,{type:'peerSelect',character:peer.character});
}
function makeRoom(ws){
 depart(ws,true);
 const room={code:roomCode(),slots:[null,null],started:false};
 rooms.set(room.code,room);makeSession(ws,room,0);
}
function joinRoom(ws,code){
 const room=rooms.get(code);
 if(!room)return send(ws,{type:'error',message:'Room not found. Ask your friend for a new code.'});
 const slot=room.slots.findIndex(s=>!s);
 if(slot<0)return send(ws,{type:'error',message:'Room is full or temporarily saving a disconnected player’s spot.'});
 depart(ws,true);makeSession(ws,room,slot);
}
function resumeRoom(ws,code,token){
 const room=rooms.get(code),s=room?.slots.find(member=>member?.token===token);
 if(!s||s.expiresAt&&s.expiresAt<now())return send(ws,{type:'resumeFailed',message:'Session expired. Create a new room.'});
 if(ws.member&&ws.member!==s)depart(ws,true);
 const prior=s.ws;
 // Transfer ownership before closing a stale socket: its onclose must not detach the resumed player.
 s.ws=ws;ws.member=s;ws.lastState=0;ws.lastAttack=0;ws.lastHit=0;
 s.expiresAt=0;s.lastState=now();s.stalled=false;
 if(prior&&prior!==ws)try{prior.close()}catch{}
 const peer=peerOf(s),peerConnected=!!(peer?.ws?.readyState===WebSocket.OPEN);
 send(ws,{type:'resumed',code:room.code,slot:s.slot,resumeToken:s.token,
  peerCount:livePlayers(room),peerCharacter:peer?.character??null,matchStarted:room.started});
 send(peer?.ws,{type:'peerResumed'});
 updatePlayers(room);
}
wss.on('connection',ws=>{
 ws.member=null;ws.lastPong=now();
 ws.on('pong',()=>{ws.lastPong=now()});
 ws.on('message',raw=>{
  if(raw.length>4096)return;
  let m;try{m=JSON.parse(raw)}catch{return}
  if(!m||typeof m!=='object'||typeof m.type!=='string')return;
  if(m.type==='ping'){send(ws,{type:'pong',t:Number(m.t)||0});return}
  if(m.type==='create'){makeRoom(ws);return}
  if(m.type==='join'){joinRoom(ws,String(m.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));return}
  if(m.type==='resume'){
   resumeRoom(ws,String(m.code||'').toUpperCase().slice(0,6),String(m.token||'').slice(0,100));return
  }
  if(m.type==='leave'){depart(ws,true);return}
  const s=ws.member;if(!s||s.ws!==ws)return;
  const room=rooms.get(s.room),peer=peerOf(s);
  if(!room)return;
  if(m.type==='select'){
   if(Number.isInteger(m.character)&&m.character>=0&&m.character<9){
    s.character=m.character;send(peer?.ws,{type:'peerSelect',character:m.character});
   }
   return;
  }
  if(m.type==='ready'){
   s.ready=!!m.ready;
   send(peer?.ws,{type:'peerReady',ready:s.ready});
   if(livePlayers(room)===2&&room.slots.every(p=>p?.ready)){
    room.started=true;
    for(const p of room.slots){p.ready=false;p.lastState=now();p.stalled=false;send(p.ws,{type:'begin'})}
   }
   return;
  }
  if(m.type==='state'&&peer?.ws){
   if(now()-ws.lastState<32)return;
   const v=m.data;
   if(!v||!['x','y','z','rot','hp','guard'].every(k=>Number.isFinite(v[k])))return;
   if(Math.abs(v.x)>40||Math.abs(v.z)>40||v.y<-.5||v.y>14)return;
   ws.lastState=now();s.lastState=now();
   if(s.stalled){s.stalled=false;send(peer.ws,{type:'peerActive'})}
   send(peer.ws,{type:'peerState',data:{
    x:v.x,y:v.y,z:v.z,rot:v.rot,hp:v.hp,guard:v.guard,
    dashKind:['forward','back','left','right'].includes(v.dashKind)?v.dashKind:null,
    dashProgress:Number.isFinite(v.dashProgress)?Math.max(0,Math.min(1,v.dashProgress)):1
   }});
   return;
  }
  if(m.type==='attack'&&peer?.ws){
   if(now()-ws.lastAttack<190||!['light','heavy','special'].includes(m.kind))return;
   ws.lastAttack=now();send(peer.ws,{type:'peerAttack',kind:m.kind});return;
  }
  if(m.type==='hit'&&peer?.ws){
   if(now()-ws.lastHit<100)return;
   ws.lastHit=now();
   const damage=Math.min(24,Math.max(0,Number(m.damage)||0));
   send(peer.ws,{type:'damage',damage,knockdown:m.knockdown===true,
    stun:m.stun===true,impactKind:['light','heavy','special','guardBreak'].includes(m.impactKind)?m.impactKind:'light',spinjitzuFinisher:m.spinjitzuFinisher===true&&m.knockdown===true});
   return;
  }
  if(m.type==='roundEnd')send(peer?.ws,{type:'roundEnd',winner:m.winner});
 });
 ws.on('close',()=>depart(ws,false));
 ws.on('error',()=>{try{ws.terminate()}catch{}});
});
const maintenance=setInterval(()=>{
 for(const ws of wss.clients){
  if(ws.readyState!==WebSocket.OPEN)continue;
  if(now()-ws.lastPong>SOCKET_DEAD_MS){ws.terminate();continue}
  try{ws.ping()}catch{ws.terminate()}
 }
 for(const room of rooms.values()){
  for(const s of room.slots){
   if(!s)continue;
   if(!s.ws){
    if(s.expiresAt&&s.expiresAt<now()){
     room.slots[s.slot]=null;send(peerOf(s)?.ws,{type:'peerLeft'});
     updatePlayers(room);
    }
   }else if(room.started&&s.lastState&&now()-s.lastState>STALE_PLAYER_MS&&!s.stalled){
    s.stalled=true;send(peerOf(s)?.ws,{type:'peerStalled'});
   }
  }
  clearEmptyRoom(room);
 }
},4000);
maintenance.unref?.();
server.listen(PORT,'0.0.0.0',()=>console.log('BRICK BATTLEGROUNDS: http://localhost:'+PORT));
