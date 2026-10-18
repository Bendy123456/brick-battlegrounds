// BRICK BATTLEGROUNDS v0.8.30 — physically inspired plastic and wind foley.
// Offline-generated one-shots (not pitched synth beeps) + continuous filtered air.
// All audio runs locally through Web Audio; no licensed samples/downloads.
let context=null,master=null,compressor=null,windNoise=null,enabled=true;
const sounds=new Map(),windVoices=new Map();
const clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
try{enabled=localStorage.getItem('brickBattlegroundsMuted')!=='1'}catch{}
function random(seed){
 return ()=>{
  seed|=0;seed=(seed+0x6D2B79F5)|0;
  let t=Math.imul(seed^(seed>>>15),1|seed);
  t^=t+Math.imul(t^(t>>>7),61|t);
  return ((t^(t>>>14))>>>0)/4294967296;
 };
}
function getAudio(){
 if(!enabled)return null;
 if(!context){
  const Audio=window.AudioContext||window.webkitAudioContext;
  if(!Audio)return null;
  try{
   context=new Audio();
   master=context.createGain();master.gain.value=.62;
   if(context.createDynamicsCompressor){
    compressor=context.createDynamicsCompressor();
    compressor.threshold.value=-17;
    compressor.knee.value=12;compressor.ratio.value=3.5;
    compressor.attack.value=.003;compressor.release.value=.13;
    master.connect(compressor);compressor.connect(context.destination);
   }else master.connect(context.destination);
  }catch(error){console.warn('Combat audio unavailable',error);context=null;return null}
 }
 if(context.state==='suspended')context.resume().catch(()=>{});
 return context;
}
// Several short collisions sound like separate plastic pieces rather than a bass thud.
// Inharmonic, rapidly damped body resonances and a noisy hard-edge transient approximate
// an ABS-style hollow shell, with tiny variation in size and contact timing.
const plasticProfiles={
 lightHit:{length:.098,peak:.73,events:[[0,1,1],[.024,.28,1.16]]},
 heavyHit:{length:.178,peak:.81,events:[[0,1.12,.77],[.022,.76,.93],[.065,.29,1.28]]},
 block:{length:.098,peak:.67,events:[[0,.9,1.42],[.019,.25,1.57]]},
 guardBreak:{length:.300,peak:.76,events:[[0,1.05,1.25],[.039,.79,.92],[.093,.56,1.51],[.164,.30,.72]]},
 knockdown:{length:.370,peak:.78,events:[[0,.96,.78],[.042,.85,1.36],[.109,.66,.91],[.185,.47,1.45],[.256,.26,1.07]]},
 spinHit:{length:.072,peak:.52,events:[[0,.67,1.55],[.018,.17,1.71]]}
};
function plasticBuffer(c,kind,variant){
 const profile=plasticProfiles[kind],sr=c.sampleRate;
 const buffer=c.createBuffer(1,Math.ceil(profile.length*sr),sr);
 const data=buffer.getChannelData(0);
 const rng=random(9013+variant*9173+kind.length*3389);
 for(const [when,power,pitch] of profile.events){
  const begin=Math.floor(when*sr),length=Math.min(data.length-begin,Math.ceil(.095*sr));
  const scale=pitch*(.965+rng()*.07);
  const freqs=[565,1025,1670,2520,3420].map(f=>f*scale);
  const phases=freqs.map(()=>rng()*.52-.26);
  const weights=[.26,.28,.18,.105,.055];
  const decays=[.047,.031,.021,.013,.0095];
  let low=0,slow=0;
  for(let i=0;i<length;i++){
   const t=i/sr,x=rng()*2-1;
   low+=(x-low)*.26;slow+=(x-slow)*.045;
   const sharp=(x-low)*Math.exp(-t/.0025)*.54;
   const contact=(low-slow)*Math.exp(-t/.011)*.29;
   let body=0;
   for(let k=0;k<freqs.length;k++){
    // Brief resonant tap; no cartoon pitch glide.
    body+=Math.sin(2*Math.PI*freqs[k]*t+phases[k])*weights[k]*Math.exp(-t/decays[k]);
   }
   const flutter=1+.055*Math.sin(t*410+rng()*1.2);
   data[begin+i]+=(sharp+contact+body)*power*flutter;
  }
 }
 let peak=.0001;
 for(let i=0;i<data.length;i++)peak=Math.max(peak,Math.abs(data[i]));
 const normal=profile.peak/peak;
 for(let i=0;i<data.length;i++){
  // Hard cutoff prevention at the very end; contacts themselves stay snappy.
  const fade=Math.min(1,(data.length-i)/(sr*.008));
  data[i]=Math.tanh(data[i]*normal*.96)*fade;
 }
 return buffer;
}
const airProfiles={
 lightSwing:{length:.085,peak:.34,band:.17,soft:.046},
 heavySwing:{length:.19,peak:.49,band:.11,soft:.085},
 dash:{length:.20,peak:.47,band:.14,soft:.092},
 jump:{length:.12,peak:.29,band:.20,soft:.058}
};
function airBuffer(c,kind,variant){
 const p=airProfiles[kind],sr=c.sampleRate;
 const buffer=c.createBuffer(1,Math.ceil(p.length*sr),sr);
 const data=buffer.getChannelData(0),rng=random(39277+variant*1531+kind.length*143);
 let fast=0,slow=0;
 for(let i=0;i<data.length;i++){
  const t=i/sr,progress=t/p.length;
  const white=rng()*2-1;
  fast+=(white-fast)*p.band;
  slow+=(white-slow)*p.soft;
  const shape=Math.pow(Math.sin(Math.PI*progress),1.25);
  data[i]=(fast-slow)*shape;
 }
 let peak=.0001;for(const sample of data)peak=Math.max(peak,Math.abs(sample));
 for(let i=0;i<data.length;i++)data[i]*=p.peak/peak;
 return buffer;
}
function soundBuffer(c,kind){
 if(!sounds.has(kind)){
  const renderer=plasticProfiles[kind]?plasticBuffer:airBuffer;
  if(!plasticProfiles[kind]&&!airProfiles[kind])return null;
  sounds.set(kind,Array.from({length:5},(_,v)=>renderer(c,kind,v)));
 }
 const variants=sounds.get(kind);
 return variants[Math.floor(Math.random()*variants.length)];
}
function playOneShot(kind){
 const c=getAudio();if(!c)return;
 const buffer=soundBuffer(c,kind);if(!buffer)return;
 const src=c.createBufferSource(),volume=c.createGain();
 src.buffer=buffer;
 src.playbackRate.value=.945+Math.random()*.11;
 volume.gain.value=kind==='spinHit'?.38:kind==='lightSwing'?.40:kind==='heavySwing'?.52:kind==='jump'?.42:kind==='dash'?.60:kind==='knockdown'?.82:.72;
 src.connect(volume);volume.connect(master);
 src.start(c.currentTime+.002);
 src.onended=()=>{src.disconnect();volume.disconnect()};
}
function createWindNoise(c){
 // Four seconds of gently colored broadband air; continuously looped through
 // independently swept filters. No notes or unnatural sawtooth oscillator timbre.
 if(windNoise)return windNoise;
 const sr=c.sampleRate,length=Math.ceil(sr*4);
 windNoise=c.createBuffer(1,length,sr);
 const dst=windNoise.getChannelData(0);
 const rng=random(7931267);
 let soft=0;
 for(let i=0;i<length;i++){
  const x=rng()*2-1;
  soft+=(x-soft)*.14;
  dst[i]=.68*x+.32*soft;
 }
 return windNoise;
}
export function startSpinjitzuWind(owner){
 if(!owner||windVoices.has(owner))return;
 const c=getAudio();if(!c)return;
 const at=c.currentTime+.006;
 const outer=c.createGain();
 outer.gain.setValueAtTime(.0001,at);
 outer.gain.linearRampToValueAtTime(.48,at+.16);
 outer.connect(master);
 const sources=[],oscillators=[],nodes=[outer],noise=createWindNoise(c);
 function band(opts){
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),volume=c.createGain();
  src.buffer=noise;src.loop=true;
  filter.type=opts.type;filter.frequency.value=opts.freq;filter.Q.value=opts.q||.65;
  volume.gain.value=opts.vol;
  src.connect(filter);filter.connect(volume);volume.connect(outer);
  src.start(at,opts.offset);
  src.stop(at+3.4);sources.push(src);
  nodes.push(src,filter,volume);
  return {filter,volume};
 }
 // Wide, low body; airy upper wind; a little thin stream of cutting air.
 const body=band({type:'lowpass',freq:850,q:.4,vol:.64,offset:0});
 const gust=band({type:'bandpass',freq:1600,q:.38,vol:.66,offset:.83});
 const whistle=band({type:'bandpass',freq:3900,q:.58,vol:.17,offset:1.51});
 function modulation(freq,target,depth){
  const lfo=c.createOscillator(),amount=c.createGain();
  lfo.type='sine';lfo.frequency.value=freq;amount.gain.value=depth;
  lfo.connect(amount);amount.connect(target);
  lfo.start(at);lfo.stop(at+3.4);
  oscillators.push(lfo);nodes.push(lfo,amount);
 }
 // Mixed rates create irregular gust pulses; none generate audible notes.
 modulation(4.2,gust.filter.frequency,660);
 modulation(3.1,whistle.filter.frequency,1050);
 modulation(1.1,body.filter.frequency,330);
 modulation(2.9,outer.gain,.055);
 modulation(.66,outer.gain,.095);
 // A discreet rotating stereo field gives the sense of air circling the fighter.
 // Connect it to the envelope only when StereoPanner is supported.
 let last=outer;
 if(c.createStereoPanner){
  const panner=c.createStereoPanner();
  outer.disconnect();outer.connect(panner);panner.connect(master);
  nodes.push(panner);last=panner;
  modulation(1.25,panner.pan,.51);
 }
 const voice={outer,sources,oscillators,nodes,startedAt:at};
 windVoices.set(owner,voice);
 sources[0].onended=()=>{
  if(windVoices.get(owner)===voice)windVoices.delete(owner);
  for(const node of nodes)try{node.disconnect()}catch{}
 };
}
export function stopSpinjitzuWind(owner){
 const voice=windVoices.get(owner);
 if(!voice||!context)return;
 windVoices.delete(owner);
 const at=context.currentTime,end=at+.17;
 const p=voice.outer.gain;
 if(typeof p.cancelAndHoldAtTime==='function')p.cancelAndHoldAtTime(at);
 else{
  p.cancelScheduledValues(at);
  // Interrupted wind should smoothly fade, even during the initial ramp.
  const level=clamp((at-voice.startedAt)/.16,0,1)*.48;
  p.setValueAtTime(Math.max(.0001,level),at);
 }
 p.exponentialRampToValueAtTime(.0001,end);
 for(const node of [...voice.sources,...voice.oscillators]){
  try{node.stop(end+.035)}catch{}
 }
}
function stopAllWind(){
 for(const owner of [...windVoices.keys()])stopSpinjitzuWind(owner);
}
export function playCombatSound(kind,owner=null){
 if(kind==='spinStart'){startSpinjitzuWind(owner);return}
 if(kind==='spinEnd'){stopSpinjitzuWind(owner);return}
 playOneShot(kind);
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
  if(master&&context)master.gain.setTargetAtTime(enabled?.62:0,context.currentTime,.02);
  if(enabled)getAudio();
  update();
 };
 button.addEventListener('click',toggle);
 window.addEventListener('pointerdown',()=>getAudio(),{passive:true});
 window.addEventListener('keydown',e=>{
  const active=document.activeElement;
  const typing=active&&(/INPUT|TEXTAREA|SELECT/.test(active.tagName)||active.isContentEditable);
  if(e.code==='KeyM'&&!e.repeat&&!typing&&!e.ctrlKey&&!e.metaKey){toggle();return}
  getAudio();
 },{passive:true});
 update();
}
