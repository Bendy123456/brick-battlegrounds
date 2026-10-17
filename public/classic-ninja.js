// Brick Battlegrounds / classic ninja prototype rig, v0.6.8.
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
 // A tighter shoulder, matching the narrower classic minifigure silhouette.
 shoulder.position.set(sx*.705,2.03,0);
 parent.add(shoulder);

 // ONE gently curved plastic sleeve. Compared to v0.6.7 it is shorter,
 // narrower, and shallower, with a rounded shoulder and slim cuff.
 const outline=new THREE.Shape();
 outline.moveTo(-.12,.07);
 outline.quadraticCurveTo(.115,.11,.15,-.035);
 outline.quadraticCurveTo(.176,-.14,.155,-.26);
 outline.quadraticCurveTo(.144,-.40,.103,-.51);
 outline.quadraticCurveTo(.09,-.55,.045,-.55);
 outline.lineTo(-.09,-.55);
 outline.quadraticCurveTo(-.123,-.54,-.134,-.48);
 outline.quadraticCurveTo(-.163,-.36,-.151,-.22);
 outline.quadraticCurveTo(-.17,-.075,-.12,.07);
 const sleeveGeo=new THREE.ExtrudeGeometry(outline,{
  depth:.225,steps:1,bevelEnabled:true,bevelThickness:.028,
  bevelSize:.024,bevelSegments:3,curveSegments:10
 });
 const sleeve=add(shoulder,sleeveGeo,main,[0,0,-.1125]);
 sleeve.name='SlimBentMinifigureArm';
 sleeve.scale.x=sx;

 // Keep the elbow pivot expected by the existing fight animations.
 // The small C-shaped hand sits RIGHT underneath the sleeve—not on a long stem.
 const elbow=new THREE.Group();
 elbow.position.set(0,-.49,-.015);
 shoulder.add(elbow);
 cyl(elbow,.082,.082,.09,hand,0,-.112,0,18);
 const gap=.78;
 const cup=new THREE.Mesh(
  new THREE.TorusGeometry(.128,.048,10,32,Math.PI*2-gap),hand
 );
 cup.rotation.z=-Math.PI/2+gap/2;
 cup.position.set(0,-.237,-.008);
 cup.castShadow=true;cup.receiveShadow=true;
 cup.name='ShortClassicCCup';
 elbow.add(cup);

 shoulder.userData.elbow=elbow;
 shoulder.rotation.z=sx*.09;
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
