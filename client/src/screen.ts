import './style.css';
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`<div id="viewport"></div><div id="flash"></div>
<section class="overlay" id="menu"><div class="shell"><div class="tag">AIRSOFT ARENA // FIRST PERSON // ORIGINAL</div><h1>ENTER THE<br><em>ARENA.</em></h1>
<p>Fast, tactical, plastic-BB airsoft. The classic LEGO-style minifigures return in a brand-new 3D indoor arena. First to five eliminations wins. Sprint with Shift, then tap C to slide.</p>
<div class="menu-grid"><div><button class="mode" id="vsBot">VS BOT<small>SOLO TRAINING · FIRST TO FIVE</small></button>
<button class="mode" id="quick">QUICK MATCH<small>FIND AN ONLINE OPPONENT</small></button>
<button class="mode" id="private">PRIVATE ROOM<small>INVITE A FRIEND USING A CODE</small></button></div>
<div class="side"><div class="field"><label>BOT DIFFICULTY</label><select id="difficulty"><option>Easy</option><option selected>Normal</option><option>Hard</option><option>Nightmare</option></select></div>
<div class="field"><label>JOIN PRIVATE ROOM</label><div class="row"><input id="roomCode" maxlength="6" type="text" placeholder="6-CHAR CODE" style="flex:1;min-width:120px"><button class="primary" id="join">JOIN</button></div></div>
<div class="row"><button id="openSettings">SETTINGS</button><button id="openLoadout">LOADOUT</button></div><p id="menuMessage">Desktop Chrome / Edge / Firefox.</p></div></div>
<p style="font-size:10px">ORIGINAL GAME IN DEVELOPMENT · NON-GRAPHIC BB HITS · ORIGINAL BRICK CHARACTER MODELS</p></div></section>
<section class="overlay hidden" id="waiting"><div class="shell"><div class="tag">ONLINE LOBBY</div><h2 id="waitTitle">SEARCHING...</h2><p id="waitDescription">Waiting for opponent.</p><div class="row"><button id="copyRoom" class="primary">COPY CODE</button><button id="cancelWait">CANCEL</button></div></div></section>
<div id="hud" class="hidden"><div class="hudtop"><div class="hudbox"><small>ZONE</small><strong id="zone">CENTER COURT</strong><small id="net">PING --</small></div><div id="score">0 <span>:</span> 0</div><div class="hudbox"><small>TIME REMAINING</small><strong id="clock">03:00</strong><small>FIRST TO FIVE</small></div></div>
<div id="crosshair">+</div><div id="hitmarker">×</div><div id="killfeed"></div><div id="message"></div>
<div class="hudbottom"><div class="hudbox"><small>HEALTH</small><div id="health">100</div><small id="stance">STANDING</small></div><div><div id="weapon">VX-4 VECTOR</div><div id="ammo">30 <small>/ 30</small></div><small id="weaponType">AEG / ASSAULT</small></div></div><div id="debug"></div></div>
<div id="gamepadPrompt" class="hidden">CONTROLLER DETECTED · PRESS ANY BUTTON</div>
<section id="pause" class="overlay hidden"><div class="shell"><div class="tag">SESSION CONTROL</div><h2>PAUSED</h2><p>Online sessions continue for your opponent during a local pause.</p><div class="row"><button id="resume" class="primary">RESUME</button><button id="pauseLoadout">LOADOUT</button><button id="pauseSettings">SETTINGS</button><button id="leaveMatch">LEAVE MATCH</button></div></div></section>
<section id="results" class="overlay hidden"><div class="shell"><div class="tag">AFTER ACTION REPORT</div><h2 id="resultTitle">MATCH COMPLETE</h2><p id="resultBody">Well played.</p><div class="row"><button id="rematch" class="primary">REMATCH</button><button id="resultMenu">MAIN MENU</button></div></div></section>
<section id="settings" class="overlay hidden"><div class="shell"><div class="tag">PERSONALIZATION</div><h2>SETTINGS</h2>
<div id="sliders"></div><div class="tag">REBINDS · CLICK A KEY AND PRESS A NEW KEY</div><div id="bindings" class="bindings"></div>
<div class="row" style="margin-top:18px"><button id="settingsBack" class="primary">SAVE & BACK</button><button id="resetBinds">RESET BINDS</button></div></div></section>
<section id="loadout" class="overlay hidden"><div class="shell"><div class="tag">AIRSOFT ARMORY</div><h2>LOADOUT</h2><div id="loadoutButtons"></div><p>All options are fictional airsoft replicas firing plastic BBs.</p><button id="loadoutBack" class="primary">CONFIRM</button></div></section>
<section id="mobile" class="overlay hidden"><div class="shell"><h2>DESKTOP ONLY</h2><p>Version one requires a desktop browser and a keyboard/mouse or game controller.</p></div></section>
`;
export const $=(id:string)=>document.getElementById(id)!;
export const overlays=['menu','waiting','pause','results','settings','loadout','mobile'];
export function show(page:string){
 for(const id of overlays)$(id).classList.toggle('hidden',id!==page);
 $('hud').classList.toggle('hidden',!['game','pause'].includes(page));
}
let timeout=0;
export function notify(text:string){
 $('message').textContent=text;
 window.clearTimeout(timeout);
 timeout=window.setTimeout(()=>{$('message').textContent=''},1400);
}
