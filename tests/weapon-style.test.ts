import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {WEAPONS} from '../shared/config.ts';

function glbJson(id:string):any{
 const data=readFileSync(resolve('client/public/assets/weapons',id+'.glb'));
 expect(data.subarray(0,4).toString()).toBe('glTF');
 expect(data.readUInt32LE(8)).toBe(data.length);
 const size=data.readUInt32LE(12);
 expect(data.readUInt32LE(16)).toBe(0x4E4F534A);
 return JSON.parse(data.subarray(20,20+size).toString('utf8'));
}
describe('bare-arm no-attachment airsoft visual contract',()=>{
 for(const weapon of WEAPONS){
  it(weapon.id+': has dark bare-skin arms, natural nails and a bright orange safety tip',()=>{
   const json=glbJson(weapon.id);
   const mats=(json.materials||[]).map((m:any)=>m.name||'').join('|');
   const nodes=(json.nodes||[]).map((n:any)=>n.name||'').join('|');
   expect(mats).toContain('DEEP_EBONY_BARE_SKIN_09');
   expect(mats).toContain('BARE_DARK_SKIN_FOREARMS_10');
   expect(mats).toContain('NATURAL_DARK_FINGERNAIL_11');
   expect(mats).toContain('AIRSOFT_ORANGE_TIP_07');
   expect(nodes).not.toMatch(/Scope optic|Scope clamp|Optic QD|Dark glass emitter|Folded bipod|Accessory training light|Wide accessory light|Angled airsoft foregrip/i);
   expect(mats).not.toMatch(/YELLOW_MINIFIG_HAND|TEAM_UNIFORM_SLEEVE/);
   const tip=(json.materials||[]).find((m:any)=>(m.name||'').includes('AIRSOFT_ORANGE_TIP_07'));
   expect(tip).toBeTruthy();
   const rgb=tip.pbrMetallicRoughness.baseColorFactor as number[];
   expect(rgb[0]).toBeGreaterThan(rgb[1]*1.2);
   expect(rgb[1]).toBeGreaterThan(rgb[2]*1.4);
  });
 }
});
