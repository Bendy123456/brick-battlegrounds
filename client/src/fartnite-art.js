import * as THREE from 'three';

// FartNite procedural art direction: original forms, paint textures and composition.
// Everything in this file is generated locally. No copyrighted assets are imported.
export const COLOR={
 sky:'#79c9f8',horizon:'#f7d9b8',grass:'#81bf5c',shadowGrass:'#4f9853',
 meadow:'#a5cb69',sun:'#ffe3ad',ochre:'#ddaa69',earth:'#bc8a63',terra:'#c7735a',
 teal:'#427d8e',ocean:'#3294c2',plaster:'#f3ddbb',wood:'#936a46'
};
const mats=new Map();
function material(color,roughness=.88){const key=color+' '+roughness;if(!mats.has(key))mats.set(key,new THREE.MeshStandardMaterial({color,roughness}));return mats.get(key)}
const G={
 box:new THREE.BoxGeometry(1,1,1),
 ball:new THREE.IcosahedronGeometry(1,1),
 ballLow:new THREE.IcosahedronGeometry(1,0),
 cone:new THREE.ConeGeometry(1,1,7),
 cyl:new THREE.CylinderGeometry(1,1,1,9),
 roof:new THREE.ConeGeometry(1,1,4)
};
function mesh(parent,geom,mat,x=0,y=0,z=0,sx=1,sy=1,sz=1,cast=true){
 const m=new THREE.Mesh(geom,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=cast;m.receiveShadow=true;parent.add(m);return m
}
function block(p,x,y,z,w,h,d,c){return mesh(p,G.box,material(c),x,y,z,w,h,d)}
function ball(p,x,y,z,sx,sy,sz,c){return mesh(p,G.ball,material(c),x,y,z,sx,sy,sz)}
function cylinder(p,x,y,z,sx,sy,sz,c){return mesh(p,G.cyl,material(c),x,y,z,sx,sy,sz)}
function lerp(a,b,t){return a+(b-a)*t}
function rng(seed){let s=seed>>>0;return ()=>((s=(Math.imul(s,1664525)+1013904223)>>>0)/4294967296)}
const pick=(xs,r)=>xs[Math.floor(r()*xs.length)%xs.length];
const roofColors=['#b95c47','#d27b4e','#497e91','#7e7581','#b56d54'];
const paintColors=['#f4d9ac','#f4e3bd','#d5e6d2','#efb9a2','#e4dfb9'];
export function paintTexture(base='#f2dec1',type='wall'){
 const key='tex'+base+type;if(mats.has(key))return mats.get(key);
 const canvas=document.createElement('canvas');canvas.width=128;canvas.height=128;
 const c=canvas.getContext('2d');if(!c)return null;
 c.fillStyle=base;c.fillRect(0,0,128,128);
 let seed=[...base+type].reduce((s,ch)=>Math.imul(s,31)+ch.charCodeAt(0)>>>0,13);const random=rng(seed);
 // Painterly broad washes rather than photographic noise.
 for(let i=0;i<180;i++){
  c.globalAlpha=random()*.085;
  c.fillStyle=random()>.45?'#fff1bf':'#624e45';
  const x=random()*128,y=random()*128;
  c.fillRect(x,y,3+random()*25,1+random()*5)
 }
 if(type==='roof'){
  c.globalAlpha=.17;c.strokeStyle='#493b39';c.lineWidth=1.5;
  for(let y=0;y<128;y+=22){c.beginPath();c.moveTo(0,y);c.lineTo(128,y);c.stroke()}
 }else if(type==='wood'){
  c.globalAlpha=.12;c.strokeStyle='#332e2b';c.lineWidth=1;
  for(let x=0;x<128;x+=19){c.beginPath();c.moveTo(x,0);c.lineTo(x+7,128);c.stroke()}
 }
 c.globalAlpha=1;
 const t=new THREE.CanvasTexture(canvas);t.colorSpace=THREE.SRGBColorSpace;
 t.wrapS=t.wrapT=THREE.RepeatWrapping;
 t.anisotropy=2;mats.set(key,t);return t
}
const paintedMats=new Map();
function painted(base,type='wall'){
 const key=base+type;if(paintedMats.has(key))return paintedMats.get(key);
 const value=new THREE.MeshStandardMaterial({color:'#ffffff',map:paintTexture(base,type),roughness:.94});
 paintedMats.set(key,value);return value
}
function trim(g,width,depth,height,wood){
 for(const s of [-1,1]){
  block(g,s*width/2,height/2,depth/2+.11,.18,height,.2,wood);
  block(g,s*width/2,height/2,-depth/2-.11,.18,height,.2,wood);
  block(g,s*width/2,height/2,0,.17,height,.17,wood)
 }
 block(g,0,height-.13,depth/2+.12,width+.22,.24,.19,wood)
}
function windowFrame(g,x,y,z,w=1.4,h=1.65){
 block(g,x,y,z,w,h,.18,'#346b7b');
 block(g,x,y,z+.12,w-.2,h-.2,.07,'#9de3e2');
 block(g,x,y,z+.2,.08,h-.12,.09,'#f5e5c5');
 block(g,x,y,z+.2,w-.12,.08,.09,'#f5e5c5');
 block(g,x,y-h*.45,z+.24,w+.16,.17,.25,'#ad7653')
}
function roof(g,w,d,y,height,color){
 const m=mesh(g,G.roof,painted(color,'roof'),0,y,0,w*.74,height,d*.74);
 m.rotation.y=Math.PI/4;
 block(g,0,y-height*.45,0,w+1,.28,d+1,color);
 return m
}
function flatRoof(g,w,d,h,c='#4b6775'){
 block(g,0,h+.18,0,w+1.4,.56,d+1.4,c);
 for(let s of [-1,1]){
  block(g,s*(w/2+.35),h+.4,0,.18,.58,d+1.35,'#d8c4a6');
  block(g,0,h+.4,s*(d/2+.35),w+1.35,.58,.18,'#d8c4a6')
 }
}
function porch(g,w,d){
 block(g,0,.34,d*.5+2.3,w*.77,.36,3.5,'#be9472');
 for(let s of [-1,1]){
  cylinder(g,s*w*.3,2.05,d*.5+3.1,.17,3.3,.17,'#e9dbc3');
  block(g,s*w*.3,1.2,d*.5+3.15,.34,.35,.32,'#fff0d6')
 }
 block(g,0,3.87,d*.5+2.35,w*.84,.36,3.8,'#846047')
}
function chimney(g,x,y,z){
 block(g,x,y,z,1.15,3.7,1.15,'#b66b5a');
 block(g,x,y+1.8,z,1.5,.35,1.5,'#a75c50')
}
function barn(g,w,d,h,color){
 const wall=painted(color,'wood');
 mesh(g,G.box,wall,0,h*.5,0,w,h,d);
 for(let n=-2;n<=2;n++)block(g,n*w/5,h*.5,d/2+.1,.14,h,.16,'#e4c49e');
 roof(g,w+1,d+1,h+2,4.9,'#b55946');
 block(g,0,2,d/2+.16,3,3.6,.24,'#5f4f48');
 block(g,0,2,d/2+.3,.2,3.7,.15,'#f1d4aa');
 block(g,0,2,d/2+.33,3,.2,.15,'#f1d4aa');
 ball(g,0,h-.8,d/2+.25,.8,.8,.24,'#f5dfac');
 for(let x of [-w*.29,w*.29])block(g,x,3,d/2+.19,1.4,1.7,.22,'#7fb5a5');
}
function lighthouse(g){
 const h=14;
 const tower=mesh(g,new THREE.CylinderGeometry(2.9,4.1,h,10),painted('#f2e4c8'),0,h*.5,0);
 tower.castShadow=true;tower.receiveShadow=true;
 for(let i=0;i<3;i++){
  cylinder(g,0,1.35+i*4.2,0,4.15,.28,4.15,'#c77a64')
 }
 cylinder(g,0,h+.7,0,3.4,.8,3.4,'#435e6d');
 cylinder(g,0,h+2.5,0,2.25,3,2.25,'#8edee5');
 cylinder(g,0,h+4.35,0,3.7,.55,3.7,'#e5b76e');
 mesh(g,G.cone,material('#a85b4a'),0,h+6.2,0,3.8,3,3.8);
 for(let i=0;i<8;i++){
  const a=i*Math.PI/4;block(g,Math.sin(a)*3.3,h+1.3,Math.cos(a)*3.3,.22,2,.22,'#c8bb95')
 }
 block(g,0,1.65,4,.95,3.1,.24,'#496b76')
}
function warehouse(g,w,d,h){
 mesh(g,G.box,painted('#d5d9cb'),0,h/2,0,w,h,d);
 for(let i=0;i<4;i++){
  const xx=-w/2+2.4+i*4.7;
  block(g,xx,3,d/2+.18,2.35,4.4,.20,'#4c6c75');
  block(g,xx,3,d/2+.29,2,3.9,.08,'#9bb5b1');
 }
 for(let i=0;i<5;i++)block(g,-w/2+1+i*3.7,h+1.7,0,.25,3.2,d+1,'#e9ddc7');
 flatRoof(g,w,d,h,'#4b7f85');
 block(g,0,h+2.1,0,w+1,.22,d*.6,'#ce8b60');
}
function awning(g,x,y,z,color){
 const cloth=block(g,x,y,z,2.6,.25,1.5,color);cloth.rotation.x=.16;
 for(let d of [-1,1])block(g,x+d*1.12,y-.85,z+.6,.09,1.8,.08,'#e4c9a2')
}
export function makeArchitecture(scene,x,z,style=0,angle=0,getHeight=()=>0){
 const y=getHeight(x,z),g=new THREE.Group(),r=rng((x*200+x*z*3+z*70)|0);
 g.position.set(x,y,z);g.rotation.y=angle;
 const w=style===3?17:style===4?13:style===2?12.4:9.2;
 const d=style===3?12.5:style===4?13:style===2?10:8.7;
 const h=style===3?7.7:style===4?9.1:style===2?7.5:6.3;
 if(style===5){lighthouse(g);g.userData={kind:'house',radius:5,art:'round beacon'}}
 else if(style===3){warehouse(g,w,d,h);g.userData={kind:'house',radius:9,art:'vented warehouse'}}
 else if(style===2){barn(g,w,d,h,'#bc725a');g.userData={kind:'house',radius:7,art:'orchard barn'}}
 else{
  const color=paintColors[(style+Math.floor(r()*paintColors.length))%paintColors.length];
  mesh(g,G.box,painted(color,'wall'),0,h/2+.3,0,w,h,d);
  trim(g,w,d,h,'#8f684d');
  if(style===4)flatRoof(g,w,d,h);
  else roof(g,w,d,h+2.5,4.9,roofColors[style%roofColors.length]);
  for(let s of [-1,1])windowFrame(g,s*w*.30,3.6,d/2+.23,1.2,1.55);
  windowFrame(g,0,3.5,-d/2-.2,1.6,1.8);
  block(g,0,1.82,d/2+.17,1.75,3.3,.2,'#765544');
  block(g,-.5,1.85,d/2+.29,.11,.11,.14,'#e1b770');
  block(g,0,.36,0,w+1,.57,d+1,'#a8aba6');
  if(style===1)porch(g,w,d);
  if(style===0)chimney(g,w*.3,h+3.0,-d*.16);
  if(style===4)for(let s of [-1,1])awning(g,s*w*.28,4.1,d/2+.78,'#e2a158');
  g.userData={kind:'house',radius:style===4?7:5.4,art:'original cabin'};
 }
 // Small, warm, oversized hand-built environmental props.
 if(style!==5){
  for(let side of [-1,1]){
   const bx=side*(w/2+1.3),bz=d*.34;
   cylinder(g,bx,.83,bz,.55,1.65,.55,'#9e6946');
   cylinder(g,bx,1.69,bz,.62,.23,.62,'#6e4b37');
  }
  const lamp=ball(g,0,4.7,d*.5+1.25,.21,.26,.21,'#ffd78e');
  lamp.material=new THREE.MeshBasicMaterial({color:'#ffdf9c'});
  block(g,0,4.92,d*.5+1.25,.33,.15,.30,'#404d59')
 }
 scene.add(g);return g;
}
function decorations(scene,getHeight,locs){
 const r=rng(49531);
 const blade=new THREE.ConeGeometry(.16,.9,3);
 const petal=new THREE.IcosahedronGeometry(.17,0);
 const pebble=new THREE.IcosahedronGeometry(1,0);
 const flowerColors=['#ffe7a0','#fff5e6','#fa9d95','#deb9f7'];
 const grassMaterials=['#66a84a','#95ca5a','#4d9853','#b9cb62'].map(c=>material(c));
 const grass=grassMaterials.map(mat=>new THREE.InstancedMesh(blade,mat,390));
 const flowers=flowerColors.map(c=>new THREE.InstancedMesh(petal,material(c),115));
 const stones=new THREE.InstancedMesh(pebble,material('#a6a09a'),150);
 const dummy=new THREE.Object3D();const grassCounts=[0,0,0,0],flowerCounts=[0,0,0,0];let sc=0;
 const place=(ob,x,z,y,sx,sy,sz,ry)=>{
  dummy.position.set(x,y,z);dummy.rotation.set(0,ry,0);dummy.scale.set(sx,sy,sz);dummy.updateMatrix();return dummy.matrix
 };
 let tries=0;
 while(tries++<5000&&grassCounts.some(v=>v<390)||false){
  const a=r()*Math.PI*2,rad=Math.sqrt(r())*237,x=Math.cos(a)*rad,z=Math.sin(a)*rad;
  if(locs.some(l=>Math.hypot(l.x-x,l.z-z)<19))continue;
  const y=getHeight(x,z),i=tries%4;
  if(grassCounts[i]<390){grass[i].setMatrixAt(grassCounts[i]++,place(grass[i],x,z,y+.43,.7+r()*.8,.45+r()*.95,.6+r()*.8,r()*6.28))}
 }
 for(let i=0;i<115*4;i++){
  const a=r()*Math.PI*2,rad=Math.sqrt(r())*232,x=Math.cos(a)*rad,z=Math.sin(a)*rad;
  if(locs.some(l=>Math.hypot(l.x-x,l.z-z)<18))continue;
  const col=i%4,y=getHeight(x,z);
  flowers[col].setMatrixAt(flowerCounts[col]++,place(flowers[col],x,z,y+.48,.52,1,.52,r()*6.28))
 }
 for(let i=0;i<150;i++){
  const a=r()*Math.PI*2,rad=Math.sqrt(r())*235,x=Math.cos(a)*rad,z=Math.sin(a)*rad;
  stones.setMatrixAt(sc++,place(stones,x,z,getHeight(x,z)+.15,.28+r()*.45,.2+r()*.23,.3+r()*.50,r()*6.28))
 }
 for(let i=0;i<4;i++){
  grass[i].count=grassCounts[i];grass[i].instanceMatrix.needsUpdate=true;grass[i].castShadow=false;
  scene.add(grass[i]);
  flowers[i].count=flowerCounts[i];flowers[i].instanceMatrix.needsUpdate=true;flowers[i].castShadow=false;scene.add(flowers[i])
 }
 stones.count=sc;stones.instanceMatrix.needsUpdate=true;scene.add(stones);
 return [...grass,...flowers,stones];
}
function cliffs(scene,getHeight){
 const r=rng(14012);
 const faces=[],cols=[],geo=new THREE.BufferGeometry();
 const colors=['#c69f80','#b98971','#d6b49b','#a97a68'];
 for(let i=0;i<115;i++){
  const a=(i/115)*Math.PI*2,a2=((i+1)/115)*Math.PI*2;
  const j=(r()-.5)*2.0,rr=240+j;
  const x=Math.cos(a)*rr,z=Math.sin(a)*rr,x2=Math.cos(a2)*rr,z2=Math.sin(a2)*rr;
  const h=getHeight(x,z),h2=getHeight(x2,z2),bot=-8.2;
  faces.push(x,h,z,x,bot,z,x2,h2,z2,x2,h2,z2,x,bot,z,x2,bot,z2);
  const ca=new THREE.Color(colors[i%4]);
  for(let k=0;k<6;k++)cols.push(ca.r,ca.g,ca.b)
 }
 geo.setAttribute('position',new THREE.Float32BufferAttribute(faces,3));
 geo.setAttribute('color',new THREE.Float32BufferAttribute(cols,3));geo.computeVertexNormals();
 const side=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));side.receiveShadow=true;scene.add(side);
 return side;
}
function sky(scene,camera){
 const mat=new THREE.ShaderMaterial({
 side:THREE.BackSide,depthWrite:false,fog:false,
 uniforms:{top:{value:new THREE.Color('#64bdf0')},middle:{value:new THREE.Color('#a6d8f2')},bottom:{value:new THREE.Color('#f8d6b2')}},
 vertexShader:'varying vec3 vPos;void main(){vPos=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
 fragmentShader:'varying vec3 vPos;uniform vec3 top;uniform vec3 middle;uniform vec3 bottom;void main(){float h=normalize(vPos).y;vec3 col=mix(bottom,middle,smoothstep(-0.14,0.30,h));col=mix(col,top,smoothstep(0.18,0.82,h));float glow=pow(max(0.,dot(normalize(vPos),normalize(vec3(-.48,.68,-.47)))),25.0);col+=glow*vec3(.19,.115,.035);gl_FragColor=vec4(col,1.);}'
 });
 const dome=new THREE.Mesh(new THREE.SphereGeometry(800,24,16),mat);dome.renderOrder=-1000;scene.add(dome);
 dome.onBeforeRender=()=>dome.position.copy(camera.position);
 return dome
}
export function polishEnvironment(scene,camera,getHeight,locs){
 const dome=sky(scene,camera);
 const side=cliffs(scene,getHeight);
 const props=decorations(scene,getHeight,locs);
 return {dome,side,props}
}
export function makeCharacterDetails(root,variant=0,isEnemy=false){
 const r=[['#c5db75','#6a9b72','#ad704c'],['#e4a97f','#7187ab','#66534b'],['#8cbcc0','#5d918d','#c9965d'],['#e0b3dc','#936d92','#a6746b']][variant%4];
 const d=root.userData;
 if(!d)return;
 const torso=d.torso;
 // Coloured diagonal field-scout sash and shoulder badges.
 const sash=block(torso,.07,2.36,.37,.14,.98,.11,r[0]);sash.rotation.z=.46;
 for(let side of [-1,1]){
  ball(torso,side*.55,2.7,0,.25,.19,.33,r[1]);
  block(torso,side*.33,1.34,.29,.26,.23,.13,r[2]);
 }
 block(torso,0,1.56,.24,.85,.16,.28,'#5a473e');
 for(let i=-1;i<=1;i++)block(torso,i*.21,1.58,.40,.14,.19,.15,'#d6ad68');
 if(variant===1){
  const brim=mesh(torso,G.cyl,material(r[1]),0,3.52,0,.51,.12,.51);
  block(torso,0,3.62,0,.77,.20,.70,r[0]);
 }else if(variant===2){
  block(torso,0,3.56,-.2,.68,.23,.59,r[1]);
  ball(torso,-.40,3.37,-.06,.21,.12,.2,r[0]);
 }else if(variant===3){
  ball(torso,0,3.58,-.12,.55,.18,.48,r[1]);
  for(let i=0;i<4;i++)ball(torso,-.30+i*.2,3.73,-.13,.15,.19,.14,r[0]);
 }else{
  for(let i=-1;i<=1;i++)ball(torso,i*.24,3.63,-.17,.2,.25,.2,r[1])
 }
 const pack=block(torso,0,2.2,-.57,.72,.88,.35,r[2]);
 pack.userData.kind='cosmetic';
 block(torso,0,2.27,-.78,.46,.18,.12,r[0]);
 root.userData.style=variant;
 return root
}
export function makeWeaponArtwork(kind='ar'){
 const g=new THREE.Group();
 const shell=material('#425867',.46),metal=material('#263f4f',.34),accent=material('#e3b96f',.55);
 // Distinct original silhouettes for every weapon class, no reproduction of recognizable IP weapons.
 const cfg={
 ar:{body:1.12,barrel:.67,stock:.43,mag:.48,sight:.21,color:'#c4af82'},
 shotgun:{body:1.32,barrel:.92,stock:.48,mag:0,sight:.1,color:'#ac6557'},
 smg:{body:.80,barrel:.34,stock:.24,mag:.36,sight:.17,color:'#6cc3ba'},
 sniper:{body:1.18,barrel:1.42,stock:.57,mag:.22,sight:.43,color:'#9e88c7'},
 pistol:{body:.48,barrel:.30,stock:0,mag:.36,sight:.11,color:'#d6b66b'}
 }[kind]||{body:1,barrel:.6,stock:.4,mag:.3,sight:.2,color:'#d6b66b'};
 const shellMat=material(cfg.color,.55);
 block(g,0,0,0,.25,.28,cfg.body,cfg.color);
 cylinder(g,0,.02,cfg.body*.5+cfg.barrel*.46,.10,.10,cfg.barrel, '#384c55').rotation.x=Math.PI/2;
 const tip=mesh(g,new THREE.CylinderGeometry(.13,.13,.18,8),metal,0,.02,cfg.body*.5+cfg.barrel);
 tip.rotation.x=Math.PI/2;
 if(cfg.stock){block(g,0,-.05,-cfg.body*.5-cfg.stock*.5,.32,.28,cfg.stock,'#78634e')}
 block(g,0,-.28,-.14,.21,.52,.20,'#34414a');
 if(cfg.mag)block(g,0,-.30,.18,.17,cfg.mag,.22,kind==='smg'?'#3d7f82':'#4a545d');
 block(g,0,.16,-.11,.30,.16,.48,cfg.color);
 if(kind==='sniper'){
  cylinder(g,0,.45,-.06,.14,.14,.74,'#253c4b').rotation.x=Math.PI/2;
  block(g,0,.30,0,.15,.16,.46,'#3d4658')
 }else if(kind==='shotgun'){
  cylinder(g,0,-.13,cfg.body*.5+.36,.10,.10,.78,'#a97855').rotation.x=Math.PI/2
 }else if(kind==='ar'){
  block(g,0,.33,0,.12,.24,.32,'#c3aa70');
  block(g,0,.36,-.48,.2,.10,.14,'#435968')
 }else if(kind==='smg'){
  block(g,.23,-.15,-.02,.15,.42,.14,'#4aa59f')
 }
 return g
}


export function paintedWaterMaterial(){
 const shader=new THREE.ShaderMaterial({
  uniforms:{time:{value:0}},
  side:THREE.DoubleSide,depthWrite:true,
  vertexShader:`
   varying vec3 vWorld;varying float vDepth;
   void main(){
    vec4 world=modelMatrix*vec4(position,1.);
    vWorld=world.xyz;vec4 mv=modelViewMatrix*vec4(position,1.);
    vDepth=-mv.z;gl_Position=projectionMatrix*mv;
   }`.replace(/\n\s+/g,' '),
  fragmentShader:`
   uniform float time;varying vec3 vWorld;varying float vDepth;
   void main(){
    float a=sin(vWorld.x*.072+vWorld.z*.055+time*.45);
    float b=sin(vWorld.x*.15-vWorld.z*.084-time*.64);
    float c=sin(vWorld.z*.33+vWorld.x*.13+time*.7);
    float foam=smoothstep(.83,.99,(a*.38+b*.31+c*.31)*.5+.5);
    vec3 deep=vec3(.07,.45,.62);
    vec3 shallow=vec3(.15,.67,.75);
    float roll=.48+.2*a+.15*b;
    vec3 color=mix(deep,shallow,clamp(roll,0.,1.));
    color=mix(color,vec3(.62,.85,.81),foam*.37);
    float haze=smoothstep(190.,690.,vDepth);
    color=mix(color,vec3(.66,.83,.83),haze*.95);
    gl_FragColor=vec4(color,1.);
   }`.replace(/\n\s+/g,' ')
 });
 return shader
}
