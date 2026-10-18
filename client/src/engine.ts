import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import RAPIER from '@dimforge/rapier3d-compat';
import {MAP,SPAWNS,type Obstacle} from '../../shared/map.ts';
import {WEAPONS,type Input,type Snapshot} from '../../shared/config.ts';
import {buildClassicNinja} from './classic-ninja.js';
import {$} from './screen.ts';
import {settings} from './controls.ts';
import {newMotion,stepMotion,type Motion} from '../../shared/movement.ts';
import {sfx} from './audio.ts';

const COLORS:Record<string,number>={concrete:0x56636a,metal:0x485969,wood:0x846848,net:0x496b63,foam:0x71884d};
const toV=(p:any)=>new THREE.Vector3(p.x,p.y,p.z);
export class Engine{
 scene=new THREE.Scene();
 camera=new THREE.PerspectiveCamera(88,innerWidth/innerHeight,.12,190);
 renderer:THREE.WebGLRenderer;
 world:any;body:any;collider:any;controller:any;enemy:THREE.Group|null=null;
 opponentYaw=0;playerSide=0;localPos=new THREE.Vector3(-18,1,0);
 motion:Motion=newMotion();stance:'stand'|'crouch'|'slide'|'prone'='stand';grounded=true;vy=0;
 cameraHeight=.52;cameraBank=0;strideSpeed=0;
 measuredFPS=60;lowFpsMode=false;maxPixelRatio=Math.min(devicePixelRatio||1,1.20);
 pixelRatio=this.maxPixelRatio;lastQualityChange=0;
 projectiles=new Map<number,THREE.Mesh>();props:{body:any,mesh:THREE.Mesh}[]=[];
 weapon=new THREE.Group();weaponCore=new THREE.Group();muzzle:THREE.PointLight;
 lastWeapon=-1; recoil=0;walkPhase=0;eyeBob=0;frame=0;lastStep=0;
 // Grip preference is individual for each gun, not global.
 gripModes=new Map<number,boolean>(); gripTwoHanded=true;
 // Test-only viewmodel selector, never enabled during ordinary gameplay.
 qaWeaponOverride:number|null=null;
 readonly temp=new THREE.Object3D();
 readonly oldBlockout:THREE.Object3D[]=[];
 readonly oldDecor:THREE.Object3D[]=[];
 renderPos=new THREE.Vector3(-18,1,0);
 lastServerError=0;lastAckLag=0;
 blenderArena:THREE.Group|null=null;
 // Each original Blender weapon model has distinct topology, silhouette,
 // accessories, magazine and first-person LEGO hands.
 weaponModels=new Map<number,THREE.Group>();
 failedWeaponModels:number[]=[];
 weaponModelIds:string[]=[];
 assetState='LOADING 3D ASSETS';
 constructor(){
  this.scene.background=new THREE.Color(0x18252b);
  this.scene.fog=new THREE.FogExp2(0x192b31,.0065);
  this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});
  this.renderer.setPixelRatio(this.maxPixelRatio); // Cap retina rendering to avoid excess frame cost.
  this.renderer.setSize(innerWidth,innerHeight);this.renderer.shadowMap.enabled=true;this.renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.23;
  $('viewport').appendChild(this.renderer.domElement);
  this.scene.add(new THREE.HemisphereLight(0xd3ecf0,0x4d4d32,1.7));
  const lamp=new THREE.DirectionalLight(0xffe7c2,2.2);lamp.position.set(-26,35,18);lamp.castShadow=true;
  lamp.shadow.mapSize.set(1024,1024);lamp.shadow.camera.left=-70;lamp.shadow.camera.right=70;lamp.shadow.camera.top=55;lamp.shadow.camera.bottom=-55;
  this.scene.add(lamp);
  this.muzzle=new THREE.PointLight(0xf2f4c0,0,5);this.muzzle.position.set(.4,-.24,-1.15);this.camera.add(this.muzzle);
  this.camera.add(this.weapon);this.weapon.add(this.weaponCore);this.scene.add(this.camera);
  // Spawn at the final near-hip position to avoid clipping on the first frame.
  this.weapon.position.set(.30,-.36,-.96);
  window.addEventListener('resize',()=>this.resize());
 }
 async init(){
  await RAPIER.init();
  this.world=new RAPIER.World({x:0,y:-20,z:0});this.world.timestep=1/60;
  this.buildMap();this.createLocal(0);this.setWeapon(0);
  await this.loadAuthoredAssets();
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
   mesh.instanceMatrix.needsUpdate=true;this.scene.add(mesh);this.oldBlockout.push(mesh);
  }
  // Industrial lamps, light shafts, painted lane strips, and steel roof beams.
  const stripe=new THREE.MeshStandardMaterial({color:0xb6c75a,emissive:0x405522,emissiveIntensity:.24});
  for(let i=0;i<5;i++){
   const z=-32+i*10.7;
   const light=new THREE.PointLight(0xc4dcb9,26,17,2.6);
   light.position.set((i%2?1:-1)*17,10.4,z);this.scene.add(light);this.oldDecor.push(light);
   const panel=new THREE.Mesh(new THREE.BoxGeometry(5,.055,.65),new THREE.MeshBasicMaterial({color:0xa6dfc4}));
   panel.position.copy(light.position);this.scene.add(panel);this.oldDecor.push(panel);
  }
  for(const z of [-28,0,28]){
   for(const side of [-1,1]){
    const line=new THREE.Mesh(new THREE.BoxGeometry(.10,.012,11),stripe);
    line.position.set(side*9,.03,z);this.scene.add(line);this.oldDecor.push(line);
   }
  }
  const trussMat=new THREE.MeshStandardMaterial({color:0x394b54,roughness:.49,metalness:.6});
  for(let z=-35;z<=35;z+=10){
   const truss=new THREE.Mesh(new THREE.BoxGeometry(119,.23,.27),trussMat);
   truss.position.set(0,11.45,z);this.scene.add(truss);this.oldDecor.push(truss);
  }
  const grate=new THREE.MeshStandardMaterial({color:0x8cab94,roughness:.65,transparent:true,opacity:.28,side:THREE.DoubleSide});
  for(const x of [-33,33]){
   const fence=new THREE.Mesh(new THREE.PlaneGeometry(30,2),grate);
   fence.rotation.y=Math.PI/2;fence.position.set(x,2,0);this.scene.add(fence);this.oldDecor.push(fence);
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
  this.motion=newMotion();this.stance='stand';this.grounded=true;this.vy=0;this.cameraHeight=.52;
  this.renderPos.set(spawn.x,spawn.y,spawn.z);this.lastServerError=0;this.lowFpsMode=false;
  if(this.body){this.world.removeRigidBody(this.body)}
  this.body=this.world.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(spawn.x,spawn.y,spawn.z));
  this.collider=this.world.createCollider(RAPIER.ColliderDesc.capsule(.60,.30),this.body);
  this.controller=this.world.createCharacterController(.03);
  this.controller.enableAutostep(.40,.24,true);this.controller.enableSnapToGround(.18);
  if(this.enemy)this.scene.remove(this.enemy);
  this.enemy=buildClassicNinja(new THREE.Color(side?0xd8ca5e:0xd24c46));
  this.enemy.scale.setScalar(1.0);this.scene.add(this.enemy);
 }
 async loadAuthoredAssets(){
  const loader=new GLTFLoader();
  // Nine original airsoft models are independently authored/exported in
  // Blender; none is a scaled clone of another weapon.
  const requests=[
   loader.loadAsync('/assets/arena.glb?scene=ARENA_COVER_CIRCUIT_C_03'),
   ...WEAPONS.map(w=>loader.loadAsync('/assets/weapons/'+w.id+'.glb'))
  ];
  const results=await Promise.allSettled(requests);
  const stage=results[0];
  if(stage.status==='fulfilled'){
   this.blenderArena=stage.value.scene;
   this.blenderArena.traverse(node=>{
    if((node as THREE.Mesh).isMesh){
     const mesh=node as THREE.Mesh;mesh.receiveShadow=true;
     mesh.castShadow=false;mesh.frustumCulled=true;
    }
   });
   this.scene.add(this.blenderArena);
   for(const placeholder of this.oldBlockout)placeholder.visible=false;
   for(const decor of this.oldDecor)decor.visible=false;
   // Keep only the shared level collision geometry. Local-only prop
   // collisions would cause snapping in multiplayer.
   for(const prop of this.props){
    this.scene.remove(prop.mesh);
    this.world.removeRigidBody(prop.body);
   }
   this.props.length=0;
   this.renderer.shadowMap.enabled=false;
  }else console.warn('Blender arena unavailable; keeping original collision blockout',stage.reason);
  this.weaponModels.clear();this.failedWeaponModels=[];this.weaponModelIds=[];
  for(let i=0;i<WEAPONS.length;i++){
   const res=results[i+1];
   if(res.status==='fulfilled'){
    const model=res.value.scene;
    model.traverse(o=>{
     if((o as THREE.Mesh).isMesh){
      const mesh=o as THREE.Mesh;
      mesh.castShadow=false;
      mesh.frustumCulled=true;
      mesh.receiveShadow=true;
     }
    });
    this.weaponModels.set(i,model);
    this.weaponModelIds.push(WEAPONS[i].id);
   }else{
    console.error('Blender replica missing '+WEAPONS[i].id,res.reason);
    this.failedWeaponModels.push(i);
   }
  }
  this.lastWeapon=-1;this.setWeapon(0);
  this.assetState=stage.status==='fulfilled'&&this.weaponModels.size===WEAPONS.length
   ?'BLENDER ASSETS READY'
   :`ART ${this.weaponModels.size}/${WEAPONS.length} REPLICAS`;
  return this.assetState;
 }
 setGrip(twoHanded:boolean){
  this.gripTwoHanded=twoHanded;
  if(this.lastWeapon>=0)this.gripModes.set(this.lastWeapon,twoHanded);
  // Hide the unused posed mesh hierarchy, not a single hand mesh: all fingers,
  // knuckles and forearm pieces change together without touching shooting logic.
  this.weaponCore.traverse(object=>{
   if(object.name.startsWith('GRIP_ONE_HAND'))object.visible=!twoHanded;
   if(object.name.startsWith('GRIP_TWO_HAND'))object.visible=twoHanded;
  });
 }
 toggleGrip(){
  this.setGrip(!this.gripTwoHanded);
  return this.gripTwoHanded;
 }
 getGripForWeapon(index:number){
  return this.gripModes.get(index)??(index<7);
 }
 setGripForWeapon(index:number,twoHanded:boolean){
  this.gripModes.set(index,twoHanded);
  if(this.lastWeapon===index)this.setGrip(twoHanded);
 }
 setWeapon(index:number){
  if(this.lastWeapon===index)return;this.lastWeapon=index;
  this.weaponCore.clear();
  const w=WEAPONS[index]||WEAPONS[0],compact=w.role.includes('PISTOL'),long=w.role.includes('BOLT');
  const original=this.weaponModels.get(index);
  if(original){
   const model=original.clone(true);
   // Keep the artist-authored gun meshes, orange tip, and anatomical hands
   // together, so they remain physically connected when the viewmodel grows.
   const weaponArt=new THREE.Group();
   weaponArt.name='Scaled FPS weapon and grip poses';
   model.add(weaponArt);
   const gunParts:THREE.Object3D[]=[];
   model.traverse(part=>{
    if((part as THREE.Mesh).isMesh &&
       (part.name.startsWith('AUTHORED ') ||
        part.name.startsWith('AIRSOFT_ORANGE_TIP_07') ||
        part.name.startsWith('Orange tip /'))){
     gunParts.push(part);
    }
   });
   // The previous rig scaled the gun while leaving hands behind: the
   // gripping fingers could never stay on the grip. Keep both grip hierarchies
   // under the SAME transform as the artist-authored weapon and orange tip.
   const gripRoots:THREE.Object3D[]=[];
   model.traverse(part=>{
    if(part.name.startsWith('GRIP_ONE_HAND') ||
       part.name.startsWith('GRIP_TWO_HAND'))gripRoots.push(part);
   });
   for(const part of gunParts)weaponArt.attach(part);
   for(const grip of gripRoots)weaponArt.attach(grip);
   // Closer, fuller COD-style first-person framing, including both grip rigs.
   weaponArt.scale.setScalar(index>=7?1.48:1.42);
   // Preserve the weapon-type tuning while moving the whole assembly toward the camera.
   const scale=index===6?.62:index===5?.70:index>=7?.83:index===4?.76:.70;
   model.scale.setScalar(gunParts.length?scale:scale*1.12);
   model.position.set(.06,-.03,-.03);
   this.weaponCore.add(model);
   // Rifles / shotguns / snipers default to two hands, sidearms to one.
   this.setGrip(this.gripModes.get(index)??(index<7));
   return;
  }
  // This temporary emergency proxy is used only if an asset failed to load.
  // Normal release CI rejects missing Blender weapon assets.
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
 applySnapshot(s:Snapshot,side:number,latestSeq=0){
  this.playerSide=side;
  const local=s.players.find(p=>p.side===side),remote=s.players.find(p=>p.side!==side);
  if(local){
   const presentedWeapon=this.qaWeaponOverride??local.weapon;
   if(this.lastWeapon!==presentedWeapon)this.setWeapon(presentedWeapon);
   const pos=this.body.translation();
   const dx=local.x-pos.x,dy=local.y-pos.y,dz=local.z-pos.z;
   const error=Math.hypot(dx,dy,dz);
   this.lastServerError=error;
   this.lastAckLag=Math.max(0,latestSeq-(local.ackSeq||latestSeq));
   // On slow GPUs fixed-step client prediction cannot keep up with 60Hz
   // server motion. Trust authoritative snapshots directly instead of
   // teleporting the FPS camera after every delayed render frame.
   if(this.lowFpsMode){
    this.body.setTranslation({x:local.x,y:local.y,z:local.z},true);
    this.localPos.set(local.x,local.y,local.z);
    this.strideSpeed=Math.max(0,local.velocity)*11.5;
    this.motion.slideTime=local.sliding ? .20 : 0;
   }else if(error>Math.max(5,Math.min(12,2+this.lastAckLag*.36))){
    // Large desync / respawn: restore server position without resetting the
    // current velocity each time (that reset created repeated sprint stalls).
    this.body.setTranslation({x:local.x,y:local.y,z:local.z},true);
    this.localPos.set(local.x,local.y,local.z);
    if(error>12||!local.alive)this.renderPos.set(local.x,local.y,local.z);
   }else if(error>1.8&&this.motion.slideTime<=0&&this.strideSpeed<3){
    // Only very small resting correction. No chasing of delayed snapshots
    // while the user is moving, walking, sprinting or sliding.
    const c=.025;
    this.body.setTranslation({x:pos.x+dx*c,y:pos.y+dy*c,z:pos.z+dz*c},true);
   }
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
 setLocalStance(kind:'stand'|'crouch'|'slide'|'prone'){
  if(kind===this.stance)return;
  const poses={stand:[.60,0],crouch:[.35,-.25],slide:[.21,-.39],prone:[.14,-.46]};
  const next=poses[kind];
  if(next[0]>poses[this.stance][0]){
   const pos=this.body.translation();
   const ceiling=this.world.castRay(new RAPIER.Ray({x:pos.x,y:pos.y-.30,z:pos.z},{x:0,y:1,z:0}),
    next[0]+.65,true,RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);
   if(ceiling)return;
  }
  this.world.removeCollider(this.collider,true);
  this.collider=this.world.createCollider(RAPIER.ColliderDesc.capsule(next[0],.30)
   .setTranslation(0,next[1],0),this.body);
  this.stance=kind;
 }
 predict(dt:number,input:Input){
  if(!this.world||!this.body||this.lowFpsMode)return;
  const movement=stepMotion(this.motion,input,dt,this.grounded);
  if(movement.started)sfx('slide');
  const sliding=movement.sliding;
  const stance=input.prone&&!sliding?'prone':sliding?'slide':input.crouch?'crouch':'stand';
  this.setLocalStance(stance);
  if(input.jump&&this.grounded&&!input.prone&&(!input.crouch||movement.ended)){
   this.vy=Math.sqrt(2*20*1.2);this.grounded=false;
  }
  this.vy=Math.max(-25,this.vy-20*dt);
  const wantX=this.motion.vx*dt,wantZ=this.motion.vz*dt;
  this.controller.computeColliderMovement(this.collider,{x:wantX,y:this.vy*dt,z:wantZ});
  const delta=this.controller.computedMovement(),pos=this.body.translation();
  if(sliding&&Math.hypot(delta.x,delta.z)<Math.hypot(wantX,wantZ)*.22)this.motion.slideTime=0;
  this.body.setNextKinematicTranslation({x:pos.x+delta.x,y:pos.y+delta.y,z:pos.z+delta.z});
  this.grounded=this.controller.computedGrounded();
  if(this.grounded&&this.vy<0)this.vy=0;
  this.world.step();this.localPos.copy(toV(this.body.translation()));
  this.strideSpeed=movement.speed;
 }

 frameDraw(dt:number,input:Input|null,local:any,side:number){
  if(!this.world)return;
  for(const p of this.props){const t=p.body.translation();p.mesh.position.set(t.x,t.y,t.z);
   const q=p.body.rotation();p.mesh.quaternion.set(q.x,q.y,q.z,q.w)}
  if(input){
   const speed=Math.hypot(input.f,input.s);
   this.walkPhase+=dt*speed*(input.sprint?19:12);
   this.eyeBob+=((this.motion.slideTime>0?0:speed>0?.022*Math.sin(this.walkPhase*2):0)-this.eyeBob)*Math.min(1,dt*12);
   this.camera.rotation.order='YXZ';
   this.camera.rotation.y=input.yaw;this.camera.rotation.x=input.pitch;this.camera.rotation.z=0;
   const sliding=this.motion.slideTime>0||local?.sliding===true;
   const sprinting=!sliding&&input.sprint&&input.f>.28&&!input.ads&&!input.crouch;
   const targetEye=sliding?-.01:local?.prone?-.20:local?.crouch?.27:.52;
   this.cameraHeight=THREE.MathUtils.damp(this.cameraHeight,targetEye,sliding?18:12,dt);
   // Smooth sub-frame motion independently from the fixed-step Rapier state,
   // avoiding stair-step flicker when the monitor draws faster than 60fps.
   const separation=this.renderPos.distanceTo(this.localPos);
   if(this.lowFpsMode||separation>3)this.renderPos.copy(this.localPos);
   else this.renderPos.lerp(this.localPos,1-Math.exp(-dt*33));
   let eyeY=this.renderPos.y+this.cameraHeight+this.eyeBob*(sliding?.12:1);
   // Use the collision floor (rather than visual paint strips) as camera
   // clearance so the near plane never passes through flooring on a slide.
   // A downwards ray was also hitting dynamic boxes, mezzanines and trim.
   // That falsely raised the camera while walking by cover, making the
   // whole floor seem to jump. The player's capsule already handles ground.
   eyeY=Math.max(eyeY,this.renderPos.y+.21,.24);
   this.camera.position.set(this.renderPos.x,eyeY,this.renderPos.z);
   const lean=sliding?.045:(input.s-.1)*.012;
   this.cameraBank=THREE.MathUtils.damp(this.cameraBank,lean,sliding?12:9,dt);
   this.camera.rotation.z=this.cameraBank;
   const aim=input.ads&&!sliding&&!sprinting?1:0,sprint=sprinting?1:0;
   const targetX=aim?0:sprint?.33:.30;
   // Center model-specific optic heights on the true reticle in ADS.
   const aimingY=this.lastWeapon>=7?-.125:this.lastWeapon===6?-.18:
    this.lastWeapon===5?-.15:-.19;
   const targetY=aim?aimingY:sliding?-.48:sprint?-.45:-.36;
   // The rear stock on scoped models extends back 0.76m before scale.
   // Don't move it through the camera near-plane (old model was at -.44).
   const targetZ=aim?-.85:sliding?-1.02:sprint?-1.08:-.96;
   this.weapon.position.lerp(new THREE.Vector3(targetX,targetY,targetZ),Math.min(1,dt*(aim?17:12)));
   this.recoil=Math.max(0,this.recoil-dt*.83);
   this.weapon.rotation.x=THREE.MathUtils.lerp(this.weapon.rotation.x,-this.recoil-sprint*.33+(sliding?-.16:0),Math.min(1,dt*14));
   this.weapon.rotation.z=THREE.MathUtils.lerp(this.weapon.rotation.z,sprint*-.32+(sliding?.15:0),Math.min(1,dt*10));
   this.weapon.rotation.y=THREE.MathUtils.lerp(this.weapon.rotation.y,aim?0:-.07,Math.min(1,dt*10));
   this.weapon.position.y+=Math.sin(this.walkPhase)*Math.hypot(input.f,input.s)*(sliding?.003:.012);
   const requestedFov=aim?Math.max(55,settings.fov-18):settings.fov+(sliding?7:sprinting?5:0);
   const nextFov=THREE.MathUtils.lerp(this.camera.fov,requestedFov,Math.min(1,dt*7));
   if(Math.abs(nextFov-this.camera.fov)>.002){this.camera.fov=nextFov;this.camera.updateProjectionMatrix();}
  }
  this.muzzle.intensity*=Math.exp(-dt*32);
  this.renderer.render(this.scene,this.camera);
  this.frame++;
  if(this.frame%35===0)$('debug').textContent='DRAW CALLS '+this.renderer.info.render.calls+'  |  TRIANGLES '+this.renderer.info.render.triangles+'  |  FPS '+Math.round(this.measuredFPS)+'  |  '+this.assetState+'  |  SYNC '+this.lastServerError.toFixed(2)+'m'+(this.lowFpsMode?'  |  SERVER MOTION':'')+'  |  NET LAG '+this.lastAckLag;
 }
 adjustQuality(fps:number){
  this.measuredFPS=fps;
  if(this.assetState==='LOADING 3D ASSETS')return;
  // Hysteresis avoids flipping back and forth at the framerate boundary.
  if(fps<27)this.lowFpsMode=true;
  else if(fps>43)this.lowFpsMode=false;
  const now=performance.now();
  if(now-this.lastQualityChange<4500)return;
  // Software/WebGL and integrated GPUs can struggle with a giant arena GLB.
  // Reduce internal shading resolution first; don't remove any Blender art.
  if(fps<38&&this.pixelRatio>.72){
   this.pixelRatio=Math.max(.72,this.pixelRatio-.18);
   this.renderer.setPixelRatio(this.pixelRatio);
   // Shadows remain consistently disabled on the Blender scene.
   this.lastQualityChange=now;
  }else if(fps>58&&this.pixelRatio<this.maxPixelRatio){
   this.pixelRatio=Math.min(this.maxPixelRatio,this.pixelRatio+.12);
   this.renderer.setPixelRatio(this.pixelRatio);
   // Never toggle moving shadows back on while playing.
   this.lastQualityChange=now;
  }
 }
 resize(){this.camera.aspect=innerWidth/innerHeight;this.camera.updateProjectionMatrix();this.renderer.setSize(innerWidth,innerHeight)}
}
