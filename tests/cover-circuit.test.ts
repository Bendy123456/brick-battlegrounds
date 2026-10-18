import {describe,it,expect} from 'vitest';
import {MAP,SPAWNS} from '../shared/map.ts';
import arena from '../shared/arena-layout.json';
const cover=MAP.filter(o=>o.id.startsWith('cover-'));
const ground=MAP.filter(o=>o.material!=='net'&&o.id!=='arena-floor'&&o.id!=='arena-roof'&&!o.id.startsWith('perimeter-wall')&&o.y-o.h/2<1.75&&o.y+o.h/2>.4);
const blocked=(x:number,z:number,r=.5)=>ground.some(o=>Math.abs(x-o.x)<=o.w/2+r&&Math.abs(z-o.z)<=o.d/2+r);
function reachable(x:number,z:number){
 const seen=new Set<string>(),queued=new Set([x+','+z]),queue:number[][]=[[x,z]];
 for(let i=0;i<queue.length;i++){
  const [cx,cz]=queue[i],id=cx+','+cz;
  if(cx< -57||cx>57||cz< -37||cz>37||blocked(cx,cz))continue;
  seen.add(id);
  for(const [dx,dz] of [[1,0],[-1,0],[0,1],[0,-1]]){
   const nx=cx+dx,nz=cz+dz,key=nx+','+nz;
   if(!queued.has(key)){queued.add(key);queue.push([nx,nz]);}
  }
 }
 return seen;
}
describe('C-cover mixed plywood and inflatables with playable movement',()=>{
 it('includes balanced solid cover and slide-height bunkers',()=>{
  expect(arena.coverEdition).toBe('COVER_CIRCUIT_C_03');
  expect(cover.length).toBeGreaterThanOrEqual(75);
  expect(cover.filter(o=>o.material==='wood').length).toBeGreaterThanOrEqual(60);
  expect(cover.filter(o=>o.material==='foam').length).toBeGreaterThanOrEqual(16);
  expect(cover.filter(o=>o.id.startsWith('cover-mezz')).length).toBe(8);
  expect(new Set(MAP.map(o=>o.id)).size).toBe(MAP.length);
 });
 it('mirrors each side fairly, including both upper platforms',()=>{
  for(const item of cover.filter(o=>o.id.includes('--1-'))){
   expect(cover.some(o=>Math.abs(o.x+item.x)<.001&&Math.abs(o.z-item.z)<.001&&Math.abs(o.w-item.w)<.001&&Math.abs(o.d-item.d)<.001&&Math.abs(o.h-item.h)<.001)).toBe(true);
  }
  for(const side of [-1,1]){
   expect(cover.filter(o=>o.id.startsWith('cover-mezz-'+side+'-')).length).toBe(4);
   expect(cover.filter(o=>o.id.startsWith('cover-low-'+side+'-')).length).toBeGreaterThanOrEqual(8);
  }
 });
 it('leaves clear sprint/slide approaches from both spawns',()=>{
  for(const s of SPAWNS){
   expect(blocked(s.x,s.z,.7)).toBe(false);
   for(let n=0;n<=4;n++)expect(blocked(s.x-Math.sign(s.x)*n,s.z,.4)).toBe(false);
   expect(cover.some(o=>o.id.startsWith('cover-panel-')&&Math.sign(o.x)===Math.sign(s.x)&&Math.abs(o.x-s.x)<10&&Math.abs(o.z-s.z)<3&&o.h>2)).toBe(true);
  }
 });
 it('keeps opposing team bases connected through offset clear routes',()=>{
  const red=reachable(-53,1),blue=reachable(53,1);
  expect(red.has('53,1')).toBe(true);
  expect(blue.has('-53,1')).toBe(true);
  expect(red.size).toBeGreaterThan(3500);
  expect(blue.size).toBeGreaterThan(3500);
 });
 it('provides solid BB-blocking full walls, partial slide cover, and upper cover',()=>{
  for(const side of [-1,1]){
   const wall=cover.find(o=>o.id==='cover-panel-'+side+'-0')!;
   expect(wall.material).toBe('wood');
   expect(wall.h).toBeGreaterThan(2);
   const slides=cover.filter(o=>o.id.startsWith('cover-low-'+side+'-'));
   expect(slides.every(o=>o.h>=1&&o.h<=1.35)).toBe(true);
   const upper=cover.filter(o=>o.id.startsWith('cover-mezz-'+side+'-'));
   expect(upper.every(o=>Math.abs(o.y-o.h/2-4.43)<.01)).toBe(true);
  }
 });
});