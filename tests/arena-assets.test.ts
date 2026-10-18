import {describe,it,expect} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {MAP,ARENA_VERSION} from '../shared/map.ts';
describe('The Arena V2 professional Blender deliverables',()=>{
 it('has original editable Blender source scene',()=>{
  expect(ARENA_VERSION).toBe('THE_ARENA_V2');
  expect(statSync(resolve('art/the_arena_v2.blend')).size).toBeGreaterThan(80000);
 });
 it('contains game-ready GLB with multiple PBR textured materials',()=>{
  const bin=readFileSync(resolve('client/public/assets/arena.glb'));
  expect(bin.subarray(0,4).toString()).toBe('glTF');
  expect(bin.readUInt32LE(4)).toBe(2);
  expect(bin.readUInt32LE(8)).toBe(bin.length);
  expect(bin.length).toBeGreaterThan(180000);
  expect(bin.readUInt32LE(16)).toBe(0x4e4f534a);
  const meta=JSON.parse(bin.subarray(20,20+bin.readUInt32LE(12)).toString());
  expect(meta.materials?.length).toBeGreaterThanOrEqual(22);
  expect(meta.images?.length).toBeGreaterThanOrEqual(4);
  expect(meta.meshes?.length).toBeLessThanOrEqual(80);
  expect(meta.materials.map((m:any)=>m.name).join(' ')).toMatch(/WORN_CONCRETE|CONCRETE_PBR/);
  expect(meta.materials.map((m:any)=>m.name).join('|')).toContain('21_ARENA_ORANGE_NEON');
  const sceneNodes=(meta.nodes||[]).map((n:any)=>n.name||'').join('|');
  expect(sceneNodes).toContain('BATCH_21_ARENA_ORANGE_NEON');
 });
 it('keeps important cover, bridge and team geometry in Rapier shared map',()=>{
  expect(MAP.find(o=>o.id==='central-shipping-container')).toBeTruthy();
  expect(MAP.find(o=>o.id==='central-container-roof')).toBeTruthy();
  expect(MAP.filter(o=>o.id.startsWith('upper-mezz'))).toHaveLength(2);
  expect(MAP.filter(o=>o.id.startsWith('lane-container-')).length).toBeGreaterThanOrEqual(4);
 });
});
