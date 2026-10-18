import './style.css';
document.querySelector<HTMLDivElement>('#app')!.innerHTML=`<div id="viewport"></div><div id="flash"></div>
<section class="overlay" id="menu">
  <div class="arena-menu">
    <div class="menu-scenery" aria-hidden="true"><div class="scenery-beam"></div><div class="scenery-b3">B3</div><div class="scenery-stacks"></div><div class="scenery-light"></div></div>
    <div class="menu-content">
      <header class="bb-brand">
        <div class="bb-brand-kicker">COVER CIRCUIT C <span>✦</span> THE ARENA V2</div>
        <div class="bb-title"><span>BRICK</span><strong>BATTLEGROUNDS</strong></div>
        <div class="bb-ribbon">AIRSOFT ARENA</div>
      </header>
      <div class="bb-modes" aria-label="Choose your game mode">
        <button class="bb-mode bb-bot" id="vsBot" type="button"><span class="bb-art" aria-hidden="true"><img class="bb-card-art" src="/menu-bot.svg" alt="" draggable="false"></span><span class="bb-mode-info"><span class="bb-mode-name">VS BOT</span><small>SOLO TRAINING<br>FIRST TO FIVE</small><b class="bb-arrow">➜</b></span></button>
        <button class="bb-mode bb-quick" id="quick" type="button"><span class="bb-art" aria-hidden="true"><img class="bb-card-art" src="/menu-quick.svg" alt="" draggable="false"></span><span class="bb-mode-info"><span class="bb-mode-name">QUICK MATCH</span><small>FIND AN ONLINE<br>OPPONENT</small><b class="bb-arrow">➜</b></span></button>
        <button class="bb-mode bb-private" id="private" type="button"><span class="bb-art" aria-hidden="true"><img class="bb-card-art" src="/menu-private.svg" alt="" draggable="false"></span><span class="bb-mode-info"><span class="bb-mode-name">PRIVATE ROOM</span><small>INVITE A FRIEND<br>USING A CODE</small><b class="bb-arrow">➜</b></span></button>
      </div>
      <div class="bb-toolbar">
        <div class="bb-tool"><label for="difficulty">BOT DIFFICULTY</label><select id="difficulty"><option>Easy</option><option selected>Normal</option><option>Hard</option><option>Nightmare</option></select></div>
        <div class="bb-tool bb-join-tool"><label for="roomCode">JOIN WITH CODE</label><div class="bb-join-row"><input id="roomCode" maxlength="6" type="text" autocomplete="off" placeholder="6-CHAR CODE" aria-label="Private room code"><button class="primary" id="join" type="button">JOIN</button></div></div>
        <button class="bb-tool-button" id="openSettings" type="button"><span aria-hidden="true">⚙</span> SETTINGS</button>
        <button class="bb-tool-button" id="openLoadout" type="button"><span aria-hidden="true">◈</span> LOADOUT</button>
      </div>
      <p id="menuMessage" class="bb-menu-status" role="status">CHOOSE YOUR MODE TO ENTER THE ARENA</p>
    </div>
  </div>
</section>
<section class="overlay hidden" id="waiting"><div class="shell"><div class="tag">ONLINE LOBBY</div><h2 id="waitTitle">SEARCHING...</h2><p id="waitDescription">Waiting for opponent.</p><div class="row"><button id="copyRoom" class="primary">COPY CODE</button><button id="cancelWait">CANCEL</button></div></div></section>
<div id="hud" class="hidden"><div class="hudtop"><div class="hudbox"><small>ZONE</small><strong id="zone">CENTER COURT</strong><small id="net">PING --</small><small id="arenaBuild">ARENA V2 // LOADING MAP...</small></div><div id="score">0 <span>:</span> 0</div><div class="hudbox"><small>TIME REMAINING</small><strong id="clock">03:00</strong><small>FIRST TO FIVE</small></div></div>
<div id="crosshair">+</div><div id="hitmarker">×</div><div id="killfeed"></div><div id="message"></div>
<div class="hudbottom"><div class="hudbox"><small>HEALTH</small><div id="health">100</div><small id="stance">STANDING</small></div><div><div id="weapon">VX-4 VECTOR</div><div id="ammo">30 <small>/ 30</small></div><small id="weaponType">AEG / ASSAULT</small></div></div><div id="debug"></div></div>
<div id="gamepadPrompt" class="hidden">CONTROLLER DETECTED · PRESS ANY BUTTON</div>
<section id="pause" class="overlay hidden"><div class="shell"><div class="tag">SESSION CONTROL</div><h2>PAUSED</h2><p>Online sessions continue for your opponent during a local pause.</p><div class="row"><button id="resume" class="primary">RESUME</button><button id="pauseLoadout">LOADOUT</button><button id="pauseSettings">SETTINGS</button><button id="leaveMatch">LEAVE MATCH</button></div></div></section>
<section id="results" class="overlay hidden"><div class="shell"><div class="tag">AFTER ACTION REPORT</div><h2 id="resultTitle">MATCH COMPLETE</h2><p id="resultBody">Well played.</p><div class="row"><button id="rematch" class="primary">REMATCH</button><button id="resultMenu">MAIN MENU</button></div></div></section>
<section id="settings" class="overlay hidden"><div class="shell"><div class="tag">PERSONALIZATION</div><h2>SETTINGS</h2>
<div id="sliders"></div><div class="tag">REBINDS · CLICK A KEY AND PRESS A NEW KEY</div><div id="bindings" class="bindings"></div>
<div class="row" style="margin-top:18px"><button id="settingsBack" class="primary">SAVE & BACK</button><button id="resetBinds">RESET BINDS</button></div></div></section>
<section id="loadout" class="overlay hidden"><div class="shell"><div class="tag">AIRSOFT ARMORY</div><h2>LOADOUT</h2><div id="loadoutButtons"></div><div class="tag" style="margin-top:18px">EQUIPPED WEAPON GRIP</div><div id="gripChoices" class="row" style="margin:12px 0 20px"></div><p>All options are fictional airsoft replicas firing plastic BBs. Press <strong>H</strong> during a match to switch between one-hand and two-hand grips for the equipped gun.</p><button id="loadoutBack" class="primary">CONFIRM</button></div></section>
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
