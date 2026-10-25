import * as THREE from 'three';

// All art in FartNite is original procedural geometry. No third-party game assets.
export const SIZE=520, ISLAND_RADIUS=246;
export const LANDMARKS=[
 {name:'MAPLE MEADOWS',x:-120,z:-105,kind:'village'},
 {name:'COPPER CROSSING',x:102,z:-88,kind:'village'},
 {name:'WILLOW WHARF',x:-145,z:100,kind:'port'},
 {name:'SUNSET ORCHARD',x:95,z:125,kind:'farm'},
 {name:'RIDGEWATCH',x:8,z:-164,kind:'outpost'},
 {name:'CLOVER COMMONS',x:5,z:25,kind:'village'}
];
const PI=Math.PI;
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
export function terrainHeight(x,z){
 const d=Math.hypot(x*.97,z*1.02);
 const coast=clamp((ISLAND_RADIUS-d)/32,0,1);
 const undulate=3.6*Math.sin(x*.023)*Math.cos(z*.026)+2.2*Math.sin(x*.061+z*.035)+1.1*Math.cos(z*.088-x*.022);
 const ridge=7*Math.exp(-((x+2)*(x+2)/10000+(z+165)*(z+165)/3200));
 return -8+(12+undulate+ridge)*coast;
}
function mat(hex,rough=.91,extra={}){return new THREE.MeshStandardMaterial({color:hex,roughness:rough,...extra})}
export const M={
 grass:mat('#80b85c'),wood:mat('#986640'),paleWood:mat('#dfc38e'),woodDark:mat('#644530'),
 brick:mat('#cf7963'),brickDark:mat('#964e47'),plaster:mat('#f3e2b5'),cream:mat('#efe7cf'),
 shingle:mat('#4d6876'),redRoof:mat('#b9644a'),blueRoof:mat('#44788b'),
 window:mat('#9ee2ec',.2,{metalness:.22,emissive:'#245b70',emissiveIntensity:.16}),
 leaf:mat('#4d984b'),leaf2:mat('#7dbb4d'),leaf3:mat('#348756'),trunk:mat('#7c4e31'),
 stone:mat('#92979a'),stone2:mat('#a7a29a'),metal:mat('#4b5966',.4,{metalness:.55}),
 tan:mat('#f1ce9e'),dark:mat('#28333c'),pants:mat('#476477'),shirt:mat('#d7ac75'),
 armor:mat('#415c65'),hair:mat('#332b2a'),black:mat('#20262b'),gold:mat('#f8cd65',.35,{metalness:.3}),
 blue:mat('#45c8df'),red:mat('#e77c72'),white:mat('#ffffff')
};
const boxG=new THREE.BoxGeometry(1,1,1);
const sphG=new THREE.SphereGeometry(1,10,8);
const cylG=new THREE.CylinderGeometry(1,1,1,8);
export function box(group,x,y,z,w,h,d,material,rot=0){
 const m=new THREE.Mesh(boxG,material);m.position.set(x,y,z);m.scale.set(w,h,d);m.rotation.y=rot;m.castShadow=true;m.receiveShadow=true;group.add(m);return m
}
export function orb(group,x,y,z,sx,sy,sz,material){
 const m=new THREE.Mesh(sphG,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);m.castShadow=true;m.receiveShadow=true;group.add(m);return m
}
function cylinder(group,x,y,z,r1,r2,h,material,n=8){
 const m=new THREE.Mesh(new THREE.CylinderGeometry(r1,r2,h,n),material);m.position.set(x,y,z);m.castShadow=true;m.receiveShadow=true;group.add(m);return m
}
function roof(group,w,d,y,material){
 const g=new THREE.ConeGeometry(1,1,4,1);
 const mesh=new THREE.Mesh(g,material);
 mesh.rotation.y=PI/4;mesh.position.y=y;
 mesh.scale.set(w*.83,4.1,d*.83);
 // A stylized hip roof keeps its own footprint and does not borrow anyone's game assets.
 mesh.castShadow=true;group.add(mesh)
}
function house(scene,x,z,style=0,angle=0){
 const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);g.rotation.y=angle;
 const w=style===2?12:8.8,d=style===2?9:8,h=style===2?8.6:6.1;
 const wall=style===1?M.brick:style===2?M.wood:M.plaster;
 box(g,0,h*.5+.3,0,w,h,d,wall);
 box(g,0,.4,0,w+1,.8,d+1,M.stone);
 box(g,0,2,d/2+.08,2.1,3.5,.22,M.woodDark);
 box(g,-w*.29,3.4,d/2+.13,1.6,1.8,.22,M.window);
 box(g,w*.29,3.4,d/2+.13,1.6,1.8,.22,M.window);
 box(g,0,3.2,-d/2-.13,1.9,2.2,.22,M.window);
 box(g,w/2+.13,3.6,0,.2,2,1.4,M.window);
 box(g,-w/2-.13,3.6,0,.2,2,1.4,M.window);
 roof(g,w+1.4,d+1.2,h+2.9,style===1?M.blueRoof:M.redRoof);
 box(g,0,h+1.15,0,w+1.2,.38,d+1.2,style===1?M.blueRoof:M.redRoof);
 box(g,0,2.5,d/2+.24,2.1,.13,.14,M.gold);
 if(style===2){
  box(g,0,h+5.2,0,3.3,.38,3.3,M.woodDark);
  box(g,0,h+6.2,0,2.3,2.3,2.3,M.wood);
 }
 g.userData.kind='house';g.userData.radius=7;scene.add(g);return g;
}
export function tree(scene,x,z,variant=0){
 const y=terrainHeight(x,z);const group=new THREE.Group();
 group.position.set(x,y,z);
 const h=5+((Math.abs(x+z)*.07)%5);
 cylinder(group,0,h*.51,0,.38,.57,h,M.trunk);
 if(variant===0){
  orb(group,0,h+1,0,2.9,2.5,2.6,M.leaf);
  orb(group,-1,h+1.7,0,1.8,1.8,1.8,M.leaf2);
  orb(group,1.2,h+1.5,.3,2.1,1.8,1.7,M.leaf3);
 }else{
  for(let i=0;i<3;i++){
   const c=new THREE.Mesh(new THREE.ConeGeometry(3.3-i*.7,4.5,7),M.leaf3);
   c.position.y=h*.45+i*2.3+1.1;c.castShadow=true;group.add(c)
  }
 }
 group.userData={kind:'tree',health:3,material:variant?'wood':'wood',radius:1.1};scene.add(group);return group;
}
function boulder(scene,x,z,r=2){
 const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);
 orb(g,0,r*.48,0,r,r*.65,r*.84,M.stone2);
 orb(g,r*.3,r*.4,.1,r*.47,r*.4,r*.53,M.stone);
 g.userData={kind:'rock',health:3,material:'stone',radius:r};scene.add(g);return g;
}
function road(scene,a,b){
 const length=Math.hypot(a.x-b.x,a.z-b.z),n=Math.ceil(length/3);
 const roadMat=mat('#cbb58e');
 const geom=new THREE.BufferGeometry();
 const vertices=[],uv=[];
 const dirX=(b.x-a.x)/length,dirZ=(b.z-a.z)/length;
 const sideX=-dirZ*2.3,sideZ=dirX*2.3;
 for(let i=0;i<n;i++){
  const makePoint=(t,s)=>{const x=a.x+(b.x-a.x)*t+sideX*s,z=a.z+(b.z-a.z)*t+sideZ*s;return [x,terrainHeight(x,z)+.12,z]};
  const p=makePoint(i/n,-1),q=makePoint(i/n,1),r=makePoint((i+1)/n,-1),s=makePoint((i+1)/n,1);
  vertices.push(...p,...q,...r,...q,...s,...r);uv.push(0,0,1,0,0,1,1,0,1,1,0,1);
 }
 geom.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geom.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));geom.computeVertexNormals();
 const mesh=new THREE.Mesh(geom,roadMat);mesh.receiveShadow=true;scene.add(mesh);
}
export function createFighter(color='#db886c',enemy=false){
 const root=new THREE.Group();
 const torso=new THREE.Group();root.add(torso);
 box(torso,0,2.15,0,.91,1.35,.54,enemy?M.red:M.shirt);
 box(torso,0,2.28,.29,.72,.9,.12,enemy?M.brickDark:M.armor);
 box(torso,0,1.58,0,.89,.27,.58,M.woodDark);
 orb(torso,0,3.15,0,.38,.42,.38,M.tan);
 box(torso,0,3.48,-.04,.82,.2,.8,enemy?M.dark:M.hair);
 for(let i=0;i<4;i++)box(torso,-.28+i*.18,3.54,-.18,.13,.24,.26,enemy?M.dark:M.hair,.1);
 box(torso,-.12,3.17,.35,.052,.055,.027,M.black);
 box(torso,.12,3.17,.35,.052,.055,.027,M.black);
 const armL=new THREE.Group(),armR=new THREE.Group(),legL=new THREE.Group(),legR=new THREE.Group();
 armL.position.set(-.62,2.64,0);armR.position.set(.62,2.64,0);
 legL.position.set(-.24,1.45,0);legR.position.set(.24,1.45,0);
 torso.add(armL,armR);root.add(legL,legR);
 for(const arm of [armL,armR]){
  box(arm,0,-.41,0,.31,.82,.35,enemy?M.brick:M.shirt);
  orb(arm,0,-.89,.05,.19,.21,.2,M.tan)
 }
 for(const leg of [legL,legR]){
  box(leg,0,-.65,0,.36,1.18,.41,M.pants);
  box(leg,0,-1.28,.16,.38,.3,.62,M.dark);
 }
 box(torso,0,2.23,-.46,.86,1.1,.32,M.woodDark);
 box(torso,0,2.23,-.65,.65,.82,.2,enemy?M.dark:M.blue);
 const weapon=new THREE.Group();weapon.position.set(.42,2.25,.47);
 box(weapon,0,0,0,.15,.17,1.07,M.dark);
 box(weapon,0,.04,.57,.19,.12,.19,M.metal);
 box(weapon,0,-.20,-.1,.16,.42,.18,M.metal);
 box(weapon,0,.17,-.18,.25,.12,.31,M.dark);
 torso.add(weapon);
 root.userData={torso,armL,armR,legL,legR,weapon,enemy};
 return root;
}
export function animateFighter(root,time,speed,heading,pitch=0){
 const a=root.userData;if(!a)return;
 const swing=Math.sin(time*11)*Math.min(.9,speed*.09);
 a.legL.rotation.x=swing;a.legR.rotation.x=-swing;
 a.armL.rotation.x=-swing*.38-1.0;
 a.armR.rotation.x=swing*.3-1.1;
 a.armL.rotation.z=.18;a.armR.rotation.z=-.18;
 a.torso.rotation.z=Math.sin(time*8)*Math.min(.035,speed*.006);
 a.torso.rotation.x=-Math.min(.12,speed*.012);
 a.weapon.rotation.x=-pitch*.45;
}
function pond(scene,x,z,r){
 const mesh=new THREE.Mesh(new THREE.CircleGeometry(r,40),new THREE.MeshStandardMaterial({color:'#2ba6b0',metalness:.13,roughness:.24,transparent:true,opacity:.92}));
 mesh.rotation.x=-PI/2;mesh.position.set(x,terrainHeight(x,z)+.18,z);scene.add(mesh);
}
export function createEnvironment(scene){
 scene.background=new THREE.Color('#89c6ef');
 scene.fog=new THREE.Fog('#a2cae7',190,690);
 const hemi=new THREE.HemisphereLight('#f7e7ca','#596e50',2.0);scene.add(hemi);
 const sun=new THREE.DirectionalLight('#fff0d9',2.5);sun.position.set(-80,160,-75);sun.castShadow=true;
 sun.shadow.mapSize.set(2048,2048);sun.shadow.camera.left=-230;sun.shadow.camera.right=230;
 sun.shadow.camera.top=230;sun.shadow.camera.bottom=-230;sun.shadow.camera.near=1;sun.shadow.camera.far=430;
 sun.shadow.bias=-.0003;scene.add(sun);
 const water=new THREE.Mesh(new THREE.PlaneGeometry(2200,2200),new THREE.MeshStandardMaterial({color:'#2f99bd',metalness:.3,roughness:.38}));
 water.rotation.x=-PI/2;water.position.y=-7;scene.add(water);
 const segments=118,geo=new THREE.PlaneGeometry(SIZE,SIZE,segments,segments);
 geo.rotateX(-PI/2);
 const pos=geo.attributes.position,colors=[];
 const grassA=new THREE.Color('#79b15d'),grassB=new THREE.Color('#afca6a'),sand=new THREE.Color('#e2c994');
 for(let i=0;i<pos.count;i++){
  const x=pos.getX(i),z=pos.getZ(i),y=terrainHeight(x,z);
  pos.setY(i,y);
  const d=Math.hypot(x*.97,z*1.02);
  const mix=Math.sin(x*.045+z*.028)*.5+.5;
  const col=grassA.clone().lerp(grassB,mix*.45);
  if(d>ISLAND_RADIUS-18)col.lerp(sand,clamp((d-(ISLAND_RADIUS-18))/14,0,1));
  colors.push(col.r,col.g,col.b)
 }
 geo.setAttribute('color',new THREE.Float32BufferAttribute(colors,3));geo.computeVertexNormals();
 const land=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({vertexColors:true,roughness:1,side:THREE.DoubleSide}));
 land.receiveShadow=true;scene.add(land);
 for(let i=0;i<LANDMARKS.length;i++){
  if(i>0)road(scene,LANDMARKS[0],LANDMARKS[i]);
 }
 const obstacles=[],harvest=[],locations=[];
 for(const [index,loc] of LANDMARKS.entries()){
  const count=loc.kind==='village'?7:loc.kind==='farm'?5:4;
  for(let j=0;j<count;j++){
   const angle=(j/count)*2*PI+.4*index,dist=loc.kind==='village'?22+(j%2)*6:20+(j%3)*4;
   const x=loc.x+Math.cos(angle)*dist,z=loc.z+Math.sin(angle)*dist;
   if(Math.hypot(x,z)>235)continue;
   const ob=house(scene,x,z,j%3,angle+PI);
   obstacles.push({x,z,radius:5.4,kind:'house'});
  }
  const marker=new THREE.Group();marker.position.set(loc.x,terrainHeight(loc.x,loc.z),loc.z);
  cylinder(marker,0,.55,0,4,4,1.1,M.paleWood,12);
  cylinder(marker,0,.85,0,3.4,3.4,.32,index%2?M.blueRoof:M.redRoof,12);
  scene.add(marker);locations.push(marker);
 }
 pond(scene,-53,83,17);pond(scene,145,-14,12);
 const rand=(seed)=>{let t=seed>>>0;return ()=>{t=(Math.imul(1664525,t)+1013904223)>>>0;return t/4294967296}};
 const next=rand(7262026);
 for(let i=0;i<165;i++){
  const a=next()*2*PI,r=Math.sqrt(next())*238,x=Math.cos(a)*r,z=Math.sin(a)*r;
  if(LANDMARKS.some(p=>Math.hypot(p.x-x,p.z-z)<29))continue;
  if(Math.hypot(x,z)>233)continue;
  if(i%9===0){const rock=boulder(scene,x,z,1+next()*1.6);harvest.push(rock);obstacles.push({x,z,radius:1.4,object:rock});}
  else{const t=tree(scene,x,z,i%4===0?1:0);harvest.push(t);obstacles.push({x,z,radius:1.25,object:t});}
 }
 for(let i=0;i<28;i++){
  const cloud=new THREE.Group();const x=(next()-.5)*520,z=(next()-.5)*520,y=82+next()*62;
  const cloudMat=new THREE.MeshBasicMaterial({color:'#ffffff',transparent:true,opacity:.52+next()*.24,depthWrite:false});
  orb(cloud,0,0,0,11,3.3,6,cloudMat);
  orb(cloud,-7,-1,1,8,2.3,6,cloudMat);
  orb(cloud,8,0,0,7,3,5,cloudMat);
  cloud.position.set(x,y,z);cloud.castShadow=false;scene.add(cloud)
 }
 return {obstacles,harvest,water,land,sun,locations};
}
export function createBuild(scene,x,z,yaw,kind){
 const g=new THREE.Group();g.position.set(x,terrainHeight(x,z),z);g.rotation.y=yaw;
 const w=6;
 if(kind==='wall'){
  box(g,0,2.2,0,6,4.4,.18,M.paleWood);
  for(let i=0;i<5;i++)box(g,-2.7+i*1.35,2.2,.22,.16,4.45,.24,M.woodDark);
  box(g,0,.25,.26,6,.17,.23,M.woodDark);box(g,0,4.13,.26,6,.19,.25,M.woodDark);
 }else if(kind==='floor'){
  box(g,0,.32,0,6,.38,6,M.paleWood);
  for(let i=0;i<5;i++)box(g,-2.5+i*1.25,.57,0,.13,.10,6,M.woodDark);
 }else{
  const ramp=new THREE.Group();ramp.position.set(0,2.0,0);ramp.rotation.x=-.53;g.add(ramp);
  box(ramp,0,0,0,6,.28,7,M.paleWood);
  for(let i=0;i<6;i++)box(ramp,0,.19,-2.8+i*1.12,6,.13,.12,M.woodDark)
 }
 g.userData={kind:'build',type:kind,radius:kind==='wall'?3:2};scene.add(g);return g;
}
export function weaponMesh(group,kind){
 const g=new THREE.Group();
 const scale=kind==='shotgun'?1.18:kind==='sniper'?1.5:kind==='smg'?.76:1;
 box(g,0,0,0,.28,.23,1.2*scale,M.dark);
 box(g,0,0,.68*scale,.12,.10,.62*scale,M.metal);
 box(g,0,-.23,-.20*scale,.18,.48,.2,M.metal);
 box(g,0,.2,-.1*scale,.20,.13,.34,M.dark);
 box(g,0,.05,-.6*scale,.28,.28,.40,M.wood);
 group.add(g);return g;
}
