// BRICK BATTLEGROUNDS v0.8.23 — cinematic show-inspired flowing Spinjitzu.
// Original procedural elemental vortex, not an image or imported copyrighted model.
// CHANGED: Animated 3D energy shells, bright ribbons, spark sprites and base aura.
// The effect is cosmetic; arena.js owns damage, root movement and networking.
import * as THREE from '/vendor/three.module.js';
import {applyCombatPose} from './combat-poses.js';
import {CLASSIC_RELAXED} from './classic-combat.js';

export const SPIN_DURATION=2.0;
export const SPIN_COOLDOWN=8.0;
export const SPIN_DAMAGE=[5,5,5,5,8];
export const SPIN_HITS=[.19,.37,.55,.73,.90];
export const SPIN_RANGE=2.85;
export const SPIN_SPEED=9.0;
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
// CHANGED: Layered shader-driven flow replaces rigid tubes and solid blocks.
const shellVert="uniform float uTime;uniform float uLayer;varying vec2 vUv;varying float vAngle;varying float vRim;\nvoid main(){vUv=uv;vec3 p=position;float h=uv.y;float a=atan(p.z,p.x);\nfloat ripple=sin(a*3.0-h*17.0+uTime*8.0+uLayer*2.2)*0.07+\nsin(a*7.0+h*27.0-uTime*13.0+uLayer*3.1)*0.026;\np.xz*=1.0+ripple*(0.45+h*0.35);\np.x+=sin(h*5.0-uTime*2.15+uLayer*1.6)*0.075*h;\np.z+=cos(h*5.2-uTime*1.85+uLayer)*0.067*h;\nvAngle=atan(p.z,p.x);\nvec3 view=normalize((modelViewMatrix*vec4(p,1.0)).xyz);\nvRim=pow(max(0.0,1.0-abs(dot(normalize(normalMatrix*normal),-view))),1.25);\ngl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}";
const shellFrag="uniform vec3 uColor;uniform float uTime;uniform float uOpacity;uniform float uLayer;\nvarying vec2 vUv;varying float vAngle;varying float vRim;\nvoid main(){float h=vUv.y;\nfloat edge=smoothstep(0.015,0.19,h)*(1.0-smoothstep(0.83,1.0,h));\nfloat turbulence=sin(vAngle*8.0+h*52.0+uTime*9.5+uLayer*7.0)*0.34+\nsin(h*83.0-vAngle*5.0-uTime*18.0)*0.17;\nfloat spin=sin(vAngle*4.0-h*34.0+uTime*12.0+uLayer*1.85+turbulence);\nfloat secondary=sin(vAngle*9.0+h*56.0-uTime*20.0+uLayer);\nfloat hot=smoothstep(0.36,0.91,spin);float wisps=smoothstep(0.64,0.98,secondary);\nfloat glow=(0.048+hot*0.29+wisps*0.105+vRim*0.12)*edge;\nglow*=0.78+0.22*sin(h*13.0-uTime*6.0+uLayer);glow*=uOpacity;\nvec3 c=mix(uColor,uColor*0.38+vec3(0.72),hot*0.54+wisps*0.12);\ngl_FragColor=vec4(c,clamp(glow,0.0,0.68));}";
const ribbonVert="uniform float uTime;uniform float uSpeed;varying vec2 vUv;varying float vShimmer;\nvoid main(){vUv=uv;vec3 p=position;float a=atan(p.z,p.x);float h=uv.y;float flow=uTime*uSpeed;\np.xz*=1.0+sin(a*5.0+h*21.0+flow*2.0)*0.018;\np.y+=0.035*sin(a*2.0+h*15.0-flow);\nvShimmer=sin(h*37.0-flow*3.3+a*4.0)*0.5+0.5;\ngl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}";
const ribbonFrag="uniform vec3 uColor;uniform float uOpacity;uniform float uTime;uniform float uBright;\nvarying vec2 vUv;varying float vShimmer;\nvoid main(){float cross=pow(max(0.0,1.0-abs(vUv.x*2.0-1.0)),2.1);\nfloat tip=smoothstep(0.0,0.20,vUv.y)*(1.0-smoothstep(0.70,1.0,vUv.y));\nfloat alpha=cross*tip*(0.75+0.25*vShimmer)*uOpacity;\nvec3 c=mix(uColor,uColor*0.15+vec3(0.92),uBright);\ngl_FragColor=vec4(c,alpha);}";
const particleVert="attribute float aSeed;attribute float aSize;attribute float aSpeed;\nuniform float uTime;uniform float uOpacity;varying float vFade;\nvoid main(){float h=fract(position.y/3.6+uTime*aSpeed);\nfloat a=aSeed*6.2831853+h*12.0+uTime*(3.8+aSpeed*8.0);\nfloat r=0.41+1.10*h+0.08*sin(aSeed*51.0+uTime*8.0);\nvec3 p=vec3(cos(a)*r,0.17+h*3.43,sin(a)*r);\nvec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;\ngl_PointSize=clamp(aSize*12.0/max(2.5,-mv.z),1.0,12.0);\nvFade=smoothstep(0.0,0.19,h)*(1.0-smoothstep(0.80,1.0,h))*uOpacity;}";
const particleFrag="uniform vec3 uColor;varying float vFade;\nvoid main(){vec2 p=gl_PointCoord-vec2(0.5);float d=length(p);\nfloat a=(1.0-smoothstep(0.10,0.50,d))*vFade*0.58;\ngl_FragColor=vec4(mix(uColor,vec3(1.0),0.72),a);}";
const groundVert="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const groundFrag="varying vec2 vUv;uniform vec3 uColor;uniform float uTime;uniform float uOpacity;\nvoid main(){vec2 p=(vUv-0.5)*2.0;float d=length(p);float a=atan(p.y,p.x);\nfloat ring=exp(-pow((d-0.66)*11.5,2.0));float soft=exp(-pow(d*2.5,2.0));\nfloat motion=sin(a*8.0-uTime*13.0+d*14.0)*0.5+0.5;\nfloat opacity=(ring*(0.18+0.30*motion)+soft*0.14)*uOpacity;\ngl_FragColor=vec4(mix(uColor,vec3(1.0),ring*0.28),opacity);}";

const TAU=Math.PI*2;
function shader(vertexShader,fragmentShader,color,layer=0){
 return new THREE.ShaderMaterial({
  vertexShader,fragmentShader,
  uniforms:{uColor:{value:color.clone()},uTime:{value:0},uOpacity:{value:0},
   uLayer:{value:layer},uSpeed:{value:1},uBright:{value:0}},
  transparent:true,depthWrite:false,depthTest:true,
  side:THREE.DoubleSide,blending:THREE.AdditiveBlending
 });
}
function ribbonGeometry(phase,turns,width,offset){
 const length=88,steps=4,pos=[],uv=[],index=[];
 for(let i=0;i<=length;i++){
  const t=i/length,h=.15+t*3.55;
  const radius=.45+Math.pow(t,.79)*1.02+offset+.045*Math.sin(t*TAU*2.8+phase*3);
  const angle=phase+t*turns*TAU,angularWidth=width*(.48+.62*t);
  for(let j=0;j<=steps;j++){
   const side=(j/steps-.5)*2,a=angle+side*angularWidth;
   const r=radius+side*.075+.025*Math.sin(t*TAU*5+phase);
   pos.push(Math.cos(a)*r,h,Math.sin(a)*r);uv.push(j/steps,t);
  }
 }
 for(let i=0;i<length;i++)for(let j=0;j<steps;j++){
  const v=i*(steps+1)+j;
  index.push(v,v+steps+1,v+1,v+1,v+steps+1,v+steps+2);
 }
 const g=new THREE.BufferGeometry();
 g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));
 g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
 g.setIndex(index);
 return g;
}
function particleGeometry(){
 const pos=[],seed=[],size=[],speed=[];
 for(let i=0;i<105;i++){
  pos.push(0,((i*.38196601125)%1)*3.6,0);
  seed.push((i*.61803398875)%1);
  size.push(1.5+2.5*((i*.754877)%1));
  speed.push(.28+.20*((i*.56984)%1));
 }
 const g=new THREE.BufferGeometry();
 for(const [key,data,dim] of [['position',pos,3],['aSeed',seed,1],
   ['aSize',size,1],['aSpeed',speed,1]])
  g.setAttribute(key,new THREE.Float32BufferAttribute(data,dim));
 return g;
}

// CHANGED: Professional swirling full-body cone made from flowing translucent
// surfaces, spirals and soft GPU sparks; not spinning solid blocks.
export function createSpinjitzu(f){
 const group=new THREE.Group();group.name='ElementalSpinjitzu';
 group.visible=false;f.root.add(group);
 const color=f.visual.userData.baseColor;
 const shells=[],ribbons=[],materials=[];
 for(let i=0;i<3;i++){
  const mat=shader(shellVert,shellFrag,color,i);
  materials.push(mat);
  const part=new THREE.Mesh(new THREE.CylinderGeometry(
   1.48+i*.085,.45+i*.045,3.65,72,28,true),mat);
  part.position.y=2;part.rotation.y=i*1.33;
  part.frustumCulled=false;part.renderOrder=3+i;
  group.add(part);shells.push(part);
 }
 for(let i=0;i<12;i++){
  const bright=i>=6,mat=shader(ribbonVert,ribbonFrag,color,i*.3);
  mat.uniforms.uSpeed.value=bright?1.45:1.1;
  mat.uniforms.uBright.value=bright?.68:.26;
  materials.push(mat);
  const part=new THREE.Mesh(ribbonGeometry(i*TAU/6+(bright?.19:0),
   bright?2.9:2.15,bright?.09:.30,bright?.10:0),mat);
  part.frustumCulled=false;part.renderOrder=7+(bright?1:0);
  group.add(part);ribbons.push(part);
 }
 const pmat=shader(particleVert,particleFrag,color);
 materials.push(pmat);
 const particles=new THREE.Points(particleGeometry(),pmat);
 particles.frustumCulled=false;particles.renderOrder=10;group.add(particles);
 const gmat=shader(groundVert,groundFrag,color);
 materials.push(gmat);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(4.1,4.1),gmat);
 ground.rotation.x=-Math.PI/2;ground.position.y=.15;ground.renderOrder=2;
 group.add(ground);
 const light=new THREE.PointLight(0xffffff,0,5.2,2);
 light.position.y=1.8;group.add(light);
 f.spinjitzu={group,shells,ribbons,particles,ground,light,materials,
  color:color.clone(),active:false};
}

export function setSpinjitzuColor(f,color){
 const fx=f.spinjitzu;if(!fx)return;
 fx.color.copy(color);
 for(const material of fx.materials)material.uniforms.uColor.value.copy(fx.color);
 fx.light.color.copy(fx.color.clone().lerp(new THREE.Color(0xffffff),.4));
}
export function stopSpinjitzu(f){
 const fx=f.spinjitzu;if(!fx)return;
 if(fx.active)f.visual.rotation.y=0; // CHANGED: Interrupts cannot leave a sideways-spun fighter.
 fx.active=false;fx.group.visible=false;fx.light.intensity=0;
 // The normal combat pose and knockdown pipelines own resetting visual rotation.
}
export function poseSpinjitzu(f){
 const fx=f.spinjitzu,attack=f.attack;
 if(!fx||attack?.kind!=='special'){stopSpinjitzu(f);return}
 const t=Math.min(SPIN_DURATION,Math.max(0,f.attackTime));
 const start=ease(t/.24),finish=1-ease((t-1.77)/.23);
 const glow=start*finish;
 // CHANGED: Ten complete rotations with eased acceleration/braking; the
 // CHANGED: minifigure finishes facing forward instead of snapping on exit.
 const rotation=2*Math.PI*10*ease(t/SPIN_DURATION);
 const swirl=rotation+Math.sin(t*14)*.12;
 // The minifig keeps arms tucked close, knees lifted alternately, and turns
 // inside the glowing vortex. Only visual yaw spins; movement root does not.
 const rad=Math.PI/180;
 const legWave=Math.sin(rotation*1.25)*27*glow;
 const action={LS:[77,-18,-24],LE:[120,0,0],RS:[78,18,24],RE:[121,0,0],
  LH:[14+legWave,0,-8],RH:[14-legWave,0,8],
  LK:[-32-14*Math.max(0,Math.sin(rotation))*glow,0,0],
  RK:[-32-14*Math.max(0,-Math.sin(rotation))*glow,0,0],
  T:[-10*glow,Math.sin(rotation*.5)*9*glow,Math.sin(rotation)*7*glow],
  H:[0,0,0]};
 // CHANGED: Smooth guard windup and final release: no instant raised arms
 // CHANGED: when the player taps E, and no snap back to idle after two seconds.
 const stance={};
 for(const key of Object.keys(CLASSIC_RELAXED))
  stance[key]=CLASSIC_RELAXED[key].map((base,i)=>base+(action[key][i]-base)*glow);
 applyCombatPose(f,stance);
 const progress=ease(t/.18);
 // No jump in visual orientation when attack starts; ease spin away on exit.
 f.visual.rotation.set(-.12*glow,rotation*progress,Math.sin(rotation)*.08*glow);
 f.visual.position.set(0,.06*glow+Math.abs(Math.sin(rotation*.85))*.11*glow,0);
 fx.active=true;fx.group.visible=glow>.015;
 fx.group.scale.setScalar(.16+.84*glow);
 // CHANGED: Tilt the *energy* with travel instead of spinning rigid hoops.
 fx.group.rotation.z=-.035*glow+Math.sin(t*3.5)*.015*glow;
 fx.group.rotation.x=Math.cos(t*2.8)*.025*glow;
 fx.shells.forEach((part,i)=>part.rotation.y=-t*(3.6+i*.28)+i*1.33);
 fx.ribbons.forEach((part,i)=>part.rotation.y=(i%2?-1:1)*t*(6.8+i*.15)+i*.18);
 for(const material of fx.materials){
  material.uniforms.uTime.value=t;
  material.uniforms.uOpacity.value=glow;
 }
 fx.shells.forEach((part,i)=>part.material.uniforms.uOpacity.value=glow*(i===0?.76:i===1?.66:.47));
 fx.ribbons.forEach((part,i)=>part.material.uniforms.uOpacity.value=glow*(i>=6?.76:.47));
 fx.particles.material.uniforms.uOpacity.value=glow*.86;
 fx.ground.material.uniforms.uOpacity.value=glow*.86;
 fx.light.intensity=2.15*glow;
}
