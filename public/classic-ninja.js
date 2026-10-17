// Brick Battlegrounds / classic ninja prototype rig, v0.6.4.
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
 // A single smooth trapezoid shell in place of many bulky layered armor blocks.
 const shape=new THREE.Shape();
 shape.moveTo(-.48,1.12);shape.lineTo(.48,1.12);
 shape.lineTo(.60,2.05);shape.quadraticCurveTo(.59,2.12,.52,2.12);
 shape.lineTo(-.52,2.12);shape.quadraticCurveTo(-.59,2.12,-.60,2.05);
 shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.50,steps:1,bevelEnabled:true,bevelThickness:.038,bevelSize:.03,bevelSegments:2,curveSegments:4});
 return add(parent,geo,mat,[0,0,-.25]);
}
function simpleLeg(parent,mat,x){
 const leg=new THREE.Group();leg.position.set(x,.99,0);parent.add(leg);
 const g=new THREE.BoxGeometry(.50,.88,.51);
 add(leg,g,mat,[0,-.46,0]);
 // A subtle flat studless foot; same color and profile as the leg.
 box(leg,.51,.18,.57,mat,0,-.82,-.03);
 return leg;
}
function simpleArm(parent,main,hand,sx){
 const shoulder=new THREE.Group();shoulder.position.set(sx*.72,2.03,0);parent.add(shoulder);
 // v0.6.4: no separate hand, cuff or torus claw; a smooth integrated forearm and mitten.
 add(shoulder,new THREE.CapsuleGeometry(.20,.42,4,12),main,[0,-.31,0]);
 const elbow=new THREE.Group();elbow.position.set(0,-.56,0);shoulder.add(elbow);
 const shape=new THREE.Shape();
 shape.moveTo(-.16,.02);
 shape.quadraticCurveTo(.16,.02,.17,-.10);
 shape.lineTo(.17,-.44);
 shape.quadraticCurveTo(.17,-.54,.10,-.58);
 shape.quadraticCurveTo(.03,-.62,.03,-.53);
 shape.quadraticCurveTo(.03,-.45,.10,-.42);
 shape.quadraticCurveTo(.00,-.43,-.10,-.42);
 shape.quadraticCurveTo(-.03,-.45,-.03,-.53);
 shape.quadraticCurveTo(-.03,-.62,-.10,-.58);
 shape.quadraticCurveTo(-.17,-.54,-.17,-.44);
 shape.lineTo(-.17,-.10);
 shape.quadraticCurveTo(-.16,.02,-.16,.02);
 const geometry=new THREE.ExtrudeGeometry(shape,{depth:.18,steps:1,bevelEnabled:true,bevelThickness:.02,bevelSize:.018,bevelSegments:2,curveSegments:8});
 add(elbow,geometry,main,[0,0,-.09]);
 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.12;
 return shoulder;
}
function buildSimpleHead(body,main,skin,ink){
 const head=new THREE.Group();head.position.set(0,2.52,0);body.add(head);
 // Subtle v0.6.4 polish: slimmer hood, smaller stud, curved inset face.
 const hoodRadius=.428;
 // Genuine front opening: do not replace this with a solid cylinder.
 add(head,new THREE.CylinderGeometry(hoodRadius,hoodRadius,.72,32,1,true,Math.PI+.60,Math.PI*2-1.20),main,[0,.08,.02]);
 cyl(head,.135,.135,.105,main,0,.505,.03,24);
 add(head,new THREE.CylinderGeometry(.395,.395,.29,24,1,true,Math.PI-.62,1.24),skin,[0,.145,.02]);
 cyl(head,.434,.434,.13,main,0,.395,.02,32);
 cyl(head,.436,.432,.275,main,0,-.205,.02,32);
 box(head,.63,.055,.06,main,0,-.038,-.400);
 for(const sx of [-1,1]){
  const eye=box(head,.068,.074,.012,ink,sx*.123,.145,-.379);
  eye.rotation.z=sx*.09;
  const brow=box(head,.125,.025,.015,ink,sx*.123,.221,-.380);
  brow.rotation.z=-sx*.15;
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
 box(body,1.06,.16,.63,belt,0,1.06,0);
 ball(body,0,1.055,-.345,.115,belt);
 box(body,.12,.36,.065,belt,.055,.84,-.355);
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
