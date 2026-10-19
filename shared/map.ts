// THE ARENA V2. Gameplay geometry is generated from the exact same JSON
// consumed by the Blender modeler. This prevents hidden collision mismatches.
import scene from './arena-layout.json';
import {SOLID_SCENE_DETAILS} from './scene-colliders.ts';
export type Obstacle={id:string,x:number,y:number,z:number,w:number,h:number,d:number,material:'concrete'|'metal'|'wood'|'net'|'foam',zone?:string};
export const ARENA_VERSION=scene.version;
export const COVER_EDITION=scene.coverEdition;
export const MAP:Obstacle[]=[
 ...scene.obstacles.map(v=>({...v,material:v.material as Obstacle['material']})),
 ...SOLID_SCENE_DETAILS
];
export const SPAWNS=scene.spawns;
export function zoneName(x:number,z:number){
 if(x< -43)return 'RED BASE';
 if(x>43)return 'BLUE BASE';
 if(Math.abs(x)<8&&Math.abs(z)<18)return 'CENTRAL';
 if(z< -22)return x<0?'ALPHA LANE':'BRAVO LANE';
 if(z>22)return x<0?'WEST FLANK':'EAST FLANK';
 if(x< -25)return 'WEST SIDE';
 if(x>25)return 'EAST SIDE';
 return z<0?'NORTH MIDFIELD':'SOUTH MIDFIELD';
}
