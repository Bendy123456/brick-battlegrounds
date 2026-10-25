import * as THREE from 'three';

// Lightweight, non-copyrighted geometric particles and atmospheric effects.
// All particles share primitive geometries and a very small colour palette.
const geo={
 ember:new THREE.TetrahedronGeometry(1,0),
 spark:new THREE.OctahedronGeometry(1,0),
 puff:new THREE.IcosahedronGeometry(1,0),
 ring:new THREE.RingGeometry(.83,1,28)
};
const colors={
 amber:new THREE.MeshBasicMaterial({color:'#ffe2a0',transparent:true,opacity:.97,depthWrite:false}),
 citrus:new THREE.MeshBasicMaterial({color:'#d6f87b',transparent:true,opacity:.84,depthWrite:false}),
 powder:new THREE.MeshBasicMaterial({color:'#e7d2b4',transparent:true,opacity:.65,depthWrite:false}),
 lilac:new THREE.MeshBasicMaterial({color:'#d5a9fd',transparent:true,opacity:.72,depthWrite:false}),
 white:new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.9,depthWrite:false})
};
const random=(a,b)=>a+Math.random()*(b-a);
export function createEffects(scene){
 const particles=[];
 let lastMuzzle=0;
 function spawn(kind,x,y,z,velocity,size=.15,life=.5){
  if(particles.length>=140){
   const p=particles.shift();if(p?.mesh)scene.remove(p.mesh);
  }
  const p=new THREE.Mesh(kind==='puff'?geo.puff:kind==='ring'?geo.ring:kind==='spark'?geo.spark:geo.ember,
    kind==='puff'?colors.powder:kind==='ring'?colors.citrus:kind==='spark'?colors.amber:colors.white);
  p.position.set(x,y,z);p.scale.setScalar(size);
  if(kind==='ring')p.rotation.x=-Math.PI/2;
  scene.add(p);
  particles.push({mesh:p,velocity:new THREE.Vector3(...velocity),age:0,life,kind,size});
 }
 return {
  impact(x,y,z,material='wood'){
   for(let i=0;i<9;i++)spawn(material==='stone'?'spark':'ember',x,y,z,
    [random(-3,3),random(2,6),random(-3,3)],random(.06,.20),random(.25,.7));
   spawn('ring',x,y,z,[0,1.0,0],.38,.38)
  },
  muzzle(x,y,z,dir){
   for(let i=0;i<6;i++)spawn('spark',x+dir.x*.15,y+dir.y*.15,z+dir.z*.15,
    [dir.x*random(4,11)+random(-2,2),dir.y*random(4,11)+random(-2,2),dir.z*random(4,11)+random(-2,2)],
    random(.05,.17),random(.07,.19))
  },
  build(x,y,z){
   for(let i=0;i<14;i++)spawn('puff',x+random(-2.7,2.7),y+random(.1,.8),z+random(-2.7,2.7),
    [random(-1.2,1.2),random(.6,2.2),random(-1.2,1.2)],random(.19,.43),random(.45,.9));
   for(let i=0;i<6;i++)spawn('spark',x+random(-2.5,2.5),y+random(.6,3),z+random(-2.5,2.5),
    [random(-1,1),random(.1,1.2),random(-1,1)],random(.05,.13),random(.2,.5))
  },
  land(x,y,z){
   for(let i=0;i<16;i++)spawn('puff',x+random(-1,1),y+.3,z+random(-1,1),
    [random(-3,3),random(.3,1.7),random(-3,3)],random(.23,.45),random(.5,1.0))
  },
  glide(x,y,z){
   for(let i=0;i<2;i++)spawn('ember',x+random(-1.7,1.7),y+.4,z+random(-.4,.4),
    [random(-.15,.15),random(-2,-.5),random(-.15,.15)],random(.08,.18),random(.22,.5))
  },
  tick(dt){
   for(let i=particles.length-1;i>=0;i--){
    const p=particles[i];p.age+=dt;
    if(p.age>=p.life){scene.remove(p.mesh);particles.splice(i,1);continue}
    p.mesh.position.addScaledVector(p.velocity,dt);
    p.velocity.y-=dt*(p.kind==='puff'?.6:7);
    p.mesh.rotation.x+=dt*2;p.mesh.rotation.y+=dt*2;
    const f=1-p.age/p.life;
    p.mesh.scale.setScalar(p.size*(p.kind==='ring'?1+(1-f)*6:p.kind==='puff'?1+(1-f)*1.8:f));
    p.mesh.visible=f>.02
   }
  },
  clear(){for(const p of particles)scene.remove(p.mesh);particles.length=0},
  count(){return particles.length}
 }
}

export function createStormShader(){
 return new THREE.ShaderMaterial({
  transparent:true,depthWrite:false,side:THREE.DoubleSide,fog:false,
  uniforms:{time:{value:0}},
  vertexShader:'varying vec2 vUv;varying vec3 vP;void main(){vUv=uv;vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec2 vUv;uniform float time;void main(){float wave=sin(vUv.x*34.0+time*1.4+sin(vUv.y*16.+time*.4)*2.2);float thread=sin(vUv.x*88.-time*2.5+vUv.y*20.);float band=smoothstep(.2,1.0,abs(wave))*.15;float pulse=.24+band+thread*.045;vec3 color=mix(vec3(.23,.25,.63),vec3(.68,.42,.86),smoothstep(-.4,.8,wave));gl_FragColor=vec4(color,pulse);}'
 });
}
