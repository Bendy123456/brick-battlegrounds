// Brick Battlegrounds / classic ninja prototype rig, v0.6.3.
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
 // One uncluttered classic arm silhouette; no cuff or differently colored floating hand.
 add(shoulder,new THREE.CapsuleGeometry(.205,.42,4,14),main,[0,-.32,0]);
 const elbow=new THREE.Group();elbow.position.set(0,-.56,0);shoulder.add(elbow);
 // Forearm and C-clamp are a single continuous piece of geometry, in the sleeve color.
 // Retain the elbow pivot so the existing punch/block animations still work.
 const outline=new THREE.Shape();
 outline.moveTo(-.18,.01);outline.lineTo(.18,.01);
 outline.quadraticCurveTo(.21,-.19,.18,-.33);
 outline.quadraticCurveTo(.28,-.43,.26,-.54);
 outline.quadraticCurveTo(.26,-.73,.095,-.74);
 outline.quadraticCurveTo(.015,-.75,.025,-.65);
 outline.lineTo(.025,-.58);
 outline.quadraticCurveTo(.16,-.62,.15,-.52);
 outline.quadraticCurveTo(.13,-.43,0,-.44);
 outline.quadraticCurveTo(-.13,-.43,-.15,-.52);
 outline.quadraticCurveTo(-.16,-.62,-.025,-.58);
 outline.lineTo(-.025,-.65);
 outline.quadraticCurveTo(-.015,-.75,-.095,-.74);
 outline.quadraticCurveTo(-.26,-.73,-.26,-.54);
 outline.quadraticCurveTo(-.28,-.43,-.18,-.33);
 outline.closePath();
 const geo=new THREE.ExtrudeGeometry(outline,{depth:.19,steps:1,bevelEnabled:true,bevelThickness:.024,bevelSize:.021,bevelSegments:2,curveSegments:8});
 add(elbow,geo,main,[0,0,-.095]);
 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.12;
 return shoulder;
}
function buildSimpleHead(body,main,skin,ink){
 const head=new THREE.Group();head.position.set(0,2.52,0);body.add(head);
 // Slim rounded hood with a genuine opening, not a yellow face plate on top.
 const hoodRadius=.435;
 add(head,new THREE.CylinderGeometry(hoodRadius,hoodRadius,.70,32,1,true,Math.PI+.60,Math.PI*2-1.20),main,[0,.08,.02]);
 cyl(head,.145,.145,.12,main,0,.49,.03,24);
 // Curved yellow minifigure face sits slightly behind the hood opening.
 add(head,new THREE.CylinderGeometry(.400,.400,.29,24,1,true,Math.PI-.62,1.24),skin,[0,.145,.02]);
 // Simple smooth top rim and narrow lower mask, no boxy face side plates.
 cyl(head,.44,.44,.13,main,0,.395,.02,32);
 cyl(head,.443,.44,.275,main,0,-.205,.02,32);
 box(head,.65,.055,.06,main,0,-.038,-.408);
 for(const sx of [-1,1]){
  const eye=box(head,.072,.079,.012,ink,sx*.13,.145,-.386);
  eye.rotation.z=sx*.11;
  const brow=box(head,.129,.027,.015,ink,sx*.13,.222,-.386);
  brow.rotation.z=-sx*.16;
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
