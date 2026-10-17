// CHANGED: Consecutive landed-hit rules and visual knockdown. This is a
// procedural, ragdoll-style fall; Three.js has no rigid-body ragdoll solver here.
export const HIT_STUN_SECONDS=1.0;
export const KNOCKDOWN_SECONDS=1.65;
export const CHAIN_WINDOW_SECONDS=3.5;
export const WAKEUP_IFRAMES_SECONDS=.25;
const ease=t=>{t=Math.max(0,Math.min(1,t));return t*t*(3-2*t)};
export function clearHitChain(f){
 f.hitChain={lights:0,heavies:0,last:-Infinity};
}
export function recordHitForKnockdown(att,attack,blocked=false){
 if(!att.hitChain)clearHitChain(att);
 const c=att.hitChain;
 if(blocked){clearHitChain(att);return false;}
 // Only *landed* hits count; each heavy R attack counts once, not twice
 // even though its existing animation contains two damaging impacts.
 if(attack.kind!=='light'&&attack.kind!=='heavy'){clearHitChain(att);return false;}
 if((att.combatClock||0)-c.last>CHAIN_WINDOW_SECONDS){c.lights=0;c.heavies=0;}
 let knock=false;
 if(attack.kind==='light'){
  c.lights++;c.heavies=0;
  knock=c.lights>=4;
 }else if(!attack._countedComboHeavy){
  attack._countedComboHeavy=true;
  knock=c.lights>=2||c.heavies>=1;
  c.heavies++;c.lights=0;
 }
 c.last=att.combatClock||0;
 if(knock)clearHitChain(att);
 return knock;
}
export function startImpact(def,knockdown){
 // The attacker cannot continue an attack during hitstun.
 def.attack=null;
 def.queuedLight=false;
 def.combo=0;
 def.comboWindow=0;
 def.block=false;
 def.dodge=0;
 def.hitFlash=.19;
 def.stun=Math.max(def.stun||0,HIT_STUN_SECONDS);
 if(knockdown){
  def.ragdoll=KNOCKDOWN_SECONDS;
  def.ragdollTotal=KNOCKDOWN_SECONDS;
  def.stun=Math.max(def.stun,KNOCKDOWN_SECONDS);
  def.iframes=Math.max(def.iframes||0,KNOCKDOWN_SECONDS+WAKEUP_IFRAMES_SECONDS);
  def.ragdollSide=((def.face||0)%Math.PI>=0)?1:-1;
 }
}
export function tickImpact(f,dt){
 const old=f.ragdoll||0; // CHANGED: Track knockdown ending.
 f.ragdoll=Math.max(0,old-dt);
 if(old>0&&f.ragdoll===0){ // CHANGED: Clean up fall orientation upon recovery.
  f.visual.rotation.x=0;
  f.visual.rotation.z=0;
 }
}
export function poseKnockdown(f){
 const total=f.ragdollTotal||KNOCKDOWN_SECONDS;
 const t=1-Math.max(0,f.ragdoll)/total;
 const collapsed=ease(t/.20)*(1-ease((t-.77)/.23));
 const sway=Math.sin(t*17)*Math.exp(-t*5)*collapsed;
 const side=(f.ragdollSide||1);
 const {arms,legs,body,head}=f.visual.userData;
 // Visual-only pose: root, hitboxes, camera and physics are unchanged.
 f.visual.rotation.x=-1.37*collapsed;
 f.visual.rotation.z=side*.16*collapsed;
 f.visual.position.y=.12*collapsed;
 body.rotation.set(-.15*collapsed,side*.13*collapsed,side*.18*collapsed);
 head.rotation.set(-.16*collapsed,0,side*.11*collapsed);
 arms[0].rotation.set((.67+sway*.35)*collapsed,0,-(1.04+sway*.2)*collapsed);
 arms[1].rotation.set((1.05-sway*.25)*collapsed,0,(.8-sway*.2)*collapsed);
 arms[0].userData.elbow.rotation.set(-.95*collapsed,0,0);
 arms[1].userData.elbow.rotation.set(-.7*collapsed,0,0);
 legs[0].rotation.set((.3+sway*.2)*collapsed,0,-.12*collapsed);
 legs[1].rotation.set((-.35-sway*.3)*collapsed,0,.17*collapsed);
 legs[0].userData.knee.rotation.set(-.45*collapsed,0,0);
 legs[1].userData.knee.rotation.set(-.65*collapsed,0,0);
}
