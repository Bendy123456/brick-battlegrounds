// BRICK BATTLEGROUNDS — v0.8.21 authored joint tracks and polished hit arcs.
// CHANGED: All nine classic fighters share this articulated rig animation table.
// CHANGED: Body weight now leans into punches, loads sideways on hooks, and counter-leans on kicks.
// CHANGED: Animation only. No modifications to attack durations, damage, collision,
// CHANGED: input, hit timestamps, stun, ragdoll, physics, or network sync.
// Angles are XYZ Euler DEGREES; combat-poses.js converts to radians at render.
export const CLASSIC_RELAXED={
 LS:[8,-4,-9],LE:[9,0,0],RS:[10,4,9],RE:[9,0,0],
 LH:[-6,0,-3],RH:[7,0,3],LK:[3,0,0],RK:[3,0,0],
 T:[1,-4,0],H:[0,0,0]
};
// CHANGED: Sparse authored channels: unspecified joints interpolate from their
// CHANGED: previous/next intentional keys instead of jumping toward idle.
const frame=(t,e,j={})=>({t,e,j:{...j}});

export const CLASSIC_COMBAT_POSES={
 light:[
  // CHANGED: 1 / LEFT JAB. Three distinct phases: fist rises to the cheek,
  // CHANGED: elbow cocks BACK behind the guard, then the forearm fires almost
  // CHANGED: horizontally into contact. Other fist never drops below the face.
  {name:'LEFT JAB',len:.48,blend:.040,frames:[
   frame(0,'sine'),
   frame(.051,'outCubic',{LS:[44,-7,-14],LE:[52,0,0],RS:[47,9,14],RE:[54,0,0],T:[-5,0,-2]}),
   frame(.110,'sine',{LS:[62,-18,-17],LE:[118,0,0],RS:[77,10,15],RE:[101,0,0],T:[-10,22,-7],LH:[-14,0,-6],RH:[9,0,4]}),
   frame(.141,'sine',{LS:[54,-23,-20],LE:[138,0,0],RS:[88,12,16],RE:[121,0,0],T:[-15,33,-11],LH:[-19,0,-8],RH:[12,0,5],LK:[10,0,0],RK:[-9,0,0]}),
   frame(.184,'outCubic',{LS:[80,-20,-15],LE:[84,0,0],RS:[91,12,16],RE:[126,0,0],T:[-12,12,2],LH:[-20,0,-8],RH:[14,0,5],LK:[12,0,0],RK:[-12,0,0]}),
   frame(.213,'outCubic',{LS:[101,-17,-14],LE:[19,0,0],RS:[93,12,16],RE:[126,0,0],T:[-20,-19,8],LH:[-21,0,-9],RH:[15,0,5],LK:[13,0,0],RK:[-12,0,0]}),
   frame(.2304,'outCubic',{LS:[107,-17,-14],LE:[3,0,0],RS:[94,12,16],RE:[127,0,0],T:[-23,-28,11],LH:[-22,0,-9],RH:[16,0,5],LK:[14,0,0],RK:[-13,0,0]}),
   frame(.255,'outCubic',{LS:[110,-17,-13],LE:[5,0,0],RS:[94,12,16],RE:[127,0,0],T:[-25,-30,12],LH:[-22,0,-9],RH:[16,0,5]}),
   frame(.308,'outCubic',{LS:[79,-12,-13],LE:[92,0,0],RS:[86,10,15],RE:[117,0,0],T:[-8,-13,4],LH:[-11,0,-5],RH:[9,0,4]}),
   frame(.386,'sine',{LS:[48,-7,-11],LE:[66,0,0],RS:[53,7,11],RE:[75,0,0],T:[-2,-6,0]}),
   frame(.48,'sine')
  ]},
  // CHANGED: 2 / RIGHT CROSS. Rear fist travels guard -> elbow tucked
  // CHANGED: behind ribs -> shoulder and hip drive -> fully straight punch.
  // CHANGED: Lead/left fist stays tight to the cheek as the torso turns.
  {name:'RIGHT CROSS',len:.48,blend:.040,frames:[
   frame(0,'sine'),
   frame(.051,'outCubic',{RS:[44,9,15],RE:[52,0,0],LS:[47,-10,-16],LE:[54,0,0],T:[-5,-4,0]}),
   frame(.112,'sine',{RS:[64,21,16],RE:[115,0,0],LS:[76,-11,-17],LE:[104,0,0],T:[-11,-29,9],RH:[-17,0,7],LH:[11,0,-5]}),
   frame(.145,'sine',{RS:[56,24,18],RE:[141,0,0],LS:[88,-12,-18],LE:[121,0,0],T:[-16,-38,13],RH:[-23,0,9],LH:[13,0,-6],RK:[11,0,0],LK:[-12,0,0]}),
   frame(.184,'outCubic',{RS:[82,19,14],RE:[80,0,0],LS:[93,-12,-18],LE:[130,0,0],T:[-10,6,-1],RH:[-25,0,9],LH:[15,0,-6],RK:[15,0,0],LK:[-14,0,0]}),
   frame(.211,'outCubic',{RS:[104,16,13],RE:[18,0,0],LS:[95,-13,-18],LE:[131,0,0],T:[-20,28,-10],RH:[-28,0,10],LH:[16,0,-7],RK:[17,0,0],LK:[-16,0,0]}),
   frame(.2304,'outCubic',{RS:[110,16,12],RE:[3,0,0],LS:[96,-13,-18],LE:[131,0,0],T:[-26,39,-13],RH:[-30,0,11],LH:[18,0,-8],RK:[18,0,0],LK:[-17,0,0]}),
   frame(.255,'outCubic',{RS:[113,17,12],RE:[6,0,0],LS:[96,-13,-18],LE:[130,0,0],T:[-27,41,-14],RH:[-30,0,11],LH:[18,0,-8]}),
   frame(.309,'outCubic',{RS:[77,11,13],RE:[92,0,0],LS:[88,-10,-17],LE:[116,0,0],T:[-9,16,-5],RH:[-14,0,7],LH:[11,0,-5]}),
   frame(.389,'sine',{RS:[45,6,12],RE:[68,0,0],LS:[51,-6,-12],LE:[77,0,0],T:[-3,5,-2]}),
   frame(.48,'sine')
  ]},
  // CHANGED: 3 / RIGHT KICK — preserve familiar front snapkick silhouette,
  // CHANGED: but push knee higher, support-leg compression, full extension and
  // CHANGED: obvious rechamber; both hands continue guarding the head.
  {name:'RIGHT KICK',len:.69,blend:.057,frames:[
   frame(0,'sine'),
   // CHANGED: pre-chamber knee and hands together before the leg snaps upward.
   frame(.060,'sine',{RH:[48,-2,5],RK:[-65,0,0],LH:[7,0,-6],LK:[-13,0,0],LS:[41,-6,-10],LE:[65,0,0],RS:[42,7,10],RE:[67,0,0],T:[5,2,-4]}),
   frame(.124,'sine',{RH:[118,-5,13],RK:[-127,0,0],LH:[13,0,-17],LK:[-27,0,0],LS:[86,-12,-18],LE:[121,0,0],RS:[88,13,18],RE:[125,0,0],T:[12,10,-10]}),
   frame(.225,'sine',{RH:[130,-5,18],RK:[-132,0,0],LH:[15,0,-18],LK:[-30,0,0],LS:[89,-14,-19],LE:[125,0,0],RS:[92,14,19],RE:[128,0,0],T:[18,16,-13]}),
   // CHANGED: transitional shin angle makes the extension read as a kick, not a pop.
   frame(.275,'sine',{RH:[128,-4,19],RK:[-104,0,0],LS:[89,-14,-19],LE:[125,0,0],RS:[92,14,19],RE:[128,0,0],T:[21,18,-15]}),
   frame(.314,'outCubic',{RH:[125,-4,20],RK:[-64,0,0],LH:[16,0,-18],LK:[-31,0,0],LS:[90,-14,-18],LE:[126,0,0],RS:[92,15,19],RE:[129,0,0],T:[26,20,-17]}),
   frame(.3795,'outCubic',{RH:[142,-4,23],RK:[-3,0,0],LH:[18,0,-20],LK:[-32,0,0],LS:[93,-15,-19],LE:[129,0,0],RS:[95,16,20],RE:[132,0,0],T:[29,28,-17]}),
   frame(.405,'outCubic',{RH:[145,-4,24],RK:[-7,0,0],LH:[18,0,-19],LK:[-31,0,0],LS:[93,-15,-19],LE:[127,0,0],RS:[95,16,20],RE:[130,0,0],T:[31,30,-18]}),
   // CHANGED: visible recoil begins before the knee folds back under the hip.
   frame(.435,'sine',{RH:[129,-4,21],RK:[-53,0,0],T:[26,24,-17]}),
   frame(.466,'sine',{RH:[113,-3,18],RK:[-104,0,0],LH:[13,0,-17],LK:[-27,0,0],LS:[83,-11,-17],LE:[118,0,0],RS:[86,12,18],RE:[119,0,0],T:[17,15,-12]}),
   frame(.563,'sine',{RH:[52,-2,9],RK:[-80,0,0],LH:[7,0,-9],LK:[-15,0,0],LS:[52,-7,-13],LE:[73,0,0],RS:[53,7,13],RE:[75,0,0],T:[7,6,-5]}),
   frame(.634,'sine',{RH:[16,0,4],RK:[-21,0,0],LH:[-3,0,-4],LK:[6,0,0],LS:[21,-5,-9],LE:[30,0,0],RS:[23,5,10],RE:[32,0,0],T:[0,-3,-3]}),
   frame(.69,'sine')
  ]},
  // CHANGED: 4 / LEFT HOOK. Start from raised guard, cock elbow
  // CHANGED: sideways behind the cheek, then CUT ACROSS (bent elbow).
  {name:'LEFT HOOK',len:.50,blend:.044,frames:[
   frame(0,'sine'),
   frame(.054,'outCubic',{LS:[44,-15,-16],LE:[55,0,0],RS:[49,11,16],RE:[55,0,0],T:[-2,-4,0]}),
   frame(.112,'sine',{LS:[63,-48,-35],LE:[114,0,0],RS:[79,12,17],RE:[103,0,0],T:[-11,39,-15],LH:[-23,0,-11],RH:[14,0,6]}),
   frame(.158,'sine',{LS:[61,-67,-39],LE:[130,0,0],RS:[94,12,17],RE:[130,0,0],T:[-17,50,-20],LH:[-29,0,-12],RH:[19,0,7]}),
   frame(.204,'outCubic',{LS:[82,-51,-34],LE:[101,0,0],RS:[96,13,18],RE:[131,0,0],T:[-13,-22,-12],LH:[-31,0,-13],RH:[21,0,8]}),
   frame(.240,'outCubic',{LS:[95,-20,-30],LE:[77,0,0],RS:[98,14,19],RE:[132,0,0],T:[-23,-72,24],LH:[-32,0,-13],RH:[22,0,9],LK:[15,0,0],RK:[-17,0,0]}),
   frame(.269,'outCubic',{LS:[97,-19,-30],LE:[74,0,0],RS:[98,14,19],RE:[132,0,0],T:[-25,-76,26],LH:[-31,0,-12],RH:[21,0,8]}),
   frame(.333,'sine',{LS:[84,-57,-26],LE:[109,0,0],RS:[90,12,17],RE:[123,0,0],T:[-11,-24,12],LH:[-15,0,-7],RH:[12,0,5]}),
   frame(.421,'sine',{LS:[43,-11,-12],LE:[69,0,0],RS:[47,6,11],RE:[75,0,0],T:[-3,-8,3]}),
   frame(.50,'sine')
  ]}
 ],
 // CHANGED: Heavy still hits on .375 and .900, exactly as before.
 // CHANGED: First strike now follows the same guard -> cocked elbow ->
 // CHANGED: lateral hook mechanics; leave second roundhouse choreography as-is.
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,blend:.045,frames:[
  frame(0,'sine'),
  frame(.075,'outCubic',{LS:[49,-16,-18],LE:[62,0,0],RS:[51,12,18],RE:[65,0,0],T:[-4,-5,0]}),
  frame(.173,'sine',{LS:[59,-55,-36],LE:[125,0,0],RS:[83,14,20],RE:[107,0,0],T:[-14,47,-18],LH:[-28,0,-13],RH:[18,0,9]}),
  frame(.252,'sine',{LS:[45,-45,-35],LE:[144,0,0],RS:[97,15,20],RE:[134,0,0],T:[-19,55,-22],LH:[-35,0,-16],RH:[22,0,10]}),
  frame(.309,'outCubic',{LS:[73,-45,-35],LE:[109,0,0],RS:[100,16,21],RE:[136,0,0],T:[-12,-16,-10],LH:[-38,0,-17],RH:[24,0,11]}),
  frame(.350,'outCubic',{LS:[88,-30,-32],LE:[84,0,0],RS:[102,17,22],RE:[138,0,0],T:[-21,-48,22],LH:[-39,0,-18],RH:[25,0,11]}),
  frame(.375,'outCubic',{LS:[95,-20,-30],LE:[77,0,0],RS:[103,18,22],RE:[139,0,0],T:[-28,-72,28],LH:[-40,0,-18],RH:[27,0,12],LK:[22,0,0],RK:[-23,0,0]}),
  frame(.407,'outCubic',{LS:[97,-19,-30],LE:[76,0,0],RS:[103,18,22],RE:[139,0,0],T:[-30,-76,30],LH:[-37,0,-17],RH:[25,0,11]}),
  frame(.515,'sine',{LS:[86,-42,-28],LE:[115,0,0],RS:[95,14,19],RE:[130,0,0],T:[-8,-15,11],LH:[-18,0,-10],RH:[14,0,8]}),
  // CHANGED: Clearly recompose into a guarded roundhouse, not a kick teleport.
  frame(.608,'sine',{LS:[84,-14,-18],LE:[120,0,0],RS:[83,13,20],RE:[121,0,0],T:[8,31,-12],RH:[60,19,17],RK:[-95,0,0],LH:[11,0,-14],LK:[-19,0,0]}),
  frame(.728,'sine',{RH:[123,28,23],RK:[-131,0,0],LH:[17,0,-26],LK:[-33,0,0],LS:[100,-19,-20],LE:[129,0,0],RS:[102,18,21],RE:[129,0,0],T:[22,54,-21]}),
   // CHANGED: roundhouse shin unfolds over time, with the final snap at contact.
   frame(.770,'sine',{RH:[128,30,25],RK:[-105,0,0],LS:[102,-19,-20],LE:[129,0,0],RS:[103,19,21],RE:[129,0,0],T:[25,57,-22]}),
  frame(.818,'sine',{RH:[136,32,27],RK:[-68,0,0],LH:[19,0,-28],LK:[-35,0,0],LS:[103,-20,-20],LE:[129,0,0],RS:[106,19,22],RE:[130,0,0],T:[28,62,-24]}),
  frame(.862,'outCubic',{RH:[131,34,30],RK:[-21,0,0],LH:[21,0,-29],LK:[-35,0,0],LS:[106,-21,-20],LE:[131,0,0],RS:[107,20,22],RE:[131,0,0],T:[33,68,-26]}),
  frame(.900,'outCubic',{RH:[148,36,30],RK:[-3,0,0],LH:[22,0,-30],LK:[-36,0,0],LS:[109,-22,-20],LE:[132,0,0],RS:[111,21,22],RE:[132,0,0],T:[35,76,-27]}),
  frame(.927,'outCubic',{RH:[150,37,30],RK:[-8,0,0],LH:[22,0,-30],LK:[-35,0,0],LS:[110,-22,-20],LE:[130,0,0],RS:[111,21,22],RE:[130,0,0],T:[36,79,-28]}),
   // CHANGED: active knee re-chamber catches momentum right after contact.
   frame(.975,'sine',{RH:[139,33,27],RK:[-65,0,0],LS:[101,-20,-20],LE:[125,0,0],RS:[103,18,21],RE:[125,0,0],T:[30,62,-24]}),
  frame(1.023,'sine',{RH:[118,24,23],RK:[-118,0,0],LH:[17,0,-24],LK:[-30,0,0],LS:[89,-14,-18],LE:[116,0,0],RS:[91,15,19],RE:[118,0,0],T:[21,48,-19]}),
  frame(1.132,'sine',{RH:[52,7,10],RK:[-84,0,0],LH:[7,0,-12],LK:[-14,0,0],LS:[43,-7,-13],LE:[70,0,0],RS:[44,8,13],RE:[72,0,0],T:[9,14,-8]}),
  frame(1.213,'sine',{RH:[14,2,5],RK:[-21,0,0],LH:[-3,0,-4],LS:[20,-4,-10],LE:[26,0,0],RS:[21,4,10],RE:[27,0,0],T:[-2,-3,-3]}),
  frame(1.25,'sine')
 ]}
};
