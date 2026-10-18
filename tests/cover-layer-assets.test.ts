import {describe,it,expect} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {MAP} from '../shared/map.ts';

describe('Option C Blender cover overlay artifacts',()=>{
 it('keeps the source cover project editable separately from the warehouse',()=>{
  expect(statSync(resolve('art/the_arena_v2.blend')).size).toBeGreaterThan(100000);
  expect(statSync(resolve('art/cover_circuit.blend')).size).toBeGreaterThan(100000);
  expect(MAP.filter(o=>o.id.startsWith('cover-')).length).toBeGreaterThanOrEqual(75);
 });
 it('loads a real valid detailed GLB overlay, not a static image or placeholder box',()=>{
  const binary=readFileSync(resolve('client/public/assets/cover_circuit.glb'));
  expect(binary.toString('utf8',0,4)).toBe('glTF');
  expect(binary.readUInt32LE(4)).toBe(2);
  expect(binary.readUInt32LE(8)).toBe(binary.length);
  expect(binary.length).toBeGreaterThan(180000);
  expect(binary.readUInt32LE(16)).toBe(0x4e4f534a);
  const gltf=JSON.parse(binary.subarray(20,20+binary.readUInt32LE(12)).toString());
  const materialNames=(gltf.materials||[]).map((x:any)=>x.name||'').join('|');
  expect(materialNames).toMatch(/PLYWOOD|OSB/);
  expect(materialNames).toMatch(/VINYL|INFLATABLE/);
  expect((gltf.meshes||[]).length).toBeLessThanOrEqual(50);
 });
 it('requires both Blender layers to load before hiding shared collision placeholders',()=>{
  const engine=readFileSync(resolve('client/src/engine.ts'),'utf8');
  expect(engine).toContain("loader.loadAsync('/assets/cover_circuit.glb?scene=COVER_CIRCUIT_C_03')");
  expect(engine).toContain("stage.status==='fulfilled'&&cover.status==='fulfilled'");
 });
});
