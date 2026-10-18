// AIRSOFT ARENA — exact original Brick Battlegrounds minifigure geometry (source preserved).
// CHANGED: All nine fighters use this same articulated model; each model
// CHANGED: instance has its own material and keeps its selected roster color.
// Preserve the exact shoulder / elbow / hip / head rig interface for existing combat.
import * as THREE from 'three';

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
  head.position.set(0,1.43,0); // CHANGED: offset from waist pivot; same resting head world position
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

// CHANGED: Add an independent knee pivot; in rest pose both pieces align
// exactly with the existing shank and foot (no foot world-position change).
function makeLeg(visual,material,sx){
  const hip=new THREE.Group();
  hip.name=sx<0?'LeftLeg':'RightLeg';
  hip.position.set(sx*.264,.99,0);visual.add(hip);
  const hinge=cylinder(hip,material,.166,.166,.405,0,-.077,0,22);
  hinge.rotation.z=Math.PI/2;
  const geometry=shape=>new THREE.ExtrudeGeometry(shape,{
    depth:.452,steps:1,bevelEnabled:true,
    bevelThickness:.009,bevelSize:.008,bevelSegments:2,curveSegments:4
  });
  const upper=new THREE.Shape();
  upper.moveTo(-.230,-.430);upper.lineTo(.230,-.430);
  upper.lineTo(.230,-.129);
  upper.quadraticCurveTo(.230,-.105,.203,-.105);
  upper.lineTo(-.203,-.105);
  upper.quadraticCurveTo(-.230,-.105,-.230,-.129);
  upper.closePath();
  const thigh=put(hip,geometry(upper),material,0,0,-.226);
  thigh.name='ClassicUpperLeg';
  const knee=new THREE.Group();knee.name='KneePivot';
  knee.position.set(0,-.430,0);hip.add(knee);
  const lower=new THREE.Shape();
  lower.moveTo(-.230,-.486);lower.lineTo(.230,-.486);
  lower.lineTo(.230,0);lower.lineTo(-.230,0);lower.closePath();
  const shin=put(knee,geometry(lower),material,0,0,-.226);
  shin.name='ClassicLowerLeg';
  // Same resting foot location, now with an independently rotating ankle.
  const ankle=new THREE.Group();ankle.name='AnklePivot';
  ankle.position.set(0,-.410,0);knee.add(ankle);
  const foot=block(ankle,material,.467,.154,.519,0,-.065,-.028);
  foot.name='FlatToyFoot';
  hip.userData.knee=knee;hip.userData.ankle=ankle;hip.userData.foot=foot;
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

function makeArmShell(parent, material, sx, elbow) { // CHANGED: render two linked arm sections using original profile
  // v0.8.0: one molded arm with the rounded shoulder dome integral to the sleeve.
  // The shoulder rounds out as part of the sleeve, then slopes into a subtle elbow bend.
  const rings = [
    // y, outward x offset, lateral radius, front/back radius, z offset
    // Rounded dome formed in one continuous sleeve mesh.
    [ 0.176,0.000,0.030,0.039,-0.021],
    [ 0.167,0.001,0.060,0.072,-0.021],
    [ 0.148,0.003,0.101,0.107,-0.020],
    [ 0.123,0.008,0.132,0.132,-0.019],
    [ 0.091,0.014,0.152,0.146,-0.016],
    [ 0.054,0.021,0.159,0.154,-0.012],
    [ 0.000,0.031,0.155,0.149,-0.006],
    [-0.08, 0.040,0.150,0.143, 0.002],
    [-0.16, 0.048,0.145,0.138, 0.010],
    [-0.24, 0.057,0.140,0.133, 0.020],
    [-0.30, 0.061,0.134,0.128, 0.028],
    [-0.35, 0.059,0.128,0.123, 0.030],
    [-0.42, 0.054,0.119,0.116, 0.026],
    [-0.50, 0.049,0.105,0.104, 0.020],
    [-0.56, 0.046,0.089,0.094, 0.014],
    [-0.585,0.046,0.074,0.084, 0.014]
  ];
  // CHANGED: Preserve every original sleeve ring, splitting its geometry at
  // CHANGED: anatomical elbow y=-.30 so the forearm can rotate independently.
  const split=10; // CHANGED: Ring at the elbow, below the upper-arm section
  const pivot=[sx*rings[split][1],rings[split][0],rings[split][4]]; // CHANGED
  function section(first,last,target,origin,name){ // CHANGED: Mesh stays in same world position when straight
    const segment=rings.slice(first,last+1),sides=32,vertices=[],indices=[]; // CHANGED
    for(const [y,offset,rx,rz,z] of segment){ // CHANGED
      for(let i=0;i<sides;i++){ // CHANGED
        const t=i/sides*Math.PI*2; // CHANGED
        vertices.push(sx*(offset+rx*Math.cos(t))-origin[0],y-origin[1],z+rz*Math.sin(t)-origin[2]); // CHANGED
      } // CHANGED
    } // CHANGED
    for(let row=0;row<segment.length-1;row++){ // CHANGED
      for(let i=0;i<sides;i++){ // CHANGED
        const next=(i+1)%sides,a=row*sides+i,b=row*sides+next,c=(row+1)*sides+i,d=(row+1)*sides+next; // CHANGED
        if(sx===1)indices.push(a,b,c,b,d,c);else indices.push(a,c,b,b,c,d); // CHANGED
      } // CHANGED
    } // CHANGED
    const top=vertices.length/3; // CHANGED
    vertices.push(sx*segment[0][1]-origin[0],segment[0][0]-origin[1],segment[0][4]-origin[2]); // CHANGED
    const bottom=vertices.length/3,lastRing=segment[segment.length-1]; // CHANGED
    vertices.push(sx*lastRing[1]-origin[0],lastRing[0]-origin[1],lastRing[4]-origin[2]); // CHANGED
    for(let i=0;i<sides;i++){ // CHANGED
      const next=(i+1)%sides,base=(segment.length-1)*sides; // CHANGED
      if(sx===1)indices.push(top,i,next,bottom,base+next,base+i); // CHANGED
      else indices.push(top,next,i,bottom,base+i,base+next); // CHANGED
    } // CHANGED
    const geo=new THREE.BufferGeometry(); // CHANGED
    geo.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3)); // CHANGED
    geo.setIndex(indices);geo.computeVertexNormals(); // CHANGED
    const sleeve=put(target,geo,material);sleeve.name=name; // CHANGED
    return sleeve; // CHANGED
  } // CHANGED
  section(0,split,parent,[0,0,0],'ClassicUpperArmSleeve'); // CHANGED
  section(split,rings.length-1,elbow,pivot,'ClassicForearmSleeve'); // CHANGED
} // CHANGED

function makeArm(body, material, sx) {
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  // Slight clearance from torso, with the rounded shoulder built into the sleeve.
  shoulder.position.set(sx*0.538,0.92,-0.006); // CHANGED: local shoulder below waist-mounted body; same resting world position
  body.add(shoulder);
  const elbow=new THREE.Group(); // CHANGED: Actual elbow pivot, not the wrist
  elbow.name='ElbowPivot'; // CHANGED
  elbow.position.set(sx*0.061,-0.30,0.028); // CHANGED: Anatomical elbow center on arm profile
  shoulder.add(elbow); // CHANGED
  makeArmShell(shoulder,material,sx,elbow); // CHANGED: Upper arm + hinged forearm, same rest silhouette
  const wristAnchor=new THREE.Group(); // CHANGED: Keep original wrist placement below new elbow
  wristAnchor.position.set(sx*(0.046-0.061),-0.285,0.014-0.028); // CHANGED
  elbow.add(wristAnchor); // CHANGED
  const wrist=cylinder(wristAnchor,material,0.078,0.078,0.075,0,-0.05,0,20); // CHANGED
  wrist.name='WristTube';
  const hand=makeCHand(wristAnchor,material); // CHANGED
  hand.rotation.z=sx<0?-0.14:0.14;
  hand.rotation.x=-0.06;
  hand.rotation.y=sx<0?0.04:-0.04;
  shoulder.userData.elbow=elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V084'; // CHANGED: anime animation rig revision
  const main=plastic(mainColor);
  const body=new THREE.Group();
  body.name='Torso';
  // CHANGED: True hip-height waist pivot. Body can now twist without swinging
  // the torso around the fighter's feet; mesh remains at its original world Y.
  body.position.y=1.08;
  visual.add(body);
  const torsoShell=makeTorso(body,main);
  torsoShell.position.y=-1.08; // CHANGED: exactly counter-offset world-space mesh
  const head=makeHead(body,main);
  // Plain minifigure hip connector; no ninja costume, belt or scabbards.
  block(visual,main,1.005,.218,.495,0,1.000,0);
  const arms=[makeArm(body,main,-1),makeArm(body,main,1)];
  const legs=[makeLeg(visual,main,-1),makeLeg(visual,main,1)];

  // Preserve the exact API expected by arena.js and its poseFighter().
  // CHANGED: All parts share this fighter's own main material; supports all nine roster colors.
  visual.userData={
    arms,legs,body,head,
    cloth:main,pants:main,accent:main,baseColor:mainColor
  };
  return visual;
}