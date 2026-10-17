// BRICK BATTLEGROUNDS v0.8.25 — contained Spinjitzu silhouette.
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
const shellVert="uniform float uTime,uLayer;varying vec2 vUv;varying float vAngle,vRim;\nvoid main(){\n vUv=uv;vec3 p=position;float h=uv.y,a=atan(p.z,p.x);\n float r=sin(a*5.0-h*24.0+uTime*12.0+uLayer*1.8)*.075+\n sin(a*11.0+h*40.0-uTime*17.0+uLayer*3.4)*.026;\n p.xz*=1.0+r*(.55+h*.65);\n p.x+=sin(h*10.0-uTime*3.0+uLayer)*.08*h;\n p.z+=cos(h*9.0-uTime*2.7+uLayer)*.08*h;\n vAngle=atan(p.z,p.x);\n vec3 n=normalize(normalMatrix*normal),view=normalize(-(modelViewMatrix*vec4(p,1.0)).xyz);\n vRim=pow(1.0-abs(dot(n,view)),1.2);\n gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);\n}";
const shellFrag="uniform vec3 uColor;uniform float uTime,uOpacity,uLayer;\nvarying vec2 vUv;varying float vAngle,vRim;\nvoid main(){\n float h=vUv.y,edge=smoothstep(0.0,.07,h)*(1.0-smoothstep(.93,1.0,h));\n float w=sin(vAngle*5.0-h*33.0+uTime*15.0+uLayer*2.4)*.85+\n sin(vAngle*9.0+h*49.0-uTime*19.0+uLayer)*.35;\n float fine=pow(max(0.0,sin(h*175.0+vAngle*4.0-uTime*28.0+w*2.2)),12.0);\n float rings=pow(max(0.0,sin(h*95.0-vAngle*3.0+uTime*18.0+w)),4.0);\n float mist=.13+.06*sin(vAngle*7.0+h*28.0-uTime*10.0);\n float energy=(mist+fine*.37+rings*.20+vRim*.11)*edge*uOpacity;\n vec3 c=mix(uColor,uColor*.30+vec3(1.1),clamp(fine*.9+rings*.4,0.0,.78));\n gl_FragColor=vec4(c*1.33,clamp(energy,0.0,.66));\n}";
const ribbonVert="uniform float uTime;uniform float uSpeed;varying vec2 vUv;varying float vShimmer;\nvoid main(){vUv=uv;vec3 p=position;float a=atan(p.z,p.x);float h=uv.y;float flow=uTime*uSpeed;\np.xz*=1.0+sin(a*5.0+h*21.0+flow*2.0)*0.018;\np.y+=0.035*sin(a*2.0+h*15.0-flow);\nvShimmer=sin(h*37.0-flow*3.3+a*4.0)*0.5+0.5;\ngl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}";
const ribbonFrag="uniform vec3 uColor;uniform float uOpacity,uTime,uBright;\nvarying vec2 vUv;varying float vShimmer;\nvoid main(){\n float width=pow(max(0.0,1.0-abs(vUv.x*2.0-1.0)),1.5);\n float ends=smoothstep(0.0,.12,vUv.y)*(1.0-smoothstep(.83,1.0,vUv.y));\n float alpha=width*ends*(.72+.28*vShimmer)*uOpacity;\n vec3 c=mix(uColor,uColor*.22+vec3(1.22),uBright);\n gl_FragColor=vec4(c*1.43,alpha);\n}";
// CHANGED: Shader ribbons for hundreds of thin horizontal wind trails.
const bandVert="attribute float aSeed,aSpeed;\nuniform float uTime;varying vec2 vUv;varying float vPulse,vSeed;\nvoid main(){\n vUv=uv;vSeed=aSeed;vec3 p=position;\n float theta=uTime*(6.0+aSpeed*3.2),c=cos(theta),s=sin(theta);\n p.xz=mat2(c,-s,s,c)*p.xz;\n p.y+=.020*sin(uTime*13.0+aSeed*7.0+uv.y*10.0);\n vPulse=.77+.23*sin(uv.y*22.0-uTime*23.0+aSeed*42.0);\n gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);\n}";
const bandFrag="uniform vec3 uColor;uniform float uOpacity,uBright;\nvarying vec2 vUv;varying float vPulse,vSeed;\nvoid main(){\n float core=pow(max(0.0,1.0-abs(vUv.x*2.0-1.0)),2.3);\n float ends=smoothstep(0.0,.11,vUv.y)*(1.0-smoothstep(.82,1.0,vUv.y));\n float alpha=core*ends*vPulse*(.77+.23*sin(vSeed*81.0))*uOpacity;\n vec3 c=mix(uColor,uColor*.11+vec3(1.35),clamp(uBright+.11*vPulse,0.0,1.0));\n gl_FragColor=vec4(c*1.40,alpha);\n}";
const particleVert="attribute float aSeed;attribute float aSize;attribute float aSpeed;\nuniform float uTime;uniform float uOpacity;varying float vFade;\nvoid main(){float h=fract(position.y/3.6+uTime*aSpeed);\nfloat a=aSeed*6.2831853+h*12.0+uTime*(3.8+aSpeed*8.0);\nfloat r=0.41+1.10*h+0.08*sin(aSeed*51.0+uTime*8.0);\nvec3 p=vec3(cos(a)*r,0.17+h*3.43,sin(a)*r);\nvec4 mv=modelViewMatrix*vec4(p,1.0);gl_Position=projectionMatrix*mv;\ngl_PointSize=clamp(aSize*12.0/max(2.5,-mv.z),1.0,12.0);\nvFade=smoothstep(0.0,0.19,h)*(1.0-smoothstep(0.80,1.0,h))*uOpacity;}";
const particleFrag="uniform vec3 uColor;varying float vFade;\nvoid main(){vec2 p=gl_PointCoord-vec2(.5);float d=length(p);\n float alpha=(1.0-smoothstep(.02,.50,d))*vFade*.94;\n gl_FragColor=vec4(mix(uColor,vec3(1.0),.72)*1.2,alpha);\n}";
const groundVert="varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}";
const groundFrag="varying vec2 vUv;uniform vec3 uColor;uniform float uTime,uOpacity;\nvoid main(){\n vec2 p=(vUv-.5)*2.0;\n float d=length(p),a=atan(p.y,p.x);\n float ring=exp(-pow((d-.54)*10.0,2.0)),glow=exp(-pow(d*1.85,2.0));\n float noise=sin(a*12.0-uTime*26.0+d*19.0)*.5+.5;\n float burst=1.0+2.5*exp(-pow((uTime-1.80)*17.0,2.0));\n float alpha=(ring*(.20+.35*noise)+glow*.31)*uOpacity*burst;\n gl_FragColor=vec4(mix(uColor,vec3(1.0),ring*.36)*1.26,clamp(alpha,0.0,.85));\n}";

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
// CHANGED: 116 winding, broken, gently tilted show-style energy rings.
// Batched as TWO meshes so this is fast enough for two players online.
function bandGeometry(count,layer=0){
 const steps=64,across=3,pos=[],uv=[],seed=[],speed=[],indices=[];
 for(let k=0;k<count;k++){
  const rnd=(k*.61803398875+layer*.37)%1;
  const height=.10+3.63*((k+.34+rnd*.65)/count);
  const norm=Math.max(0,Math.min(1,height/3.85));
  const radius=.36+1.20*Math.pow(norm,.83)+(layer?.13:0);
  const phase=k*2.39996323+layer*.91;
  const arc=3.45+2.90*((k*.75487766)%1);
  const slant=.018+.095*((k*.41421356)%1);
  const thickness=(layer?.047:.029)*(.54+norm*.9);
  const start=pos.length/3;
  for(let i=0;i<=steps;i++){
   const t=i/steps,angle=phase+arc*t;
   const r=radius+.06*Math.sin(t*6.283*2+phase)+.035*Math.sin(t*18+phase*1.9);
   const y=height+slant*(t-.5)+.021*Math.sin(t*9+phase);
   for(let j=0;j<=across;j++){
    const side=(j/across-.5)*2;
    pos.push(Math.cos(angle)*(r+side*.013),y+side*thickness,Math.sin(angle)*(r+side*.013));
    uv.push(j/across,t);seed.push(rnd);speed.push((k*.348234)%1);
   }
  }
  for(let i=0;i<steps;i++)for(let j=0;j<across;j++){
   const v=start+i*(across+1)+j;
   indices.push(v,v+1,v+across+1,v+1,v+across+2,v+across+1);
  }
 }
 const g=new THREE.BufferGeometry();
 for(const [key,data,dim] of [['position',pos,3],['uv',uv,2],
  ['aSeed',seed,1],['aSpeed',speed,1]])
  g.setAttribute(key,new THREE.Float32BufferAttribute(data,dim));
 g.setIndex(indices);return g;
}

function particleGeometry(){
 const pos=[],seed=[],size=[],speed=[];
 for(let i=0;i<240;i++){
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
 const shells=[],ribbons=[],bands=[],materials=[];
 for(let i=0;i<4;i++){
  const mat=shader(shellVert,shellFrag,color,i);
  materials.push(mat);
  const part=new THREE.Mesh(new THREE.CylinderGeometry(
   1.62+i*.10,.36+i*.035,3.86,84,24,true),mat);
  part.position.y=1.98;part.rotation.y=i*1.33;
  part.frustumCulled=false;part.renderOrder=3+i;
  group.add(part);shells.push(part);
 }
 for(let i=0;i<15;i++){
  const bright=i>=8,mat=shader(ribbonVert,ribbonFrag,color,i*.3);
  mat.uniforms.uSpeed.value=bright?1.45:1.1;
  mat.uniforms.uBright.value=bright?.68:.26;
  materials.push(mat);
  const part=new THREE.Mesh(ribbonGeometry(i*TAU/8+(bright?.19:0),
   bright?4.2:3.6,bright?.07:.20,bright?.10:0),mat);
  part.frustumCulled=false;part.renderOrder=7+(bright?1:0);
  group.add(part);ribbons.push(part);
 }
 // CHANGED: Fill the tornado with many luminous almost-horizontal spirals,
 // including white-hot thinner streaks like the supplied Spinjitzu reference.
 for(let layer=0;layer<2;layer++){
  const mat=shader(bandVert,bandFrag,color,layer);
  mat.uniforms.uBright.value=layer===0?.40:.83;
  materials.push(mat);
  const mesh=new THREE.Mesh(bandGeometry(layer===0?68:48,layer),mat);
  mesh.frustumCulled=false;mesh.renderOrder=9+layer;
  group.add(mesh);bands.push(mesh);
 }
 const pmat=shader(particleVert,particleFrag,color);
 materials.push(pmat);
 const particles=new THREE.Points(particleGeometry(),pmat);
 particles.frustumCulled=false;particles.renderOrder=10;group.add(particles);
 const gmat=shader(groundVert,groundFrag,color);
 materials.push(gmat);
 const ground=new THREE.Mesh(new THREE.PlaneGeometry(5.2,5.2),gmat);
 ground.rotation.x=-Math.PI/2;ground.position.y=.15;ground.renderOrder=2;
 group.add(ground);
 const light=new THREE.PointLight(0xffffff,0,7.0,2);
 light.position.y=1.8;group.add(light);
 f.spinjitzu={group,shells,ribbons,bands,particles,ground,light,materials,
  color:color.clone(),active:false};
}

export function setSpinjitzuColor(f,color){
 const fx=f.spinjitzu;if(!fx)return;
 // CHANGED: Fighter-matching NEON hues. Verdant needs the vivid lime green
 // from the screenshot, not the dark plastic green used on the minifigure.
 const elemental={
  '137db8':'33baff','c63633':'ff4b24','238550':'67ff12',
  '333c49':'a5b9ff','c7a134':'ffde39','d7dce1':'d4ffff',
  'd56c2a':'ff9124','783ca3':'ce58ff','ce577c':'ff60b4'
 };
 const chosen=elemental[color.getHexString()]||null;
 fx.color.copy(chosen?new THREE.Color('#'+chosen):color);
 for(const material of fx.materials)material.uniforms.uColor.value.copy(fx.color);
 fx.light.color.copy(fx.color.clone().lerp(new THREE.Color(0xffffff),.4));
}
export function stopSpinjitzu(f){
 const fx=f.spinjitzu;if(!fx)return;
 if(fx.active){
  // CHANGED: Restore visual scale/offset after Special or interruption.
  f.visual.rotation.y=0;
  f.visual.scale.setScalar(1);
  f.visual.position.set(0,0,0);
 }
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
 // CHANGED: A tighter spinning pose prevents stray arms and feet poking out.
 const legWave=Math.sin(rotation*1.25)*17*glow;
 const action={LS:[88,-13,-12],LE:[132,0,0],RS:[89,13,12],RE:[133,0,0],
  LH:[10+legWave,0,-5],RH:[10-legWave,0,5],
  LK:[-36-9*Math.max(0,Math.sin(rotation))*glow,0,0],
  RK:[-36-9*Math.max(0,-Math.sin(rotation))*glow,0,0],
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
 f.visual.rotation.set(-.08*glow,rotation*progress,Math.sin(rotation)*.045*glow);
 // CHANGED: Move and scale ONLY the visible LEGO rig into the funnel center.
 // CHANGED: The fighter root, attack range, collision and hitbox stay unchanged.
 // CHANGED: Ease into/out of the smaller silhouette to avoid visible snapping.
 const contained=ease(t/.18)*(1-ease((t-1.70)/.30));
 f.visual.scale.setScalar(1-.41*contained);
 f.visual.position.set(0,.38*contained+.035*glow+
   Math.abs(Math.sin(rotation*.85))*.025*glow,0);
 fx.active=true;fx.group.visible=glow>.015;
 fx.group.scale.setScalar(.13+.87*glow);
 // CHANGED: Tilt the *energy* with travel instead of spinning rigid hoops.
 fx.group.rotation.z=-.035*glow+Math.sin(t*3.5)*.015*glow;
 fx.group.rotation.x=Math.cos(t*2.8)*.025*glow;
 fx.shells.forEach((part,i)=>part.rotation.y=-t*(4.7+i*.32)+i*1.33);
 fx.ribbons.forEach((part,i)=>part.rotation.y=(i%2?-1:1)*t*(8.7+i*.11)+i*.18);
 for(const material of fx.materials){
  material.uniforms.uTime.value=t;
  material.uniforms.uOpacity.value=glow;
 }
 fx.shells.forEach((part,i)=>part.material.uniforms.uOpacity.value=glow*(i===0?.94:i===1?.78:i===2?.57:.34));
 fx.ribbons.forEach((part,i)=>part.material.uniforms.uOpacity.value=glow*(i>=8?.95:.70));
 fx.bands.forEach((part,i)=>part.material.uniforms.uOpacity.value=glow*(i===0?.98:.88));
 fx.particles.material.uniforms.uOpacity.value=glow*.98;
 fx.ground.material.uniforms.uOpacity.value=glow*.94;
 fx.light.intensity=3.5*glow;
}
