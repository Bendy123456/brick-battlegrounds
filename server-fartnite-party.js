import {randomBytes} from 'node:crypto';
import {WebSocketServer,WebSocket} from 'ws';

// Lobby presence only. Game matches are currently solo vs AI, not synchronized multiplayer.
// Each party uses a short shareable code, lives in memory, and exists while host is connected.
export function attachPartyServer(httpServer){
 const rooms=new Map();
 const wss=new WebSocketServer({noServer:true,maxPayload:2048,perMessageDeflate:false});
 let serial=0;
 const safeName=x=>typeof x==='string'?x.replace(/[<>&"'\x00-\x1f]/g,'').trim().slice(0,22)||'FIELD SCOUT':'FIELD SCOUT';
 const safeSkin=x=>Number.isInteger(x)&&x>=0&&x<25?x:0;
 const send=(ws,x)=>{if(ws.readyState===WebSocket.OPEN)ws.send(JSON.stringify(x))};
 const warn=(ws,message)=>send(ws,{type:'error',message});
 function leave(ws,notify=true){
  const room=ws.partyRoom;if(!room)return;
  ws.partyRoom=null;
  const id=ws.partyId,member=room.members.get(id);
  room.members.delete(id);
  if(room.hostId===id){
   rooms.delete(room.code);
   for(const other of room.members.values()){
    other.ws.partyRoom=null;
    send(other.ws,{type:'closed',message:'Party host left. Your lobby is now solo.'});
   }
   room.members.clear()
  }else if(room.members.size)broadcast(room);
  if(notify)send(ws,{type:'left'});
 }
 function broadcast(room){
  const members=[...room.members.entries()].map(([id,m])=>({id,name:m.name,skin:m.skin}));
  for(const m of room.members.values())send(m.ws,{type:'party',code:room.code,hostId:room.hostId,selfId:m.id,members})
 }
 function code(){
  let value;
  do{value=randomBytes(3).toString('hex').toUpperCase()}while(rooms.has(value));
  return value
 }
 httpServer.on('upgrade',(req,socket,head)=>{
  // Restrict websocket path and cross-origin connections.
  let path;
  try{path=new URL(req.url,'http://localhost').pathname}catch{socket.destroy();return}
  if(path!=='/party'){socket.destroy();return}
  if(req.headers.origin){
   try{
    const origin=new URL(req.headers.origin);
    const host=(req.headers['x-forwarded-host']||req.headers.host||'').split(',')[0].trim().toLowerCase();
    if(origin.host.toLowerCase()!==host){socket.destroy();return}
   }catch{socket.destroy();return}
  }
  wss.handleUpgrade(req,socket,head,ws=>wss.emit('connection',ws,req))
 });
 wss.on('connection',ws=>{
  ws.partyId=String(++serial);
  ws.partyRoom=null;
  ws.isAlive=true;
  ws.on('pong',()=>{ws.isAlive=true});
  ws.on('message',data=>{
   let event;
   try{event=JSON.parse(String(data))}catch{warn(ws,'Invalid party request.');return}
   if(!event||typeof event!=='object')return;
   if(event.type==='leave'){leave(ws);return}
   if(event.type==='create'){
    leave(ws,false);
    const room={code:code(),hostId:ws.partyId,members:new Map()};
    room.members.set(ws.partyId,{ws,name:safeName(event.name),skin:safeSkin(event.skin)});
    ws.partyRoom=room;rooms.set(room.code,room);broadcast(room)
   }else if(event.type==='join'){
    if(typeof event.code!=='string'||!/^[A-F0-9]{6}$/.test(event.code.trim().toUpperCase())){warn(ws,'Enter a valid 6-character party code.');return}
    const room=rooms.get(event.code.trim().toUpperCase());
    if(!room){warn(ws,'No active party with that code.');return}
    if(room.members.size>=3&&!room.members.has(ws.partyId)){warn(ws,'That party is full (3 players).');return}
    if(ws.partyRoom&&ws.partyRoom!==room)leave(ws,false);
    ws.partyRoom=room;
    room.members.set(ws.partyId,{ws,name:safeName(event.name),skin:safeSkin(event.skin)});
    broadcast(room)
   }else if(event.type==='skin'){
    const room=ws.partyRoom,member=room?.members.get(ws.partyId);
    if(!member)return;
    member.skin=safeSkin(event.skin);broadcast(room)
   }
  });
  ws.on('close',()=>leave(ws,false));
  ws.on('error',()=>leave(ws,false))
 });
 const heartbeat=setInterval(()=>{
  for(const ws of wss.clients){
   if(!ws.isAlive){ws.terminate();continue}
   ws.isAlive=false;ws.ping()
  }
 },30000);
 heartbeat.unref?.();
 httpServer.on('close',()=>{clearInterval(heartbeat);wss.close()});
 return {rooms,wss};
}
