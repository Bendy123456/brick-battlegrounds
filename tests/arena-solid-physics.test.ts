import {describe,it,expect,beforeAll} from 'vitest';
import RAPIER from '@dimforge/rapier3d-compat';
import {MAP} from '../shared/map.ts';

beforeAll(async()=>{await RAPIER.init()});
function world(){
 const w=new RAPIER.World({x:0,y:-20,z:0});
 w.timestep=1/60;
 for(const b of MAP){
  if(b.material==='net')continue;
  const body=w.createRigidBody(RAPIER.RigidBodyDesc.fixed().setTranslation(b.x,b.y,b.z));
  w.createCollider(RAPIER.ColliderDesc.cuboid(b.w/2,b.h/2,b.d/2),body);
 }
 // Rapier ray queries require a synchronised broad-phase after creating bodies.
 w.step();
 return w;
}
function ray(w:any,from:{x:number,y:number,z:number},direction:{x:number,y:number,z:number},distance:number){
 return w.castRay(new RAPIER.Ray(from,direction),distance,true,RAPIER.QueryFilterFlags.EXCLUDE_KINEMATIC);
}
describe('Real shared arena collision physics',()=>{
 it('player stands on upper mezzanine decks instead of falling through',()=>{
  const w=world();
  for(const side of [-1,1]){
   const deck=MAP.find(b=>b.id==='upper-mezz-'+side)!;
   const top=deck.y+deck.h/2;
   const from={x:deck.x,y:top+.9,z:deck.z};
   const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased().setTranslation(from.x,from.y,from.z));
   const collider=w.createCollider(RAPIER.ColliderDesc.capsule(.60,.30),body);
   const controller=w.createCharacterController(.03);
   controller.enableAutostep(.40,.24,true);
   controller.enableSnapToGround(.18);
   let vy=0;
   for(let frame=0;frame<150;frame++){
    vy=Math.max(-25,vy-20/60);
    controller.computeColliderMovement(collider,{x:0,y:vy/60,z:0});
    const move=controller.computedMovement(),pos=body.translation();
    body.setNextKinematicTranslation({x:pos.x+move.x,y:pos.y+move.y,z:pos.z+move.z});
    if(controller.computedGrounded()&&vy<0)vy=0;
    w.step();
   }
   expect(body.translation().y).toBeGreaterThan(top+.76);
   expect(body.translation().y).toBeLessThan(top+1.08);
   w.removeRigidBody(body);
  }
  w.free();
 });
 it('the side stair run actually reaches each upper deck without sinking',()=>{
  const w=world();
  for(const side of [-1,1]){
   // Begin in front of the first step and walk all the way across the
   // last stair-to-deck transition using the REAL in-game capsule/KCC.
   const body=w.createRigidBody(RAPIER.RigidBodyDesc.kinematicPositionBased()
    .setTranslation(side*51,1,38.1));
   const collider=w.createCollider(RAPIER.ColliderDesc.capsule(.60,.30),body);
   const controller=w.createCharacterController(.03);
   controller.enableAutostep(.4,.24,true);
   controller.enableSnapToGround(.18);
   let vy=0,highest=0,atLanding=0;
   for(let tick=0;tick<300;tick++){
    vy=Math.max(-25,vy-20/60);
    controller.computeColliderMovement(collider,{x:0,y:vy/60,z:-.095});
    const mov=controller.computedMovement();
    const at=body.translation();
    body.setNextKinematicTranslation({x:at.x+mov.x,y:at.y+mov.y,z:at.z+mov.z});
    if(controller.computedGrounded()&&vy<0)vy=0;
    w.step();
    const pos=body.translation();
    highest=Math.max(highest,pos.y);
    if(pos.z<18)atLanding=Math.max(atLanding,pos.y);
   }
   const end=body.translation();
   console.log('STAIR_TO_MEZZ_PHYSICS',side,{end,highest,atLanding});
   expect(end.z).toBeLessThan(18);
   expect(end.y).toBeGreaterThan(5.05);
   w.removeRigidBody(body);
  }
  w.free();
 });
 it('central shipping-container roof and stairs are solid and walkable',()=>{
  const w=world();
  const roof=MAP.find(b=>b.id==='central-container-roof')!;
  const top=roof.y+roof.h/2;
  const hit=ray(w,{x:roof.x,y:top+.7,z:roof.z},{x:0,y:-1,z:0},2);
  expect(hit).toBeTruthy();
  expect(hit!.timeOfImpact).toBeLessThan(.8);
  for(const b of MAP.filter(b=>b.id.startsWith('team-stair-')||b.id.startsWith('central-stair-'))){
   const top=b.y+b.h/2;
   expect(ray(w,{x:b.x,y:top+.2,z:b.z},{x:0,y:-1,z:0},.5)).toBeTruthy();
  }
  w.free();
 });
 it('walls, barricades, pallets, and containers block player-size movement',()=>{
  const w=world();
  const chosen=['cover-panel--1-0','cover-low--1-0','cover-pallet--1-0','lane-container--1--27','perimeter-wall-z-39.65'];
  for(const id of chosen){
   const b=MAP.find(o=>o.id===id)!;
   expect(b).toBeTruthy();
   const origin={x:b.x-b.w/2-.75,y:b.y,z:b.z};
   const hit=ray(w,origin,{x:1,y:0,z:0},b.w+1.5);
   expect(hit).toBeTruthy();
  }
  w.free();
 });
 it('BB raycasts collide with solid cover and cannot pass through it',()=>{
  const w=world();
  for(const b of MAP.filter(o=>o.id.startsWith('cover-')||o.id.startsWith('perimeter-wall'))){
   const height=Math.max(b.y-b.h/2+.08,Math.min(b.y,b.y+b.h/2-.08));
   const from={x:b.x-b.w/2-.10,y:height,z:b.z};
   expect(ray(w,from,{x:1,y:0,z:0},b.w+.20)).toBeTruthy();
  }
  w.free();
 });
});
