// BRICK BATTLEGROUNDS v0.7.3 — Option B: plain classic minifigure prototype.
// Replace public/classic-ninja.js with this file.
// Only VERDANT and CRIMSON use this model; public/arena.js already restricts the swap.
// Preserve the exact shoulder / elbow / hip / head rig interface for existing combat.
import * as THREE from '/vendor/three.module.js';

const plastic = color => new THREE.MeshStandardMaterial({
  color, metalness: 0.015, roughness: 0.27
});

function put(parent, geometry, material, x=0, y=0, z=0) {
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.set(x,y,z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function block(parent, material, w,h,d, x,y,z) {
  return put(parent, new THREE.BoxGeometry(w,h,d), material,x,y,z);
}
function cylinder(parent,material,rTop,rBottom,h,x,y,z,sides=28){
  return put(parent,new THREE.CylinderGeometry(rTop,rBottom,h,sides),material,x,y,z);
}

// A properly tapered, simple one-piece classic minifigure torso.
function makeTorso(parent,material){
  // A solid, very lightly beveled tapered minifigure torso.
  // Flat back and front, broad shoulders, gently narrowing waist.
  const shape=new THREE.Shape();
  shape.moveTo(-.438,1.106);
  shape.lineTo(.438,1.106);
  shape.lineTo(.545,2.035);
  shape.quadraticCurveTo(.543,2.081,.493,2.081);
  shape.lineTo(-.493,2.081);
  shape.quadraticCurveTo(-.543,2.081,-.545,2.035);
  shape.closePath();
  const shell=put(parent,new THREE.ExtrudeGeometry(shape,{
    depth:.462,steps:1,bevelEnabled:true,
    bevelThickness:.013,bevelSize:.012,bevelSegments:3,curveSegments:6
  }),material,0,0,-.231);
  shell.name='SmoothClassicMinifigTorso';
  return shell;
}
function makeHead(body,material){
  const head=new THREE.Group();
  head.name='PlainHead';
  head.position.set(0,2.51,0);
  body.add(head);

  // A single smooth, unprinted cylindrical head with softly rounded edges.
  const profile=[
    [0,-.337],[.36,-.337],[.407,-.303],
    [.421,-.265],[.421,.267],[.404,.313],
    [.359,.339],[0,.339]
  ];
  const points=profile.map(([r,y])=>new THREE.Vector2(r,y));
  put(head,new THREE.LatheGeometry(points,32),material);
  cylinder(head,material,.145,.145,.13,0,.404,0,24);
  // Short neck below the head so it looks like an assembled classic toy.
  cylinder(head,material,.219,.219,.13,0,-.403,0,24);
  return head;
}

function makeLeg(visual,material,sx){
  const hip=new THREE.Group();
  hip.name=sx<0?'LeftLeg':'RightLeg';
  hip.position.set(sx*.264,.99,0);
  visual.add(hip);
  // The cylindrical hip joint is tucked inside the leg, not showing above it.
  const hinge=cylinder(hip,material,.166,.166,.405,0,-.077,0,22);
  hinge.rotation.z=Math.PI/2;
  const outline=new THREE.Shape();
  outline.moveTo(-.230,-.916);
  outline.lineTo(.230,-.916);
  outline.lineTo(.230,-.129);
  outline.quadraticCurveTo(.230,-.105,.203,-.105);
  outline.lineTo(-.203,-.105);
  outline.quadraticCurveTo(-.230,-.105,-.230,-.129);
  outline.closePath();
  const leg=put(hip,new THREE.ExtrudeGeometry(outline,{
    depth:.452,steps:1,bevelEnabled:true,
    bevelThickness:.009,bevelSize:.008,bevelSegments:2,curveSegments:4
  }),material,0,0,-.226);
  leg.name='SolidClassicMinifigureLeg';
  // Small block-shaped foot, integrated into the leg with no bulky heel.
  const foot=block(hip,material,.467,.154,.519,0,-.905,-.028);
  foot.name='FlatToyFoot';
  return hip;
}
function makeMoldedSleeve(parent,material,sx){
  // Moulded single-piece arm based on classic toy proportions:
  // short rounded shoulder, gently outward elbow, tapered straight cuff.
  // This replaces the sharply bent tubing from earlier prototypes.
  const rings=[
    // Y, X-offset outward, lateral radius, depth radius, Z-offset
    [.084,.010,.065,.067,.000],
    [.042,.018,.103,.105,.000],
    [-.037,.061,.135,.127,-.006],
    [-.135,.105,.135,.132,-.010],
    [-.245,.170,.126,.124,-.018],
    [-.365,.217,.114,.113,-.024],
    [-.455,.232,.107,.107,-.026],
    [-.521,.222,.104,.103,-.025],
    [-.550,.215,.080,.083,-.024]
  ];
  const n=24,vertices=[],indices=[];
  for(const [y,offset,rx,rz,z] of rings){
    for(let i=0;i<n;i++){
      const t=2*Math.PI*i/n;
      vertices.push(sx*(offset+rx*Math.cos(t)),y,z+rz*Math.sin(t));
    }
  }
  for(let j=0;j<rings.length-1;j++){
    for(let i=0;i<n;i++){
      const next=(i+1)%n;
      const a=j*n+i,b=j*n+next,c=(j+1)*n+i,d=(j+1)*n+next;
      if(sx===1)indices.push(a,b,c,b,d,c);
      else indices.push(a,c,b,b,c,d);
    }
  }
  const top=vertices.length/3;
  vertices.push(sx*rings[0][1],rings[0][0],rings[0][4]);
  const bottom=vertices.length/3;
  const last=rings[rings.length-1];
  vertices.push(sx*last[1],last[0],last[4]);
  for(let i=0;i<n;i++){
    const j=(i+1)%n,base=(rings.length-1)*n;
    if(sx===1)indices.push(top,i,j,bottom,base+j,base+i);
    else indices.push(top,j,i,bottom,base+i,base+j);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const mesh=put(parent,geo,material);
  mesh.name='GentlyBentSinglePieceArm';
  return mesh;
}
function makeArm(body,material,sx){
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  shoulder.position.set(sx*.633,2.015,0);
  body.add(shoulder);
  makeMoldedSleeve(shoulder,material,sx);
  // Preserve the elbow pivot used by every combat animation.
  const elbow=new THREE.Group();
  elbow.position.set(sx*.215,-.550,-.024);
  shoulder.add(elbow);
  // Flush short wrist connection and a true open C, not a donut ring.
  cylinder(elbow,material,.076,.076,.072,0,-.054,0,20);
  const outer=.144,inner=.079,halfGap=.47;
  const first=-Math.PI/2+halfGap;
  const last=first+2*Math.PI-2*halfGap;
  const grip=new THREE.Shape();
  grip.moveTo(outer*Math.cos(first),outer*Math.sin(first));
  grip.absarc(0,0,outer,first,last,false);
  grip.lineTo(inner*Math.cos(last),inner*Math.sin(last));
  grip.absarc(0,0,inner,last,first,true);
  grip.closePath();
  const cup=put(elbow,new THREE.ExtrudeGeometry(grip,{
    depth:.097,steps:1,bevelEnabled:true,
    bevelThickness:.012,bevelSize:.011,bevelSegments:3,curveSegments:30
  }),material,0,-.164,-.049);
  cup.name='TrueOpenCHand';
  shoulder.userData.elbow=elbow;
  return shoulder;
}
export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V073';
  const main=plastic(mainColor);
  const body=new THREE.Group();
  body.name='Torso';
  visual.add(body);
  makeTorso(body,main);
  const head=makeHead(body,main);
  // Plain minifigure hip connector; no ninja costume, belt or scabbards.
  block(visual,main,1.005,.218,.495,0,1.000,0);
  const arms=[makeArm(body,main,-1),makeArm(body,main,1)];
  const legs=[makeLeg(visual,main,-1),makeLeg(visual,main,1)];

  // Preserve the exact API expected by arena.js and its poseFighter().
  // All parts share 'main', so recoloring VERDANT / CRIMSON still works.
  visual.userData={
    arms,legs,body,head,
    cloth:main,pants:main,accent:main,baseColor:mainColor
  };
  return visual;
}