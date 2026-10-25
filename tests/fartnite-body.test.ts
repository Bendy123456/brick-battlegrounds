import {describe,it,expect} from 'vitest';
import {SKINS} from '../client/src/fartnite-skins.js';
import {createDetailedFighter} from '../client/src/fartnite-character.js';
import {BODY_BASE_VERSION,BODY_PROPORTIONS} from '../client/src/fartnite-body-base.js';

describe('25 characters use shared smooth mannequin-inspired base anatomy',()=>{
 it('builds every original skin on the correct gender body, with working animation pivots',()=>{
  expect(SKINS).toHaveLength(25);
  const meshes=[];
  for(let i=0;i<SKINS.length;i++){
   const root=createDetailedFighter(i,false);
   const rig=root.userData;
   expect(rig.variant).toBe(i);
   expect(rig.profile).toBe(SKINS[i].gender);
   expect(rig.bodyBase).toBe(BODY_BASE_VERSION);
   for(const joint of ['torso','armL','armR','legL','legR','weapon'])expect(rig[joint]).toBeDefined();
   const body=rig.torso.children.find(x=>x.isMesh&&x.geometry?.attributes?.position?.count>1000);
   const upperArm=rig.armL.children.find(x=>x.isMesh&&x.geometry?.attributes?.position?.count>500);
   const leg=rig.legL.children.find(x=>x.isMesh&&x.geometry?.attributes?.position?.count>500);
   expect(body,'missing smooth torso on '+SKINS[i].name).toBeDefined();
   expect(upperArm,'missing smooth arm on '+SKINS[i].name).toBeDefined();
   expect(leg,'missing smooth leg on '+SKINS[i].name).toBeDefined();
   expect(body.geometry.attributes.normal.count).toBeGreaterThan(500);
   expect(Number.isFinite(root.scale.x)).toBe(true);
   meshes.push({body:body.geometry,arm:upperArm.geometry,leg:leg.geometry});
  }
  // All 25 outfits reuse just two base meshes, not 25 heavy copies.
  for(const kind of ['body','arm','leg']){
   expect(new Set(meshes.map(x=>x[kind])).size).toBe(2)
  }
 });
 it('makes masculine and feminine body templates lean rather than bulked up',()=>{
  expect(BODY_PROPORTIONS.male.shoulder).toBeGreaterThan(BODY_PROPORTIONS.female.shoulder);
  expect(BODY_PROPORTIONS.male.wrist).toBeLessThan(.10);
  expect(BODY_PROPORTIONS.female.wrist).toBeLessThan(.09);
  expect(BODY_PROPORTIONS.male.thigh).toBeLessThan(.24);
 });
});
