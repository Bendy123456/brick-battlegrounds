import {describe,it,expect} from 'vitest';
import {MOVE,newMotion,stepMotion,type MoveControls} from '../shared/movement.ts';
const base=():MoveControls=>({f:1,s:0,yaw:0,sprint:true,crouch:false,prone:false,ads:false,slide:false,jump:false});
const tick=(m:ReturnType<typeof newMotion>,i:MoveControls,n=1,grounded=true)=>{
 let out:any;for(let k=0;k<n;k++)out=stepMotion(m,i,1/60,grounded);return out;
};
describe('responsive sprint and tactical slide simulation',()=>{
 it('builds fast run speed without instant acceleration',()=>{
  const m=newMotion(),i=base();
  const first=tick(m,i);
  expect(first.speed).toBeGreaterThan(0);
  expect(first.speed).toBeLessThan(MOVE.sprint);
  const top=tick(m,i,30);
  expect(top.speed).toBeCloseTo(MOVE.sprint,3);
  expect(top.sprinting).toBe(true);
 });
 it('preserves sprint momentum through a brief low slide then slows naturally',()=>{
  const m=newMotion(),i=base();tick(m,i,25);
  const slide=tick(m,{...i,slide:true,crouch:true});
  expect(slide.started).toBe(true);
  expect(slide.sliding).toBe(true);
  expect(slide.speed).toBeGreaterThan(MOVE.sprint);
  const mid=tick(m,{...i,crouch:true,sprint:false},22);
  expect(mid.sliding).toBe(true);
  expect(mid.speed).toBeLessThan(slide.speed);
  expect(mid.speed).toBeGreaterThan(MOVE.slideEnd);
  const last=tick(m,{...i,crouch:false,sprint:false},34);
  expect(last.sliding).toBe(false);
  expect(m.slideTime).toBe(0);
 });
 it('does not allow sliding from a standstill or from the air',()=>{
  const m=newMotion(),i=base();
  expect(tick(m,{...i,slide:true} ).started).toBe(false);
  tick(m,i,25);
  expect(tick(m,{...i,slide:true},1,false).started).toBe(false);
 });
 it('enforces cooldown and requires a new sprint after stopping',()=>{
  const m=newMotion(),i=base();tick(m,i,26);
  expect(tick(m,{...i,slide:true}).started).toBe(true);
  tick(m,{...i,slide:false},50);
  const spam=tick(m,{...i,slide:true});
  expect(spam.started).toBe(false);
  tick(m,{...i,slide:false},90);
  // Sprinting and a fresh tap are required; crouch alone never starts a slide.
  expect(tick(m,{...i,sprint:false,slide:true}).started).toBe(false);
  expect(tick(m,{...i,sprint:true,slide:true}).started).toBe(true);
 });
 it('supports slide-jump cancel without losing all forward momentum',()=>{
  const m=newMotion(),i=base();tick(m,i,24);
  tick(m,{...i,slide:true});
  const cancel=tick(m,{...i,slide:false,jump:true});
  expect(cancel.ended).toBe(true);expect(cancel.sliding).toBe(false);
  expect(Math.hypot(m.vx,m.vz)).toBeGreaterThan(5);
 });
 it('preserves the initial direction when the camera turns',()=>{
  const m=newMotion(),i=base();tick(m,i,24);
  tick(m,{...i,slide:true});const z=m.vz;
  tick(m,{...i,yaw:Math.PI/2,slide:false},6);
  expect(m.vz).toBeLessThan(0);
  expect(Math.abs(m.vz)).toBeGreaterThan(Math.abs(m.vx));
  expect(z).toBeLessThan(0);
 });
 it('ground drag stops rather than maintaining ghost velocity',()=>{
  const m=newMotion(),i=base();tick(m,i,30);
  const idle={...i,f:0,s:0,sprint:false};
  tick(m,idle,20);
  expect(Math.hypot(m.vx,m.vz)).toBeLessThan(.05);
 });
});
