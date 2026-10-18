import {settings} from './controls.ts';
let ctx:AudioContext|null=null,master:GainNode|null=null;
function init(){
 if(ctx)return ctx;
 const C=window.AudioContext||(window as any).webkitAudioContext;
 if(!C)return null;
 ctx=new C();master=ctx.createGain();master.gain.value=settings.volume;master.connect(ctx.destination);return ctx;
}
export function unlockAudio(){const c=init();if(c?.state==='suspended')c.resume().catch(()=>{})}
export function setAudioVolume(){if(master)master.gain.value=settings.volume}
export function sfx(kind:'fire'|'reload'|'hit'|'hurt'|'impact'|'step'|'ui'|'elimination'|'bb'|'slide',variant=0){
 const c=init();if(!c||!master)return;const at=c.currentTime;
 if(kind==='slide'){
  // Filtered gritty wind rush, not a cartoon musical beep.
  const length=.34,noise=c.createBuffer(1,Math.floor(c.sampleRate*length),c.sampleRate);
  const samples=noise.getChannelData(0);
  for(let i=0;i<samples.length;i++){
   const t=i/samples.length;
   samples[i]=(Math.random()*2-1)*Math.pow(Math.sin(Math.PI*t),.85);
  }
  const src=c.createBufferSource(),filter=c.createBiquadFilter(),gain=c.createGain();
  src.buffer=noise;filter.type='bandpass';filter.frequency.value=850;filter.Q.value=.44;
  gain.gain.value=.16;
  src.connect(filter).connect(gain).connect(master);
  src.start(at);src.onended=()=>{src.disconnect();filter.disconnect();gain.disconnect()};
  return;
 }
 const rate=kind==='fire'?215:kind==='reload'?650:kind==='hit'?890:kind==='hurt'?150:kind==='impact'?470:kind==='step'?130:kind==='ui'?1100:kind==='elimination'?1320:780;
 const length=kind==='fire'?.075:kind==='elimination'?.22:kind==='hit'?.09:kind==='reload'?.07:.05;
 const o=c.createOscillator(),g=c.createGain();o.type=kind==='fire'?'square':kind==='hurt'?'triangle':'sine';
 o.frequency.setValueAtTime(rate+variant*15,at);
 o.frequency.exponentialRampToValueAtTime(Math.max(45,rate*(kind==='fire'?.43:.75)),at+length);
 g.gain.setValueAtTime(.001,at);g.gain.exponentialRampToValueAtTime(kind==='fire'?.065:.040,at+.003);
 g.gain.exponentialRampToValueAtTime(.0001,at+length);
 o.connect(g).connect(master);o.start(at);o.stop(at+length+.008);o.onended=()=>{o.disconnect();g.disconnect()}
}
