// Brick Battlegrounds / classic ninja prototype rig, v0.6.9.
// Original simplified minifigure-inspired character geometry.
// Only applied to VERDANT and CRIMSON, not the rest of the roster.
import * as THREE from '/vendor/three.module.js';

const material=(color,roughness=.27)=>new THREE.MeshStandardMaterial({
 color,roughness,metalness:0.015
});
function add(parent,geometry,material,position=[0,0,0],rotation=[0,0,0]){
 const mesh=new THREE.Mesh(geometry,material);
 mesh.position.set(...position);
 mesh.rotation.set(...rotation);
 mesh.castShadow=true;mesh.receiveShadow=true;
 parent.add(mesh);return mesh;
}
function box(parent,w,h,d,mat,x,y,z){return add(parent,new THREE.BoxGeometry(w,h,d),mat,[x,y,z]);}
function cyl(parent,rt,rb,h,mat,x,y,z,segments=24){return add(parent,new THREE.CylinderGeometry(rt,rb,h,segments),mat,[x,y,z]);}
function ball(parent,x,y,z,r,mat){return add(parent,new THREE.SphereGeometry(r,16,10),mat,[x,y,z]);}
function slopedTorso(parent,mat){
 // v0.6.9: clean classic toy-minifigure torso — tapered, slim and smooth.
 const shape=new THREE.Shape();
 shape.moveTo(-.435,1.10);shape.lineTo(.435,1.10);
 shape.lineTo(.54,2.06);
 shape.quadraticCurveTo(.535,2.11,.485,2.11);
 shape.lineTo(-.485,2.11);
 shape.quadraticCurveTo(-.535,2.11,-.54,2.06);
 shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{
  depth:.425,steps:1,bevelEnabled:true,
  bevelThickness:.017,bevelSize:.014,bevelSegments:3,curveSegments:6
 });
 return add(parent,geo,mat,[0,0,-.2125]);
}
function simpleLeg(parent,mat,x){
 const leg=new THREE.Group();leg.position.set(x,.99,0);parent.add(leg);
 add(leg,new THREE.BoxGeometry(.48,.84,.48),mat,[0,-.43,0]);
 box(leg,.49,.16,.54,mat,0,-.80,-.01);
 return leg;
}
function simpleArm(parent,main,hand,sx){
 const shoulder=new THREE.Group();
 shoulder.position.set(sx*.65,2.025,0);
 parent.add(shoulder);

 // Sculpted smooth minifigure arm: thin shoulder, small elbow bend,
 // tapered cuff. Rounded in 3D, not a flat box or a giant oval capsule.
 const rings=[
  // height, outward curve, sideways radius, front-to-back radius
  [.110,-.016,.068,.070],
  [.074,.005,.111,.120],
  [-.016,.014,.121,.125],
  [-.125,.035,.114,.119],
  [-.235,.074,.106,.113],
  [-.327,.104,.099,.108],
  [-.405,.105,.090,.104],
  [-.472,.086,.080,.099],
  [-.505,.078,.064,.080],
  [-.514,.077,.025,.037]
 ];
 const sides=20,verts=[],faces=[];
 for(let r=0;r<rings.length;r++){
  const [y,bend,rx,rz]=rings[r];
  for(let k=0;k<sides;k++){
   const t=2*Math.PI*k/sides;
   verts.push(bend+rx*Math.cos(t),y,rz*Math.sin(t));
  }
 }
 for(let r=0;r<rings.length-1;r++){
  for(let k=0;k<sides;k++){
   const nk=(k+1)%sides;
   const a=r*sides+k,an=r*sides+nk,b=(r+1)*sides+k,bn=(r+1)*sides+nk;
   faces.push(a,an,b,an,bn,b);
  }
 }
 const geo=new THREE.BufferGeometry();
 geo.setAttribute('position',new THREE.Float32BufferAttribute(verts,3));
 geo.setIndex(faces);
 geo.computeVertexNormals();
 const sleeve=add(shoulder,geo,main);
 sleeve.name='MoldedClassicSlimArm';
 sleeve.scale.x=sx;

 // Preserve existing punch/block elbow rotations and put a small grip
 // immediately under the molded sleeve, not on a long hanging extension.
 const elbow=new THREE.Group();
 elbow.position.set(sx*.077,-.46,-.008);
 shoulder.add(elbow);
 cyl(elbow,.076,.076,.075,hand,0,-.104,0,18);
 const gap=.78;
 const cup=new THREE.Mesh(
  new THREE.TorusGeometry(.124,.047,10,32,Math.PI*2-gap),hand
 );
 cup.rotation.z=-Math.PI/2+gap/2;
 cup.position.set(0,-.22,-.009);
 cup.castShadow=true;cup.receiveShadow=true;
 cup.name='CompactClassicCGrip';
 elbow.add(cup);
 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.055;
 return shoulder;
}
function buildSimpleHead(body,main,skin,ink){
 const head=new THREE.Group();head.position.set(0,2.52,0);body.add(head);
 // Open ninja hood preserves the v0.6.4 recessed face.
 add(head,new THREE.CylinderGeometry(.418,.418,.70,32,1,true,Math.PI+.60,Math.PI*2-1.20),main,[0,.08,.02]);
 cyl(head,.13,.13,.10,main,0,.50,.03,24);
 add(head,new THREE.CylinderGeometry(.385,.385,.29,24,1,true,Math.PI-.62,1.24),skin,[0,.145,.02]);
 cyl(head,.425,.425,.13,main,0,.395,.02,32);
 cyl(head,.426,.423,.275,main,0,-.205,.02,32);
 box(head,.61,.055,.06,main,0,-.038,-.390);
 for(const sx of [-1,1]){
  const eye=box(head,.064,.070,.011,ink,sx*.113,.145,-.369);
  eye.rotation.z=sx*.08;
  const brow=box(head,.115,.023,.013,ink,sx*.113,.214,-.371);
  brow.rotation.z=-sx*.13;
 }
 return head;
}
export function buildClassicNinja(mainColor){
 const visual=new THREE.Group();visual.name='CLASSIC_NINJA_VISUAL';
 const main=material(mainColor),skin=material(0xf6c746,.35),ink=material(0x161b1d,.57),belt=material(0x15181a,.42);
 const body=new THREE.Group();body.name='Torso';visual.add(body);
 slopedTorso(body,main);
 const head=buildSimpleHead(body,main,skin,ink);
 // One simple black belt with a small center knot and hanging strap.
 box(body,.91,.14,.53,belt,0,1.065,0);
 ball(body,0,1.055,-.292,.087,belt);
 box(body,.10,.28,.06,belt,.05,.875,-.298);
 const arms=[simpleArm(body,main,belt,-1),simpleArm(body,main,belt,1)];
 const legs=[simpleLeg(visual,main,-.275),simpleLeg(visual,main,.275)];
 // Single plain katana sheathed diagonally across the back; no crossed oversized swords.
 const weapon=new THREE.Group();weapon.position.set(.24,1.6,.35);weapon.rotation.z=-.50;body.add(weapon);
 cyl(weapon,.095,.095,1.05,belt,0,.13,0,12);
 cyl(weapon,.065,.065,.38,ink,0,.82,0,12);
 cyl(weapon,.12,.12,.065,belt,0,.63,0,12);
 cyl(weapon,.10,.10,.08,belt,0,1.04,0,12);
 visual.userData={arms,legs,body,head,cloth:main,pants:main,accent:belt,baseColor:mainColor};
 return visual;
}
