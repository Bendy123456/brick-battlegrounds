import {describe,it,expect} from 'vitest';
import {newViewmodelMotion,fireViewmodelMotion,stepViewmodelMotion,VIEWMODEL_PROFILE} from '../client/src/viewmodel-motion.ts';
const frame=(state:ReturnType<typeof newViewmodelMotion>,change:Record<string,unknown>={})=>
 stepViewmodelMotion(state,{dt:1/60,weapon:0,yaw:0,pitch:0,forward:0,strafe:0,
 ads:false,sprint:false,slide:false,airborne:false,...change});

describe('First person weapon and connected hand animation',()=>{
 it('covers all nine weapon loadout IDs with distinct handling weights',()=>{
  expect(VIEWMODEL_PROFILE.map(p=>p.id)).toEqual([
   'vanguard','ranger','specter','atlas','whisper','breacher','watcher','echo','tempo']);
  expect(new Set(VIEWMODEL_PROFILE.map(p=>p.weight)).size).toBeGreaterThan(6);
 });
 it('recoil physically kicks backward and springs to neutral without leaving the grip',()=>{
  const motion=newViewmodelMotion();
  frame(motion);fireViewmodelMotion(motion,5);
  for(let i=0;i<4;i++)frame(motion,{weapon:5});
  expect(motion.rx).toBeLessThan(-.008);
  expect(motion.z).toBeGreaterThan(.004);
  for(let i=0;i<110;i++)frame(motion,{weapon:5});
  expect(Math.abs(motion.rx)).toBeLessThan(.007);
  expect(Math.abs(motion.z)).toBeLessThan(.004);
 });
 it('sway is stable when idle and never jumps at yaw +/-pi wrap',()=>{
  const state=newViewmodelMotion();
  for(let i=0;i<80;i++)frame(state,{yaw:Math.PI-.01,pitch:.1});
  const before=state.x;
  frame(state,{yaw:-Math.PI+.01,pitch:.1});
  expect(Math.abs(state.x-before)).toBeLessThan(.02);
  for(let i=0;i<65;i++)frame(state,{yaw:-Math.PI+.01,pitch:.1});
  expect(Math.abs(state.x)).toBeLessThan(.006);
  expect(Math.abs(state.ry)).toBeLessThan(.006);
 });
 it('aim down sights reduces bob/sway substantially',()=>{
  const hip=newViewmodelMotion(),ads=newViewmodelMotion();
  for(let i=0;i<105;i++){
   frame(hip,{forward:1,strafe:.3,yaw:i*.012});
   frame(ads,{forward:1,strafe:.3,yaw:i*.012,ads:true});
  }
  let hipRange=0,aimRange=0;
  for(let i=105;i<185;i++){
   frame(hip,{forward:1,yaw:i*.012});
   frame(ads,{forward:1,yaw:i*.012,ads:true});
   hipRange=Math.max(hipRange,Math.abs(hip.x),Math.abs(hip.y));
   aimRange=Math.max(aimRange,Math.abs(ads.x),Math.abs(ads.y));
  }
  expect(aimRange).toBeLessThan(hipRange*.45);
 });
 it('walking and sprinting move the weapon without excessive arm motion',()=>{
  const s=newViewmodelMotion();let high=0;
  for(let i=0;i<240;i++){
   frame(s,{forward:1,sprint:i>110});
   high=Math.max(high,Math.abs(s.x),Math.abs(s.y),Math.abs(s.z));
  }
  expect(high).toBeGreaterThan(.01);
  expect(high).toBeLessThan(.10);
  for(let i=0;i<100;i++)frame(s);
  expect(Math.abs(s.x)).toBeLessThan(.005);
  expect(Math.abs(s.y)).toBeLessThan(.009);
 });
 it('a landing gives brief weight and returns to neutral',()=>{
  const s=newViewmodelMotion();
  for(let i=0;i<35;i++)frame(s,{airborne:true});
  frame(s,{airborne:false});
  expect(s.land).toBeGreaterThan(0);
  const kick=s.land;
  for(let i=0;i<80;i++)frame(s);
  expect(s.land).toBeLessThan(kick*.02);
 });
 it('rapid fire is bounded for all guns at low and high frame rates',()=>{
  for(let gun=0;gun<9;gun++){
   const s=newViewmodelMotion();
   for(let i=0;i<150;i++){
    if(i%3===0)fireViewmodelMotion(s,gun);
    stepViewmodelMotion(s,{dt:i%2?1/240:.09,weapon:gun,yaw:.02*i,
     pitch:0,forward:1,strafe:0,ads:false,sprint:false,slide:false,airborne:false});
    for(const name of ['x','y','z','rx','ry','rz'] as const){
     expect(Number.isFinite(s[name])).toBe(true);
     expect(Math.abs(s[name])).toBeLessThan(.5);
    }
   }
  }
 });
});
