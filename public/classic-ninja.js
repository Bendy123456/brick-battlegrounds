// Brick Battlegrounds / classic ninja prototype rig, v0.6.2.
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
 // Curved single sleeve, with no armored pauldrons or forearm plates.
 add(shoulder,new THREE.CapsuleGeometry(.215,.45,4,12),main,[0,-.34,0]);
 const elbow=new THREE.Group();elbow.position.set(0,-.58,0);shoulder.add(elbow);
 // The tiny lower sleeve preserves the original animation's elbow pivot.
 add(elbow,new THREE.CylinderGeometry(.17,.18,.27,14),main,[0,-.13,0]);
 cyl(elbow,.115,.115,.12,hand,0,-.34,0,16);
 // Proper C-shaped clamp hand. Openings are visible from the front of the character.
 add(elbow,new THREE.TorusGeometry(.14,.057,9,22,Math.PI*1.55),hand,[0,-.49,0],[0,0,-.75]);
 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.14;
 return shoulder;
}
function buildSimpleHead(body,main,skin,ink){
 const head=new THREE.Group();head.position.set(0,2.52,0);body.add(head);
 // Sculpt the hood as an open shell instead of covering a pasted-on face panel.
 // Three.js CylinderGeometry angles: Math.PI faces the front (-Z).
 add(head,new THREE.CylinderGeometry(.45,.45,.73,28,1,true,Math.PI+.64,Math.PI*2-1.28),main,[0,.07,.02]);
 cyl(head,.165,.165,.14,main,0,.51,.03,20);
 // Slightly recessed curved yellow face; the front hood shell is genuinely open.
 add(head,new THREE.CylinderGeometry(.405,.405,.31,20,1,true,Math.PI-.65,1.30),skin,[0,.15,.02]);
 // Upper brow and lower face wrap cover the opening's top and bottom.
 cyl(head,.452,.452,.14,main,0,.41,.02,28);
 cyl(head,.455,.45,.29,main,0,-.21,.02,28);
 // Short edges follow the perimeter; mask lip projects in front of the eyes.
 box(head,.085,.31,.105,main,-.30,.135,-.37);
 box(head,.085,.31,.105,main,.30,.135,-.37);
 box(head,.69,.070,.10,main,0,-.04,-.408);
 box(head,.72,.025,.06,main,0,-.27,-.437);
 for(const sx of [-1,1]){
  // Eyes are attached to the curved yellow face with minimal separation.
  const eye=box(head,.075,.085,.013,ink,sx*.135,.145,-.383);
  eye.rotation.z=sx*.13;
  const eyebrow=box(head,.137,.031,.015,ink,sx*.135,.231,-.385);
  eyebrow.rotation.z=-sx*.19;
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
