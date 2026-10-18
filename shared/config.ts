// All airsoft replicas are fictional: no real weapon brands or identifiers.
export type Weapon={id:string,name:string,role:string,damage:number,rate:number,mag:number,reload:number,speed:number,spread:number,recoil:number,ads:number,auto:boolean,pellets?:number};
export const WEAPONS:Weapon[]=[
{id:'vanguard',name:'VX-4 VECTOR',role:'AEG · ASSAULT',damage:35,rate:660,mag:30,reload:1.9,speed:102,spread:1.3,recoil:1.4,ads:.20,auto:true},
{id:'ranger',name:'RANGER 556',role:'AEG · ASSAULT',damage:35,rate:740,mag:30,reload:2.1,speed:105,spread:1.45,recoil:1.6,ads:.21,auto:true},
{id:'specter',name:'SPECTER 12',role:'AEG · ASSAULT',damage:35,rate:560,mag:28,reload:2.0,speed:117,spread:1.0,recoil:1.15,ads:.18,auto:true},
{id:'atlas',name:'ATLAS-M',role:'AEG · ASSAULT',damage:35,rate:810,mag:36,reload:2.5,speed:98,spread:1.7,recoil:1.9,ads:.25,auto:true},
{id:'whisper',name:'WHISPER 9',role:'AEG · SMG',damage:35,rate:920,mag:40,reload:1.7,speed:83,spread:2.15,recoil:1.25,ads:.14,auto:true},
{id:'breacher',name:'BREACHER P',role:'SPRING · SHOTGUN',damage:25,rate:85,mag:6,reload:2.8,speed:74,spread:7,recoil:3.2,ads:.30,auto:false,pellets:6},
{id:'watcher',name:'WATCHER B',role:'SPRING · BOLT',damage:100,rate:43,mag:8,reload:3.4,speed:145,spread:.12,recoil:3.8,ads:.38,auto:false},
{id:'echo',name:'ECHO G',role:'GBB · PISTOL',damage:35,rate:325,mag:17,reload:1.35,speed:93,spread:1.85,recoil:1.65,ads:.15,auto:false},
{id:'tempo',name:'TEMPO 23',role:'GBB · PISTOL',damage:35,rate:380,mag:20,reload:1.45,speed:88,spread:1.7,recoil:1.4,ads:.14,auto:false}
];
export const ROUND_KILLS=5,MAX_HP=100;
export const DIFFICULTIES={Easy:.60,Normal:.40,Hard:.25,Nightmare:.15} as const;
export {MOVE as SPEED} from './movement.ts';
export type Input={f:number,s:number,yaw:number,pitch:number,jump:boolean,crouch:boolean,sprint:boolean,prone:boolean,slide?:boolean,fire:boolean,ads:boolean,reload:boolean,swap?:number,grenade?:boolean,melee?:boolean,seq?:number};
export type Actor={id:string,side:number,x:number,y:number,z:number,yaw:number,pitch:number,hp:number,kills:number,deaths:number,ammo:number,mag:number,weapon:number,alive:boolean,ads:boolean,crouch:boolean,prone:boolean,sliding:boolean,sprinting:boolean,velocity:number,reloadEnd:number};
export type Snapshot={type:'snapshot',players:Actor[],pellets:{id:number,x:number,y:number,z:number}[],timer:number,score:[number,number],status:string,round:number,ping?:number};
export function hitDamage(zone:'head'|'torso'|'limb',base:number){return zone==='head'?100:zone==='torso'?base:25}
export function canShoot(ammo:number,last:number,now:number,rate:number){return ammo>0&&now-last>=60000/rate}
export function reloadAmmo(mag:number,capacity:number){return Math.max(0,capacity-mag)}
export function roundComplete(a:number,b:number,limit=ROUND_KILLS){return a>=limit||b>=limit}
