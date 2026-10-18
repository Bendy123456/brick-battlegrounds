// Deterministic 120 x 80 x 12m three-tier indoor blockout.
// Static layouts shared by client and authoritative server collision world.
export type Obstacle={id:string,x:number,y:number,z:number,w:number,h:number,d:number,material:'concrete'|'metal'|'wood'|'net'|'foam',zone?:string};
export const MAP:Obstacle[]=[];
function box(id:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Obstacle['material']='concrete',zone?:string){
 MAP.push({id,x,y,z,w,h,d,material,zone});
}
// Enclosure 120 x 80m with catwalks and a central warehouse nave.
box('arena-floor',0,-.40,0,120,.8,80);
box('north-wall',0,6,-40,120,12,.8);
box('south-wall',0,6,40,120,12,.8);
box('west-wall',-60,6,0,.8,12,80);
box('east-wall',60,6,0,.8,12,80);
box('high-ceiling',0,12.45,0,120,.7,80,'metal');
for(const sign of [-1,1]){
 const a=sign;
 box('wing-border-'+sign,a*27,2.3,-24,.65,4.6,21);
 box('wing-border-back-'+sign,a*27,2.3,23,.65,4.6,21);
 box('mezz-floor-'+sign,a*47,4.15,0,25,.40,39,'metal');
 box('mezz-rail-'+sign,a*33.4,5.0,0,.18,1.5,37,'metal');
 box('roof-walk-'+sign,a*18.4,6.45,0,2.8,.28,25,'metal');
 box('roof-rail-'+sign,a*16.9,7.13,0,.14,1.1,25,'metal');
 for(let i=0;i<12;i++){
  const z=-29+i*5.3;
  if(i%3!==1)box('cover-'+sign+'-'+i,a*(12+(i%3)*5),.85,z,3.5,1.7,2.3,i%3===0?'wood':'foam');
 }
 for(let i=0;i<5;i++)box('container-'+sign+'-'+i,a*(38+(i%2)*9),1.4,-31+i*15,6.2,2.8,3.7,i%2?'wood':'metal');
 // Sloped access ramps to the mezzanine (rendered as graduated stepping floors in blockout).
 for(let i=0;i<9;i++)box('ramp-'+sign+'-'+i,a*(33+i*1.6),.22+i*.43,25,3.0,.45+i*.85,5,'metal');
 for(let i=0;i<7;i++)box('barrier-'+sign+'-'+i,a*(30+(i%2)*7),.92,-26+i*8,4,1.84,.4,'wood');
}
for(let i=0;i<8;i++){
 const z=-31+i*8.8;
 box('central-cover-'+i,((i%2)*2-1)*5.5,1.15,z,2.9,2.3,1.9,i%3?'foam':'wood');
}
box('center-platform',0,2.5,0,8,.45,8,'metal');
box('nest-platform',0,5.35,-32,13,.35,6,'metal');
for(let i=0;i<10;i++)box('nest-step-'+i,0,.18+i*.5,-18-i*1.35,2.4,.36+i,1.8,'wood');
export const SPAWNS=[{x:-48,y:1,z:0},{x:48,y:1,z:0}];
export function zoneName(x:number,z:number){
 if(Math.abs(x)<10&&Math.abs(z)<12)return 'CENTER COURT';
 if(z< -19&&Math.abs(x)<20)return 'NORTH CORRIDOR';
 if(z>19&&Math.abs(x)<20)return 'SOUTH CORRIDOR';
 if(x< -30)return 'WEST WING';
 if(x>30)return 'EAST WING';
 return x<0?'WEST APPROACH':'EAST APPROACH';
}
