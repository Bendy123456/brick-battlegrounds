import {describe,it,expect} from 'vitest';
import {readdirSync,readFileSync,statSync} from 'node:fs';
import {createHash} from 'node:crypto';
import {resolve} from 'node:path';
import {WEAPONS} from '../shared/config.ts';
describe('Blender nine-weapon production assets',()=>{
 const source=resolve('art/weapons'),runtime=resolve('client/public/assets/weapons');
 it('has a unique editable source for every selectable weapon',()=>{
  expect(readdirSync(source).filter(f=>f.endsWith('.blend')).sort()).toEqual(WEAPONS.map(w=>w.id+'.blend').sort());
  for(const w of WEAPONS)expect(statSync(resolve(source,w.id+'.blend')).size).toBeGreaterThan(12000);
 });
 it('has nine distinct valid binary glTF v2 exports',()=>{
  expect(readdirSync(runtime).filter(f=>f.endsWith('.glb')).sort()).toEqual(WEAPONS.map(w=>w.id+'.glb').sort());
  const hashes=new Set<string>();
  for(const w of WEAPONS){
   const buf=readFileSync(resolve(runtime,w.id+'.glb'));
   expect(buf.subarray(0,4).toString('utf8')).toBe('glTF');
   expect(buf.readUInt32LE(4)).toBe(2);
   expect(buf.readUInt32LE(8)).toBe(buf.byteLength);
   expect(buf.byteLength).toBeGreaterThan(15000);
   hashes.add(createHash('sha256').update(buf).digest('hex'));
  }
  expect(hashes.size).toBe(9);
 });
 it('loads by individual weapon IDs, not a single resized AEG',()=>{
  const loader=readFileSync(resolve('client/src/engine.ts'),'utf8');
  expect(loader).toContain("WEAPONS.map(w=>loader.loadAsync('/assets/weapons/'+w.id+'.glb'))");
  expect(loader).toContain('this.weaponModels.get(index)');
 });
});
