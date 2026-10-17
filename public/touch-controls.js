// Brick Battlegrounds mobile-only touch controller, v0.6.7.
// No effect on desktop, laptop or gamepad input.
const isPhone=()=>Boolean(navigator.userAgentData?.mobile)||/iPhone|iPod|Android.*Mobile|Windows Phone|webOS|BlackBerry|Opera Mini/i.test(navigator.userAgent||'');
export function setupTouchControls(){
 const empty=()=>({mx:0,my:0,light:false,heavy:false,block:false,dodge:false,jump:false,special:false,target:false,lookX:0,lookY:0});
 if(!isPhone()) return {enabled:false,sample:empty,reset(){}};
 document.body.classList.add('phone-game');
 const css=document.createElement('style'); css.id='mobileTouchStyles';
 css.textContent=`
 #touchControls{display:none;position:fixed;inset:0;z-index:14;pointer-events:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;touch-action:none;font-family:Inter,Arial,sans-serif;}
 body.phone-game.in-match #touchControls{display:block}
 #touchLook{position:absolute;top:8%;right:0;width:57%;height:92%;pointer-events:auto;touch-action:none;background:transparent}
 #touchStick{position:absolute;bottom:calc(15px + env(safe-area-inset-bottom,0px));left:calc(16px + env(safe-area-inset-left,0px));width:clamp(112px,27vw,148px);height:clamp(112px,27vw,148px);border:2px solid #f1c47788;border-radius:50%;background:radial-gradient(circle,#182e3b7d,#061b26c7);box-shadow:0 5px 20px #0009;pointer-events:auto;touch-action:none}
 #touchKnob{position:absolute;left:50%;top:50%;width:48%;height:48%;border-radius:50%;border:2px solid #ffd28aa8;background:#dca34bbd;transform:translate(-50%,-50%);pointer-events:none;box-shadow:0 2px 12px #0008}
 #touchActions{position:absolute;bottom:calc(12px + env(safe-area-inset-bottom,0px));right:calc(12px + env(safe-area-inset-right,0px));display:grid;grid-template-columns:repeat(3,clamp(51px,8vw,73px));grid-template-rows:repeat(3,clamp(46px,8vh,65px));gap:6px;pointer-events:none}
 .touchButton{appearance:none;-webkit-appearance:none;border-radius:16px;border:2px solid #f3c777aa;color:#fff9e9;background:#112736dc;box-shadow:0 4px 12px #0008;touch-action:none;pointer-events:auto;font:800 clamp(9px,1.65vw,12px) Inter,Arial,sans-serif;letter-spacing:.03em;text-align:center;padding:3px;min-height:44px}
 .touchButton[data-action=light]{background:#e5b65de8;color:#13202b;border-color:#fbe09d}
 .touchButton[data-action=heavy]{background:#c66c44ea;border-color:#f2ac78}
 .touchButton[data-action=block]{background:#287183e6}
 .touchButton[data-action=special]{background:#6648a9e8}
 .touchButton[data-action=target]{grid-column:2;grid-row:3;background:#364150e3}
 .touchButton.pressed{transform:scale(.92);filter:brightness(1.25);border-color:white}
 body.phone-game.in-match #top{display:none}
 body.phone-game.in-match #fullscreenToggle{display:none}
 body.phone-game.in-match #gameHelp{display:none!important}
 body.phone-game.in-match #quit{top:calc(5px + env(safe-area-inset-top,0px));right:calc(6px + env(safe-area-inset-right,0px));bottom:auto;padding:5px 7px;font-size:10px;z-index:25}
 body.phone-game.in-match #hud{top:calc(4px + env(safe-area-inset-top,0px));left:9px;right:9px;gap:5px;z-index:8}
 body.phone-game.in-match .hud-side{width:37%}
 body.phone-game.in-match .player-name{font-size:clamp(14px,3.2vw,21px);letter-spacing:1px}
 body.phone-game.in-match .hp-track{height:9px;margin-top:3px;border-width:1px}
 body.phone-game.in-match .hud-side small{font-size:clamp(7px,1.3vw,9px);margin:3px 0;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
 body.phone-game.in-match .hud-center{font-size:8px;min-width:83px}
 body.phone-game.in-match #timer{font-size:clamp(27px,7vw,40px);letter-spacing:0}
 body.phone-game.in-match #toast{font-size:clamp(25px,6vw,42px);top:21%;white-space:nowrap}
 body.phone-game.in-match #fpsCounter{bottom:auto!important;top:calc(67px + env(safe-area-inset-top,0px));left:8px!important;font-size:9px!important}
 #touchRotate{display:none;position:absolute;top:72px;left:50%;transform:translateX(-50%);white-space:nowrap;font-size:10px;color:#f6db9c;background:#15242ccc;padding:5px 8px;border-radius:5px;pointer-events:none}
 @media(orientation:portrait){body.phone-game.in-match #touchRotate{display:block}#touchActions{grid-template-columns:repeat(3,clamp(44px,14vw,60px));grid-template-rows:repeat(3,clamp(44px,14vw,60px));gap:4px}#touchStick{width:clamp(104px,27vw,140px);height:clamp(104px,27vw,140px)}body.phone-game.in-match #hud{top:8px}}
 @media(max-height:400px) and (orientation:landscape){#touchStick{width:clamp(94px,25vh,116px);height:clamp(94px,25vh,116px)}#touchActions{grid-template-columns:repeat(3,clamp(49px,13vh,62px));grid-template-rows:repeat(3,clamp(43px,12vh,54px));gap:5px}}
 `;
 document.head.appendChild(css);
 const root=document.createElement('div');root.id='touchControls';root.setAttribute('aria-label','Mobile game controls');
 root.innerHTML=`<div id="touchLook" aria-label="Drag to look around"></div><div id="touchStick" role="group" aria-label="Move joystick"><div id="touchKnob"></div></div><div id="touchActions" role="group" aria-label="Combat buttons"><button class="touchButton" data-action="light" aria-label="Light attack">LIGHT</button><button class="touchButton" data-action="heavy" aria-label="Heavy attack">HEAVY</button><button class="touchButton" data-action="block" aria-label="Hold block">BLOCK</button><button class="touchButton" data-action="dodge" aria-label="Directional dash">DASH</button><button class="touchButton" data-action="jump" aria-label="Jump">JUMP</button><button class="touchButton" data-action="special" aria-label="Special attack">SPECIAL</button><button class="touchButton" data-action="target" aria-label="Toggle lock on">LOCK</button></div><div id="touchRotate">Rotate to landscape for more room</div>`;
 document.body.appendChild(root);
 let mx=0,my=0,stickPointer=null,lookPointer=null,lookX=0,lookY=0,lastX=0,lastY=0;
 const held=new Set(),pending=new Set(),buttons=new Map();
 const joystick=root.querySelector('#touchStick'),knob=root.querySelector('#touchKnob'),look=root.querySelector('#touchLook');
 function updateStick(e){const r=joystick.getBoundingClientRect(),limit=r.width*.32;const dx=e.clientX-(r.left+r.width/2),dy=e.clientY-(r.top+r.height/2);const dist=Math.hypot(dx,dy),factor=dist>limit?limit/dist:1;mx=dx*factor/limit;my=dy*factor/limit;knob.style.transform=`translate(calc(-50% + ${dx*factor}px),calc(-50% + ${dy*factor}px))`;}
 function releaseStick(){stickPointer=null;mx=0;my=0;knob.style.transform='translate(-50%,-50%)'}
 joystick.addEventListener('pointerdown',e=>{if(stickPointer!==null)return;e.preventDefault();stickPointer=e.pointerId;joystick.setPointerCapture(e.pointerId);updateStick(e)});
 joystick.addEventListener('pointermove',e=>{if(e.pointerId===stickPointer){e.preventDefault();updateStick(e)}});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])joystick.addEventListener(ev,e=>{if(stickPointer===e.pointerId)releaseStick()});
 look.addEventListener('pointerdown',e=>{if(lookPointer!==null)return;e.preventDefault();lookPointer=e.pointerId;lastX=e.clientX;lastY=e.clientY;look.setPointerCapture(e.pointerId)});
 look.addEventListener('pointermove',e=>{if(e.pointerId!==lookPointer)return;e.preventDefault();lookX+=e.clientX-lastX;lookY+=e.clientY-lastY;lastX=e.clientX;lastY=e.clientY});
 for(const ev of ['pointerup','pointercancel','lostpointercapture'])look.addEventListener(ev,e=>{if(e.pointerId===lookPointer)lookPointer=null});
 for(const button of root.querySelectorAll('.touchButton')){
  const name=button.dataset.action;let pointer=null;buttons.set(name,button);
  button.addEventListener('pointerdown',e=>{if(pointer!==null)return;e.preventDefault();e.stopPropagation();pointer=e.pointerId;button.setPointerCapture(e.pointerId);button.classList.add('pressed');if(name==='block')held.add(name);else pending.add(name)});
  const release=e=>{if(pointer!==e.pointerId)return;pointer=null;button.classList.remove('pressed');held.delete(name)};
  for(const ev of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(ev,release);
 }
 function reset(){releaseStick();lookPointer=null;lookX=0;lookY=0;held.clear();pending.clear();for(const b of buttons.values())b.classList.remove('pressed')}
 window.addEventListener('blur',reset);document.addEventListener('visibilitychange',()=>{if(document.hidden)reset()});
 return {enabled:true,reset,sample(){const data={mx,my,light:pending.has('light'),heavy:pending.has('heavy'),block:held.has('block'),dodge:pending.has('dodge'),jump:pending.has('jump'),special:pending.has('special'),target:pending.has('target'),lookX,lookY};pending.clear();lookX=0;lookY=0;return data}};
}