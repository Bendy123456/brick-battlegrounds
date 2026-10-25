import * as THREE from 'three';
import {createFighter,animateFighter} from './fartnite-world.js';

// Separate original 3D showroom in the existing scene and renderer.
// The single-player game world stays untouched and is visible when a match begins.
const ORIGIN=1600;
function mat(hex,options={}){return new THREE.MeshStandardMaterial({color:hex,roughness:.48,metalness:.17,...options})}
export function createLobbyShowroom(scene){
 const root=new THREE.Group();root.position.set(ORIGIN,0,0);scene.add(root);
 const bg=new THREE.Mesh(new THREE.PlaneGeometry(120,70),new THREE.ShaderMaterial({
  depthWrite:false,side:THREE.DoubleSide,
  vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'varying vec2 vUv;void main(){vec3 low=vec3(.012,.048,.15),top=vec3(.042,.118,.30);vec3 c=mix(low,top,smoothstep(0.,1.,vUv.y));c+=vec3(.01,.08,.12)*exp(-pow((vUv.x-.5)*3.,2.)-pow((vUv.y-.45)*3.5,2.));gl_FragColor=vec4(c,1.);}'
 }));
 bg.position.set(0,9,-17);root.add(bg);
 const floor=new THREE.Mesh(new THREE.CircleGeometry(32,90),mat('#16233e',{metalness:.32,roughness:.31}));
 floor.rotation.x=-Math.PI/2;floor.position.y=-.22;floor.receiveShadow=true;root.add(floor);
 const floorOuter=new THREE.Mesh(new THREE.RingGeometry(15,18,80),new THREE.MeshBasicMaterial({color:'#42609a',transparent:true,opacity:.24,side:THREE.DoubleSide}));
 floorOuter.rotation.x=-Math.PI/2;floorOuter.position.y=-.18;root.add(floorOuter);
 const stageGlow=new THREE.Mesh(new THREE.PlaneGeometry(34,22),new THREE.MeshBasicMaterial({color:'#123e89',transparent:true,opacity:.08,depthWrite:false}));
 stageGlow.position.set(0,4,-14);root.add(stageGlow);
 const points=[-3.3,0,3.3],fighters=[],lamps=[],halos=[],rotators=[];
 let auraColor='#42ebff',skin=0;
 for(let i=0;i<3;i++){
  const x=points[i],front=i===1?2.2:0;
  const stand=new THREE.Group();stand.position.set(x,0,front);root.add(stand);
  const base=new THREE.Mesh(new THREE.CylinderGeometry(i===1?1.87:1.45,i===1?1.93:1.52,.3,46),mat('#314968',{metalness:.6,roughness:.22}));
  base.position.y=-.03;base.receiveShadow=true;stand.add(base);
  const bottom=new THREE.Mesh(new THREE.CylinderGeometry(i===1?1.72:1.32,i===1?1.72:1.32,.09,46),new THREE.MeshBasicMaterial({color:'#6b98b4'}));
  bottom.position.y=.11;stand.add(bottom);
  const aura=new THREE.Mesh(new THREE.CircleGeometry(i===1?1.58:1.20,48),new THREE.MeshBasicMaterial({color:'#42ebff',transparent:true,opacity:i===1?.62:.4,side:THREE.DoubleSide,depthWrite:false}));
  aura.rotation.x=-Math.PI/2;aura.position.y=.165;stand.add(aura);halos.push(aura);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(i===1?1.59:1.21,.055,7,48),new THREE.MeshBasicMaterial({color:'#bdfbff',transparent:true,opacity:.93}));
  ring.rotation.x=Math.PI/2;ring.position.y=.18;stand.add(ring);rotators.push(ring);
  const beam=new THREE.Mesh(new THREE.CylinderGeometry(i===1?1.6:1.24,i===1?1.45:1.15,4.4,32,1,true),
   new THREE.MeshBasicMaterial({color:'#37c5ff',transparent:true,opacity:i===1?.105:.045,side:THREE.DoubleSide,depthWrite:false}));
  beam.position.y=2.37;stand.add(beam);halos.push(beam);
  const light=new THREE.PointLight('#48dfff',i===1?9:5,i===1?8:6,1.8);light.position.set(0,.65,.1);stand.add(light);lamps.push(light);
  const fighter=createFighter(undefined,false,i===1?0:i===0?2:1);
  fighter.position.y=.27;fighter.rotation.y=i===1?Math.PI-.18:Math.PI+(i===0?-.3:.28);
  stand.add(fighter);fighters.push(fighter);
 }
 for(const x of [-8.2,8.2]){
  const pillar=new THREE.Mesh(new THREE.BoxGeometry(.17,18,.3),new THREE.MeshBasicMaterial({color:'#193a77',transparent:true,opacity:.35}));
  pillar.position.set(x,7,-6);root.add(pillar);
 }
 const key=new THREE.PointLight('#87dafa',45,34,1.3);key.position.set(0,9,10);root.add(key);
 const rim=new THREE.PointLight('#486bdc',24,30,1.6);rim.position.set(-3,8,-7);root.add(rim);
 const warm=new THREE.PointLight('#edb19b',10,21,1.4);warm.position.set(4,6,3);root.add(warm);
 const setSkin=index=>{
  skin=index;
  const old=fighters[1],p=old.parent;
  const next=createFighter(undefined,false,index);
  next.position.copy(old.position);next.rotation.copy(old.rotation);
  p.remove(old);p.add(next);fighters[1]=next
 };
 const setAura=a=>{
  auraColor=a?.color||'#42ebff';
  halos.forEach(m=>m.material.color.set(auraColor));
  lamps.forEach(l=>l.color.set(auraColor));
  rotators.forEach(r=>r.material.color.set(auraColor).lerp(new THREE.Color('#ffffff'),.5))
 };
 function update(camera,t,animate=true){
  const sway=animate?Math.sin(t*.22)*.11:0;
  camera.fov=45;camera.updateProjectionMatrix();
  camera.position.set(ORIGIN+sway,5.1,15.2);
  camera.lookAt(ORIGIN,2.35,0);
  for(let i=0;i<3;i++){
   const fighter=fighters[i];
   if(animate){
    fighter.position.y=.27+Math.sin(t*(i===1?1.75:1.2)+i*1.4)*.06;
    animateFighter(fighter,t+i*.3,0,0)
   }else{fighter.position.y=.27;animateFighter(fighter,0,0,0)}
   rotators[i].rotation.z=animate?t*.4*(i%2?1:-1):0
  }
  root.visible=true
 }
 return {root,update,setSkin,setAura,hide(){root.visible=false},show(){root.visible=true},getSkin(){return skin}};
}
