import {describe,it,expect} from 'vitest';
import {WEAPONS,DIFFICULTIES,hitDamage,canShoot,reloadAmmo,roundComplete} from '../shared/config.ts';
import {MAP,SPAWNS,zoneName} from '../shared/map.ts';
describe('airsoft damage and match rules',()=>{
 it('tags head, torso, limb',()=>{expect(hitDamage('head',35)).toBe(100);expect(hitDamage('torso',35)).toBe(35);expect(hitDamage('limb',35)).toBe(25)});
 it('enforces ammo and fire rate',()=>{expect(canShoot(30,1000,1100,600)).toBe(true);expect(canShoot(30,1000,1099,600)).toBe(false);expect(canShoot(0,0,2000,600)).toBe(false)});
 it('reloads to magazine capacity',()=>{expect(reloadAmmo(4,30)).toBe(26);expect(reloadAmmo(30,30)).toBe(0)});
 it('first to five',()=>{expect(roundComplete(4,4)).toBe(false);expect(roundComplete(5,1)).toBe(true);expect(roundComplete(0,5)).toBe(true)});
 it('nine fictional BB replicas have positive parameters',()=>{expect(WEAPONS.length).toBe(9);for(const w of WEAPONS){expect(w.mag).toBeGreaterThan(0);expect(w.speed).toBeGreaterThan(0);expect(w.rate).toBeGreaterThan(0)}});
 it('four bot levels',()=>{expect(Object.values(DIFFICULTIES)).toEqual([.6,.4,.25,.15])});
});
describe('indoor blockout',()=>{
 it('has 120x80 floor and opposing symmetrical spawns',()=>{expect(MAP.find(b=>b.id==='arena-floor')?.w).toBe(120);expect(MAP.find(b=>b.id==='arena-floor')?.d).toBe(80);expect(SPAWNS[0].x).toBe(-SPAWNS[1].x)});
 it('has zone labels',()=>{expect(zoneName(-45,0)).toBe('RED BASE');expect(zoneName(45,0)).toBe('BLUE BASE');expect(zoneName(0,0)).toBe('CENTRAL')});
});