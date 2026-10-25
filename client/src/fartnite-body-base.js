import * as THREE from 'three';

// One watertight, smoothly shaded body per gender. The body is formed from original
// implicit volumes, joined with smooth unions and extracted as one isosurface.
// The shared surface is skinned to the existing character animation pivots.
// No overlaid spheres, capsules, hands, separate heads, clothes or accessories.
export const BODY_BASE_VERSION='seamless-humanoid-v4';
export const BODY_PROPORTIONS=Object.freeze({
 male:{shoulder:.548,hip:.232,wrist:.079,thigh:.214},
 female:{shoulder:.497,hip:.244,wrist:.071,thigh:.223}
});
const geometries=new Map();

function softMin(a,b,k){
 const h=Math.max(k-Math.abs(a-b),0)/k;
 return Math.min(a,b)-h*h*k*.25;
}
function ellipsoid(x,y,z,cx,cy,cz,rx,ry,rz){
 const px=(x-cx)/rx,py=(y-cy)/ry,pz=(z-cz)/rz;
 const k0=Math.hypot(px,py,pz);
 const k1=Math.hypot(px/rx,py/ry,pz/rz);
 return k1>1e-8?k0*(k0-1)/k1:-Math.min(rx,ry,rz);
}
function lineCapsule(x,y,z,ax,ay,az,bx,by,bz,r1,r2){
 const vx=bx-ax,vy=by-ay,vz=bz-az;
 const t=Math.max(0,Math.min(1,((x-ax)*vx+(y-ay)*vy+(z-az)*vz)/(vx*vx+vy*vy+vz*vz)));
 const r=r1+(r2-r1)*t;
 return Math.hypot(x-ax-vx*t,y-ay-vy*t,z-az-vz*t)-r;
}
function bodyDistance(x,y,z,gender){
 const male=gender==='male';
 const shoulder=male?.55:.49;
 const hip=male?.235:.25;
 let d=ellipsoid(x,y,z,0,2.29,0,male?.455:.391,.635,male?.259:.244); // chest + upper body
 d=softMin(d,ellipsoid(x,y,z,0,1.80,0,male?.317:.298,.49,.221),.30); // tapered waist
 d=softMin(d,ellipsoid(x,y,z,0,1.56,0,male?.359:.378,.245,.260),.24); // pelvis
 d=softMin(d,lineCapsule(x,y,z,0,2.77,0,0,3.079,0,male?.134:.115,male?.124:.111),.135); // neck
 // Smooth adult-proportion blank head. Deliberately narrower than shoulders.
 d=softMin(d,ellipsoid(x,y,z,0,3.253,.008,male?.259:.251,.320,male?.244:.234),.084);
 for(const sign of [-1,1]){
  const sx=sign*shoulder;
  // Upper arm, elbow, forearm and mitten-like featureless hand all unioned.
  let a=lineCapsule(x,y,z,sign*(shoulder-.01),2.675,0,sign*(shoulder+.040),2.115,0,male?.152:.135,male?.115:.105);
  a=softMin(a,lineCapsule(x,y,z,sign*(shoulder+.040),2.135,0,sign*(shoulder+.057),1.58,.025,male?.114:.106,male?.082:.076),.12);
  a=softMin(a,ellipsoid(x,y,z,sign*(shoulder+.066),1.430,.048,male?.102:.094,.163,.086),.13);
  // A shallow built-in thumb shape, merged into the hand rather than an extra visible mesh.
  a=softMin(a,ellipsoid(x,y,z,sign*(shoulder+.113),1.450,.112,.049,.094,.049),.065);
  d=softMin(d,a,.16);

  const lx=sign*hip;
  let leg=lineCapsule(x,y,z,lx,1.565,0,lx+sign*.017,.94,.003,male?.214:.225,male?.165:.159);
  leg=softMin(leg,lineCapsule(x,y,z,lx+sign*.017,.94,.003,lx+sign*.023,.225,.015,male?.164:.158,male?.111:.106),.145);
  // Bare foot with anatomical arch and gently projecting toe.
  leg=softMin(leg,ellipsoid(x,y,z,lx+sign*.025,.153,.129,male?.142:.134,.132,.274),.105);
  d=softMin(d,leg,.17);
 }
 return d;
}
const TETS=[
 [0,5,1,6],[0,1,2,6],[0,2,3,6],
 [0,3,7,6],[0,7,4,6],[0,4,5,6]
];
const CORNERS=[
 [0,0,0],[1,0,0],[1,1,0],[0,1,0],
 [0,0,1],[1,0,1],[1,1,1],[0,1,1]
];
function makeGeometry(gender){
 const step=.060;
 const xmin=-1.00,xmax=1.00,ymin=-.060,ymax=3.68,zmin=-.54,zmax=.60;
 const nx=Math.ceil((xmax-xmin)/step),ny=Math.ceil((ymax-ymin)/step),nz=Math.ceil((zmax-zmin)/step);
 const xs=Array.from({length:nx+1},(_,i)=>xmin+i*step);
 const ys=Array.from({length:ny+1},(_,i)=>ymin+i*step);
 const zs=Array.from({length:nz+1},(_,i)=>zmin+i*step);
 const row=nx+1,plane=row*(ny+1);
 const samples=new Float32Array(plane*(nz+1));
 const at=(i,j,k)=>k*plane+j*row+i;
 for(let k=0;k<=nz;k++)for(let j=0;j<=ny;j++)for(let i=0;i<=nx;i++)
  samples[at(i,j,k)]=bodyDistance(xs[i],ys[j],zs[k],gender);
 const positions=[],normals=[],skinIds=[],skinWeights=[];
 const props=BODY_PROPORTIONS[gender];
 function vertex(px,py,pz){
  positions.push(px,py,pz);
  const h=.013;
  let nx=bodyDistance(px+h,py,pz,gender)-bodyDistance(px-h,py,pz,gender);
  let ny=bodyDistance(px,py+h,pz,gender)-bodyDistance(px,py-h,pz,gender);
  let nz=bodyDistance(px,py,pz+h,gender)-bodyDistance(px,py,pz-h,gender);
  const n=Math.hypot(nx,ny,nz)||1;nx/=n;ny/=n;nz/=n;
  normals.push(nx,ny,nz);
  // Bone ordering: base=0, torso=1, L/R arms=2/3, L/R legs=4/5.
  let center=1,other=0,blend=1;
  // Arms smoothly blend from the torso at the shoulder. Since the character
  // is a single surface, vertices at the upper shoulder are not split.
  const absx=Math.abs(px),armX=props.shoulder;
  if(absx>armX-.20&&py>1.24&&py<2.84){
   const armFactor=Math.max(0,Math.min(1,(absx-(armX-.24))/.30));
   const vertical=Math.max(0,Math.min(1,(2.80-py)/.32));
   const weight=armFactor*vertical;
   if(weight>.02){center=px<0?2:3;other=1;blend=weight}
  }
  // Leg bones meet the pelvis gradually.
  if(py<1.56&&Math.abs(px)>.09){
   const legFactor=Math.max(0,Math.min(1,(1.66-py)/.32));
   center=px<0?4:5;other=0;blend=legFactor;
  }
  skinIds.push(center,other,0,0);
  skinWeights.push(blend,1-blend,0,0);
 }
 function emitTri(a,b,c){
  const ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2];
  const vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2];
  const cx=ux*0+uy*vz-uz*vy,cy=uz*vx-ux*vz,cz=ux*vy-uy*vx;
  const center=[(a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3];
  const e=.009;
  const grad=[
   bodyDistance(center[0]+e,center[1],center[2],gender)-bodyDistance(center[0]-e,center[1],center[2],gender),
   bodyDistance(center[0],center[1]+e,center[2],gender)-bodyDistance(center[0],center[1]-e,center[2],gender),
   bodyDistance(center[0],center[1],center[2]+e,gender)-bodyDistance(center[0],center[1],center[2]-e,gender)
  ];
  if(cx*grad[0]+cy*grad[1]+cz*grad[2]<0){vertex(...a);vertex(...c);vertex(...b)}
  else{vertex(...a);vertex(...b);vertex(...c)}
 }
 for(let k=0;k<nz;k++)for(let j=0;j<ny;j++)for(let i=0;i<nx;i++){
  const cornerValues= CORNERS.map(([dx,dy,dz])=>samples[at(i+dx,j+dy,k+dz)]);
  let min=Infinity,max=-Infinity;
  for(let a=0;a<8;a++){if(cornerValues[a]<min)min=cornerValues[a];if(cornerValues[a]>max)max=cornerValues[a]}
  if(min>=0||max<0)continue;
  const cornerPos=CORNERS.map(([dx,dy,dz])=>[xs[i+dx],ys[j+dy],zs[k+dz]]);
  for(const tet of TETS){
   const negative=tet.filter(n=>cornerValues[n]<0);
   if(negative.length===0||negative.length===4)continue;
   const positive=tet.filter(n=>cornerValues[n]>=0);
   const cross=(a,b)=>{
    const v1=cornerValues[a],v2=cornerValues[b],t=v1/(v1-v2);
    const p=cornerPos[a],q=cornerPos[b];
    return [p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t,p[2]+(q[2]-p[2])*t]
   };
   if(negative.length===1){
    const a=negative[0];
    emitTri(cross(a,positive[0]),cross(a,positive[1]),cross(a,positive[2]))
   }else if(negative.length===3){
    const a=positive[0];
    emitTri(cross(a,negative[0]),cross(a,negative[1]),cross(a,negative[2]))
   }else{
    const a=negative[0],b=negative[1],c=positive[0],d=positive[1];
    const p=cross(a,c),q=cross(a,d),r=cross(b,c),s=cross(b,d);
    emitTri(p,q,r);emitTri(q,s,r)
   }
  }
 }
 const geometry=new THREE.BufferGeometry();
 geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
 geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));
 geometry.setAttribute('skinIndex',new THREE.Uint16BufferAttribute(skinIds,4));
 geometry.setAttribute('skinWeight',new THREE.Float32BufferAttribute(skinWeights,4));
 geometry.computeBoundingSphere();
 geometry.userData={gender,unified:true,faces:positions.length/9,algorithm:'smooth-implicit-isosurface'};
 return geometry;
}
export function humanoidGeometry(gender='male'){
 if(gender!=='male'&&gender!=='female')throw new Error('Invalid humanoid base');
 if(!geometries.has(gender))geometries.set(gender,makeGeometry(gender));
 return geometries.get(gender);
}
export function createHumanoidSkeleton(gender){
 const p=BODY_PROPORTIONS[gender];
 const root=new THREE.Bone();root.name='root';
 const torso=new THREE.Bone();torso.name='torso';torso.position.set(0,1.60,0);root.add(torso);
 const armL=new THREE.Bone();armL.name='leftArm';armL.position.set(-p.shoulder,1.025,0);torso.add(armL);
 const armR=new THREE.Bone();armR.name='rightArm';armR.position.set(p.shoulder,1.025,0);torso.add(armR);
 const legL=new THREE.Bone();legL.name='leftLeg';legL.position.set(-p.hip,1.56,0);root.add(legL);
 const legR=new THREE.Bone();legR.name='rightLeg';legR.position.set(p.hip,1.56,0);root.add(legR);
 return {bones:[root,torso,armL,armR,legL,legR],root,torso,armL,armR,legL,legR};
}
