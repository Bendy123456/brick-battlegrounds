// BRICK BATTLEGROUNDS v0.7.9 — Option B: plain classic minifigure prototype.
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
  // v0.7.9: single molded classic minifigure arm, without a detached shoulder ball.
  // The shoulder rounds out as part of the sleeve, then slopes into a subtle elbow bend.
  const rings = [
    // y, outward x offset, lateral radius, front/back radius, z offset
    [ 0.13, 0.000,0.132,0.128,-0.020],
    [ 0.10, 0.010,0.150,0.144,-0.018],
    [ 0.06, 0.022,0.156,0.149,-0.015],
    [ 0.00, 0.032,0.152,0.146,-0.008],
    [-0.08, 0.040,0.148,0.142, 0.000],
    [-0.16, 0.047,0.144,0.138, 0.010],
    [-0.24, 0.056,0.139,0.133, 0.020],
    [-0.30, 0.060,0.133,0.128, 0.028],
    [-0.35, 0.058,0.126,0.123, 0.030],
    [-0.42, 0.053,0.118,0.116, 0.026],
    [-0.50, 0.048,0.104,0.104, 0.020],
    [-0.56, 0.046,0.088,0.094, 0.014],
    [-0.585,0.046,0.074,0.084, 0.014]
  ];
  const sides=32,vertices=[],indices=[];
  for(const [y,offset,rx,rz,z] of rings){
    for(let i=0;i<sides;i++){
      const t=i/sides*Math.PI*2;
      vertices.push(sx*(offset+rx*Math.cos(t)),y,z+rz*Math.sin(t));
    }
  }
  for(let row=0;row<rings.length-1;row++){
    for(let i=0;i<sides;i++){
      const next=(i+1)%sides;
      const a=row*sides+i,b=row*sides+next,c=(row+1)*sides+i,d=(row+1)*sides+next;
      if(sx===1)indices.push(a,b,c,b,d,c);
      else indices.push(a,c,b,b,c,d);
    }
  }
  const top=vertices.length/3;
  vertices.push(sx*rings[0][1],rings[0][0],rings[0][4]);
  const bottom=vertices.length/3;
  const last=rings[rings.length-1];
  vertices.push(sx*last[1],last[0],last[4]);
  for(let i=0;i<sides;i++){
    const next=(i+1)%sides,base=(rings.length-1)*sides;
    if(sx===1)indices.push(top,i,next,bottom,base+next,base+i);
    else indices.push(top,next,i,bottom,base+i,base+next);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));
  geo.setIndex(indices);
  geo.computeVertexNormals();
  const sleeve=put(parent,geo,material);
  sleeve.name='OnePieceClassicArm';
  return sleeve;
}

function makeArm(body, material, sx) {
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  // Slight clearance from torso, with the rounded shoulder built into the sleeve.
  shoulder.position.set(sx*0.545,2.01,-0.006);
  body.add(shoulder);
  makeArmShell(shoulder,material,sx);

  // Preserve the articulated pivot used by combat animations and blocking.
  const elbow=new THREE.Group();
  elbow.position.set(sx*0.046,-0.585,0.014);
  shoulder.add(elbow);
  const wrist=cylinder(elbow,material,0.078,0.078,0.075,0,-0.05,0,20);
  wrist.name='WristTube';
  const hand=makeCHand(elbow,material);
  hand.rotation.z=sx<0?-0.17:0.17;
  hand.rotation.x=-0.08;
  hand.rotation.y=sx<0?0.06:-0.06;
  shoulder.userData.elbow=elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V079';
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