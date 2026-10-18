import * as THREE from 'three';
import RAPIER from '@dimforge/rapier3d-compat';
import {MAP,SPAWNS,type Obstacle} from '../../shared/map.ts';
import {WEAPONS,type Input,type Snapshot} from '../../shared/config.ts';
import {buildClassicNinja} from './classic-ninja.js';
import {$} from './screen.ts';

const COLORS:Record<string,number>={concrete:0x56636a,metal:0x485969,wood:0x846848,net:0x496b63,foam:0x71884d};
const toV=(p:any)=>new THREE.Vector3(p.x,p.y,p.z);
export class Engine{
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(88,innerWidth/innerHeight,.08,190);
 renderer:THREE.WebGLRenderer;
 world:any;body:any;collider:any;controller:any;enemy:THREE.Group|null=null;
 opponentYaw=0;playerSide=0;localPos=new THREE.Vector3(-48,1,0);
 projectiles=new Map<number,THREE.Mesh>();props:{body:any,mesh:THREE.Mesh}[]=[];
 weapon=new THREE.Group();weaponCore=new THREE.Group();muzzle:THREE.PointLight;
 lastWeapon=-1; recoil=0;walkPhase=0;eyeBob=0;frame=0;lastStep=0;
 readonly temp=new THREE.Object3D();
 constructor(){
  this.scene.background=new THREE.Color(0x18252b);
  this.scene.fog=new THREE.FogExp2(0x192b31,.0065);
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(Math.min(devicePixelRatio||1,1.5));
  this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.23;
  $('viewport').appendChild(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight(0xd3ecf0,0x4d4d32,1.7));
  const lamp=new THREE.DirectionalLight(0xffe7c2,2.2);lamp.position.set(-26,35,18);lamp.castShadow=true;
  lamp.shadow.mapSize.set(1024,1024);lamp.shadow.camera.left=-70;lamp.shadow.camera.right=70;lamp.shadow.camera.top=55;lamp.shadow.camera.bottom=-55;
  this.scene.add(lamp);
  this.muzzle=new THREE.PointLight(0xf2f4c0,0,5);this.muzzle.position.set(.4,-.24,-1.15);this.camera.add(this.muzzle);
  this.camera.add(this.weapon);this.weapon.add(this.weaponCore);this.scene.add(this.camera);
  window.addEventListener('resize',()=>this.resize());
 }
 async init(){
  await RAPIER.init();
  this.world=new RAPIER.World({x:0,y:-20,z:0});this.world.timestep=1/60;
  this.buildMap();this.createLocal(0);this.setWeapon(0);
 }
 buildMap(){
  const groups=new Map<string,Obstacle[]>();
  for(const obj of MAP){
   const type=obj.material;
   if(!groups.has(type))groups.set(type,[]);
   groups.get(type)!.push(obj);
   if(type!=='net'){
    const rb=this.world.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(obj.x,obj.y,obj.z));
    this.world.createCollider(RAPIER.ColliderDesc.cuboid(obj.w/2,obj.h/2,obj.d/2),rb);
   }
  }
  const cube=new THREE.BoxGeometry(1,1,1);
  for(const [type,objects] of groups){
   const material=new THREE.MeshStandardMaterial({color:COLORS[type],roughness:type==='metal'?.38:.82,metalness:type==='metal'?.45:.01});
   const mesh=new THREE.InstancedMesh(cube,material,objects.length);
   mesh.castShadow=type!=='concrete';mesh.receiveShadow=true;
   objects.forEach((b,i)=>{
    this.temp.position.set(b.x,b.y,b.z);
    this.temp.rotation.set(0,0,0);
    this.temp.scale.set(b.w,b.h,b.d);
    this.temp.updateMatrix();mesh.setMatrixAt(i,this.temp.matrix)
   });
   mesh.instanceMatrix.needsUpdate=true;this.scene.add(mesh);
  }
  // Industrial lamps, light shafts, painted lane strips, and steel roof beams.
  const stripe=new THREE.MeshStandardMaterial({color:0xb6c75a,emissive:0x405522,emissiveIntensity:.24});
  for(let i=0;i<7;i++){
   const z=-32+i*10.7;
   const light=new THREE.PointLight(0xc4dcb9,26,17,2.6);
   light.position.set((i%2?1:-1)*17,10.4,z);this.scene.add(light);
   const panel=new THREE.Mesh(new THREE.BoxGeometry(5,.055,.65),new THREE.MeshBasicMaterial({color:0xa6dfc4}));
   panel.position.copy(light.position);this.scene.add(panel);
  }
  for(const z of [-28,0,28]){
   for(const side of [-1,1]){
    const line=new THREE.Mesh(new THREE.BoxGeometry(.10,.012,11),stripe);
    line.position.set(side*9,.03,z);this.scene.add(line);
   }
  }
  const trussMat=new THREE.MeshStandardMaterial({color:0x394b54,roughness:.49,metalness:.6});
  for(let z=-35;z<=35;z+=10){
   const truss=new THREE.Mesh(new THREE.BoxGeometry(119,.23,.27),trussMat);
   truss.position.set(0,11.45,z);this.scene.add(truss);
  }
  const grate=new THREE.MeshStandardMaterial({color:0x8cab94,roughness:.65,transparent:true,opacity:.28,side:THREE.DoubleSide});
  for(const x of [-33,33]){
   const fence=new THREE.Mesh(new THREE.PlaneGeometry(30,2),grate);
   fence.rotation.y=Math.PI/2;fence.position.set(x,2,0);this.scene.add(fence);
  }
  // Small original destructible-looking practice carts (Rapier dynamics).
  const cratemat=new THREE.MeshStandardMaterial({color:0x775d40,roughness:.83});
  for(let i=0;i<8;i++){
   const x=(i%2?1:-1)*(10+(i%4)*9),z=-32+(i*8.2);
   const body=this.world.createRigidBody(RAPIER.RigidBodyDesc.dynamic().setTranslation(x,1,z).setCanSleep(true));
   this.world.createCollider(RAPIER.ColliderDesc.cuboid(.55,.55,.55).setDensity(.4),body);
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(1.1,1.1,1.1),cratemat);mesh.castShadow=true;
   this.scene.add(mesh);this.props.push({body,mesh});
  }
 }
 createLocal(side:number){
  this.playerSide=side;const spawn=SPAWNS[side];this.localPos.set(spawn.x,spawn.y,spawn.z);
  if(this.body){this.world.removeRigidBody(this.body)}
  this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x,spawn.y,spawn.z));
  this.collider=this.world.createCollider(RAPIER.ColliderDesc.capsule(.60,.30),this.body);
  this.controller=this.world.createCharacterController(.03);
  this.controller.enableAutostep(.40,.24,true);this.controller.enableSnapToGround(.18);
  if(this.enemy)this.scene.remove(this.enemy);
  this.enemy=buildClassicNinja(new THREE.Color(side?0xd8ca5e:0xd24c46));
  this.enemy.scale.setScalar(1.0);this.scene.add(this.enemy);
 }
 setWeapon(index:number){
  if(this.lastWeapon===index)return;this.lastWeapon=index;
  this.weaponCore.clear();
  const w=WEAPONS[index]||WEAPONS[0],compact=w.role.includes('PISTOL'),long=w.role.includes('BOLT');
  const frame=new THREE.MeshStandardMaterial({color:0x343e40,metalness:.58,roughness:.42});
  const plastic=new THREE.MeshStandardMaterial({color:0x222b28,metalness:.12,roughness:.4});
  const accent=new THREE.MeshStandardMaterial({color:0xb8c997,metalness:.15,roughness:.5});
  const piece=(width:number,height:number,depth:number,x:number,y:number,z:number,mat:THREE.Material)=>{
   const mesh=new THREE.Mesh(new THREE.BoxGeometry(width,height,depth),mat);mesh.position.set(x,y,z);mesh.castShadow=true;this.weaponCore.add(mesh);return mesh;
  };
  const length=compact?.28:long?.99:.78;
  piece(.24,.18,length,0,0,-length*.33,frame);
  piece(.20,.25,.16,.0,-.18,-.13,plastic);
  piece(.16,.31,.13,-.03,-.27,-length*.35,accent);
  piece(.12,.07,.14,0,.115,-length*.43,accent);
  piece(.07,.07,length*.60,0,.015,-length*.80,frame);
  if(!compact)piece(.26,.19,.30,0,.013,.20,plastic);
  if(long)piece(.055,.26,.055,0,.16,-.26,frame);
  const armMat=new THREE.MeshStandardMaterial({color:this.playerSide?0x206d9e:0xb23e36,roughness:.34});
  const handMat=new THREE.MeshStandardMaterial({color:0xf2bd53,roughness:.36});
  piece(.20,.17,.42,.22,-.26,.08,armMat);
  piece(.18,.17,.16,.21,-.15,-.13,handMat);
  piece(.19,.17,.43,-.20,-.31,.16,armMat);
  piece(.17,.17,.14,-.19,-.22,-.12,handMat);
 }
 applySnapshot(s:Snapshot,side:number){
  this.playerSide=side;
  const local=s.players.find(p=>p.side===side),remote=s.players.find(p=>p.side!==side);
  if(local){
   if(this.lastWeapon!==local.weapon)this.setWeapon(local.weapon);
   const pos=this.body.translation(),delta=new THREE.Vector3(local.x-pos.x,local.y-pos.y,local.z-pos.z);
   // Server remains final authority. Keep close predictions smooth but pull
   // away instantly from impossible/stale positions after respawn.
   if(delta.length()>5)this.body.setTranslation({x:local.x,y:local.y,z:local.z},true);
   else if(delta.length()>.27)this.body.setTranslation({x:pos.x+delta.x*.20,y:pos.y+delta.y*.20,z:pos.z+delta.z*.20},true);
  }
  if(remote&&this.enemy){
   this.enemy.visible=remote.alive;
   this.enemy.position.lerp(toV(remote),.35);
   const difference=Math.atan2(Math.sin(remote.yaw-this.enemy.rotation.y),Math.cos(remote.yaw-this.enemy.rotation.y));
   this.enemy.rotation.y+=difference*.23;
   const parts=this.enemy.userData;
   const moving=remote.velocity;
   this.walkPhase+=moving*.10;
   for(let i=0;i<2;i++){
    parts.legs[i].rotation.x=Math.sin(this.walkPhase+i*Math.PI)*.45*moving;
    parts.arms[i].rotation.x=-Math.sin(this.walkPhase+i*Math.PI)*.28*moving+.90;
    parts.arms[i].userData.elbow.rotation.x=.35;
   }
   parts.body.rotation.y=remote.ads?.15:0;
  }
  const current=new Set<number>();
  const sphereGeom=new THREE.SphereGeometry(.028,6,5);
  for(const b of s.pellets.slice(-135)){
   current.add(b.id);
   let mesh=this.projectiles.get(b.id);
   if(!mesh){mesh=new THREE.Mesh(sphereGeom,new THREE.MeshBasicMaterial({color:0xf3f0a4}));this.scene.add(mesh);this.projectiles.set(b.id,mesh)}
   mesh.position.set(b.x,b.y,b.z);
  }
  for(const [id,m] of this.projectiles)if(!current.has(id)){this.scene.remove(m);this.projectiles.delete(id)}
 }
 flash(){this.recoil+=.11;this.muzzle.intensity=7}
 predict(dt:number,input:Input){
  if(!this.world||!this.body)return;
  const speed=input.prone?1.4:input.crouch?3:input.sprint?8.7:5.8;
  const f=input.f,s=input.s;
  this.controller.computeColliderMovement(this.collider,{
   x:(Math.cos(input.yaw)*s-Math.sin(input.yaw)*f)*speed*dt,
   y:-.20*dt,
   z:(-Math.sin(input.yaw)*s-Math.cos(input.yaw)*f)*speed*dt
  });
  const movement=this.controller.computedMovement(),pos=this.body.translation();
  this.body.setNextKinematicTranslation({x:pos.x+movement.x,y:pos.y+movement.y,z:pos.z+movement.z});
  this.world.step();this.localPos.copy(toV(this.body.translation()));
 }
 frameDraw(dt:number,input:Input|null,local:any,side:number){
  if(!this.world)return;
  for(const p of this.props){const t=p.body.translation();p.mesh.position.set(t.x,t.y,t.z);
   const q=p.body.rotation();p.mesh.quaternion.set(q.x,q.y,q.z,q.w)}
  if(input){
   const speed=Math.hypot(input.f,input.s);
   this.walkPhase+=dt*speed*(input.sprint?15:10);
   this.eyeBob+=((speed>0?.026*Math.sin(this.walkPhase*2):0)-this.eyeBob)*Math.min(1,dt*12);
   this.camera.rotation.order='YXZ';
   this.camera.rotation.y=input.yaw;this.camera.rotation.x=-input.pitch;this.camera.rotation.z=0;
   const height=local?.prone?-.30:local?.crouch?-.15:0;
   this.camera.position.set(this.localPos.x,this.localPos.y+.52+height+this.eyeBob,this.localPos.z);
   const aim=input.ads?1:0,sprint=input.sprint&&!aim?1:0;
   const targetX=aim?0:.33,targetY=aim?-.24:-.38,targetZ=aim?-.44:-.68;
   this.weapon.position.lerp(new THREE.Vector3(targetX,targetY,targetZ),Math.min(1,dt*(aim?17:12)));
   this.recoil=Math.max(0,this.recoil-dt*.83);
   this.weapon.rotation.x=THREE.MathUtils.lerp(this.weapon.rotation.x,-this.recoil-sprint*.25,Math.min(1,dt*14));
   this.weapon.rotation.z=THREE.MathUtils.lerp(this.weapon.rotation.z,sprint*-.32,Math.min(1,dt*10));
   this.weapon.position.y+=Math.sin(this.walkPhase)*Math.hypot(input.f,input.s)*.012;
   this.camera.fov=THREE.MathUtils.lerp(this.camera.fov,input.ads?68:88,Math.min(1,dt*9));this.camera.updateProjectionMatrix();
  }
  this.muzzle.intensity*=Math.exp(-dt*32);
  this.renderer.render(this.scene,this.camera);
  this.frame++;
  if(this.frame%35===0)$('debug').textContent='DRAW CALLS '+this.renderer.info.render.calls+'  |  TRIANGLES '+this.renderer.info.render.triangles;
 }
 resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight)}
}
