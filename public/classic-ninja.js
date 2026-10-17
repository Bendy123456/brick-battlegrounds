// Brick Battlegrounds / classic ninja prototype rig, v0.6.7.
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
 const shape=new THREE.Shape();
 shape.moveTo(-.47,1.10);shape.lineTo(.47,1.10);
 shape.lineTo(.59,2.02);shape.lineTo(.51,2.12);
 shape.lineTo(-.51,2.12);shape.lineTo(-.59,2.02);shape.closePath();
 const geo=new THREE.ExtrudeGeometry(shape,{depth:.46,steps:1,bevelEnabled:true,bevelThickness:.022,bevelSize:.02,bevelSegments:2,curveSegments:3});
 return add(parent,geo,mat,[0,0,-.23]);
}
function simpleLeg(parent,mat,x){
 const leg=new THREE.Group();leg.position.set(x,.99,0);parent.add(leg);
 add(leg,new THREE.BoxGeometry(.48,.84,.48),mat,[0,-.43,0]);
 box(leg,.49,.16,.54,mat,0,-.80,-.01);
 return leg;
}
function simpleArm(parent,main,hand,sx){
 const shoulder=new THREE.Group();
 shoulder.position.set(sx*.72,2.03,0);
 parent.add(shoulder);
 // One continuous curved sleeve, sized like a classic minifigure arm.
 // No long hanging finger/forearm extension.
 const outline=new THREE.Shape();
 outline.moveTo(-.13,.10);
 outline.quadraticCurveTo(-.25,.10,-.22,-.10);
 outline.quadraticCurveTo(-.24,-.30,-.19,-.46);
 outline.quadraticCurveTo(-.165,-.57,-.145,-.65);
 outline.lineTo(.145,-.65);
 outline.quadraticCurveTo(.165,-.57,.19,-.46);
 outline.quadraticCurveTo(.24,-.30,.22,-.10);
 outline.quadraticCurveTo(.25,.10,.13,.10);
 outline.closePath();
 const sleeveGeo=new THREE.ExtrudeGeometry(outline,{
  depth:.29,steps:1,bevelEnabled:true,bevelThickness:.024,
  bevelSize:.027,bevelSegments:3,curveSegments:9
 });
 const sleeve=add(shoulder,sleeveGeo,main,[0,0,-.145]);
 sleeve.name='SingleCurvedSleeve';
 // Retain the old elbow animation pivot but attach only the little wrist and C hand.
 const elbow=new THREE.Group();
 elbow.position.set(0,-.50,-.035);
 shoulder.add(elbow);
 // A very short peg just below the sleeve, the way a LEGO grip fits the arm.
 cyl(elbow,.103,.103,.10,hand,0,-.159,-.005,18);
 // Torus lies in the XY/front plane: opening visible rather than turned edge-on.
 // The 44-degree gap at the bottom makes a compact, unmistakable C cup.
 const gap=.77;
 const cup=new THREE.Mesh(
  new THREE.TorusGeometry(.147,.053,10,32,Math.PI*2-gap),
  hand
 );
 cup.rotation.z=-Math.PI/2+gap/2;
 cup.position.set(0,-.296,-.012);
 cup.castShadow=true;cup.receiveShadow=true;
 cup.name='ClassicCHook';
 elbow.add(cup);
 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.11;
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
 box(body,1.06,.16,.63,belt,0,1.06,0);
 ball(body,0,1.055,-.345,.095,belt);
 box(body,.10,.30,.06,belt,.05,.87,-.35);
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
