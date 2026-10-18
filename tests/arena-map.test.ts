import {describe,it,expect} from 'vitest';
import {MAP,SPAWNS,ARENA_VERSION,zoneName} from '../shared/map.ts';
describe('The Arena V2 shared playable 3D map',()=>{
 it('loads the new map on client and server from one canonical collision source',()=>{
  expect(ARENA_VERSION).toBe('THE_ARENA_V2');
  expect(MAP.length).toBeGreaterThan(105);
  expect(new Set(MAP.map(b=>b.id)).size).toBe(MAP.length);
  expect(MAP.filter(b=>b.id.startsWith('team-stair-'))).toHaveLength(32);
  expect(MAP.filter(b=>b.id.startsWith('central-stair-'))).toHaveLength(12);
 });
 it('keeps all 3D colliders finite, inside arena bounds and positive-size',()=>{
  for(const b of MAP){
   expect([b.x,b.y,b.z,b.w,b.h,b.d].every(Number.isFinite)).toBe(true);
   expect(Math.min(b.w,b.h,b.d)).toBeGreaterThan(0);
   expect(Math.abs(b.x)+b.w/2).toBeLessThanOrEqual(61);
   expect(Math.abs(b.z)+b.d/2).toBeLessThanOrEqual(41);
  }
 });
 it('gives both teams symmetric spawn separation and enough personal clearance',()=>{
  expect(SPAWNS[0].x).toBe(-SPAWNS[1].x);
  expect(SPAWNS[0].z).toBe(SPAWNS[1].z);
  for(const s of SPAWNS){
   expect(zoneName(s.x,s.z)).toMatch(/BASE/);
   for(const b of MAP.filter(b=>!['arena-floor','arena-roof'].includes(b.id)&&!b.id.startsWith('perimeter-wall'))){
    // Player's vertical capsule at start y=1 spans ground to y~2.
    const overlapY=Math.abs(s.y-b.y)<(b.h/2+.85);
    const overlapXZ=Math.abs(s.x-b.x)<b.w/2+.5&&Math.abs(s.z-b.z)<b.d/2+.5;
    expect(overlapY&&overlapXZ).toBe(false);
   }
  }
 });
 it('side stairs ascend in climbable sub-40cm rises and connect to the mezzanine',()=>{
  for(const side of [-1,1]){
   const steps=MAP.filter(b=>b.id.startsWith('team-stair-'+side+'-')).sort((a,b)=>Number(a.id.split('-').at(-1))-Number(b.id.split('-').at(-1)));
   expect(steps.length).toBe(16);
   for(let i=1;i<steps.length;i++){
    expect(steps[i].y+steps[i].h/2-(steps[i-1].y+steps[i-1].h/2)).toBeCloseTo(.27);
   }
   const deck=MAP.find(b=>b.id==='upper-mezz-'+side)!;
   const top=steps.at(-1)!;
   expect(Math.abs((top.y+top.h/2)-(deck.y+deck.h/2))).toBeLessThan(.35);
  }
 });
});
