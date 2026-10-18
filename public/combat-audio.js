// Brick Battlegrounds — original procedural toy-plastic combat audio.
// Sharp, resonant brick clacks and a sustained layered wind vortex. No downloaded SFX.
let context=null, master=null, noiseBuffer=null;
let enabled=true;
const windVoices=new Map(); // One independent wind sound per fighting character.
try{enabled=localStorage.getItem('brickBattlegroundsMuted')!=='1'}catch{}
const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));

function getAudio(){
 if(!enabled)return null;
 if(!context){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return null;
  try{
   context=new Audio();
   master=context.createGain();master.gain.value=.34;master.connect(context.destination);
   // Reusable, broadband material: a longer sample makes loop seams less noticeable.
   noiseBuffer=context.createBuffer(1,Math.floor(context.sampleRate*2),context.sampleRate);
   const samples=noiseBuffer.getChannelData(0);
   for(let i=0;i<samples.length;i++)samples[i]=Math.random()*2-1;
  }catch(error){console.warn('Combat audio unavailable',error);context=null;return null}
 }
 if(context.state==='suspended')context.resume().catch(()=>{});
 return context;
}
function tone(c,at,duration,from,to,volume,type='sine'){
 const osc=c.createOscillator(),gain=c.createGain();
 osc.type=type;
 osc.frequency.setValueAtTime(Math.max(20,from),at);
 osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);
 gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.004);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(master);
 osc.start(at);osc.stop(at+duration+.01);
 osc.onended=()=>{osc.disconnect();gain.disconnect()};
}
function noise(c,at,duration,volume,frequency=2100,q=.9){
 const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
 src.buffer=noiseBuffer;
 filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
 gain.gain.setValueAtTime(.0001,at);
 gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.004);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 src.connect(filter);filter.connect(gain);gain.connect(master);
 src.start(at);src.stop(at+duration+.015);
 src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
}
// A high, hard shell tap over a short hollow resonant body. Tiny pitch differences
// and doubled contacts simulate separate brick pieces clicking against one another.
function plasticClack(c,at,power=1,pitch=1){
 const p=pitch*(.96+Math.random()*.08),v=clamp(power,.15,1.7);
 noise(c,at,.022,.19*v,3100*p,1.55);
 tone(c,at,.041,1650*p,1070*p,.115*v,'triangle');
 tone(c,at+.003,.073,680*p,470*p,.125*v,'sine');
 tone(c,at+.008,.052,1130*p,740*p,.052*v,'triangle');
}
function plasticHit(c,at,heavy=false){
 if(!heavy){
  plasticClack(c,at,.92,1.05);
  plasticClack(c,at+.021,.34,.90);
 }else{
  plasticClack(c,at,1.28,.88);
  plasticClack(c,at+.029,.90,1.02);
  plasticClack(c,at+.065,.35,.72);
 }
}
function plasticTumble(c,at,strength=1){
 plasticClack(c,at,.75*strength,.88);
 plasticClack(c,at+.048,.66*strength,1.24);
 plasticClack(c,at+.113,.47*strength,.77);
 plasticClack(c,at+.19,.30*strength,1.14);
}
function whoosh(c,at,duration,volume,frequency){
 // Quiet air behind the toy-plastic hit, not a cinematic bass thump.
 noise(c,at,duration,volume,frequency,.55);
}
// The continuously looped noise is shaped into a low turbulent air body and a
// brighter whistling spiral. Slow filter modulation creates the moving vortex.
export function startSpinjitzuWind(owner){
 if(!owner||windVoices.has(owner))return;
 const c=getAudio();if(!c)return;
 const at=c.currentTime+.004;
 const gain=c.createGain();
 gain.gain.setValueAtTime(.0001,at);
 gain.gain.linearRampToValueAtTime(.27,at+.18);
 gain.connect(master);
 const sources=[],nodes=[gain],oscillators=[];
 function layer(frequency,q,amount,offset){
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),volume=c.createGain();
  src.buffer=noiseBuffer;src.loop=true;
  filter.type='bandpass';filter.frequency.value=frequency;filter.Q.value=q;
  volume.gain.value=amount;
  src.connect(filter);filter.connect(volume);volume.connect(gain);
  src.start(at,offset);
  sources.push(src);nodes.push(src,filter,volume);
  return filter;
 }
 const rumble=layer(450,.42,.55,0);
 const swirl=layer(1730,.68,.70,.42);
 const lfo=c.createOscillator(),lowSweep=c.createGain(),highSweep=c.createGain();
 lfo.type='sine';lfo.frequency.value=6.8;
 lowSweep.gain.value=220;highSweep.gain.value=800;
 lfo.connect(lowSweep);lowSweep.connect(rumble.frequency);
 lfo.connect(highSweep);highSweep.connect(swirl.frequency);
 lfo.start(at);oscillators.push(lfo);nodes.push(lfo,lowSweep,highSweep);
 const voice={gain,sources,oscillators,nodes};
 windVoices.set(owner,voice);
 // The game's 2s move normally stops this earlier. Fail-safe cleanup at 3s.
 const fallback=at+3.1;
 for(const source of sources)source.stop(fallback);
 for(const oscillator of oscillators)oscillator.stop(fallback);
 sources[0].onended=()=>{
  if(windVoices.get(owner)===voice)windVoices.delete(owner);
  for(const n of nodes)try{n.disconnect()}catch{}
 };
}
export function stopSpinjitzuWind(owner){
 const voice=windVoices.get(owner);
 if(!voice||!context)return;
 windVoices.delete(owner);
 const now=context.currentTime,end=now+.22;
 voice.gain.gain.cancelScheduledValues(now);
 voice.gain.gain.setValueAtTime(Math.max(.0001,voice.gain.gain.value),now);
 voice.gain.gain.exponentialRampToValueAtTime(.0001,end);
 for(const node of [...voice.sources,...voice.oscillators]){
  try{node.stop(end+.025)}catch{}
 }
}
function stopAllWind(){
 for(const owner of [...windVoices.keys()])stopSpinjitzuWind(owner);
}
export function playCombatSound(kind,owner=null){
 if(kind==='spinStart'){startSpinjitzuWind(owner);return}
 if(kind==='spinEnd'){stopSpinjitzuWind(owner);return}
 const c=getAudio();if(!c)return;
 const at=c.currentTime+.003,p=.94+Math.random()*.12;
 switch(kind){
  case 'lightSwing':
   whoosh(c,at,.065,.043,1600*p);break;
  case 'heavySwing':
   whoosh(c,at,.13,.082,950*p);break;
  case 'lightHit':
   plasticHit(c,at);break;
  case 'heavyHit':
   plasticHit(c,at,true);break;
  case 'block':
   plasticClack(c,at,.70,1.6);
   tone(c,at,.045,2200,1350,.042,'triangle');break;
  case 'guardBreak':
   plasticTumble(c,at,1.15);break;
  case 'dash':
   whoosh(c,at,.17,.11,950*p);break;
  case 'jump':
   whoosh(c,at,.08,.056,1400*p);break;
  case 'spinHit':
   // Quiet plastic contacts cut through the dominant rushing wind.
   plasticClack(c,at,.48,1.42);break;
  case 'knockdown':
   plasticTumble(c,at,1.12);break;
 }
}
export function initCombatAudio(button){
 const update=()=>{
  button.textContent=enabled?'♪ SOUND ON':'♪ SOUND OFF';
  button.setAttribute('aria-label',enabled?'Mute combat sounds':'Unmute combat sounds');
  button.setAttribute('aria-pressed',String(enabled));
 };
 const toggle=()=>{
  enabled=!enabled;
  try{localStorage.setItem('brickBattlegroundsMuted',enabled?'0':'1')}catch{}
  if(!enabled)stopAllWind();
  if(master&&context)master.gain.setTargetAtTime(enabled?.34:0,context.currentTime,.025);
  if(enabled)getAudio();
  update();
 };
 button.addEventListener('click',toggle);
 window.addEventListener('pointerdown',()=>{getAudio()},{passive:true});
 window.addEventListener('keydown',e=>{
  const el=document.activeElement,typing=el&&(/INPUT|TEXTAREA|SELECT/.test(el.tagName)||el.isContentEditable);
  if(e.code==='KeyM'&&!e.repeat&&!typing&&!e.ctrlKey&&!e.metaKey){toggle();return}
  getAudio();
 },{passive:true});
 update();
}
