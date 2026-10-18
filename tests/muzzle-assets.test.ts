import {describe,it,expect} from 'vitest';
import {readFileSync} from 'node:fs';
import {resolve} from 'node:path';
import {WEAPONS} from '../shared/config.ts';

describe('visible barrel muzzle and projectile effects',()=>{
 for(const weapon of WEAPONS){
  it(weapon.id+' has a fitted hollow orange tip and a real barrel socket',()=>{
   const buf=readFileSync(resolve('client/public/assets/weapons',weapon.id+'.glb'));
   expect(buf.toString('ascii',0,4)).toBe('glTF');
   const size=buf.readUInt32LE(12);
   const gltf=JSON.parse(buf.subarray(20,20+size).toString('utf8'));
   const nodes=(gltf.nodes||[]) as {name?:string;translation?:number[];mesh?:number}[];
   const sockets=nodes.filter(n=>n.name==='FPS_MUZZLE_SOCKET');
   expect(sockets).toHaveLength(1);
   const socket=sockets[0];
   expect(socket.translation?.every(Number.isFinite)).toBe(true);
   const tips=nodes.filter(n=>n.name?.startsWith('AIRSOFT_ORANGE_TIP_07'));
   expect(tips).toHaveLength(1);
   expect(tips[0].mesh).toBeDefined();
   // Regression: the muzzle flash light must be positioned by the socket.
   const code=readFileSync(resolve('client/src/engine.ts'),'utf8');
   expect(code).toContain('this.muzzleSocket=attachedSocket;');
   expect(code).toContain('b.owner===side&&b.age<.14&&this.muzzleSocket');
   if(weapon.id==='vanguard'){
    console.log('VANGUARD_AUTHORED_NODES',JSON.stringify(nodes.filter(n=>/AUTHORED|magazine|mag\b/i.test(n.name||'')).map(n=>({name:n.name,mesh:n.mesh,translation:n.translation})).slice(0,75)));
   }
  });
 }
});
