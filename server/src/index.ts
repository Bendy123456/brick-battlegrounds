import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {resolve,extname,sep} from 'node:path';
import {randomBytes} from 'node:crypto';
import {WebSocket,WebSocketServer} from 'ws';
import RAPIER from '@dimforge/rapier3d-compat';
import {WEAPONS,DIFFICULTIES,ROUND_KILLS,SPEED,canShoot,hitDamage,roundComplete,type Actor,type Input} from '../../shared/config.ts';
import {MAP,SPAWNS} from '../../shared/map.ts';
await RAPIER.init();

type Client=WebSocket & {participant?:Participant,lastPong?:number};
type Pellet={id:number,owner:number,x:number,y:number,z:number,vx:number,vy:number,vz:number,age:number,bounces:number};
type Participant={ws:Client|null,room:Room,index:number,token:string,actor:Actor,input:Input,body:any,collider:any,controller:any,
 lastFire:number,reloadAt:number,vy:number,grounded:boolean,deadUntil:number,heardAt:number,reconnectUntil:number,bot:boolean,thinkAt:number,decision:number};
type Room={code:string,mode:'bot'|'online',players:Participant[],world:any,pellets:Pellet[],nextPellet:number,round:number,started:number,status:'waiting'|'playing'|'finished',score:[number,number],difficulty:number,lastSnapshot:number};
const rooms=new Map<string,Room>(),queue:Client[]=[];
const PORT=Number(process.env.PORT)||3000,dist=resolve('dist');
const mime:Record<string,string>={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.wasm':'application/wasm','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.ico':'image/x-icon'};
const app=http.createServer(async(req,res)=>{
 if(req.url?.split('?')[0]==='/health'){res.writeHead(200,{'Content-Type':'application/json'}).end('{"ok":true,"game":"airsoft-arena"}');return}
 try{
  const url=new URL(req.url||'/', 'http://localhost'),pathname=decodeURIComponent(url.pathname);
  const target=pathname==='/'?'/index.html':pathname;
  const file=resolve(dist,'.'+target);
  if(file!==dist&&!file.startsWith(dist+sep)){res.writeHead(403).end();return}
  const info=await stat(file);if(!info.isFile())throw Error('not file');
  res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream','Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(await readFile(file));
 }catch{res.writeHead(404).end('Not found')}
});
const wss=new WebSocketServer({server:app,path:'/ws',maxPayload:2048});
const valid=(n:unknown,min:number,max:number)=>typeof n==='number'&&Number.isFinite(n)?Math.min(max,Math.max(min,n)):min;
const send=(ws:Client|null,m:unknown)=>{if(ws?.readyState===WebSocket.OPEN&&ws.bufferedAmount<256000){try{ws.send(JSON.stringify(m))}catch{}}};
function code(){const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let out='';do{out=Array.from(randomBytes(6),a=>alphabet[a%alphabet.length]).join('')}while(rooms.has(out));return out}
function inputDefault():Input{return{f:0,s:0,yaw:0,pitch:0,jump:false,crouch:false,sprint:false,prone:false,fire:false,ads:false,reload:false}}
function makeWorld(){
 const world=new RAPIER.World({x:0,y:-20,z:0});
 world.timestep=1/60;
 for(const b of MAP){
  if(b.material==='net')continue;
  const body=world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(b.x,b.y,b.z));
  world.createCollider(RAPIER.ColliderDesc.cuboid(b.w/2,b.h/2,b.d/2).setFriction(.9),body);
 }
 return world;
}
function newRoom(mode:'bot'|'online',difficulty:number):Room{
 const room:Room={code:code(),mode,players:[],world:makeWorld(),pellets:[],nextPellet:0,round:1,started:Date.now(),status:'waiting',score:[0,0],difficulty,lastSnapshot:0};
 rooms.set(room.code,room);return room;
}
function createParticipant(room:Room,ws:Client|null,index:number,bot=false):Participant{
 const spawn=SPAWNS[index];
 const body=room.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x,spawn.y,spawn.z));
 const collider=room.world.createCollider(RAPIER.ColliderDesc.capsule(.60,.30).setFriction(.8),body);
 const controller=room.world.createCharacterController(.03);
 controller.enableAutostep(.4,.24,true);
 controller.enableSnapToGround(.18);
 const actor:Actor={id:index?'BLUE':'RED',side:index,x:spawn.x,y:spawn.y,z:spawn.z,yaw:index?Math.PI/2:-Math.PI/2,pitch:0,
 hp:100,kills:0,deaths:0,ammo:WEAPONS[0].mag,mag:WEAPONS[0].mag,weapon:0,alive:true,ads:false,crouch:false,prone:false,velocity:0,reloadEnd:0};
 const p:Participant={ws,room,index,token:randomBytes(20).toString('hex'),actor,input:inputDefault(),body,collider,controller,lastFire:0,reloadAt:0,vy:0,grounded:true,deadUntil:0,heardAt:Date.now(),reconnectUntil:0,bot,thinkAt:0,decision:0};
 room.players.push(p);if(ws)ws.participant=p;return p;
}
function joinState(p:Participant){
 send(p.ws,{type:'joined',mode:p.room.mode,code:p.room.code,side:p.index,token:p.token,difficulty:p.room.difficulty});
}
function announce(room:Room,message:string,extra:Record<string,unknown>={}){
 for(const p of room.players)send(p.ws,{type:message,...extra});
}
function begin(room:Room){
 if(room.players.length!==2)return;
 room.status='playing';room.started=Date.now();
 announce(room,'begin',{mode:room.mode}); 
}
function endParticipant(ws:Client,explicit=false){
 const p=ws.participant;if(!p||p.ws!==ws)return;
 ws.participant=undefined;p.ws=null;p.input.fire=false;p.input.f=0;p.input.s=0;
 if(explicit){p.reconnectUntil=0;announce(p.room,'peerLeft');p.room.status='finished'}
 else {p.reconnectUntil=Date.now()+30000;announce(p.room,'peerPaused',{seconds:30})}
}
function startBot(ws:Client,difficulty:number){
 if(ws.participant)endParticipant(ws,true);
 const room=newRoom('bot',difficulty);
 const me=createParticipant(room,ws,0),enemy=createParticipant(room,null,1,true);
 enemy.actor.yaw=Math.PI/2;joinState(me);begin(room);
}
function createPrivate(ws:Client){
 if(ws.participant)endParticipant(ws,true);
 const room=newRoom('online',.40);joinState(createParticipant(room,ws,0));
}
function joinPrivate(ws:Client,c:string){
 const room=rooms.get(c);
 if(!room||room.mode!=='online'||room.players.length!==1||room.status!=='waiting'){
  send(ws,{type:'error',message:'Room unavailable or already full.'});return}
 if(ws.participant)endParticipant(ws,true);
 joinState(createParticipant(room,ws,1));
 begin(room);
}
function quickMatch(ws:Client){
 if(ws.participant)endParticipant(ws,true);
 while(queue.length){
  const waiting=queue.shift()!;
  if(waiting.readyState!==WebSocket.OPEN||waiting===ws)continue;
  const room=newRoom('online',.40);
  const a=createParticipant(room,waiting,0);joinState(a);
  const b=createParticipant(room,ws,1);joinState(b);begin(room);return;
 }
 queue.push(ws);send(ws,{type:'queue'});
}
function restore(ws:Client,code:string,token:string){
 const room=rooms.get(code),p=room?.players.find(a=>a.token===token);
 if(!p||p.bot||p.reconnectUntil<Date.now()||p.ws){send(ws,{type:'resumeFailed'});return}
 if(ws.participant)endParticipant(ws,true);
 p.ws=ws;p.reconnectUntil=0;ws.participant=p;p.heardAt=Date.now();
 joinState(p);send(ws,{type:'begin',resumed:true});announce(room!,'peerResumed');
}
function respawn(p:Participant){
 const spawn=SPAWNS[p.index],a=p.actor;
 a.x=spawn.x;a.y=spawn.y;a.z=spawn.z;a.hp=100;a.alive=true;a.ammo=WEAPONS[a.weapon].mag;
 p.deadUntil=0;p.reloadAt=0;p.vy=0;p.body.setTranslation({x:a.x,y:a.y,z:a.z},true);
 send(p.ws,{type:'respawn'});
}
function swap(p:Participant,index:number){
 if(index<0||index>=WEAPONS.length||!Number.isInteger(index))return;
 const a=p.actor;a.weapon=index;a.ammo=WEAPONS[index].mag;a.mag=WEAPONS[index].mag;p.reloadAt=0;
}
function lineSphere(x:number,y:number,z:number,dx:number,dy:number,dz:number,len:number,cx:number,cy:number,cz:number,r:number){
 const px=x-cx,py=y-cy,pz=z-cz,b=px*dx+py*dy+pz*dz,c=px*px+py*py+pz*pz-r*r;
 const det=b*b-c;if(det<0)return Infinity;
 const t=-b-Math.sqrt(det);return t>=0&&t<=len?t:Infinity;
}
function rayHitPlayer(b:Pellet,target:Participant,len:number){
 const a=target.actor;if(!a.alive||a.hp<=0)return null;
 const dx=b.vx,dy=b.vy,dz=b.vz,m=Math.hypot(dx,dy,dz)||1;
 let best={t:Infinity,zone:'torso' as 'head'|'torso'|'limb'};
 // Sphere approximations around minifigure head, main torso, arms and legs.
 for(const [zone,ox,oy,oz,r] of [['head',0,.66,0,.37],['torso',0,.08,0,.50],['limb',-.48,.07,0,.28],['limb',.48,.07,0,.28],['limb',-.22,-.50,0,.30],['limb',.22,-.50,0,.30]] as const){
  const t=lineSphere(b.x,b.y,b.z,dx/m,dy/m,dz/m,len,a.x+ox,a.y+oy,a.z+oz,r);
  if(t<best.t)best={t,zone};
 }
 return Number.isFinite(best.t)?best:null;
}
function damage(room:Room,attacker:Participant,victim:Participant,zone:'head'|'torso'|'limb',wIndex:number){
 if(!victim.actor.alive)return;
 const amount=hitDamage(zone,WEAPONS[wIndex].damage);
 victim.actor.hp=Math.max(0,victim.actor.hp-amount);
 send(attacker.ws,{type:'hit',zone,damage:amount,down:victim.actor.hp===0});
 send(victim.ws,{type:'hurt',damage:amount,zone});
 if(victim.actor.hp!==0)return;
 victim.actor.alive=false;victim.actor.deaths++;attacker.actor.kills++;
 room.score[attacker.index]++;victim.deadUntil=Date.now()+2100;
 announce(room,'elimination',{winner:attacker.index,zone,score:room.score});
 if(roundComplete(...room.score,ROUND_KILLS)){
  room.status='finished';announce(room,'matchEnd',{winner:attacker.index,score:room.score});
 }
}
function fire(room:Room,p:Participant,now:number){
 const a=p.actor,w=WEAPONS[a.weapon];
 if(p.reloadAt||!a.alive||!canShoot(a.ammo,p.lastFire,now,w.rate))return;
 p.lastFire=now;a.ammo--;
 const baseYaw=a.yaw,basePitch=a.pitch,spread=(a.ads?.35:1)*(w.spread*Math.PI/180);
 for(let i=0;i<(w.pellets||1);i++){
  const yaw=baseYaw+(Math.random()-.5)*spread,pitch=basePitch+(Math.random()-.5)*spread;
  const dx=-Math.sin(yaw)*Math.cos(pitch),dy=Math.sin(pitch),dz=-Math.cos(yaw)*Math.cos(pitch);
  room.pellets.push({id:++room.nextPellet,owner:p.index,x:a.x+dx*.55,y:a.y+.52+dy*.55,z:a.z+dz*.55,
   vx:dx*w.speed,vy:dy*w.speed,vz:dz*w.speed,age:0,bounces:0});
 }
 announce(room,'fire',{side:p.index,weapon:a.weapon,x:a.x,y:a.y+.52,z:a.z});
}
function updatePellets(room:Room,dt:number){
 const remaining:Pellet[]=[];
 for(const bb of room.pellets){
  if(bb.age>2.5||Math.abs(bb.x)>60||Math.abs(bb.z)>40||bb.y<0||bb.y>12)continue;
  const vx=bb.vx,vy=bb.vy,vz=bb.vz,mag=Math.hypot(vx,vy,vz);
  bb.vx-=bb.vx*.006*dt*mag;bb.vy+=(1.5-9.81)*dt-bb.vy*.006*dt*mag;bb.vz-=bb.vz*.006*dt*mag;
  const dist=Math.hypot(bb.vx,bb.vy,bb.vz)*dt;
  if(dist<.001)continue;
  const direction={x:bb.vx/dist*dt,y:bb.vy/dist*dt,z:bb.vz/dist*dt};
  const ray=new RAPIER.Ray({x:bb.x,y:bb.y,z:bb.z},direction);
  // Kinematic character capsules are excluded so zone testing can distinguish
  // head / torso / limbs separately; Rapier handles solid world obstruction.
  const solid=room.world.castRay(ray,dist,true,RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);
  let nearest=solid?.timeOfImpact??Infinity;
  let victim:Participant|null=null,zone:'head'|'torso'|'limb'='torso';
  for(const p of room.players){
   if(p.index===bb.owner)continue;
   const hit=rayHitPlayer(bb,p,dist);
   if(hit&&hit.t<nearest){nearest=hit.t;victim=p;zone=hit.zone}
  }
  if(victim){damage(room,room.players[bb.owner],victim,zone,room.players[bb.owner].actor.weapon);continue}
  if(solid){announce(room,'impact',{x:bb.x+direction.x*nearest,y:bb.y+direction.y*nearest,z:bb.z+direction.z*nearest});continue}
  bb.x+=bb.vx*dt;bb.y+=bb.vy*dt;bb.z+=bb.vz*dt;bb.age+=dt;
  remaining.push(bb);
 }
 room.pellets=remaining.slice(-450);
}
function controlBot(p:Participant,dt:number,now:number){
 const other=p.room.players[0],a=p.actor,t=other.actor;
 if(!a.alive||!t.alive){p.input.fire=false;return}
 const dx=t.x-a.x,dz=t.z-a.z,range=Math.hypot(dx,dz);
 a.yaw=Math.atan2(-dx,-dz);a.pitch=Math.atan2((t.y+.20)-(a.y+.52),Math.max(.1,range));
 if(now>p.thinkAt){
  const response=p.room.difficulty*1000;
  p.thinkAt=now+response;
  p.decision=Math.sin(now*.0011+p.index*13)>0?1:-1;
  p.input.fire=range<47&&Math.random()>(p.room.difficulty*.35);
  p.input.reload=a.ammo<3;
 }
 p.input.f=range>18?1:range<9?-.55:0;
 p.input.s=p.decision*.47;p.input.sprint=range>27;p.input.crouch=range<17&&Math.random()<.03;
 p.input.yaw=a.yaw;p.input.pitch=a.pitch;
}
function move(p:Participant,dt:number,now:number){
 const a=p.actor,inp=p.input;
 if(!a.alive){if(p.deadUntil&&now>=p.deadUntil&&p.room.status==='playing')respawn(p);return}
 if(p.bot)controlBot(p,dt,now);
 if(!p.bot&&now-p.heardAt>450){inp.f=0;inp.s=0;inp.fire=false}
 a.yaw=valid(inp.yaw,-Math.PI*8,Math.PI*8);a.pitch=valid(inp.pitch,-1.4,1.4);
 a.crouch=!!inp.crouch;a.prone=!!inp.prone;a.ads=!!inp.ads;
 const sp=a.prone?SPEED.prone:a.crouch?SPEED.crouch:inp.sprint?SPEED.sprint:SPEED.walk;
 const f=valid(inp.f,-1,1),side=valid(inp.s,-1,1),scale=Math.max(1,Math.hypot(f,side));
 const moveX=(Math.cos(a.yaw)*side-Math.sin(a.yaw)*f)*sp/scale*dt;
 const moveZ=(-Math.sin(a.yaw)*side-Math.cos(a.yaw)*f)*sp/scale*dt;
 if(inp.jump&&p.grounded&&!a.prone&&!a.crouch){p.vy=Math.sqrt(2*20*1.2);p.grounded=false}
 p.vy=Math.max(-25,p.vy-20*dt);
 p.controller.computeColliderMovement(p.collider,{x:moveX,y:p.vy*dt,z:moveZ});
 const change=p.controller.computedMovement(),current=p.body.translation();
 p.body.setNextKinematicTranslation({x:current.x+change.x,y:current.y+change.y,z:current.z+change.z});
 p.grounded=p.controller.computedGrounded();
 if(p.grounded&&p.vy<0)p.vy=0;
 // Snapshot is taken after world.step() in the room tick.
 if(inp.swap!==undefined){swap(p,inp.swap);inp.swap=undefined}
 if(inp.reload&&!p.reloadAt&&a.ammo<WEAPONS[a.weapon].mag){p.reloadAt=now+WEAPONS[a.weapon].reload*1000}
 if(p.reloadAt&&now>=p.reloadAt){a.ammo=WEAPONS[a.weapon].mag;p.reloadAt=0}
 a.reloadEnd=p.reloadAt;
 if(inp.fire)fire(p.room,p,now);
}
function tick(){
 const dt=1/60,now=Date.now();
 for(const room of rooms.values()){
  if(room.status!=='playing'){
   if(room.status==='finished'&&now-room.started>300000)rooms.delete(room.code);
   continue
  }
  for(const p of room.players){
   if(!p.bot&&!p.ws&&!p.reconnectUntil){room.status='finished';break}
   if(!p.bot&&!p.ws&&now>p.reconnectUntil){room.status='finished';announce(room,'peerLeft');break}
  }
  if(room.status!=='playing')continue;
  for(const p of room.players)move(p,dt,now);
  room.world.step();
  for(const p of room.players){
   const pos=p.body.translation();p.actor.x=pos.x;p.actor.y=pos.y;p.actor.z=pos.z;
   p.actor.velocity=Math.hypot(p.input.f,p.input.s);
  }
  updatePellets(room,dt);
  if(now-room.lastSnapshot>=50){
   room.lastSnapshot=now;
   const msg={type:'snapshot',players:room.players.map(p=>p.actor),pellets:room.pellets.map(b=>({id:b.id,x:b.x,y:b.y,z:b.z})),timer:Math.max(0,180-Math.floor((now-room.started)/1000)),score:room.score,status:room.status,round:room.round};
   announce(room,'snapshot',msg);
   if(now-room.started>180000){room.status='finished';announce(room,'matchEnd',{winner:room.score[0]>=room.score[1]?0:1,score:room.score})}
  }
 }
}
setInterval(tick,1000/60).unref?.();
setInterval(()=>{
 for(const ws of wss.clients as Set<Client>){
  if(ws.readyState!==WebSocket.OPEN)continue;
  if(Date.now()-(ws.lastPong||0)>35000){ws.terminate();continue}
  ws.ping();
 }
 for(const room of rooms.values())if(room.status==='waiting'&&Date.now()-room.started>10*60000)rooms.delete(room.code);
},9000).unref?.();
wss.on('connection',(sock:WebSocket)=>{
 const ws=sock as Client;ws.lastPong=Date.now();
 ws.on('pong',()=>{ws.lastPong=Date.now()});
 ws.on('message',raw=>{
  if(raw.length>2048)return;
  let msg:any;try{msg=JSON.parse(String(raw))}catch{return}
  if(!msg||typeof msg.type!=='string')return;
  if(msg.type==='ping'){send(ws,{type:'pong',at:msg.at||0});return}
  if(msg.type==='bot'){startBot(ws,DIFFICULTIES[msg.difficulty as keyof typeof DIFFICULTIES]??.40);return}
  if(msg.type==='private'){createPrivate(ws);return}
  if(msg.type==='join'){joinPrivate(ws,String(msg.code||'').toUpperCase().replace(/[^A-Z0-9]/g,'').slice(0,6));return}
  if(msg.type==='queue'){quickMatch(ws);return}
  if(msg.type==='resume'){restore(ws,String(msg.code||'').slice(0,6),String(msg.token||''));return}
  if(msg.type==='leave'){endParticipant(ws,true);return}
  const p=ws.participant;if(!p||p.ws!==ws)return;
  if(msg.type==='rematch'){
   const r=p.room;if(r.status!=='finished')return;
   if(!('rematchVotes' in r))(r as any).rematchVotes=new Set<number>();
   (r as any).rematchVotes.add(p.index);
   if(r.mode==='bot'||(r as any).rematchVotes.size===2){
    r.score=[0,0];r.pellets=[];r.round++;r.started=Date.now();r.status='playing';(r as any).rematchVotes.clear();
    for(const x of r.players){x.actor.kills=0;x.actor.deaths=0;respawn(x)}
    announce(r,'begin',{rematch:true});
   }else send(ws,{type:'notice',message:'Waiting for opponent to rematch...'});
   return;
  }
  if(msg.type==='input'){
   const x=msg.data;if(!x||typeof x!=='object')return;
   p.input={f:valid(x.f,-1,1),s:valid(x.s,-1,1),yaw:valid(x.yaw,-Math.PI*8,Math.PI*8),
    pitch:valid(x.pitch,-1.4,1.4),jump:x.jump===true,crouch:x.crouch===true,sprint:x.sprint===true,prone:x.prone===true,
    fire:x.fire===true,ads:x.ads===true,reload:x.reload===true,swap:Number.isInteger(x.swap)?x.swap:undefined,
    grenade:x.grenade===true,melee:x.melee===true,seq:valid(x.seq,0,1e9)};
   p.heardAt=Date.now();
  }
 });
 ws.on('close',()=>endParticipant(ws,false));
 ws.on('error',()=>{try{ws.terminate()}catch{}});
});
app.listen(PORT,'0.0.0.0',()=>console.log('AIRSOFT ARENA online at port '+PORT+' (server authoritative)'));
