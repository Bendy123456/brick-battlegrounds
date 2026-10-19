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
   expect(two).toContain('fingertip cushion');
   expect(two).toContain('natural finger and palm folds');
   expect(one).toContain('natural finger and palm folds');
  });
 }
});

describe('anatomical weapon model scale and rigidly attached hand contacts',()=>{
 for(const weapon of WEAPONS){
  it(weapon.id+' gun bounds are physically scaled (no giant misoriented meshes)',()=>{
   const binary=readFileSync(resolve('client/public/assets/weapons',weapon.id+'.glb'));
   const size=binary.readUInt32LE(12);
   const json=JSON.parse(binary.subarray(20,20+size).toString('utf8'));
   const nodes=json.nodes||[],meshes=json.meshes||[],accessors=json.accessors||[];
   const authored=nodes.filter((n:any)=>String(n.name||'').startsWith('AUTHORED ')&&Number.isInteger(n.mesh));
   expect(authored.length).toBeGreaterThan(0);
   const mins=[Infinity,Infinity,Infinity],maxs=[-Infinity,-Infinity,-Infinity];
   for(const node of authored){
    for(const prim of meshes[node.mesh].primitives||[]){
     const bounds=accessors[prim.attributes.POSITION];
     if(!bounds?.min||!bounds?.max)continue;
     for(let axis=0;axis<3;axis++){
      mins[axis]=Math.min(mins[axis],bounds.min[axis]);
      maxs[axis]=Math.max(maxs[axis],bounds.max[axis]);
     }
    }
   }
   const spans=mins.map((n,i)=>maxs[i]-n);
   expect(spans.every(Number.isFinite)).toBe(true);
   expect(Math.max(...spans)).toBeGreaterThan(.25);
   expect(Math.max(...spans)).toBeLessThan(3);
  });
 }
 it('both sculpted grip families share the same scaled gun parent',()=>{
  const source=readFileSync(resolve('client/src/engine.ts'),'utf8');
  expect(source).toContain('for(const grip of gripRoots)weaponArt.attach(grip)');
  expect(source).toContain('weaponArt.scale.setScalar(index>=7?1.70:index===6?1.59:1.63)');
  expect(source).toContain('model.position.set(.045,-.012,-.052)');
  expect(source).toContain('for(const grip of gripRoots)weaponArt.attach(grip)');
 });
});
