import {createPartyClient} from './fartnite-party.js';

// Real lobby presence. A player appears beside the host only after the WebSocket
// server confirms that a different live browser session joined the invitation code.
export function mountPartyUI(home,{getSkin,onMembers,notify}){
 const $=selector=>home.querySelector(selector);
 const text=(selector,value)=>{const e=$(selector);if(e)e.textContent=String(value)};
 function draw(party){
  const peers=party?.members.filter(member=>member.id!==party.selfId)||[];
  const slot=(side,member)=>{
   const panel=$('#fnParty'+side),name=$('#fnParty'+side+'Name');
   panel.classList.toggle('hidden',!member);
   name.textContent=member?.name||''
  };
  slot('Left',peers[0]);slot('Right',peers[1]);
  onMembers(peers);
  const count=party?.members.length||1;
  const owner=!party||party.hostId===party.selfId;
  text('#fnPartyCount',count+' / 3');
  text('#fnStageMode',party?'PARTY • '+count+' / 3':'SOLO • ONLY YOU');
  text('#fnPartyStatus',party?(owner?'YOUR PARTY':'JOINED PARTY'):'ALONE IN LOBBY');
  $('#fnCreateParty').classList.toggle('hidden',Boolean(party));
  $('#fnLeaveParty').classList.toggle('hidden',!party);
  $('#fnJoinParty').disabled=Boolean(party);
  $('#fnJoinCode').disabled=Boolean(party);
  $('#fnPartyCodePanel').classList.toggle('hidden',!party);
  text('#fnPartyCode',party?.code||'');
  const list=$('#fnPartyList');list.replaceChildren();
  if(party)for(const member of party.members){
   const item=document.createElement('span');
   item.textContent=member.name+(member.id===party.selfId?' (YOU)':'');
   list.appendChild(item)
  }
  const canStart=peers.length===0&&owner;
  $('#play').disabled=!canStart;
  text('#fnReadyNote',canStart?'Solo AI battles only • Party lobby does not synchronize gameplay':'Group battles are not online yet • Leave party for solo');
 }
 const client=createPartyClient({onParty:draw,onMessage:notify});
 let chosenName='FIELD SCOUT';
 try{chosenName=sessionStorage.getItem('fartnite_party_name')||('SCOUT '+Math.floor(Math.random()*9000+1000))}catch{}
 $('#fnPlayerName').value=chosenName;
 const getName=()=>{
  const name=$('#fnPlayerName').value.trim().replace(/[<>&"']/g,'').slice(0,22)||'FIELD SCOUT';
  try{sessionStorage.setItem('fartnite_party_name',name)}catch{}
  return name
 };
 $('#fnCreateParty').onclick=()=>client.create(getName(),getSkin());
 $('#fnJoinParty').onclick=()=>{
  const code=$('#fnJoinCode').value.trim().toUpperCase();
  if(!/^[A-F0-9]{6}$/.test(code)){notify('Enter the 6-character invite code.');return}
  client.join(code,getName(),getSkin())
 };
 $('#fnJoinCode').onkeydown=event=>{if(event.key==='Enter')$('#fnJoinParty').click()};
 $('#fnLeaveParty').onclick=()=>client.leave();
 $('#fnCopyParty').onclick=async()=>{
  const code=client.getState()?.code;if(!code)return;
  try{await navigator.clipboard.writeText(code);notify('INVITE CODE COPIED')}
  catch{notify('PARTY CODE: '+code)}
 };
 draw(null);
 return {
  setSkin:index=>client.setSkin(index),
  getState:()=>client.getState(),
  leave:()=>client.leave(),
  canStart:()=>{
   const party=client.getState();
   return !party||(party.hostId===party.selfId&&party.members.length===1)
  }
 }
}
