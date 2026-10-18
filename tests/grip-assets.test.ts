import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {WEAPONS} from '../shared/config.ts';

function glbNodes(id:string){
 const bin=readFileSync(resolve('client/public/assets/weapons',id+'.glb'));
 expect(bin.subarray(0,4).toString('ascii')).toBe('glTF');
 const size=bin.readUInt32LE(12);
 const data=JSON.parse(bin.subarray(20,20+size).toString('utf8'));
 return data.nodes as {name?:string;children?:number[];mesh?:number}[];
}
function descendants(nodes:{name?:string;children?:number[]}[],root:number):string[]{
 const result:string[]=[];
 const walk=(n:number)=>{
  result.push(nodes[n].name||'');
  for(const child of nodes[n].children||[])walk(child);
 };
 walk(root);return result;
}
describe('hand contact and pose exports',()=>{
 for(const w of WEAPONS){
  it(w.id+' has both individual grip poses with articulated fingers',()=>{
   const nodes=glbNodes(w.id);
   const single=nodes.findIndex(n=>n.name?.startsWith('GRIP_ONE_HAND'));
   const double=nodes.findIndex(n=>n.name?.startsWith('GRIP_TWO_HAND'));
   expect(single).toBeGreaterThan(-1);
   expect(double).toBeGreaterThan(-1);
   const one=descendants(nodes,single).join('|');
   const two=descendants(nodes,double).join('|');
   expect(one).toContain('RIGHT');
   expect(one).not.toContain('LEFT bare anatomical forearm');
   expect(two).toContain('RIGHT');
   expect(two).toContain('LEFT');
   expect(two).toContain('finger 4 articulated');
   expect(two).toContain('natural nail');
   expect(two).toContain('bare anatomical forearm');
  });
 }
});