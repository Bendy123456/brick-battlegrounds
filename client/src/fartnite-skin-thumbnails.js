import * as THREE from 'three';
import {createDetailedFighter} from './fartnite-character.js';
import {SKINS} from './fartnite-skins.js';

// Renders thumbnails of the SAME actual Three.js models used in the game.
// No stock character images, misleading concept renders or remote assets.
export function createSkinThumbnailLoader(home){
 const cache=new Map();
 let renderer=null,active=false,complete=false,next=0;
 function hydrate(){
  home.querySelectorAll('[data-skin-thumb]').forEach(el=>{
   const index=Number(el.dataset.skinThumb),src=cache.get(index);
   if(!src||el.querySelector('img'))return;
   const image=document.createElement('img');
   image.className='fn-actual-model-thumbnail';
   image.alt='Blank humanoid 3D body for '+SKINS[index].name;
   image.decoding='async';image.src=src;el.appendChild(image)
  })
 }
 function start(){
  if(active||complete){hydrate();return}
  active=true;
  try{
   renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,preserveDrawingBuffer:true,powerPreference:'low-power'});
   renderer.setPixelRatio(1);
   renderer.setSize(166,185,false);
   renderer.outputColorSpace=THREE.SRGBColorSpace;
   renderer.toneMapping=THREE.ACESFilmicToneMapping;
   renderer.toneMappingExposure=1.5;
  }catch{
   active=false;complete=true;
   return
  }
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(29,166/185,.1,50);
  camera.position.set(.0,2.04,9);
  camera.lookAt(0,1.88,0);
  scene.add(new THREE.HemisphereLight('#e8f4ff','#60717e',2.9));
  const key=new THREE.DirectionalLight('#fff0d3',3.5);key.position.set(-2,5,7);scene.add(key);
  const rim=new THREE.DirectionalLight('#7db7ff',2.0);rim.position.set(4,5,-6);scene.add(rim);
  const paint=()=>{
   hydrate();
   if(next>=SKINS.length){
    renderer.dispose();renderer.forceContextLoss();
    active=false;complete=true;return
   }
   const i=next++;
   const fighter=createDetailedFighter(i,false);
   fighter.userData.weapon.visible=false;
   fighter.rotation.y=-.13;
   scene.add(fighter);
   try{
    renderer.render(scene,camera);
    cache.set(i,renderer.domElement.toDataURL('image/webp',.88));
   }catch{
    // Keep the small original CSS portrait as a fallback on unsupported WebGL contexts.
   }finally{scene.remove(fighter)}
   hydrate();
   requestAnimationFrame(paint)
  };
  requestAnimationFrame(paint)
 }
 return {ensure:start,hydrate,get(index){return cache.get(index)||null},get count(){return cache.size}};
}
