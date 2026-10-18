// Original, procedural browser combat audio. No samples or external assets.
let context=null,master=null,noiseBuffer=null,enabled=true;
try{enabled=localStorage.getItem('brickBattlegroundsMuted')!=='1'}catch{}
function getAudio(){
 if(!enabled)return null;
 if(!context){
  const Ctor=window.AudioContext||window.webkitAudioContext;
  if(!Ctor)return null;
  try{
   context=new Ctor();
   master=context.createGain();master.gain.value=.34;master.connect(context.destination);
   noiseBuffer=context.createBuffer(1,Math.floor(context.sampleRate*.85),context.sampleRate);
   const data=noiseBuffer.getChannelData(0);
   for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;
  }catch(error){console.warn('Combat audio unavailable',error);context=null;return null}
 }
 if(context.state==='suspended')context.resume().catch(()=>{});
 return context.state==='running'?context:null;
}
function tone(c,at,duration,from,to,volume,type='sine'){
 const osc=c.createOscillator(),gain=c.createGain();
 osc.type=type;
 osc.frequency.setValueAtTime(Math.max(20,from),at);
 osc.frequency.exponentialRampToValueAtTime(Math.max(20,to),at+duration);
 gain.gain.setValueAtTime(.0001,at);
 gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.008);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 osc.connect(gain);gain.connect(master);
 osc.start(at);osc.stop(at+duration+.02);
 osc.onended=()=>{osc.disconnect();gain.disconnect()};
}
function air(c,at,duration,volume,frequency=900){
 const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
 src.buffer=noiseBuffer;filter.type='bandpass';
 filter.frequency.setValueAtTime(frequency,at);
 filter.frequency.exponentialRampToValueAtTime(Math.max(80,frequency*.45),at+duration);
 filter.Q.value=.65;
 gain.gain.setValueAtTime(.0001,at);
 gain.gain.exponentialRampToValueAtTime(Math.max(.001,volume),at+.014);
 gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
 src.connect(filter);filter.connect(gain);gain.connect(master);
 src.start(at);src.stop(at+duration+.01);
 src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
}
export function playCombatSound(kind){
 const c=getAudio();if(!c)return;
 const at=c.currentTime+.002,variation=.94+Math.random()*.12;
 switch(kind){
  case 'lightSwing':
   air(c,at,.12,.095,1550*variation);tone(c,at,.11,210*variation,88,.045,'triangle');break;
  case 'heavySwing':
   air(c,at,.21,.15,1000*variation);tone(c,at,.23,160,56,.10,'sawtooth');break;
  case 'lightHit':
   air(c,at,.085,.18,1700*variation);tone(c,at,.15,145,56,.18,'triangle');break;
  case 'heavyHit':
   air(c,at,.17,.25,940*variation);tone(c,at,.25,100,40,.27,'triangle');break;
  case 'block':
   air(c,at,.095,.11,2500);tone(c,at,.14,570,230,.11,'square');break;
  case 'guardBreak':
   air(c,at,.23,.21,2250);tone(c,at,.3,430,75,.19,'sawtooth');break;
  case 'dash':
   air(c,at,.19,.15,1300*variation);tone(c,at,.16,140,63,.065,'triangle');break;
  case 'jump':
   air(c,at,.10,.07,1250);tone(c,at,.14,190,260,.065,'sine');break;
  case 'spinStart':
   air(c,at,.64,.16,650);tone(c,at,.65,90,380,.15,'sawtooth');
   tone(c,at+.10,.44,210,630,.065,'sine');break;
  case 'spinHit':
   air(c,at,.10,.18,2100*variation);tone(c,at,.13,390,135,.15,'sawtooth');break;
  case 'knockdown':
   air(c,at,.28,.22,580);tone(c,at,.37,118,35,.19,'triangle');break;
  case 'spinEnd':
   air(c,at,.22,.12,1500);tone(c,at,.24,420,84,.105,'sine');break;
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
