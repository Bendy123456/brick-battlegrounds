// BRICK BATTLEGROUNDS v0.7.6 — Option B: plain classic minifigure prototype.
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
function makeCHand(parent, material) {
  // Solid molded C-shaped grip: short and rounded, with a visible opening.
  const grip = new THREE.Shape();
  const outer = 0.148, inner = 0.082;
  const start = -Math.PI / 2 + 0.48;
  const end = start + (Math.PI * 2 - 0.96);
  grip.moveTo(outer * Math.cos(start), outer * Math.sin(start));
  grip.absarc(0, 0, outer, start, end, false);
  grip.lineTo(inner * Math.cos(end), inner * Math.sin(end));
  grip.absarc(0, 0, inner, end, start, true);
  grip.closePath();
  const geo = new THREE.ExtrudeGeometry(grip, {
    depth: 0.10, steps: 1, bevelEnabled: true,
    bevelThickness: 0.012, bevelSize: 0.012,
    bevelSegments: 3, curveSegments: 28
  });
  const hand = put(parent, geo, material, 0, -0.165, -0.05);
  hand.name = 'ClassicCHand';
  return hand;
}

function makeArmShell(parent, material, sx) {
  // v0.7.6: a real minifigure-inspired elbow silhouette.
  // The upper arm travels outward diagonally, reaches its widest point at the
  // elbow, then the forearm slopes slightly back inwards towards the C-hand.
  // It is one sealed, molded sleeve — no detached ball-shaped elbow joint.
  const rings = [
    // y, outward x offset, lateral radius, front/back radius, z offset
    [ 0.09, 0.008,0.098,0.103, 0.00],
    [ 0.05, 0.015,0.141,0.144, 0.00],
    [-0.04, 0.044,0.156,0.159,-0.004],
    [-0.13, 0.089,0.157,0.156,-0.007],
    [-0.21, 0.142,0.153,0.151,-0.012],
    // Elbow knuckle: distinct turn, with a fuller outer radius.
    [-0.265,0.176,0.149,0.146,-0.015],
    [-0.318,0.179,0.145,0.145,-0.018],
    [-0.362,0.171,0.138,0.137,-0.019],
    // Lower forearm returns inward and tapers to the wrist cuff.
    [-0.420,0.150,0.132,0.131,-0.020],
    [-0.502,0.116,0.115,0.115,-0.020],
    [-0.559,0.111,0.092,0.099,-0.020],
    [-0.580,0.111,0.078,0.088,-0.020]
  ];
  const sides=32, vertices=[], indices=[];
  for(const [y,offset,rx,rz,z] of rings){
    for(let i=0;i<sides;i++){
      const t=(i/sides)*Math.PI*2;
      vertices.push(sx*(offset+rx*Math.cos(t)),y,z+rz*Math.sin(t));
    }
  }
  for(let row=0;row<rings.length-1;row++){
    for(let i=0;i<sides;i++){
      const next=(i+1)%sides;
      const a=row*sides+i,b=row*sides+next;
      const c=(row+1)*sides+i,d=(row+1)*sides+next;
      if(sx===1)indices.push(a,b,c,b,d,c);
      else indices.push(a,c,b,b,c,d);
    }
  }
  // Seal shoulder and wrist ends for clean plastic shading.
  const top=vertices.length/3;
  vertices.push(sx*rings[0][1],rings[0][0],rings[0][4]);
  const bottom=vertices.length/3;
  const last=rings[rings.length-1];
  vertices.push(sx*last[1],last[0],last[4]);
  for(let i=0;i<sides;i++){
    const next=(i+1)%sides, base=(rings.length-1)*sides;
    if(sx===1)indices.push(top,i,next,bottom,base+next,base+i);
    else indices.push(top,next,i,bottom,base+i,base+next);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const sleeve=put(parent,geo,material);
  sleeve.name='BentElbowMinifigureArm';
  return sleeve;
}

function makeArm(body, material, sx) {
  const shoulder = new THREE.Group();
  shoulder.name = sx < 0 ? 'LeftArm' : 'RightArm';
  shoulder.position.set(sx * 0.565, 2.01, 0);
  body.add(shoulder);
  // Compact shoulder socket integrated into the fuller molded sleeve.
  const ball = put(shoulder, new THREE.SphereGeometry(0.12,16,12), material, 0,0.02,0);
  ball.scale.set(1,0.95,1);
  ball.name = 'ShoulderSocket';
  makeArmShell(shoulder, material, sx);
  // Keep exactly the elbow pivot the combat engine expects.
  const elbow = new THREE.Group();
  elbow.position.set(sx * 0.111, -0.575, -0.02);
  shoulder.add(elbow);
  const wrist = cylinder(elbow, material, 0.078,0.078,0.075, 0,-0.05,0, 20);
  wrist.name = 'WristTube';
  makeCHand(elbow, material);
  shoulder.userData.elbow = elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V076';
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