// Original FartNite classic-style multiplayer lobby arrangement.
// All progress, currency, cosmetics, and match records are local only.
import {SKINS,STARTER_SKINS,SHOP_SKINS,SKIN_RARITIES} from './fartnite-skins.js';
import {createSkinThumbnailLoader} from './fartnite-skin-thumbnails.js';
import {mountPartyUI} from './fartnite-party-ui.js';
export const SCOUTS=SKINS.map(s=>({...s,color:s.accent}));
export const AURAS=[
 {id:'aqua',name:'Aqua Reactor',color:'#42ebff',cost:0},
 {id:'mint',name:'Mint Horizon',color:'#b0fa81',cost:120},
 {id:'sunset',name:'Sunset Core',color:'#ffb773',cost:200},
 {id:'violet',name:'Violet Pulse',color:'#bc9cff',cost:280}
];
const QUESTS=[
 {id:'drop',name:'FIELD EXERCISES',text:'Complete 2 solo drops',key:'games',goal:2,reward:100},
 {id:'fighter',name:'FRONTIER FIGHTER',text:'Eliminate 5 contenders',key:'elims',goal:5,reward:140},
 {id:'scout',name:'RESOURCEFUL',text:'Pick up 8 loot items',key:'loot',goal:8,reward:100},
 {id:'builder',name:'QUICK BUILDER',text:'Place 5 structures',key:'builds',goal:5,reward:110},
 {id:'gatherer',name:'FIELD HARVEST',text:'Land 12 harvest hits',key:'harvest',goal:12,reward:110},
 {id:'winner',name:'ISLAND LEGEND',text:'Win a solo game',key:'wins',goal:1,reward:300}
];
const PASS=[['FOUNDERS BADGE',40],['HARBOR SUPPLY',70],['SURVEYOR RIBBON',100],['FIELD SCOUT BANNER',130],['ISLAND CHAMPION CREST',200]];
const STORE='fartnite_lobby_season_zero_v1';
const defaults=()=>({skin:0,aura:'aqua',owned:['aqua'],ownedSkins:[...STARTER_SKINS],xp:0,credits:150,games:0,wins:0,elims:0,loot:0,builds:0,harvest:0,best:20,claimed:[],passClaimed:[],history:[],mode:'survival',settings:{shadows:true,motion:true,stats:true}});
const escapeText=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tier=data=>Math.floor(data.xp/350)+1;
const pct=(v,goal)=>Math.max(0,Math.min(100,Math.round(v/goal*100)));
function read(){
 try {
  const old=JSON.parse(localStorage.getItem(STORE)||'null');
  if(!old||typeof old!=='object')return defaults();
  const d=defaults(),o={...d,...old,settings:{...d.settings,...old.settings}};
  o.skin=Math.max(0,Math.min(SKINS.length-1,Number(o.skin)||0));
  o.ownedSkins=[...new Set([...STARTER_SKINS,...(Array.isArray(o.ownedSkins)?o.ownedSkins.filter(i=>Number.isInteger(i)&&i>=0&&i<SKINS.length):[])])];
  if(!o.ownedSkins.includes(o.skin))o.skin=0;
  o.owned=(Array.isArray(o.owned)?o.owned:[]).filter(id=>AURAS.some(a=>a.id===id));
  if(!o.owned.includes('aqua'))o.owned.unshift('aqua');
  if(!o.owned.includes(o.aura))o.aura='aqua';
  o.history=Array.isArray(o.history)?o.history.slice(0,10):[];
  o.claimed=Array.isArray(o.claimed)?o.claimed:[];
  o.passClaimed=Array.isArray(o.passClaimed)?o.passClaimed:[];
  return o;
 }catch{return defaults()}
}
function cardButton(text,action,disabled=false){
 return '<button type="button" class="fn-action" '+action+(disabled?' disabled':'')+'>'+text+'</button>';
}
export function mountLobby(home,{play,onSkin,onAura,onSettings,how,onPreview,onPartyChange}){
 const data=read(),persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}};
 let tabName='PLAY',notificationTimer=0;
 let partyClient=null;
 home.classList.add('fn-lobby');
 home.innerHTML=[
 '<div class="fn-back-lines" aria-hidden="true"></div>',
 '<header class="fn-header"><div class="fn-logo">FART<span>NITE</span><small>ISLAND SURVIVAL</small></div>',
 '<nav class="fn-nav" aria-label="Lobby navigation">',
 ...[['PLAY','LOBBY'],['PASS','FIELD PASS'],['CHALLENGES','CHALLENGES'],['LOCKER','LOCKER'],['SHOP','SUPPLY SHOP'],['PROFILE','PROFILE'],['LEADERBOARDS','RECORDS'],['SETTINGS','SETTINGS']].map(p=>'<button type="button" data-tab="'+p[0]+'" '+(p[0]==='PLAY'?'class="current" aria-current="page"':'')+'>'+p[1]+'</button>'),
 '</nav><div class="fn-wallet"><span>✦</span><b id="fnCredits"></b><small>CREDITS</small></div></header>',
 '<aside class="fn-progression" aria-label="Progression and objectives">',
 '<div class="fn-season-title">FIELD SEASON <strong>01</strong></div>',
 '<div class="fn-level-row"><div class="fn-level-badge"><span>◆</span><b>F</b></div><div><small>FIELD LEVEL</small><strong id="fnLevel">1</strong><div class="fn-level-progress"><i id="fnXP"></i></div><small id="fnXPText"></small></div></div>',
 '<div class="fn-medal">✦ ORIGINAL ISLAND EXPLORER ✦</div>',
 '<button type="button" class="fn-pass-cta" data-jump="PASS"><b>FIELD PASS</b><small>EARN REWARDS AS YOU PLAY</small><span>VIEW ›</span></button>',
 '<div class="fn-objectives-head">DAILY OBJECTIVES <span id="fnQuestDone">0 / 6</span></div>',
 '<div id="fnQuestRows"></div>',
 '<button type="button" class="fn-more-quests" data-jump="CHALLENGES">VIEW ALL OBJECTIVES &nbsp; ›</button></aside>',
 '<div class="fn-stage-heading">FARTNITE <b>FIELD SQUAD</b><small id="fnStageMode">SOLO • ONLY YOU</small></div>',
 '<div class="fn-character-tags" aria-hidden="true"><div class="fn-tag-left hidden" id="fnPartyLeft"><b id="fnPartyLeftName"></b><small>IN YOUR PARTY</small></div><div class="fn-tag-center"><span>◆</span><b id="fnSkinName">MEADOW RUNNER</b><small>READY TO DEPLOY</small></div><div class="fn-tag-right hidden" id="fnPartyRight"><b id="fnPartyRightName"></b><small>IN YOUR PARTY</small></div></div>',
 '<div class="fn-stage-tip">CUSTOMIZE YOUR SCOUT IN THE LOCKER</div>',
 '<aside class="fn-ready" aria-label="Game mode and ready">',
 '<div class="fn-ready-overline">SELECTED MISSION <b>SOLO / AI</b></div>',
 '<h2 id="fnModeTitle">ISLAND SURVIVAL</h2><p id="fnModeDescription">1 player + 19 AI rivals</p>',
 '<button type="button" id="fnChangeMode" class="fn-change-mode">▣ &nbsp; CHANGE MODE</button>',
 '<div class="fn-party-controls"><div class="fn-party-status"><b id="fnPartyStatus">ALONE IN LOBBY</b><span id="fnPartyCount">1 / 3</span></div>',
 '<div class="fn-party-name-row"><label for="fnPlayerName">NAME</label><input id="fnPlayerName" maxlength="22" autocomplete="off" aria-label="Your party display name"></div>',
 '<div class="fn-party-join-row"><input id="fnJoinCode" placeholder="6-CHAR PARTY CODE" maxlength="6" autocomplete="off" aria-label="Party invitation code"><button type="button" id="fnJoinParty">JOIN</button></div>',
 '<div class="fn-party-buttons"><button type="button" id="fnCreateParty">CREATE PARTY</button><button type="button" id="fnLeaveParty" class="hidden">LEAVE PARTY</button></div>',
 '<div id="fnPartyCodePanel" class="fn-party-code hidden"><span>INVITE CODE</span><b id="fnPartyCode"></b><button id="fnCopyParty" type="button">COPY</button></div>',
 '<div id="fnPartyList" class="fn-party-list" aria-live="polite"></div></div>',
 '<div class="fn-fill"><span>GAMEPLAY</span><b>SOLO VS AI</b></div>',
 '<button type="button" class="fn-ready-cta" id="play">▶ &nbsp; READY!</button>',
 '<small class="fn-ready-note" id="fnReadyNote">Solo battle matches only for now</small></aside>',
 '<footer class="fn-bottom"><div><span class="fn-dot"></span><b>FARTNITE // SEASON ZERO</b><span>LOCAL SOLO PREVIEW</span></div><span>ORIGINAL GAME • NO EXTERNAL ACCOUNTS</span><div><button type="button" data-jump="LOCKER">◈ LOCKER</button><button id="how" type="button">? HELP / CONTROLS</button></div></footer>',
 '<div id="fnNotice" class="fn-notice" role="status" aria-live="polite"></div>',
 '<section id="fnOverlay" class="fn-overlay hidden" aria-label="Lobby tabs"><div class="fn-content-panel">',
 '<div class="fn-panel-head"><div><small>SEASON ZERO / FIELD TERMINAL</small><h2 id="fnPanelHeading">LOCKER</h2></div><button type="button" id="fnClose">✕ RETURN TO LOBBY</button></div>',
 '<div id="fnTabContent" class="fn-tab-content"></div></div></section>'
 ].join('');
 const skinThumbs=createSkinThumbnailLoader(home);
 const $=selector=>home.querySelector(selector);
 const setText=(selector,txt)=>{const el=$(selector);if(el)el.textContent=String(txt)};
 const notify=txt=>{
  const el=$('#fnNotice');el.textContent=txt;el.classList.add('visible');
  clearTimeout(notificationTimer);notificationTimer=setTimeout(()=>el.classList.remove('visible'),2500)
 };
 const drawLeft=()=>{
  setText('#fnCredits',data.credits);
  setText('#fnLevel',tier(data));
  setText('#fnXPText',(data.xp%350)+' / 350 XP');
  $('#fnXP').style.width=pct(data.xp%350,350)+'%';
  setText('#fnQuestDone',QUESTS.filter(q=>data.claimed.includes(q.id)).length+' / 6');
  setText('#fnSkinName',SCOUTS[data.skin].name.toUpperCase());
  $('#fnQuestRows').innerHTML=QUESTS.slice(0,3).map(q=>'<div class="fn-small-quest"><div><strong>'+q.name+'</strong><small>'+q.text+'</small><i><em style="width:'+pct(data[q.key],q.goal)+'%"></em></i></div><b>'+Math.min(q.goal,data[q.key])+'/'+q.goal+'</b></div>').join('')
 };
 const drawMode=()=>{
  const training=data.mode==='training';setText('#fnModeTitle',training?'SCOUT TRAINING':'ISLAND SURVIVAL');
  setText('#fnModeDescription',training?'1 player + 9 AI rivals':'1 player + 19 AI rivals')
 };
 function selectSkin(index){
  if(index<0||index>=SKINS.length||!Number.isInteger(index))return;
  if(!data.ownedSkins.includes(index)){
   onPreview?.(index);notify(SKINS[index].name.toUpperCase()+' — UNLOCK IN SUPPLY SHOP');
   return
  }
  data.skin=index;persist();onSkin(index);partyClient.setSkin(index);drawLeft();notify(SKINS[index].name.toUpperCase()+' EQUIPPED');
  if(tabName==='LOCKER')renderTab()
 }
 function purchaseSkin(index){
  const skin=SKINS[index];
  if(!skin||skin.starter||data.ownedSkins.includes(index))return;
  if(data.credits<skin.price){notify('NOT ENOUGH CREDITS');return}
  data.credits-=skin.price;data.ownedSkins.push(index);
  persist();drawLeft();notify('UNLOCKED '+skin.name.toUpperCase());renderTab()
 }
 function rarityLabel(s){return s.rarity.toUpperCase()}
 function skinTile(s,i){
  const owned=data.ownedSkins.includes(i),selected=data.skin===i;
  return '<button type="button" class="fn-scout-tile fn-skin-detail '+(selected?'selected ':'')+(owned?'':'locked')+'" data-skin="'+i+'" style="--swatch:'+s.color+';--rarity:'+SKIN_RARITIES[s.rarity]+'"><div class="fn-skin-portrait" data-skin-thumb="'+i+'"><span class="fn-portrait-head"></span><span class="fn-portrait-body"></span><span class="fn-portrait-legs"></span></div><small>'+rarityLabel(s)+' • '+s.gender.toUpperCase()+'</small><strong>'+s.name.toUpperCase()+'</strong><em>'+(selected?'✓ EQUIPPED':owned?'EQUIP':'🔒 PREVIEW • '+s.price+' CR')+'</em></button>'
 }

 function selectAura(id){
  if(!data.owned.includes(id))return;
  data.aura=id;persist();onAura(AURAS.find(a=>a.id===id));notify('PLATFORM: '+AURAS.find(a=>a.id===id).name.toUpperCase());
  if(tabName==='LOCKER'||tabName==='SHOP')renderTab()
 }
 function renderTab(){
  if(tabName==='PLAY')return;
  setText('#fnPanelHeading',tabName==='LEADERBOARDS'?'PERSONAL RECORDS':tabName);
  const intro=text=>'<p class="fn-tab-intro">'+text+'</p>';
  let html='';
  if(tabName==='LOCKER'){
   html=intro('25 ORIGINAL 3D SKINS • Eight starters are yours. All 25 appear here. Click any locked skin to preview it on the stage; unlock it in Supply Shop.')+
    '<div class="fn-roster-count"><strong>'+data.ownedSkins.length+' / '+SKINS.length+' OWNED</strong><span>'+SKINS.filter(s=>s.gender==='female').length+' FEMALE • '+SKINS.filter(s=>s.gender==='male').length+' MALE • LOCAL SAVE</span></div>'+
    '<div class="fn-scouter-grid">'+SCOUTS.map(skinTile).join('')+'</div>'+
    '<h3 class="fn-subhead">PLATFORM AURA</h3><div class="fn-aura-grid">'+AURAS.filter(a=>data.owned.includes(a.id)).map(a=>'<button class="fn-aura-tile '+(data.aura===a.id?'selected':'')+'" style="--swatch:'+a.color+'" data-aura="'+a.id+'"><i></i><b>'+a.name+'</b><small>'+(data.aura===a.id?'ACTIVE':'EQUIP')+'</small></button>').join('')+'</div>'
  }else if(tabName==='PASS'){
   html=intro('Level up by playing. Claim unlocked rewards in your local Field Pass.')+'<div class="fn-pass-level">FIELD LEVEL <strong>'+tier(data)+'</strong><small>'+data.xp%350+' / 350 XP TO NEXT LEVEL</small></div><div class="fn-pass-list">'+PASS.map((q,i)=>{
    const n=i+1,claimed=data.passClaimed.includes(n),open=tier(data)>=n;
    return '<div class="fn-pass-row"><span class="fn-tier-number">'+n+'</span><div><b>'+q[0]+'</b><small>+'+q[1]+' credits</small></div>'+cardButton(claimed?'CLAIMED':open?'CLAIM':'LEVEL '+n,'data-pass="'+n+'"',claimed||!open)+'</div>'
   }).join('')+'</div>'
  }else if(tabName==='CHALLENGES'){
   html=intro('Earn credits for exploring, fighting and building. Claim each objective once.')+'<div class="fn-mission-list">'+QUESTS.map(q=>{
    const n=Math.min(q.goal,data[q.key]),claimed=data.claimed.includes(q.id);
    return '<div class="fn-mission"><div><b>'+q.name+'</b><small>'+q.text+'</small><i><em style="width:'+pct(n,q.goal)+'%"></em></i></div><strong>'+n+'/'+q.goal+'</strong>'+cardButton(claimed?'CLAIMED':n===q.goal?'CLAIM +'+q.reward:'+'+q.reward,'data-quest="'+q.id+'"',claimed||n!==q.goal)+'</div>'
   }).join('')+'</div>'
  }else if(tabName==='SHOP'){
   html=intro('17 ORIGINAL SHOP SKINS • Unlocked with credits from matches and challenges. Every skin stays visible in the Locker. No purchases with real money.')+
    '<h3 class="fn-subhead">ORIGINAL CHARACTER SKINS</h3><div class="fn-skin-shop-grid">'+SHOP_SKINS.map(s=>{
     const owned=data.ownedSkins.includes(s.id),equipped=data.skin===s.id;
     return '<article class="fn-shop-skin" style="--swatch:'+s.accent+';--rarity:'+SKIN_RARITIES[s.rarity]+'"><div class="fn-skin-shop-avatar" data-skin-thumb="'+s.id+'"><i class="fn-portrait-head"></i><i class="fn-portrait-body"></i><i class="fn-portrait-legs"></i></div><small>'+s.rarity.toUpperCase()+' • '+s.gender.toUpperCase()+'</small><h3>'+s.name.toUpperCase()+'</h3>'+cardButton(equipped?'EQUIPPED':owned?'EQUIP':'✦ '+s.price+' CREDITS','data-buy-skin="'+s.id+'"',equipped||(!owned&&data.credits<s.price))+'</article>'
    }).join('')+'</div><h3 class="fn-subhead">PLATFORM AURAS</h3><div class="fn-shop-grid">'+AURAS.map(a=>{
    const owned=data.owned.includes(a.id),equipped=data.aura===a.id;
    return '<article class="fn-shop-card" style="--swatch:'+a.color+'"><div class="fn-shop-display"><i></i></div><small>PLATFORM AURA</small><h3>'+a.name+'</h3><p>Original character-platform light effect</p>'+cardButton(equipped?'EQUIPPED':owned?'EQUIP':a.cost+' CREDITS','data-buy="'+a.id+'"',equipped||(!owned&&data.credits<a.cost))+'</article>'
   }).join('')+'</div>'
  }else if(tabName==='PROFILE'){
   html=intro('Your personal survivor record, stored in this browser.')+'<div class="fn-profile-lead"><span>◆</span><div><small>FIELD SCOUT PROFILE</small><h3>'+SCOUTS[data.skin].name.toUpperCase()+'</h3><p>Season Zero • Level '+tier(data)+'</p></div></div><div class="fn-stats">'+[['MATCHES',data.games],['WINS',data.wins],['ELIMINATIONS',data.elims],['BEST FINISH','#'+data.best],['WIN RATE',data.games?Math.round(data.wins/data.games*100)+'%':'0%'],['TOTAL XP',data.xp]].map(x=>'<div><small>'+x[0]+'</small><strong>'+x[1]+'</strong></div>').join('')+'</div>'
  }else if(tabName==='LEADERBOARDS'){
   html=intro('Results from your last 10 solo matches on this browser. This is not a global leaderboard.')+(data.history.length?'<div class="fn-history"><div class="fn-history-row heading"><b>PLACE</b><b>ELIMS</b><b>XP</b><b>DATE</b></div>'+data.history.map(h=>'<div class="fn-history-row"><b>#'+h.place+'</b><b>'+h.elims+'</b><b>+'+h.xp+'</b><b>'+escapeText(h.date)+'</b></div>').join('')+'</div>':'<div class="fn-empty-state">NO MATCH RECORDS YET. COMPLETE A SOLO MATCH TO START YOUR PERSONAL RECORD BOARD.</div>')
  }else if(tabName==='SETTINGS'){
   html=intro('Change rendering and lobby animation settings. Changes are saved on this browser.')+'<div class="fn-setting-list">'+[['shadows','SOFT SHADOWS','Dynamic shadow rendering'],['motion','LOBBY MOTION','Animated showroom and lighting'],['stats','PERFORMANCE READOUT','FPS and draw calls during a match']].map(q=>'<label><span><b>'+q[1]+'</b><small>'+q[2]+'</small></span><input type="checkbox" data-setting="'+q[0]+'" '+(data.settings[q[0]]?'checked':'')+'></label>').join('')+cardButton('CONTROLS / HOW TO PLAY','id="fnHelpFromSettings"')+'</div>'
  }
  $('#fnTabContent').innerHTML=html;
  if(tabName==='LOCKER'||tabName==='SHOP'){
   skinThumbs.hydrate();skinThumbs.ensure();
  }
  $('#fnTabContent').querySelectorAll('[data-skin]').forEach(el=>el.addEventListener('click',()=>selectSkin(Number(el.dataset.skin))));
  $('#fnTabContent').querySelectorAll('[data-aura]').forEach(el=>el.addEventListener('click',()=>selectAura(el.dataset.aura)));
  $('#fnTabContent').querySelectorAll('[data-buy-skin]').forEach(el=>el.addEventListener('click',()=>{
   const index=Number(el.dataset.buySkin);
   if(data.ownedSkins.includes(index))selectSkin(index);
   else purchaseSkin(index)
  }));
  $('#fnTabContent').querySelectorAll('[data-buy]').forEach(el=>el.addEventListener('click',()=>{
   const id=el.dataset.buy,a=AURAS.find(a=>a.id===id);if(!a)return;
   if(data.owned.includes(id))selectAura(id);
   else if(data.credits>=a.cost){data.credits-=a.cost;data.owned.push(id);data.aura=id;persist();drawLeft();onAura(a);notify('UNLOCKED: '+a.name.toUpperCase());renderTab()}
  }));
  $('#fnTabContent').querySelectorAll('[data-pass]').forEach(el=>el.addEventListener('click',()=>{
   const n=Number(el.dataset.pass);if(data.passClaimed.includes(n)||tier(data)<n)return;
   data.passClaimed.push(n);data.credits+=PASS[n-1][1];persist();drawLeft();notify('FIELD PASS REWARD CLAIMED');renderTab()
  }));
  $('#fnTabContent').querySelectorAll('[data-quest]').forEach(el=>el.addEventListener('click',()=>{
   const q=QUESTS.find(q=>q.id===el.dataset.quest);
   if(!q||data.claimed.includes(q.id)||data[q.key]<q.goal)return;
   data.claimed.push(q.id);data.credits+=q.reward;data.xp+=50;persist();drawLeft();notify('OBJECTIVE COMPLETE: +'+q.reward+' CREDITS');renderTab()
  }));
  $('#fnTabContent').querySelectorAll('[data-setting]').forEach(el=>el.addEventListener('change',()=>{
   data.settings[el.dataset.setting]=el.checked;persist();onSettings({...data.settings});notify('SETTING SAVED')
  }));
  $('#fnHelpFromSettings')?.addEventListener('click',how)
 }
 function switchTab(name){
  if(tabName==='LOCKER'&&name!=='LOCKER')onSkin(data.skin);
  tabName=name;$('#fnOverlay').classList.toggle('hidden',name==='PLAY');
  home.querySelectorAll('[data-tab]').forEach(el=>{const active=el.dataset.tab===name;el.classList.toggle('current',active);el.setAttribute('aria-current',active?'page':'false')});
  renderTab()
 }
 home.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
 home.querySelectorAll('[data-jump]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.jump)));
 $('#fnClose').addEventListener('click',()=>switchTab('PLAY'));
 document.addEventListener('keydown',event=>{if(event.code==='Escape'&&tabName!=='PLAY'&&!home.classList.contains('hidden')){event.preventDefault();switchTab('PLAY')}});
 $('#play').addEventListener('click',()=>{
  if(!partyClient.canStart()){notify('Group matches are not available yet. Leave the party to play solo.');return}
  if(partyClient.getState())partyClient.leave();
  play(data.mode)
 });
 $('#how').addEventListener('click',how);
 $('#fnChangeMode').addEventListener('click',()=>{data.mode=data.mode==='survival'?'training':'survival';persist();drawMode()});
 function record(type,n=1){
  if(!['loot','builds','harvest'].includes(type))return;
  data[type]+=n;persist();drawLeft()
 }
 function recordMatch({win=false,placement=20,elims=0}){
  data.games++;if(win)data.wins++;data.elims+=elims;data.best=Math.min(data.best,placement);
  const xp=60+elims*75+(win?240:0);data.xp+=xp;data.credits+=25+15*elims+(win?120:0);
  data.history.unshift({place:placement,elims,xp,date:new Date().toLocaleDateString()});
  data.history=data.history.slice(0,10);persist();drawLeft();
 }
 partyClient=mountPartyUI(home,{getSkin:()=>data.skin,onMembers:onPartyChange,notify});
 drawLeft();drawMode();onSkin(data.skin);onAura(AURAS.find(a=>a.id===data.aura));onSettings({...data.settings});
 return {data,switchTab,selectSkin,record,recordMatch,getMode:()=>data.mode,motion:()=>Boolean(data.settings.motion),notify,getParty:()=>partyClient.getState(),leaveParty:()=>partyClient.leave()};
}
