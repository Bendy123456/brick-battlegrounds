// BRICK BATTLEGROUNDS v0.7.2 — Option B: plain classic minifigure prototype.
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
  // True minifigure trapezoid, slightly broader shoulders, narrow straight waist.
  const shape=new THREE.Shape();
  shape.moveTo(-.427,1.112);
  shape.lineTo(.427,1.112);
  shape.lineTo(.513,2.043);
  shape.quadraticCurveTo(.515,2.080,.480,2.080);
  shape.lineTo(-.480,2.080);
  shape.quadraticCurveTo(-.515,2.080,-.513,2.043);
  shape.closePath();
  const shell=put(parent,new THREE.ExtrudeGeometry(shape,{
    depth:.442,steps:1,bevelEnabled:true,
    bevelThickness:.010,bevelSize:.010,bevelSegments:2,curveSegments:5
  }),material,0,0,-.221);
  shell.name='ClassicOnePieceTrapezoid';
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
  hip.position.set(sx*.265,.990,0);
  visual.add(hip);
  // The hip hinge is tucked inside the body instead of visibly protruding.
  const hinge=cylinder(hip,material,.163,.163,.415,0,-.060,0,20);
  hinge.rotation.z=Math.PI/2;
  const profile=new THREE.Shape();
  profile.moveTo(-.231,-.865);
  profile.lineTo(.231,-.865);
  profile.lineTo(.231,-.124);
  profile.quadraticCurveTo(.231,-.101,.207,-.101);
  profile.lineTo(-.207,-.101);
  profile.quadraticCurveTo(-.231,-.101,-.231,-.124);
  profile.closePath();
  const leg=put(hip,new THREE.ExtrudeGeometry(profile,{
    depth:.456,steps:1,bevelEnabled:true,
    bevelThickness:.010,bevelSize:.008,bevelSegments:2,curveSegments:3
  }),material,0,0,-.228);
  leg.name='ClassicStraightLeg';
  // Foot is short, flush with the leg and extends forward only slightly.
  const foot=block(hip,material,.468,.144,.528,0,-.819,-.031);
  foot.name='IntegratedFlatFoot';
  return hip;
}

// Mesh loft around a gently angled arm centerline instead of blocky
// extrusions/capsules. Smooth normals make this read as a molded toy part.
function makeMoldedSleeve(parent,material,sx){
  // Narrow realistic molded minifigure arm: subtle shoulder and angled elbow.
  // The shoulder is part of this single smooth plastic form, not a large ball.
  const rings=[
    // y, offset away from torso, radius left-right, radius front-back, forward curve
    [.065,-.006,.075,.084,.000],
    [.029,.006,.105,.107,.000],
    [-.048,.024,.126,.122,-.003],
    [-.142,.055,.126,.126,-.011],
    [-.248,.092,.113,.118,-.017],
    [-.348,.115,.106,.109,-.025],
    [-.438,.107,.094,.102,-.029],
    [-.508,.090,.092,.099,-.027],
    [-.535,.085,.073,.083,-.024]
  ];
  const sides=24,verts=[],indices=[];
  for(const [y,offset,rx,rz,z] of rings){
    for(let k=0;k<sides;k++){
      const theta=k*2*Math.PI/sides;
      verts.push(sx*(offset+rx*Math.cos(theta)),y,z+rz*Math.sin(theta));
    }
  }
  for(let i=0;i<rings.length-1;i++){
    for(let k=0;k<sides;k++){
      const n=(k+1)%sides;
      const a=i*sides+k,b=i*sides+n,c=(i+1)*sides+k,d=(i+1)*sides+n;
      if(sx===1)indices.push(a,b,c,b,d,c);
      else indices.push(a,c,b,b,c,d);
    }
  }
  // Proper sealed ends, rather than open tube edges.
  const top=verts.length/3;
  verts.push(sx*rings[0][1],rings[0][0],rings[0][4]);
  const bot=verts.length/3;
  const last=rings[rings.length-1];
  verts.push(sx*last[1],last[0],last[4]);
  for(let k=0;k<sides;k++){
    const n=(k+1)%sides,base=(rings.length-1)*sides;
    if(sx===1)indices.push(top,k,n,bot,base+n,base+k);
    else indices.push(top,n,k,bot,base+k,base+n);
  }
  const geo=new THREE.BufferGeometry();
  geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geo.setIndex(indices);geo.computeVertexNormals();
  const mesh=put(parent,geo,material);
  mesh.name='SlimMoldedMinifigArm';
  return mesh;
}

function makeArm(body,material,sx){
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  shoulder.position.set(sx*.606,2.018,0);
  body.add(shoulder);
  makeMoldedSleeve(shoulder,material,sx);
  // Original elbow pivot is essential for the punch, block and heavy animations.
  const elbow=new THREE.Group();
  elbow.position.set(sx*.085,-.533,-.024);
  shoulder.add(elbow);
  // The wrist is only a tiny visible neck under the molded sleeve.
  cylinder(elbow,material,.071,.071,.070,0,-.070,0,20);
  // Actual open C-shaped clip geometry, not a nearly closed donut/torus.
  // Flat rounded ends and a visible opening below, like classic toy hands.
  const outer=.148,inner=.079,halfGap=.47;
  const a=-Math.PI/2+halfGap,b=a+Math.PI*2-2*halfGap;
  const shape=new THREE.Shape();
  shape.moveTo(outer*Math.cos(a),outer*Math.sin(a));
  shape.absarc(0,0,outer,a,b,false);
  shape.lineTo(inner*Math.cos(b),inner*Math.sin(b));
  shape.absarc(0,0,inner,b,a,true);
  shape.closePath();
  const clip=put(elbow,new THREE.ExtrudeGeometry(shape,{
    depth:.095,steps:1,bevelEnabled:true,
    bevelThickness:.012,bevelSize:.011,bevelSegments:3,curveSegments:28
  }),material,0,-.180,-.050);
  clip.name='OpenMoldedCGrip';
  shoulder.userData.elbow=elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V072';
  const main=plastic(mainColor);
  const body=new THREE.Group();
  body.name='Torso';
  visual.add(body);
  makeTorso(body,main);
  const head=makeHead(body,main);
  // Plain minifigure hip connector; no ninja costume, belt or scabbards.
  block(visual,main,.994,.185,.498,0,1.018,0);
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