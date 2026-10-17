// CHANGED: v0.8.9 FULL-SCREEN CINEMATIC DOJO MAIN MENU.
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
 const wood=mat(0x1d2025,.76),woodLight=mat(0x353037,.64),lacquer=mat(0x451f23,.45),
  black=mat(0x090e15,.88),gold=mat(0xc89a53,.34,.48),tile=mat(0x30343d,.69),
  ember=mat(0xffb65c,.31,.1,0xff8b31,1.25),jade=mat(0x72e1bc,.35,.12,0x21b986,.8);
 // Raised ceremonial dueling floor, a geometric octagon with inset trim.
 addMesh(scene,new THREE.CylinderGeometry(3.95,4.22,.38,8),wood,0,-.31,-.65);
 addMesh(scene,new THREE.CylinderGeometry(3.76,3.92,.08,8),tile,0,-.10,-.65);
 const ring=addMesh(scene,new THREE.TorusGeometry(3.43,.028,6,96),gold,0,-.038,-.65);
 ring.rotation.x=Math.PI/2;
 for(let i=0;i<8;i++){
  const a=(i+.5)*Math.PI/4;
  const plate=block(scene,.36,.032,.12,Math.sin(a)*3.3,-.048,Math.cos(a)*3.3-.65,gold);
  plate.rotation.y=a;
 }
 for(let x=-3;x<=3;x++)for(let z=-3;z<=2;z++){
  if(Math.hypot(x*.88,(z+.4)*.82)>3.25)continue;
  block(scene,.82,.022,.77,x*.88,-.032,z*.82-.65,(x+z)%2?woodLight:wood);
 }
 // Actual modeled ceremonial dojo / gate, kept behind the fighter silhouettes.
 const back=-4.8;
 block(scene,17.1,.28,.42,0,4.12,back,lacquer); // CHANGED: wide full-screen dojo façade
 block(scene,17.8,.14,.61,0,4.38,back,black); // CHANGED: extend roof framing
 block(scene,18.2,.13,.5,0,4.58,back,gold); // CHANGED: full-width gold trim
 for(const x of [-8.40,-4.55,4.55,8.40]){ // CHANGED: additional exterior columns
  block(scene,.34,4.9,.43,x,2.02,back,lacquer);
  block(scene,.42,.12,.5,x,3.87,back,gold);
  block(scene,.47,.12,.5,x,.40,back,gold);
 }
 // Giant segmented shoji panels plus layered roof silhouette.
 for(let i=-7;i<=7;i++){ // CHANGED: seamless wall across ultra-wide displays
  const x=i*1.13;
  block(scene,1.05,2.78,.13,x,2.03,back-.28,mat(0x283239,.85));
  block(scene,.98,2.69,.03,x,2.03,back-.17,mat(0x6b6657,.7,0,0x987848,.16));
  for(const h of [1.38,2.03,2.69])block(scene,.98,.038,.05,x,h,back-.12,black);
  block(scene,.046,2.73,.045,x,2.03,back-.10,wood);
 }
 // Architectural roof cap / dramatic dark outline.
 block(scene,18.5,.28,1.07,0,4.82,back-.26,wood); // CHANGED: fill the entire hero backdrop
 block(scene,19,.12,.92,0,5.03,back-.25,lacquer); // CHANGED: widescreen roof cap
 for(const side of [-1,1]){
  block(scene,.33,3.3,.38,side*3.87,1.65,-3.84,wood);
  const metal=side<0?ember:jade;
  const lantern=addMesh(scene,new THREE.BoxGeometry(.47,.74,.46),metal,side*3.87,2.57,-3.56);
  block(scene,.63,.12,.60,side*3.87,3.02,-3.56,gold);
  block(scene,.63,.12,.60,side*3.87,2.12,-3.56,gold);
  const lamp=new THREE.PointLight(side<0?0xff895f:0x4adcb1,19,6,2);
  lamp.position.set(side*3.87,2.56,-3.15);scene.add(lamp);
 }
 for(const [x,z] of [[-1.36,.90],[1.36,.90]]){
  addMesh(scene,new THREE.CylinderGeometry(.81,.9,.18,32),woodLight,x,-.008,z);
  const metal=x<0?mat(0x982f37,.4,.25,0x8f202b,.22):mat(0x246e57,.4,.25,0x198b67,.2);
  addMesh(scene,new THREE.TorusGeometry(.70,.026,6,64),metal,x,.097,z).rotation.x=Math.PI/2;
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
 scene.add(particles);return {particles};
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
 scene.fog=new THREE.FogExp2(0x0b1018,.044);
 const camera=new THREE.PerspectiveCamera(35,1,.1,80);
 camera.position.set(0,3.35,11.8);camera.lookAt(0,1.75,-.50);
 renderer.setClearColor(0x000000,0);
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.55));
 renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.toneMapping=THREE.ACESFilmicToneMapping;
 renderer.toneMappingExposure=1.35;
 renderer.shadowMap.enabled=true;
 renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 renderer.domElement.className='menu-3d-canvas';
 renderer.domElement.setAttribute('aria-hidden','true');
 host.appendChild(renderer.domElement);
 scene.add(new THREE.HemisphereLight(0xb2c9d8,0x201a1b,2.25));
 const warm=new THREE.SpotLight(0xffbf83,62,24,Math.PI/4,.78);
 warm.position.set(-4.9,7.2,5.5);warm.target.position.set(-1.5,1,-.5);
 warm.castShadow=true;warm.shadow.mapSize.set(512,512);
 scene.add(warm,warm.target);
 const cold=new THREE.SpotLight(0x86f5d4,58,24,Math.PI/4,.7);
 cold.position.set(4.5,7,4.5);cold.target.position.set(1.5,1,-.7);
 scene.add(cold,cold.target);
 const rim=new THREE.DirectionalLight(0xb8b2fa,2);
 rim.position.set(0,4,-5);scene.add(rim);
 const {particles}=makeDojo(scene);
 const crimson=prepareFighter(CRIMSON,-1.36,.13),verdant=prepareFighter(VERDANT,1.36,-.18);
 scene.add(crimson.root,verdant.root);
 host.classList.add('menu-3d-ready');
 let raf=0,last=0,elapsed=0,wasVisible=true;
 const resize=()=>{
  const w=Math.max(1,host.clientWidth),h=Math.max(1,host.clientHeight);
  if(!w||!h)return;
  renderer.setSize(w,h,false);camera.aspect=w/h;
  camera.fov=(w/h)<.86?45:(w/h)<1.14?39:35;
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
   fighter.root.rotation.y=(i===0?.13:-.18)+(reduceMotion?0:Math.sin(phase*.38)*.10);
  }
  if(!reduceMotion){
   particles.rotation.y=Math.sin(elapsed*.12)*.05;
   particles.position.y=Math.sin(elapsed*.40)*.05;
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
  renderer.dispose();renderer.domElement.remove();
 };
}
