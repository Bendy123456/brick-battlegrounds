import {describe,it,expect} from 'vitest';
import {readFileSync,statSync} from 'node:fs';
import {resolve} from 'node:path';
import {MAP} from '../shared/map.ts';

const binary=readFileSync(resolve('client/public/assets/arena.glb'));
const len=binary.readUInt32LE(12);
const gltf=JSON.parse(binary.subarray(20,20+len).toString('utf8'));
const nodes=(gltf.nodes||[]).map((n:{name?:string})=>n.name||'');
const materials=(gltf.materials||[]).map((m:{name?:string})=>m.name||'');
const accessors=gltf.accessors||[];

describe('Complete concrete tile grid and all-wall wood plank Blender release',()=>{
 it('ships the editable source without duplicating the huge warehouse scene',()=>{
  const source=statSync(resolve('art/arena_tiled_wood_upgrade.blend'));
  expect(source.size).toBeGreaterThan(150_000);
  expect(source.size).toBeLessThan(50_000_000);
  expect(binary.toString('ascii',0,4)).toBe('glTF');
  expect(binary.readUInt32LE(8)).toBe(binary.length);
 });
 it('keeps material-batched wall planks with 4 separate wood grain looks',()=>{
  for(const name of ['24_AGED_PINE_PLANK_GRAIN_A','25_WARM_OAK_PLANK_GRAIN_B',
   '26_SMOKED_TIMBER_PLANK_GRAIN_C','27_HONEY_FIELD_PLANK_GRAIN_D']){
   expect(materials).toContain(name);
  }
  expect(nodes.filter((name:string)=>name.startsWith('BATCH_NEW_ALL_WALLS_WOOD_PLANKS_'))).toHaveLength(4);
  expect(nodes).toContain('BATCH_WOOD_PLANK_NAIL_HEADS');
  expect((gltf.meshes||[]).length).toBeLessThanOrEqual(65);
 });
 it('provides complete edge-to-edge tiled floor under existing arena lanes',()=>{
  expect(materials).toContain('31_DEEP_CONTINUOUS_TILE_JOINTS');
  for(const name of ['28_FULL_CERAMIC_CONCRETE_TILE_A','29_FULL_CERAMIC_CONCRETE_TILE_B',
   '30_FULL_CERAMIC_CONCRETE_TILE_C'])expect(materials).toContain(name);
  const floorNodes=(gltf.nodes||[]).filter((n:{name?:string})=>n.name?.startsWith('BATCH_COMPLETE_FLOOR_TILES_'));
  expect(floorNodes).toHaveLength(3);
  const extent={minX:Infinity,maxX:-Infinity,minZ:Infinity,maxZ:-Infinity,positions:0};
  for(const node of floorNodes){
   const mesh=gltf.meshes[node.mesh];
   expect(mesh).toBeTruthy();
   for(const p of mesh.primitives){
    const attr=accessors[p.attributes.POSITION];
    expect(attr?.min).toBeDefined();
    expect(attr?.max).toBeDefined();
    extent.minX=Math.min(extent.minX,attr.min[0]);
    extent.maxX=Math.max(extent.maxX,attr.max[0]);
    extent.minZ=Math.min(extent.minZ,attr.min[2]);
    extent.maxZ=Math.max(extent.maxZ,attr.max[2]);
    extent.positions+=attr.count||0;
   }
  }
  expect(extent.minX).toBeLessThan(-59.70);
  expect(extent.maxX).toBeGreaterThan(59.70);
  expect(extent.minZ).toBeLessThan(-39.60);
  expect(extent.maxZ).toBeGreaterThan(39.60);
  expect(extent.positions).toBeGreaterThan(15000);
 });
 it('retains original gameplay collision and metal container geometry',()=>{
  expect(MAP.filter(o=>o.id.startsWith('perimeter-wall-'))).toHaveLength(4);
  expect(MAP.filter(o=>o.id.startsWith('cover-')).length).toBeGreaterThanOrEqual(75);
  expect(materials.join('|')).toContain('03_POWDERCOATED_GUNMETAL');
  expect(nodes.join('|')).toContain('BATCH_21_ARENA_ORANGE_NEON');
 });
});
