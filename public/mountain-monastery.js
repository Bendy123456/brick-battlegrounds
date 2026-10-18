// BRICK BATTLEGROUNDS — v0.8.26 Mountain Monastery Arena.
// CHANGED: Entirely visual 3D scenery. No combat colliders, movement, physics or UI.
import * as THREE from '/vendor/three.module.js';
const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
const mat=(c,r=.86,m=0)=>new THREE.MeshStandardMaterial({color:c,roughness:r,metalness:m});
function part(parent,geo,m,x=0,y=0,z=0,shadow=false){
 const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);
 o.castShadow=shadow;o.receiveShadow=true;parent.add(o);return o;
}
const block=(p,w,h,d,x,y,z,m,shadow=false)=>
 part(p,new THREE.BoxGeometry(w,h,d),m,x,y,z,shadow);
const cyl=(p,rt,rb,h,x,y,z,m,n=10)=>
 part(p,new THREE.CylinderGeometry(rt,rb,h,n),m,x,y,z);
function rod(p,a,b,r,m){
 const diff=new THREE.Vector3().subVectors(b,a);
 const o=cyl(p,r,r,diff.length(),(a.x+b.x)*.5,(a.y+b.y)*.5,(a.z+b.z)*.5,m,7);
 o.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),diff.normalize());return o;
}
const groundWave=(x,z)=>Math.sin(x*.14+z*.051)*.7+
 Math.cos(z*.19-x*.074)*.55+Math.sin((x+z)*.35)*.21;
function makeSky(scene){
 const m=new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,fog:false,
  vertexShader:"varying vec3 vRay;void main(){vRay=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}",fragmentShader:"varying vec3 vRay;void main(){vec3 r=normalize(vRay);float h=clamp(r.y*.75+.38,0.0,1.0);vec3 low=vec3(.80,.83,.76),mid=vec3(.53,.70,.75),high=vec3(.22,.43,.61);vec3 c=mix(low,mid,smoothstep(.02,.52,h));c=mix(c,high,smoothstep(.46,1.0,h)*.63);float sun=pow(max(0.0,dot(r,normalize(vec3(-.46,.32,-.78)))),15.0);c+=vec3(.30,.19,.09)*sun*.42;float disc=pow(max(0.0,dot(r,normalize(vec3(-.46,.32,-.78)))),620.0);c+=vec3(1.0,.64,.24)*disc*.43;gl_FragColor=vec4(c,1.0);}"});
 const sky=part(scene,new THREE.SphereGeometry(237,32,16),m);
 sky.name='MonasteryAlpineSky';sky.frustumCulled=false;sky.renderOrder=-100;
}
function landscape(g){
 const geom=new THREE.PlaneGeometry(440,440,96,96);geom.rotateX(-Math.PI/2);
 const a=geom.attributes.position,color=[];
 const grass=new THREE.Color(0x667c61),hill=new THREE.Color(0x879b79);
 const stone=new THREE.Color(0x868a82),snow=new THREE.Color(0xc8d0c6);
 const c=new THREE.Color();
 for(let i=0;i<a.count;i++){
  const x=a.getX(i),z=a.getZ(i),dist=Math.hypot(x,z);
  const t=clamp((dist-23)/76,0,1);
  const height=-3.45+Math.pow(t,1.65)*(6+groundWave(x,z)*4.8)+
   Math.pow(t,3)*Math.sin(x*.039+z*.027)*4;
  a.setY(i,height);
  c.copy(grass).lerp(hill,t*.65).lerp(stone,clamp((height-4)/26,0,.82));
  if(height>19)c.lerp(snow,clamp((height-19)/27,0,.65));
  let v=1+Math.sin(i*14.91)*.055;
  color.push(c.r*v,c.g*v,c.b*v);
 }
 geom.setAttribute('color',new THREE.Float32BufferAttribute(color,3));
 geom.computeVertexNormals();
 const land=part(g,geom,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1}));
 land.name='RollingAlpineLandscape';
}
function ridge(g,radius,height,seed,color){
 const vertices=[],index=[],segs=128;
 for(let i=0;i<=segs;i++){
  const a=(i%segs)/segs*TAU,wiggle=Math.sin(a*7+seed)*.15+
   Math.sin(a*16+seed*2)*.09+Math.sin(a*39+seed)*.04;
  const r=radius*(1+wiggle*.18);
  const h=Math.max(6,height*(.75+.26*Math.sin(a*13+seed)+.18*Math.cos(a*21+seed*2)));
  for(const [rad,y] of [[r-24,-5],[r,h],[r+33,-2]])
   vertices.push(Math.sin(a)*rad,y,Math.cos(a)*rad);
  if(i<segs){const j=i*3;
   index.push(j,j+3,j+1,j+1,j+3,j+4);
   index.push(j+1,j+4,j+2,j+2,j+4,j+5);
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geo.setIndex(index);geo.computeVertexNormals();
 const o=part(g,geo,mat(color,1));
 o.name='PanoramicMountainRidge';o.material.side=THREE.DoubleSide;
}
function makeForest(g){
 // CHANGED: Four GPU instanced draw calls for 78 articulated silhouette pines.
 const count=78,dummy=new THREE.Object3D();
 const trunk=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.28,3.7,6),
  mat(0x564335,1),count);
 const crowns=[0x365747,0x436952,0x557960].map(c=>
  new THREE.InstancedMesh(new THREE.ConeGeometry(1,2.8,7),mat(c,.96),count));
 let seed=1837;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 for(let i=0;i<count;i++){
  let x,z,r;
  do{const a=rand()*TAU;r=32+rand()*72;x=Math.sin(a)*r;z=Math.cos(a)*r;}
  while(Math.abs(x)<18&&z< -20&&z> -62);
  const size=.65+rand()*1.06,t=clamp((r-23)/76,0,1);
  const y=-3.2+Math.pow(t,1.65)*(6+groundWave(x,z)*4.8);
  dummy.position.set(x,y+1.85*size,z);
  dummy.rotation.set(0,rand()*TAU,0);
  dummy.scale.set(.95*size,size,.95*size);
  dummy.updateMatrix();trunk.setMatrixAt(i,dummy.matrix);
  crowns.forEach((c,j)=>{
   dummy.position.y=y+(2.5+j*.96)*size;
   dummy.scale.set((1.55-j*.29)*size,(1-j*.09)*size,(1.55-j*.29)*size);
   dummy.updateMatrix();c.setMatrixAt(i,dummy.matrix);
  });
 }
 for(const p of [trunk,...crowns]){
  p.instanceMatrix.needsUpdate=true;p.frustumCulled=false;
  p.castShadow=false;p.receiveShadow=false;g.add(p);
 }
}
function scatteredRocks(g,stone){
 let seed=21;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
 const dummy=new THREE.Object3D();
 const inst=new THREE.InstancedMesh(new THREE.DodecahedronGeometry(1,0),stone,110);
 for(let i=0;i<110;i++){
  const a=rand()*TAU,r=23+rand()*28,s=.4+rand()*2.4;
  dummy.position.set(Math.sin(a)*r,-1.25+rand()*.55,Math.cos(a)*r);
  dummy.rotation.set(rand()*.23,rand()*TAU,rand()*.18);
  dummy.scale.set(s,s*(.27+rand()*.5),s*(.6+rand()*.65));
  dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
 }
 inst.instanceMatrix.needsUpdate=true;g.add(inst);
}
function makeCourtyard(g,M){
 // CHANGED: preserve original raised 8-sided stage footprint and floor elevation.
 cyl(g,21.2,22.5,2.4,0,-1.35,0,M.dark,8);
 cyl(g,20.4,20.5,.2,0,-.07,0,M.stone,8);
 const slateGeo=new THREE.BoxGeometry(2.65,.06,2.65);
 const A=[],B=[];
 for(let ix=-6;ix<=6;ix++)for(let iz=-6;iz<=6;iz++){
  const x=ix*2.79,z=iz*2.79;if(Math.hypot(x,z)>17.6)continue;
  ((ix+iz)&1?A:B).push([x,z]);
 }
 const dummy=new THREE.Object3D();
 for(const [tiles,material] of [[A,M.paveA],[B,M.paveB]]){
  const inst=new THREE.InstancedMesh(slateGeo,material,tiles.length);
  tiles.forEach(([x,z],i)=>{
   dummy.position.set(x,.064,z);dummy.rotation.set(0,0,0);
   dummy.scale.set(1,1,1);dummy.updateMatrix();inst.setMatrixAt(i,dummy.matrix);
  });
  inst.instanceMatrix.needsUpdate=true;inst.castShadow=false;inst.receiveShadow=true;
  inst.name="StoneCourtyardPaving";g.add(inst);
 }
 for(const [radius,material,thickness] of [[17.95,M.gold,.12],[5.3,M.dark,.065]]){
  const ring=part(g,new THREE.TorusGeometry(radius,thickness,6,96),material,0,.14,0);
  ring.rotation.x=Math.PI/2;
 }
 for(let k=0;k<8;k++){
  const a=k*TAU/8;
  const petal=block(g,.2,.024,3.05,Math.sin(a)*2.45,.15,Math.cos(a)*2.45,M.gold);
  petal.rotation.y=a;
 }
 cyl(g,.73,.73,.034,0,.17,0,M.gold,16);
 for(let i=0;i<48;i++){
  const a=i*TAU/48;
  const stone=block(g,1.7,.52,.55,Math.sin(a)*20.6,.08,
   Math.cos(a)*20.6,M.dark);
  stone.rotation.y=a;
 }
 // Small off-stage stone staircase toward the shrine, entirely decorative.
 for(let i=0;i<7;i++){
  const z=-21.5-i*1.48;
  block(g,10.3,.32,1.39,0,-.43-i*.21,z,M.stone);
  block(g,10.7,.09,1.40,0,-.245-i*.21,z,M.paveA);
 }
}
function curvedRoof(g,w,d,y,M,up=1){
 // CHANGED: Curved tiled gables with lifted corners—not two rectangular boxes.
 const vertices=[],uv=[],index=[],cols=12,rows=6;
 for(let side=0;side<2;side++){
  const offset=vertices.length/3;
  for(let i=0;i<=cols;i++){
   const u=i/cols,x=(u-.5)*w,curl=Math.pow(Math.abs(u-.5)*2,4)*.46;
   for(let j=0;j<=rows;j++){
    const v=j/rows,z=(side===0?1:-1)*v*d*.5;
    vertices.push(x,y+(1-v)*1.66*up+curl,z);uv.push(u,v);
   }
  }
  for(let i=0;i<cols;i++)for(let j=0;j<rows;j++){
   const a=offset+i*(rows+1)+j,b=a+rows+1;
   index.push(a,a+1,b,a+1,b+1,b);
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
 geo.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 geo.setIndex(index);geo.computeVertexNormals();
 part(g,geo,M.roof,0,0,0,true).name="SweptTempleRoof";
 for(const side of [-1,1]){
  const z=side*d*.5;
  rod(g,new THREE.Vector3(-w*.5,y+.46,z),
   new THREE.Vector3(w*.5,y+.46,z),.15,M.edge);
  for(const x of [-w/2,w/2]){
   rod(g,new THREE.Vector3(x,y+.46,z),
    new THREE.Vector3(x*.93,y+.82,z*.85),.13,M.gold);
  }
 }
 rod(g,new THREE.Vector3(-w/2,y+1.66*up,0),
  new THREE.Vector3(w/2,y+1.66*up,0),.18,M.gold);
 for(let i=0;i<=10;i++){
  const x=(i/10-.5)*(w-.5);
  for(const side of [-1,1]){
   const z=side*d*.43;
   rod(g,new THREE.Vector3(x,y+.49,z),
    new THREE.Vector3(x,y+1.45*up,z*.09),.046,M.edge);
  }
 }
}
function temple(g,x,z,scale,M,small=false){
 const b=new THREE.Group();b.position.set(x,-.12,z);
 b.scale.setScalar(scale);g.add(b);
 const w=small?12:23,d=small?9:15;
 block(b,w+4,1.1,d+4,0,.19,0,M.stone,true);
 block(b,w+3.5,.23,d+3.5,0,.84,0,M.gold);
 block(b,w,5,d,0,3.45,0,M.wall);
 const columns=small?[-w*.38,0,w*.38]:[-w*.44,-w*.22,0,w*.22,w*.44];
 for(const X of columns)for(const Z of [-d*.46,d*.46]){
  cyl(b,.33,.39,5.75,X,3.85,Z,M.red,10);
  block(b,.77,.16,.77,X,6.55,Z,M.gold);
  block(b,.77,.25,.77,X,1.1,Z,M.stone);
 }
 const front=d/2+.14;
 for(let i=-2;i<=2;i++){
  const width=(w-3.2)/5,X=i*width;
  block(b,width-.22,3.33,.17,X,3.83,front,M.wood);
  block(b,width-.42,3.10,.18,X,3.83,front+.04,M.cream);
  for(let j=-2;j<=2;j++)
   block(b,.065,3.0,.21,X+j*(width-.4)/5,3.83,front+.17,M.wood);
  for(const dy of [-.46,.46])
   block(b,width-.37,.062,.22,X,3.83+dy,front+.18,M.wood);
 }
 block(b,2.4,3.2,.22,0,3.08,front+.1,M.red);
 block(b,w+1.4,.5,d+1.2,0,6.26,0,M.wood);
 curvedRoof(b,w+4.3,d+4.9,6.85,M);
 if(!small){
  const upper=new THREE.Group();upper.position.y=7.1;b.add(upper);
  block(upper,12.8,3.15,9.3,0,2.5,0,M.wall);
  for(const dx of [-5.5,-1.8,1.8,5.5]){
   cyl(upper,.22,.24,3.75,dx,2.45,4.25,M.red);
   block(upper,2.8,1.65,.18,dx,2.55,4.75,M.cream);
  }
  block(upper,14,.38,10,0,4.13,0,M.wood);
  curvedRoof(upper,17,13.3,4.65,M,.96);
  cyl(upper,.13,.19,1.6,0,7.6,0,M.gold,12);
  part(upper,new THREE.SphereGeometry(.37,10,8),M.gold,0,8.48,0);
 }
}
function gate(g,M){
 const b=new THREE.Group();b.position.set(0,0,29.4);g.add(b);
 for(const x of [-5.25,5.25]){
  cyl(b,.41,.48,7.4,x,3.65,0,M.red);
  block(b,.96,.35,.96,x,7.29,0,M.gold);
  block(b,1.13,.42,1.13,x,.23,0,M.stone);
 }
 block(b,12,.56,1.6,0,7.13,0,M.wood);
 block(b,13.2,.4,2.2,0,7.62,0,M.roof);
 curvedRoof(b,15,4.9,7.7,M,.72);
 block(b,4.8,1.25,.23,0,6.44,.40,M.red);
 block(b,4.55,.14,.29,0,7.06,.56,M.gold);
}
function lanterns(g,M){
 for(let i=0;i<8;i++){
  const a=(i+.5)*TAU/8,x=Math.sin(a)*22.8,z=Math.cos(a)*22.8;
  const b=new THREE.Group();b.position.set(x,0,z);g.add(b);
  cyl(b,.31,.48,.8,0,-.65,0,M.stone);
  cyl(b,.23,.29,2.65,0,1.09,0,M.stone);
  block(b,1.28,.22,1.28,0,2.55,0,M.stone);
  block(b,.91,.94,.91,0,3.07,0,M.lamp);
  for(const dx of [-.46,.46])for(const dz of [-.46,.46])
   block(b,.085,1,.085,dx,3.07,dz,M.wood);
  block(b,1.43,.19,1.43,0,3.59,0,M.roof);
  const lid=part(b,new THREE.ConeGeometry(.73,.6,4),M.roof,0,3.92,0);
  lid.rotation.y=Math.PI/4;
  cyl(b,.13,.18,.39,0,4.36,0,M.gold);
  if(i===1||i===6){
   const light=new THREE.PointLight(0xffbc70,1.6,13,2);
   light.position.set(x,3.55,z);g.add(light);
  }
 }
}
function blossomingTrees(g){
 const trunk=mat(0x604a46,.93),pinks=[mat(0xd6a1a4,.95),mat(0xe8bec1,.95)];
 const blob=new THREE.IcosahedronGeometry(1,1);
 for(const [x,z,s] of [[-27,-12,1.2],[29,-12,1.1],[-43,-22,1.5],[43,-22,1.3]]){
  const t=new THREE.Group();t.position.set(x,-2,z);t.scale.setScalar(s);g.add(t);
  cyl(t,.24,.42,5.9,0,2.95,0,trunk);
  for(let j=0;j<5;j++){
   const a=j*TAU/5;
   rod(t,new THREE.Vector3(0,4,0),
    new THREE.Vector3(Math.cos(a)*2.7,6.6+Math.sin(j*4)*.4,Math.sin(a)*2.7),
    .16,trunk);
  }
  for(let j=0;j<14;j++){
   const a=j*TAU/14,r=1.05+(j%4)*.52;
   const leaf=part(t,blob,pinks[j%3?0:1],
    Math.cos(a)*r,5.8+((j*7)%5)*.38,Math.sin(a)*r);
   leaf.scale.set(1.2,.82,1.06);
  }
 }
}
function banners(g,M){
 const cloth=mat(0xb54938,.92),mark=mat(0xe2bb77,.85);
 for(const [x,z] of [[-25,7],[25,7],[-22,-22],[22,-22]]){
  cyl(g,.11,.11,6,x,3,z,M.wood,8);
  const banner=block(g,1.65,2.65,.11,x+.88,4.15,z,cloth);
  banner.rotation.z=-.075;
  block(g,1.8,.13,.13,x+.85,5.49,z,M.gold);
  block(g,.13,1.45,.15,x+.85,4.20,z,mark);
 }
}
export function buildMountainMonastery(scene){
 const g=new THREE.Group();g.name="MountainMonasteryScenery";scene.add(g);
 makeSky(scene);
 const M={
  stone:mat(0xb8b6a7,.96),dark:mat(0x68746a,.93),
  paveA:mat(0xa5a89c,.96),paveB:mat(0x949e95,.97),
  red:mat(0x8b302c,.63),wood:mat(0x302b2a,.76),
  wall:mat(0xd2c5a7,.96),cream:mat(0xc5ba9c,.94),
  roof:mat(0x365750,.78),edge:mat(0x243f3a,.68),
  gold:mat(0xcba66a,.48,.17),
  lamp:new THREE.MeshStandardMaterial({
   color:0xffdeb0,emissive:0xffa94d,emissiveIntensity:.85,roughness:.57
  })
 };
 landscape(g);
 ridge(g,82,24,4.7,0x657b70);
 ridge(g,132,41,9.3,0x85998f);
 ridge(g,188,56,2.5,0xa5b6b0);
 scatteredRocks(g,mat(0x777b6e,.96));
 makeForest(g);
 makeCourtyard(g,M);
 temple(g,0,-45.8,1,M,false);
 temple(g,-30,-35,.8,M,true);
 temple(g,30,-35,.8,M,true);
 gate(g,M);
 lanterns(g,M);
 blossomingTrees(g);
 banners(g,M);
 // Static scenery: there are no per-frame updates and no collision bodies.
 return g;
}
