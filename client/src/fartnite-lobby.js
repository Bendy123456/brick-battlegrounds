// Original FartNite classic-style multiplayer lobby arrangement.
// All progress, currency, cosmetics, and match records are local only.
export const SCOUTS=[
 {name:'Meadow Runner',color:'#ceeb80'},
 {name:'Copper Courier',color:'#f5aa7f'},
 {name:'Tidal Scout',color:'#79d8df'},
 {name:'Violet Voyager',color:'#d9adf2'}
];
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
const defaults=()=>({skin:0,aura:'aqua',owned:['aqua'],xp:0,credits:150,games:0,wins:0,elims:0,loot:0,builds:0,harvest:0,best:20,claimed:[],passClaimed:[],history:[],mode:'survival',settings:{shadows:true,motion:true,stats:true}});
const escapeText=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const tier=data=>Math.floor(data.xp/350)+1;
const pct=(v,goal)=>Math.max(0,Math.min(100,Math.round(v/goal*100)));
function read(){
 try {
  const old=JSON.parse(localStorage.getItem(STORE)||'null');
  if(!old||typeof old!=='object')return defaults();
  const d=defaults(),o={...d,...old,settings:{...d.settings,...old.settings}};
  o.skin=Math.max(0,Math.min(3,Number(o.skin)||0));
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
export function mountLobby(home,{play,onSkin,onAura,onSettings,how}){
 const data=read(),persist=()=>{try{localStorage.setItem(STORE,JSON.stringify(data))}catch{}};
 let tabName='PLAY',notificationTimer=0;
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
 '<div class="fn-stage-heading">FARTNITE <b>FIELD SQUAD</b><small>CHARACTER SHOWCASE • SOLO GAME</small></div>',
 '<div class="fn-character-tags" aria-hidden="true"><div class="fn-tag-left"><b>TIDAL SCOUT</b><small>SHOWCASE</small></div><div class="fn-tag-center"><span>◆</span><b id="fnSkinName">MEADOW RUNNER</b><small>READY TO DEPLOY</small></div><div class="fn-tag-right"><b>COPPER COURIER</b><small>SHOWCASE</small></div></div>',
 '<div class="fn-stage-tip">CUSTOMIZE YOUR SCOUT IN THE LOCKER</div>',
 '<aside class="fn-ready" aria-label="Game mode and ready">',
 '<div class="fn-ready-overline">SELECTED MISSION <b>SOLO / AI</b></div>',
 '<h2 id="fnModeTitle">ISLAND SURVIVAL</h2><p id="fnModeDescription">1 player + 19 AI rivals</p>',
 '<button type="button" id="fnChangeMode" class="fn-change-mode">▣ &nbsp; CHANGE MODE</button>',
 '<div class="fn-fill"><span>PARTY STATUS</span><b>LOCAL SOLO</b></div>',
 '<button type="button" class="fn-ready-cta" id="play">▶ &nbsp; READY!</button>',
 '<small class="fn-ready-note">Press Ready to launch your solo match</small></aside>',
 '<footer class="fn-bottom"><div><span class="fn-dot"></span><b>FARTNITE // SEASON ZERO</b><span>LOCAL SOLO PREVIEW</span></div><span>ORIGINAL GAME • NO EXTERNAL ACCOUNTS</span><div><button type="button" data-jump="LOCKER">◈ LOCKER</button><button id="how" type="button">? HELP / CONTROLS</button></div></footer>',
 '<div id="fnNotice" class="fn-notice" role="status" aria-live="polite"></div>',
 '<section id="fnOverlay" class="fn-overlay hidden" aria-label="Lobby tabs"><div class="fn-content-panel">',
 '<div class="fn-panel-head"><div><small>SEASON ZERO / FIELD TERMINAL</small><h2 id="fnPanelHeading">LOCKER</h2></div><button type="button" id="fnClose">✕ RETURN TO LOBBY</button></div>',
 '<div id="fnTabContent" class="fn-tab-content"></div></div></section>'
 ].join('');
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
  if(index<0||index>=SCOUTS.length||!Number.isInteger(index))return;
  data.skin=index;persist();onSkin(index);drawLeft();notify(SCOUTS[index].name.toUpperCase()+' EQUIPPED');
  if(tabName==='LOCKER')renderTab()
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
   html=intro('Select your original scout. Changes appear instantly on the showcase and in matches.')+
    '<div class="fn-scouter-grid">'+SCOUTS.map((skin,i)=>'<button type="button" class="fn-scout-tile '+(data.skin===i?'selected':'')+'" data-skin="'+i+'" style="--swatch:'+skin.color+'"><div class="fn-scout-gem">◆</div><small>FIELD SCOUT / 0'+(i+1)+'</small><strong>'+skin.name.toUpperCase()+'</strong><em>'+(data.skin===i?'✓ EQUIPPED':'EQUIP SCOUT')+'</em></button>').join('')+'</div>'+
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
   html=intro('Unlock original glow effects using credits earned in matches. There are no paid purchases or online services.')+'<div class="fn-shop-grid">'+AURAS.map(a=>{
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
  $('#fnTabContent').querySelectorAll('[data-skin]').forEach(el=>el.addEventListener('click',()=>selectSkin(Number(el.dataset.skin))));
  $('#fnTabContent').querySelectorAll('[data-aura]').forEach(el=>el.addEventListener('click',()=>selectAura(el.dataset.aura)));
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
  tabName=name;$('#fnOverlay').classList.toggle('hidden',name==='PLAY');
  home.querySelectorAll('[data-tab]').forEach(el=>{const active=el.dataset.tab===name;el.classList.toggle('current',active);el.setAttribute('aria-current',active?'page':'false')});
  renderTab()
 }
 home.querySelectorAll('[data-tab]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.tab)));
 home.querySelectorAll('[data-jump]').forEach(el=>el.addEventListener('click',()=>switchTab(el.dataset.jump)));
 $('#fnClose').addEventListener('click',()=>switchTab('PLAY'));
 $('#play').addEventListener('click',()=>play(data.mode));
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
 drawLeft();drawMode();onSkin(data.skin);onAura(AURAS.find(a=>a.id===data.aura));onSettings({...data.settings});
 return {data,switchTab,selectSkin,record,recordMatch,getMode:()=>data.mode,motion:()=>Boolean(data.settings.motion),notify};
}
