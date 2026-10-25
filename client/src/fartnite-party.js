// FartNite lobby presence: real people with invite codes.
// Gameplay itself remains solo vs bots; nobody is shown until the server reports a join.
export function createPartyClient({onParty,onMessage}){
 let socket=null,room=null,connecting=false;
 const notify=message=>onMessage?.(String(message));
 const update=value=>{room=value;onParty?.(value)};
 function send(event){if(socket?.readyState===WebSocket.OPEN)socket.send(JSON.stringify(event))}
 function connect(action){
  if(connecting)return;
  if(socket?.readyState===WebSocket.OPEN){send(action);return}
  connecting=true;
  if(socket){try{socket.close()}catch{}}
  const address=(location.protocol==='https:'?'wss://':'ws://')+location.host+'/party';
  try{
   const ws=new WebSocket(address);socket=ws;
   ws.onopen=()=>{connecting=false;send(action)};
   ws.onmessage=event=>{
    let packet;
    try{packet=JSON.parse(event.data)}catch{return}
    if(packet.type==='party'){
     const members=Array.isArray(packet.members)?packet.members.filter(m=>m&&typeof m.name==='string'&&Number.isInteger(m.skin)).slice(0,3):[];
     update({code:packet.code,selfId:packet.selfId,hostId:packet.hostId,members});
    }else if(packet.type==='left'||packet.type==='closed'){
     update(null);
     if(packet.message)notify(packet.message)
    }else if(packet.type==='error'){notify(packet.message||'Could not join party.')}
   };
   ws.onclose=()=>{
    if(socket!==ws)return;
    const interrupted=Boolean(room);connecting=false;socket=null;update(null);
    if(interrupted)notify('Party connection ended. Returned to solo lobby.')
   };
   ws.onerror=()=>notify('Party connection unavailable. Try again.');
  }catch{
   connecting=false;socket=null;update(null);notify('Party connection unavailable.')
  }
 }
 return {
  create(name,skin){connect({type:'create',name,skin})},
  join(code,name,skin){connect({type:'join',code,name,skin})},
  setSkin(skin){send({type:'skin',skin})},
  leave(){
   send({type:'leave'});const old=socket;socket=null;connecting=false;
   if(old){try{old.close()}catch{}}update(null)
  },
  getState(){return room},
  get connected(){return socket?.readyState===WebSocket.OPEN}
 }
}
