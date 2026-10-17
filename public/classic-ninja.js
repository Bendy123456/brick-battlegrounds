// BRICK BATTLEGROUNDS v0.7.1 — Option B: plain classic minifigure prototype.
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
  // Genuine minifigure-style tapered shell: clean flat chest and gentle edges.
  const outline=new THREE.Shape();
  outline.moveTo(-.425,1.105);outline.lineTo(.425,1.105);
  outline.lineTo(.542,2.035);
  outline.quadraticCurveTo(.544,2.083,.494,2.083);
  outline.lineTo(-.494,2.083);
  outline.quadraticCurveTo(-.544,2.083,-.542,2.035);
  outline.closePath();
  const geo=new THREE.ExtrudeGeometry(outline,{
    depth:.455,steps:1,bevelEnabled:true,
    bevelThickness:.020,bevelSize:.021,bevelSegments:3,curveSegments:7
  });
  const shell=put(parent,geo,material,0,0,-.2275);
  shell.name='ClassicTaperedTorsoShell';
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
  // Rounded hip pivot leading into one solid leg and small integrated foot.
  const hip=new THREE.Group();
  hip.position.set(sx*.265,.990,0);visual.add(hip);
  hip.name=sx<0?'LeftLeg':'RightLeg';
  const hinge=cylinder(hip,material,.231,.231,.495,0,-.09,0,24);
  hinge.rotation.z=Math.PI/2;
  hinge.name='RoundedHipPivot';
  const leg=block(hip,material,.485,.71,.475,0,-.442,0);
  leg.name='SmoothLeg';
  const foot=block(hip,material,.485,.173,.542,0,-.827,-.031);
  foot.name='ClassicFoot';
  return hip;
}

// Mesh loft around a gently angled arm centerline instead of blocky
// extrusions/capsules. Smooth normals make this read as a molded toy part.
function makeMoldedSleeve(parent,material,sx){
  // Smooth molded LEGO-like shoulder and angled, narrowing rigid sleeve.
  const rings=[
    [.115,-.01,.091,.085],
    [.073,.010,.145,.137],
    [-.020,.030,.164,.154],
    [-.135,.061,.160,.156],
    [-.250,.091,.147,.146],
    [-.356,.116,.133,.132],
    [-.458,.112,.116,.118],
    [-.541,.092,.121,.114],
    [-.590,.080,.112,.106],
    [-.610,.078,.086,.088]
  ];
  const verts=[],inds=[],sides=24;
  for(const [y,dx,rx,rz] of rings){
    for(let k=0;k<sides;k++){
      const theta=2*Math.PI*k/sides;
      verts.push(sx*(dx+rx*Math.cos(theta)),y,rz*Math.sin(theta));
    }
  }
  for(let i=0;i<rings.length-1;i++){
    for(let k=0;k<sides;k++){
      const next=(k+1)%sides;
      const a=i*sides+k,an=i*sides+next,b=(i+1)*sides+k,bn=(i+1)*sides+next;
      if(sx===1)inds.push(a,an,b,an,bn,b);
      else inds.push(a,b,an,an,b,bn);
    }
  }
  // Close the arm mesh so the wrist and shoulder never look hollow.
  const start=verts.length/3;
  verts.push(0,rings[0][0],0);
  const end=verts.length/3;
  verts.push(sx*rings[rings.length-1][1],rings[rings.length-1][0],0);
  for(let k=0;k<sides;k++){
    const next=(k+1)%sides;
    if(sx===1){inds.push(start,k,next);inds.push(end,(rings.length-1)*sides+next,(rings.length-1)*sides+k)}
    else{inds.push(start,next,k);inds.push(end,(rings.length-1)*sides+k,(rings.length-1)*sides+next)}
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geometry.setIndex(inds);
  geometry.computeVertexNormals();
  const sleeve=put(parent,geometry,material);
  sleeve.name='ClassicMoldedBentArm';
  return sleeve;
}

function makeArm(body,material,sx){
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  shoulder.position.set(sx*.632,2.012,0);
  body.add(shoulder);
  // Small rounded shoulder connection, rather than a big capsule.
  const socket=put(shoulder,new THREE.SphereGeometry(.145,16,12),material,0,.015,0);
  socket.scale.set(1,.94,.98);
  socket.name='RoundedShoulderPivot';
  makeMoldedSleeve(shoulder,material,sx);
  // Existing punch, block, dodge animations depend on this elbow group.
  const elbow=new THREE.Group();
  elbow.position.set(sx*.078,-.572,0);
  shoulder.add(elbow);
  // Short wrist stem with classic C grip.
  cylinder(elbow,material,.087,.087,.085,0,-.066,0,20);
  const gap=.93;
  const cup=put(elbow,new THREE.TorusGeometry(.130,.048,12,36,Math.PI*2-gap),material,0,-.180,0);
  cup.rotation.z=-Math.PI/2+gap/2;
  cup.name='TraditionalMinifigureCHand';
  shoulder.userData.elbow=elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V071';
  const main=plastic(mainColor);
  const body=new THREE.Group();
  body.name='Torso';
  visual.add(body);
  makeTorso(body,main);
  const head=makeHead(body,main);
  // Plain minifigure hip connector; no ninja costume, belt or scabbards.
  block(visual,main,1.005,.175,.515,0,1.028,0);
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