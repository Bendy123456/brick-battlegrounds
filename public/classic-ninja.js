// BRICK BATTLEGROUNDS v0.7.0 — Option B: plain classic minifigure prototype.
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
  const shape = new THREE.Shape();
  shape.moveTo(-.44,1.105);
  shape.lineTo(.44,1.105);
  shape.lineTo(.55,2.015);
  shape.quadraticCurveTo(.55,2.09,.49,2.09);
  shape.lineTo(-.49,2.09);
  shape.quadraticCurveTo(-.55,2.09,-.55,2.015);
  shape.closePath();
  const geo = new THREE.ExtrudeGeometry(shape,{
    depth:.50, steps:1, bevelEnabled:true,
    bevelThickness:.013, bevelSize:.015, bevelSegments:3, curveSegments:7
  });
  // Extrusion runs from -z to 0: centered on the fighter's spine.
  return put(parent,geo,material,0,0,-.25);
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
  // Separate hip groups allow kicks, walking and dodges just like v0.6.x.
  const hip=new THREE.Group();
  hip.position.set(sx*.263,.985,0);
  visual.add(hip);
  block(hip,material,.50,.82,.49,0,-.417,0);
  // Shallow toe extends slightly forward (-Z), not a huge blocky boot.
  block(hip,material,.50,.17,.56,0,-.816,-.025);
  return hip;
}

// Mesh loft around a gently angled arm centerline instead of blocky
// extrusions/capsules. Smooth normals make this read as a molded toy part.
function makeMoldedSleeve(parent,material,sx){
  const rings=[
    // y, outward center offset, x radius, z radius
    [.066,-.008,.080,.086],
    [.032,.012,.125,.127],
    [-.063,.065,.166,.159],
    [-.170,.095,.148,.154],
    [-.294,.100,.131,.144],
    [-.420,.063,.126,.142],
    [-.544,.020,.125,.137],
    [-.596,.015,.117,.130],
    [-.623,.015,.087,.098]
  ];
  const verts=[],inds=[];
  const sides=24;
  for(const [y,dx,rx,rz] of rings){
    for(let k=0;k<sides;k++){
      const angle=2*Math.PI*k/sides;
      verts.push(sx*(dx+rx*Math.cos(angle)),y,rz*Math.sin(angle));
    }
  }
  for(let row=0;row<rings.length-1;row++){
    for(let k=0;k<sides;k++){
      const n=(k+1)%sides;
      const a=row*sides+k, an=row*sides+n;
      const b=(row+1)*sides+k, bn=(row+1)*sides+n;
      if(sx===1)inds.push(a,an,b,an,bn,b);
      else inds.push(a,b,an,an,b,bn);
    }
  }
  const geometry=new THREE.BufferGeometry();
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
  geometry.setIndex(inds);
  geometry.computeVertexNormals();
  const mesh=put(parent,geometry,material);
  mesh.name='MoldedCurvedMinifigureArm';
  return mesh;
}

function makeArm(body,material,sx){
  const shoulder=new THREE.Group();
  shoulder.name=sx<0?'LeftArm':'RightArm';
  shoulder.position.set(sx*.617,2.015,0);
  body.add(shoulder);
  makeMoldedSleeve(shoulder,material,sx);

  // Existing combo animations expect a shoulder.userData.elbow Group.
  // Keep the pivot but only the small hand belongs to it.
  const elbow=new THREE.Group();
  elbow.position.set(sx*.015,-.59,0);
  shoulder.add(elbow);
  // Short wrist peg tucked into the bottom of the sleeve.
  cylinder(elbow,material,.085,.085,.106,0,-.083,0,20);
  // C-grip with a visible front-facing opening (like the reference photo).
  const gap=.90;
  const cup=put(elbow,new THREE.TorusGeometry(.132,.045,12,36,Math.PI*2-gap),material,0,-.205,0);
  cup.rotation.z=-Math.PI/2+gap/2;
  cup.name='ClassicCGrip';
  shoulder.userData.elbow=elbow;
  return shoulder;
}

export function buildClassicNinja(mainColor){
  const visual=new THREE.Group();
  visual.name='PLAIN_CLASSIC_MINIFIG_V070';
  const main=plastic(mainColor);
  const body=new THREE.Group();
  body.name='Torso';
  visual.add(body);
  makeTorso(body,main);
  const head=makeHead(body,main);
  // Plain minifigure hip connector; no ninja costume, belt or scabbards.
  block(visual,main,1.016,.155,.52,0,1.045,0);
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