import {describe,it,expect} from 'vitest';
import * as THREE from 'three';
import {SKINS} from '../client/src/fartnite-skins.js';
import {createDetailedFighter} from '../client/src/fartnite-character.js';
import {BODY_BASE_VERSION,BODY_PROPORTIONS} from '../client/src/fartnite-body-base.js';

describe('one-piece seamless humanoid models for every character slot',()=>{
 it('builds all 25 male and female blank skins with one continuous geometry, no stacked parts',()=>{
  expect(SKINS).toHaveLength(25);
  const geometries=new Map<string,THREE.BufferGeometry>();
  for(let i=0;i<SKINS.length;i++){
   const model=createDetailedFighter(i,false);
   const rig=model.userData;
   expect(rig.variant).toBe(i);
   expect(rig.profile).toBe(SKINS[i].gender);
   expect(rig.bodyBase).toBe(BODY_BASE_VERSION);
   expect(rig.appearance).toBe('seamless-blank-humanoid');
   expect(rig.accessoryCount).toBe(0);
   expect(rig.anatomyDrawMeshes).toBe(1);
   expect(rig.body).toBeInstanceOf(THREE.SkinnedMesh);
   expect(rig.body.name).toBe('OnePieceSmoothHumanoid');
   expect(rig.body.geometry.userData.unified).toBe(true);
   expect(rig.body.geometry.userData.algorithm).toBe('smooth-implicit-isosurface');
   expect(rig.body.geometry.attributes.position.count).toBeGreaterThan(1200);
   expect(rig.body.geometry.attributes.normal.count).toBe(rig.body.geometry.attributes.position.count);
   expect(rig.body.geometry.attributes.skinWeight.count).toBe(rig.body.geometry.attributes.position.count);
   expect(rig.body.skeleton.bones).toHaveLength(6);
   expect(rig.body.material).toBeDefined();
   expect(model.children.filter(child=>child.isSkinnedMesh)).toHaveLength(1);
   expect(model.children.filter(child=>child.isMesh&&!child.isSkinnedMesh)).toHaveLength(0);
   for(const joint of ['torso','armL','armR','legL','legR','weapon'])
    expect(rig[joint]).toBeDefined();
   expect(rig.torso).toBeInstanceOf(THREE.Bone);
   expect(rig.armL).toBeInstanceOf(THREE.Bone);
   expect(rig.legR).toBeInstanceOf(THREE.Bone);
   expect(Number.isFinite(model.scale.x)).toBe(true);
   if(geometries.has(rig.profile))
    expect(rig.body.geometry).toBe(geometries.get(rig.profile));
   else geometries.set(rig.profile,rig.body.geometry);
  }
  expect(geometries.size).toBe(2);
 });
 it('preserves slimmer mannequin proportions without visible muscular overlays',()=>{
  expect(BODY_PROPORTIONS.male.shoulder).toBeGreaterThan(BODY_PROPORTIONS.female.shoulder);
  expect(BODY_PROPORTIONS.male.wrist).toBeLessThan(.1);
  expect(BODY_PROPORTIONS.female.wrist).toBeLessThan(.09);
  expect(BODY_PROPORTIONS.male.thigh).toBeLessThan(.24);
 });
});
