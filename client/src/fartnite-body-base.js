import * as THREE from 'three';

// FartNite smooth anatomical base v2: original, faceless mannequin-inspired proportions.
// Every outfit, NPC and player uses this same male/female topology.
// Shapes are smooth joined elliptical cross sections (not stacks of muscle spheres).
// Shared immutable BufferGeometries are reused by all 25 cosmetics and their thumbnails.
const cache=new Map();
const profile={
 male:{
  body:[
   [-.24,.24,.235,0,0],[-.17,.355,.263,0,0],[.00,.392,.274,0,0],
   [.20,.358,.265,0,0],[.38,.345,.251,0,0],[.56,.397,.280,0,0],
   [.74,.458,.303,0,.012],[.89,.474,.303,0,.006],
   [1.015,.458,.280,0,-.008],[1.135,.302,.210,0,-.007],
   [1.225,.156,.155,0,0]
  ],
  arm:[
   [ .02,.133,.142,0,0],[-.12,.151,.151,0,0],
   [-.32,.137,.142,0,0],[-.56,.119,.121,0,.002],
   [-.71,.109,.113,0,.008],[-.81,.121,.118,0,.014],
   [-1.02,.112,.107,0,.016],[-1.21,.081,.086,0,.017]
  ],
  sleeve:[
   [.07,.143,.147,0,0],[-.04,.165,.167,0,0],
   [-.14,.171,.166,0,0],[-.22,.166,.158,0,0],
   [-.26,.137,.139,0,0]
  ],
  leg:[
   [.06,.208,.220,0,0],[-.11,.226,.235,0,0],
   [-.33,.216,.220,0,-.012],[-.57,.190,.201,0,-.013],
   [-.76,.161,.162,0,0],[-.89,.164,.160,0,.020],
   [-1.05,.153,.158,0,.022],[-1.23,.135,.136,0,.020],
   [-1.38,.105,.104,0,.018]
  ]
 },
 female:{
  body:[
   [-.24,.25,.23,0,0],[-.16,.413,.262,0,0],[.00,.405,.263,0,0],
   [.18,.337,.236,0,0],[.37,.317,.228,0,0],[.55,.365,.263,0,.014],
   [.72,.395,.292,0,.016],[.84,.398,.289,0,.011],
   [1.00,.392,.266,0,0],[1.125,.263,.191,0,0],
   [1.225,.140,.141,0,0]
  ],
  arm:[
   [.02,.117,.126,0,0],[-.11,.129,.134,0,0],
   [-.30,.117,.124,0,0],[-.57,.105,.103,0,.007],
   [-.73,.090,.096,0,.007],[-.84,.101,.104,0,.010],
   [-1.02,.095,.089,0,.016],[-1.19,.072,.071,0,.017]
  ],
  sleeve:[
   [.07,.119,.130,0,0],[-.04,.138,.144,0,0],
   [-.15,.139,.142,0,0],[-.22,.132,.136,0,0],
   [-.26,.115,.120,0,0]
  ],
  leg:[
   [.06,.220,.228,0,0],[-.10,.235,.240,0,0],
   [-.33,.225,.219,0,-.017],[-.57,.193,.197,0,-.011],
   [-.76,.155,.161,0,0],[-.89,.153,.152,0,.011],
   [-1.07,.145,.147,0,.013],[-1.25,.125,.124,0,.014],
   [-1.38,.101,.097,0,.015]
  ]
 }
};
export const BODY_BASE_VERSION='blank-humanoid-v3';
export const BODY_HEIGHT=3.76;
export const BODY_PROPORTIONS=Object.freeze({
 male:{shoulder:.565,hip:.23,wrist:.082,thigh:.226},
 female:{shoulder:.49,hip:.245,wrist:.072,thigh:.235}
});
const ease=(t)=>t*t*(3-2*t);
function interpolate(rows,y){
 let n=0;while(n<rows.length-2&&rows[n+1][0]<y)n++;
 const lo=rows[n],hi=rows[n+1];
 const t=ease(Math.max(0,Math.min(1,(y-lo[0])/(hi[0]-lo[0]))));
 return [lo[1]+(hi[1]-lo[1])*t,lo[2]+(hi[2]-lo[2])*t,
  lo[3]+(hi[3]-lo[3])*t,lo[4]+(hi[4]-lo[4])*t]
}
function shapeGeometry(gender,part){
 const key=gender+'-'+part;
 if(cache.has(key))return cache.get(key);
 const rows=[...profile[gender][part]].sort((a,b)=>a[0]-b[0]),rings=part==='body'?47:part==='leg'?38:part==='arm'?35:17;
 const sides=part==='body'?24:16;
 const coords=[],uvs=[],indices=[];
 for(let j=0;j<=rings;j++){
  const t=j/rings,y=rows[0][0]+(rows[rows.length-1][0]-rows[0][0])*t;
  const [rx,rz,cx,cz]=interpolate(rows,y);
  for(let k=0;k<=sides;k++){
   const a=k/sides*Math.PI*2,x=Math.cos(a)*rx;
   const z=Math.sin(a)*rz+cz;
   // A gentle, subtle chest shape follows the smooth body surface; no visible muscles.
   let front=0;
   if(part==='body'&&z>0){
    const yy=(y-.76)/.23;
    const xx=(Math.abs(x)-(gender==='female'?.18:.19))/(gender==='female'?.19:.27);
    front=(gender==='female'?.065:.013)*Math.exp(-yy*yy*1.2-xx*xx*1.35)*(Math.sin(a)**2);
   }
   coords.push(x+cx,y,z+front);
   uvs.push(k/sides,t);
  }
 }
 for(let j=0;j<rings;j++)for(let k=0;k<sides;k++){
  const a=j*(sides+1)+k,b=a+sides+1;
  // outward winding for the y-up ring orientation
  indices.push(a,b,a+1,b,b+1,a+1)
 }
 // End caps for closed silhouettes in all supported renderers.
 const geometry=new THREE.BufferGeometry();
 geometry.setIndex(indices);
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(coords,3));
 geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));
 geometry.computeVertexNormals();
 geometry.computeBoundingSphere();
 cache.set(key,geometry);
 return geometry
}
export function smoothSurface(group,gender,part,color){
 const mesh=new THREE.Mesh(shapeGeometry(gender,part),color);
 mesh.castShadow=true;mesh.receiveShadow=true;
 group.add(mesh);return mesh
}
export function makeNeck(group,gender,mat){
 const neck=new THREE.Mesh(new THREE.CylinderGeometry(gender==='male'?.132:.117,gender==='male'?.15:.128,.32,18,1),
  mat);
 neck.position.set(0,1.25,0);neck.castShadow=true;group.add(neck);return neck
}
