// CHANGED: v0.8.11 DOJO FADES INTO DARKNESS — no boxed-in blue room.
// Uses the actual arena minifigure geometry, actual roster colors, and actual
// anime animation evaluator. This menu scene is visual-only: no combat state.
import * as THREE from '/vendor/three.module.js';
import {buildClassicNinja} from './classic-ninja.js';
import {captureCombatRest,sampleCombatPose,applyCombatPose} from './combat-poses.js';

const CRIMSON=0xc63633,VERDANT=0x238550;
const reduceMotion=matchMedia('(prefers-reduced-motion: reduce)').matches;
const mat=(color,roughness=.48,metalness=.05,emissive=0x000000,intensity=0)=>
 new THREE.MeshStandardMaterial({color,roughness,metalness,emissive,emissiveIntensity:intensity});
const addMesh=(parent,geometry,material,x=0,y=0,z=0)=>{
 const mesh=new THREE.Mesh(geometry,material);mesh.position.set(x,y,z);
 mesh.castShadow=true;mesh.receiveShadow=true;parent.add(mesh);return mesh;
};
const block=(parent,w,h,d,x,y,z,material)=>addMesh(parent,new THREE.BoxGeometry(w,h,d),material,x,y,z);
const glow=(color,intensity=2)=>new THREE.MeshBasicMaterial({color,transparent:true,opacity:.95,depthWrite:false,blending:THREE.AdditiveBlending});
function makeDojo(scene){
 // CHANGED: Warm, neutral charcoal materials replace the flat navy/blue room.
 const wood=mat(0x1c1817,.85),woodLight=mat(0x302725,.82),lacquer=mat(0x361d1b,.56),
  black=mat(0x0d0b0b,.91),gold=mat(0xb89158,.47,.27),tile=mat(0x292625,.81),
  ember=mat(0xffbe75,.42,.06,0xff8b36,1.55),jade=mat(0xd3b582,.55,.05,0x947548,.30);
 // Raised ceremonial dueling floor, a geometric octagon with inset trim.
 addMesh(scene,new THREE.CylinderGeometry(6.03,6.28,.38,8),wood,0,-.31,-.65);
 addMesh(scene,new THREE.CylinderGeometry(5.83,5.98,.08,8),tile,0,-.10,-.65);
 const ring=addMesh(scene,new THREE.TorusGeometry(5.55,.028,6,96),gold,0,-.038,-.65);
 ring.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){
  const a=(i+.5)*Math.PI/4;
  const plate=block(scene,.36,.032,.12,Math.sin(a)*5.38,-.048,Math.cos(a)*5.38-.65,gold);
  plate.rotation.y=a;
 }
 for(let x=-6;x<=6;x++)for(let z=-4;z<=4;z++){ // CHANGED: extended dojo platform
  if(Math.hypot(x*.88,(z+.4)*.82)>5.50)continue;
  block(scene,.82,.022,.77,x*.88,-.032,z*.82-.65,(x+z)%2?woodLight:wood);
 }

 // CHANGED: A partial dojo emerges from darkness, rather than a wall-sized room.
 // The outer shoji panels become translucent and dissolve toward the scene fog.
 const back=-4.8;
 block(scene,12.8,.24,.42,0,4.12,back,lacquer);
 block(scene,13.4,.12,.61,0,4.38,back,black);
 block(scene,13.8,.075,.5,0,4.58,back,gold);
 for(const x of [-4.55,4.55]){
  block(scene,.29,4.35,.38,x,2.02,back,lacquer);
  block(scene,.38,.09,.5,x,3.87,back,gold);
  block(scene,.40,.09,.5,x,.40,back,gold);
 }
 // CHANGED: Fade structural panels out at both sides, avoiding a hard backdrop edge.
 for(let i=-7;i<=7;i++){
  const fade=Math.max(0,1-Math.pow(Math.abs(i)/7,1.9));
  if(fade<.025)continue;
  const x=i*1.13;
  const backing=mat(0x131110,.95);
  backing.transparent=true;backing.opacity=.50*fade;backing.depthWrite=false;
  block(scene,1.05,2.78,.13,x,2.03,back-.28,backing);
  const paper=mat(0x766348,.95,0,0x67451c,.10);
  paper.transparent=true;paper.opacity=.59*fade;paper.depthWrite=false;
  block(scene,.98,2.69,.03,x,2.03,back-.17,paper);
  const ink=mat(0x13100f,.94);
  ink.transparent=true;ink.opacity=.88*fade;ink.depthWrite=false;
  for(const h of [1.38,2.03,2.69])block(scene,.98,.038,.05,x,h,back-.12,ink);
  block(scene,.046,2.73,.045,x,2.03,back-.10,ink);
 }
 // A shorter roof silhouette gets lost in the shadow at the edges.
 block(scene,13.9,.23,1.07,0,4.82,back-.26,wood);
 block(scene,14.4,.10,.92,0,5.03,back-.25,lacquer);
 for(const side of [-1,1]){
  block(scene,.33,3.3,.38,side*3.87,1.65,-3.84,wood);
  const lantern=addMesh(scene,new THREE.BoxGeometry(.47,.74,.46),side<0?ember:jade,side*3.87,2.57,-3.56);
  block(scene,.63,.12,.60,side*3.87,3.02,-3.56,gold);
  block(scene,.63,.12,.60,side*3.87,2.12,-3.56,gold);
  // CHANGED: Both lanterns emit warm light; green stays a subtle fighter accent.
  const lamp=new THREE.PointLight(side<0?0xffb36a:0xf4cc91,side<0?24:17,8,2);
  lamp.position.set(side*3.87,2.56,-3.15);scene.add(lamp);
 }
 // CHANGED: Each fighter's podium follows its screen-responsive position.
 const platforms=[];
 for(const x of [-4.55,4.55]){
  const platform=new THREE.Group();
  platform.position.set(x,0,.90);
  scene.add(platform);
  addMesh(platform,new THREE.CylinderGeometry(.81,.9,.18,32),woodLight,0,-.008,0);
  const metal=x<0?mat(0x982f37,.4,.25,0x8f202b,.22):mat(0x246e57,.4,.25,0x198b67,.2);
  addMesh(platform,new THREE.TorusGeometry(.70,.026,6,64),metal,0,.097,0).rotation.x=Math.PI/2;
  platforms.push(platform);
 }
 // Light airborne motes establish movement even when models are idle.
 const count=105,positions=new Float32Array(count*3),colors=new Float32Array(count*3);
 for(let i=0;i<count;i++){
  const k=i*3;positions[k]=(Math.random()-.5)*10;
  positions[k+1]=Math.random()*5;positions[k+2]=(Math.random()-.5)*6-1.3;
  const c=new THREE.Color(i%3===0?0xffd88a:i%3===1?0xff937b:0x8ce1d8);
  colors[k]=c.r;colors[k+1]=c.g;colors[k+2]=c.b;
 }
 const dotsGeo=new THREE.BufferGeometry();
 dotsGeo.setAttribute('position',new THREE.BufferAttribute(positions,3));
 dotsGeo.setAttribute('color',new THREE.BufferAttribute(colors,3));
 const particles=new THREE.Points(dotsGeo,new THREE.PointsMaterial({size:.042,transparent:true,opacity:.75,vertexColors:true,depthWrite:false,sizeAttenuation:true}));
 scene.add(particles);return {particles,platforms};
}
function prepareFighter(color,x,twist){
 const root=new THREE.Group();root.position.set(x,.13,.82);root.rotation.y=twist;
 const visual=buildClassicNinja(new THREE.Color(color));root.add(visual);
 visual.scale.setScalar(1.18);
 const rig={root,visual,attack:null,attackTime:0,block:false,moving:0,stun:0,runTime:0,combatClock:0};
 captureCombatRest(rig);
 return rig;
}
// Exported for the app to stop animation work on character selection / combat.
export function mountMenuShowcase(host){
 if(!host)return ()=>{};
 let renderer;
 try{
  renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:'low-power'});
 }catch(err){
  console.warn('3D menu disabled; retaining cinematic menu fallback.',err);
  host.classList.add('menu-3d-unavailable');return ()=>{};
 }
 const scene=new THREE.Scene();
 // CHANGED: Charcoal distance fog absorbs the open edges of the dojo.
 scene.background=new THREE.Color(0x0b0a0a);
 scene.fog=new THREE.FogExp2(0x0b0a0a,.067);
 const camera=new THREE.PerspectiveCamera(35,1,.1,80);
 camera.position.set(0,3.35,11.8);camera.lookAt(0,1.75,-.50);
 renderer.setClearColor(0x0b0a0a,1); // CHANGED: no blue/translucent room behind the scene
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.55));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.35;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.className='menu-3d-canvas';
 renderer.domElement.setAttribute('aria-hidden','true');
 host.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xc9b8a2,0x17100d,1.85)); // CHANGED: warm neutral fill
 const warm=new THREE.SpotLight(0xffc68e,69,24,Math.PI/4,.78);
 warm.position.set(-4.9,7.2,5.5);warm.target.position.set(-1.5,1,-.5);
 warm.castShadow=true;warm.shadow.mapSize.set(512,512);
 scene.add(warm,warm.target);
 const cold=new THREE.SpotLight(0xd9c7a7,41,24,Math.PI/4,.7); // CHANGED: remove cyan room wash
 cold.position.set(4.5,7,4.5);cold.target.position.set(1.5,1,-.7);
 scene.add(cold,cold.target);
 const rim=new THREE.DirectionalLight(0xe9c6a3,1.55); // CHANGED: warm backlight, no blue glow
 rim.position.set(0,4,-5);scene.add(rim);

 // CHANGED: Soft atmospheric haze, not a visible background box or plane.
 const haze=[];let hazeTexture=null;
 try{
  const cv=document.createElement('canvas');cv.width=cv.height=128;
  const ctx=cv.getContext('2d');
  if(ctx){
   const grad=ctx.createRadialGradient(64,64,0,64,64,64);
   grad.addColorStop(0,'rgba(247,196,130,0.40)');
   grad.addColorStop(.42,'rgba(165,130,105,0.15)');
   grad.addColorStop(1,'rgba(0,0,0,0)');
   ctx.fillStyle=grad;ctx.fillRect(0,0,128,128);
   hazeTexture=new THREE.CanvasTexture(cv);
   for(const [x,y,z,w,h,opacity] of [
    [-5.9,2.1,-4.25,6.3,3.4,.46],
    [5.9,2.2,-4.30,6.3,3.6,.40],
    [0,1.0,-4.40,9.4,2.3,.21]]){
    const sprite=new THREE.Sprite(new THREE.SpriteMaterial({
     map:hazeTexture,transparent:true,opacity,depthWrite:false,
     blending:THREE.AdditiveBlending}));
    sprite.position.set(x,y,z);sprite.scale.set(w,h,1);scene.add(sprite);haze.push(sprite);
   }
  }
 }catch(err){console.warn('Menu haze disabled:',err);}
 const {particles,platforms}=makeDojo(scene);
 // CHANGED: Place fighters outside the huge centered title, without resizing their meshes.
 const crimson=prepareFighter(CRIMSON,-4.55,.33),verdant=prepareFighter(VERDANT,4.55,-.33);
 scene.add(crimson.root,verdant.root);
 host.classList.add('menu-3d-ready');
 let raf=0,last=0,elapsed=0,wasVisible=true;
 const resize=()=>{
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.fov=(w/h)<.86?45:(w/h)<1.14?39:35;
  // CHANGED: Keep both figures visible on tablets/phones; desktop uses title-flanking spacing.
  const ratio=w/h;
  const spacing=ratio<.85?1.65:ratio<1.25?2.65:ratio<1.6?3.52:4.55;
  crimson.root.position.x=-spacing;verdant.root.position.x=spacing;
  platforms[0].position.x=-spacing;platforms[1].position.x=spacing;
  camera.updateProjectionMatrix();
 };
 const resizer=typeof ResizeObserver!=='undefined'?new ResizeObserver(resize):null;
 resizer?.observe(host);window.addEventListener('resize',resize);
 resize();
 const fighters=[crimson,verdant];
 const animate=(now)=>{
  raf=requestAnimationFrame(animate);
  const visible=document.getElementById('lobby')?.classList.contains('show')&&!document.hidden;
  if(!visible){last=now;return;}
  const dt=Math.min(.05,Math.max(0,(now-last)/1000||.016));last=now;
  if(!reduceMotion)elapsed+=dt;
  for(let i=0;i<fighters.length;i++){
   const fighter=fighters[i];const phase=elapsed+i*2.6;
   fighter.combatClock=phase;fighter.runTime=phase*1.1;
   // Every several seconds each fighter performs an actual in-game strike.
   const cycle=(elapsed+i*3.6)%8.5;
   const move=i===0?{kind:'light',stage:4,len:.5}:{kind:'light',stage:3,len:.69};
   const showStrike=!reduceMotion&&cycle>=3.15&&cycle<3.15+move.len;
   if(showStrike){
    if(!fighter.attack)fighter.attack={...move};
    fighter.attackTime=cycle-3.15;
   }else{fighter.attack=null;fighter.attackTime=0;}
   const pose=sampleCombatPose(fighter,dt);
   if(pose)applyCombatPose(fighter,pose);
   const bob=reduceMotion?0:Math.sin(phase*1.65)*.036;
   fighter.root.position.y=.13+bob;
   // CHANGED: Both fighters face slightly inward during their idle and showcase strikes.
   fighter.root.rotation.y=(i===0?.33:-.33)+(reduceMotion?0:Math.sin(phase*.38)*.07);
  }
  if(!reduceMotion){
   particles.rotation.y=Math.sin(elapsed*.12)*.05;
   particles.position.y=Math.sin(elapsed*.40)*.05;
   for(let i=0;i<haze.length;i++)haze[i].position.y+=(Math.sin(elapsed*.31+i)-Math.sin((elapsed-dt)*.31+i))*.18;
   camera.position.x=Math.sin(elapsed*.21)*.18;
   camera.lookAt(0,1.72,-.45);
  }
  renderer.render(scene,camera);
 };
 raf=requestAnimationFrame(animate);
 return ()=>{
  cancelAnimationFrame(raf);
  resizer?.disconnect();
  window.removeEventListener('resize',resize);
  scene.traverse(object=>{
   if(object.geometry)object.geometry.dispose();
   if(object.material){const mats=Array.isArray(object.material)?object.material:[object.material];for(const m of mats)m.dispose();}
  });
  hazeTexture?.dispose(); // CHANGED: release procedural haze texture.
  renderer.dispose();renderer.domElement.remove();
 };
}
