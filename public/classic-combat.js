// BRICK BATTLEGROUNDS — v0.8.16 exaggerated anime-battleground combat animations.
// CHANGED: All nine classic fighters share this articulated rig animation table.
// CHANGED: Animation only. No modifications to attack durations, damage, collision,
// CHANGED: input, hit timestamps, stun, ragdoll, physics, or network sync.
// Angles are XYZ Euler DEGREES; combat-poses.js converts to radians at render.
export const CLASSIC_RELAXED={
 LS:[8,-4,-9],LE:[9,0,0],RS:[10,4,9],RE:[9,0,0],
 LH:[-6,0,-3],RH:[7,0,3],LK:[3,0,0],RK:[3,0,0],
 T:[1,-4,0],H:[0,0,0]
};
const frame=(t,e,j={})=>({t,e,j:{...CLASSIC_RELAXED,...j}});

export const CLASSIC_COMBAT_POSES={
 light:[
  // CHANGED: 1 / LEFT JAB — compressed crouch, shoulder-loaded coil, sharp snap,
  // CHANGED: tiny impact overshoot, tight right-hand face guard throughout the hit.
  {name:'LEFT JAB',len:.48,blend:.045,frames:[
   frame(0,'sine'),
   frame(.070,'sine',{LS:[-45,-27,-20],LE:[139,0,0],RS:[88,11,15],RE:[120,0,0],T:[-13,27,-13],LH:[-22,0,-8],RH:[14,0,5],LK:[13,0,0],RK:[-12,0,0]}),
   frame(.130,'sine',{LS:[38,-22,-18],LE:[112,0,0],RS:[91,12,15],RE:[127,0,0],T:[3,-10,3],LH:[-25,0,-9],RH:[17,0,5],RK:[-14,0,0]}),
   frame(.190,'outCubic',{LS:[120,-21,-14],LE:[15,0,0],RS:[94,12,16],RE:[131,0,0],T:[19,-42,13],LH:[-27,0,-10],RH:[20,0,5],LK:[16,0,0],RK:[-16,0,0]}),
   frame(.2304,'outCubic',{LS:[137,-24,-13],LE:[2,0,0],RS:[97,14,17],RE:[132,0,0],T:[25,-51,16],LH:[-28,0,-11],RH:[21,0,6],LK:[17,0,0],RK:[-17,0,0]}),
   frame(.254,'outCubic',{LS:[143,-22,-12],LE:[6,0,0],RS:[97,14,17],RE:[131,0,0],T:[26,-55,16],LH:[-25,0,-10],RH:[20,0,5]}),
   frame(.315,'sine',{LS:[91,-13,-12],LE:[50,0,0],RS:[88,12,15],RE:[122,0,0],T:[12,-28,8],LH:[-20,0,-7],RH:[14,0,4]}),
   frame(.399,'sine',{LS:[49,-5,-12],LE:[85,0,0],RS:[53,7,12],RE:[91,0,0],T:[2,-10,0],LH:[-8,0,-3],RH:[8,0,3]}),
   frame(.48,'sine')
  ]},
  // CHANGED: 2 / RIGHT CROSS — deeper rear-side twist and more decisive heel-to-
  // CHANGED: shoulder transfer, left hand stays tight to the cheek until recoil.
  {name:'RIGHT CROSS',len:.48,blend:.045,frames:[
   frame(0,'sine'),
   frame(.077,'sine',{RS:[-49,30,25],RE:[141,0,0],LS:[87,-12,-17],LE:[121,0,0],T:[-16,-38,17],RH:[-28,0,9],LH:[15,0,-6],RK:[16,0,0],LK:[-12,0,0]}),
   frame(.139,'sine',{RS:[50,23,18],RE:[109,0,0],LS:[93,-12,-16],LE:[126,0,0],T:[5,15,-3],RH:[-29,0,10],LH:[17,0,-6],RK:[17,0,0],LK:[-13,0,0]}),
   frame(.196,'outCubic',{RS:[120,20,14],RE:[15,0,0],LS:[96,-13,-18],LE:[132,0,0],T:[21,45,-14],RH:[-33,0,12],LH:[19,0,-8],RK:[19,0,0],LK:[-18,0,0]}),
   frame(.2304,'outCubic',{RS:[143,23,13],RE:[3,0,0],LS:[97,-14,-18],LE:[133,0,0],T:[28,57,-18],RH:[-36,0,13],LH:[21,0,-9],RK:[20,0,0],LK:[-20,0,0]}),
   frame(.254,'outCubic',{RS:[148,21,12],RE:[7,0,0],LS:[97,-14,-18],LE:[131,0,0],T:[28,60,-18],RH:[-34,0,12],LH:[20,0,-9]}),
   frame(.324,'sine',{RS:[92,12,12],RE:[54,0,0],LS:[87,-11,-17],LE:[123,0,0],T:[13,29,-8],RH:[-19,0,8],LH:[13,0,-5]}),
   frame(.398,'sine',{RS:[46,5,12],RE:[84,0,0],LS:[50,-6,-13],LE:[94,0,0],T:[3,7,-2],RH:[0,0,4]}),
   frame(.48,'sine')
  ]},
  // CHANGED: 3 / RIGHT KICK — preserve familiar front snapkick silhouette,
  // CHANGED: but push knee higher, support-leg compression, full extension and
  // CHANGED: obvious rechamber; both hands continue guarding the head.
  {name:'RIGHT KICK',len:.69,blend:.057,frames:[
   frame(0,'sine'),
   frame(.124,'sine',{RH:[118,-5,13],RK:[-127,0,0],LH:[13,0,-17],LK:[-27,0,0],LS:[86,-12,-18],LE:[121,0,0],RS:[88,13,18],RE:[125,0,0],T:[-25,10,-17]}),
   frame(.225,'sine',{RH:[130,-5,18],RK:[-132,0,0],LH:[15,0,-18],LK:[-30,0,0],LS:[89,-14,-19],LE:[125,0,0],RS:[92,14,19],RE:[128,0,0],T:[-28,16,-20]}),
   frame(.314,'outCubic',{RH:[125,-4,20],RK:[-24,0,0],LH:[16,0,-18],LK:[-31,0,0],LS:[90,-14,-18],LE:[126,0,0],RS:[92,15,19],RE:[129,0,0],T:[-28,20,-21]}),
   frame(.3795,'outCubic',{RH:[142,-4,23],RK:[-3,0,0],LH:[18,0,-20],LK:[-32,0,0],LS:[93,-15,-19],LE:[129,0,0],RS:[95,16,20],RE:[132,0,0],T:[-32,28,-24]}),
   frame(.405,'outCubic',{RH:[145,-4,24],RK:[-7,0,0],LH:[18,0,-19],LK:[-31,0,0],LS:[93,-15,-19],LE:[127,0,0],RS:[95,16,20],RE:[130,0,0],T:[-33,30,-25]}),
   frame(.466,'sine',{RH:[113,-3,18],RK:[-119,0,0],LH:[13,0,-17],LK:[-27,0,0],LS:[83,-11,-17],LE:[118,0,0],RS:[86,12,18],RE:[119,0,0],T:[-22,15,-17]}),
   frame(.563,'sine',{RH:[52,-2,9],RK:[-80,0,0],LH:[7,0,-9],LK:[-15,0,0],LS:[52,-7,-13],LE:[73,0,0],RS:[53,7,13],RE:[75,0,0],T:[-9,6,-9]}),
   frame(.634,'sine',{RH:[16,0,4],RK:[-21,0,0],LH:[-3,0,-4],LK:[6,0,0],LS:[21,-5,-9],LE:[30,0,0],RS:[23,5,10],RE:[32,0,0],T:[-1,-3,-3]}),
   frame(.69,'sine')
  ]},
  // CHANGED: 4 / LEFT HOOK — distinct wide bent-arm silhouette, strongly coiled
  // CHANGED: waist swing, and retained right-hand guard on the final combo hit.
  {name:'LEFT HOOK',len:.50,blend:.045,frames:[
   frame(0,'sine'),
   frame(.096,'sine',{LS:[-52,-45,-40],LE:[132,0,0],RS:[91,12,17],RE:[125,0,0],T:[-19,49,-22],LH:[-28,0,-12],RH:[16,0,7],LK:[15,0,0],RK:[-17,0,0]}),
   frame(.159,'sine',{LS:[37,-67,-48],LE:[117,0,0],RS:[96,13,17],RE:[132,0,0],T:[-2,21,-10],LH:[-30,0,-13],RH:[18,0,8]}),
   frame(.214,'outCubic',{LS:[113,-90,-48],LE:[78,0,0],RS:[98,14,18],RE:[133,0,0],T:[23,-49,21],LH:[-34,0,-13],RH:[20,0,8],LK:[19,0,0],RK:[-22,0,0]}),
   frame(.240,'outCubic',{LS:[139,-101,-45],LE:[71,0,0],RS:[99,15,19],RE:[136,0,0],T:[33,-64,29],LH:[-36,0,-15],RH:[24,0,9],LK:[20,0,0],RK:[-23,0,0]}),
   frame(.263,'outCubic',{LS:[141,-109,-46],LE:[77,0,0],RS:[99,14,19],RE:[134,0,0],T:[34,-68,30],LH:[-34,0,-14],RH:[23,0,8]}),
   frame(.331,'sine',{LS:[96,-61,-33],LE:[96,0,0],RS:[90,12,17],RE:[124,0,0],T:[17,-32,15],LH:[-18,0,-8],RH:[14,0,6]}),
   frame(.418,'sine',{LS:[38,-11,-15],LE:[63,0,0],RS:[49,6,12],RE:[83,0,0],T:[3,-10,2]}),
   frame(.50,'sine')
  ]}
 ],
 // CHANGED: Heavy = one forceful hook then a second, spinning roundhouse kick.
 // CHANGED: Contacts remain EXACTLY at .375s and .900s (hits [.30,.72]).
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,blend:.052,frames:[
  frame(0,'sine'),
  frame(.214,'sine',{LS:[-62,-54,-49],LE:[141,0,0],RS:[91,13,19],RE:[130,0,0],T:[-22,61,-25],LH:[-36,0,-17],RH:[20,0,10],LK:[20,0,0],RK:[-19,0,0]}),
  frame(.300,'sine',{LS:[46,-76,-50],LE:[118,0,0],RS:[96,15,21],RE:[136,0,0],T:[3,19,-8],LH:[-39,0,-17],RH:[22,0,10]}),
  frame(.350,'outCubic',{LS:[132,-96,-46],LE:[79,0,0],RS:[99,17,21],RE:[137,0,0],T:[27,-58,25],LH:[-40,0,-18],RH:[26,0,11],LK:[22,0,0],RK:[-24,0,0]}),
  frame(.375,'outCubic',{LS:[150,-107,-45],LE:[68,0,0],RS:[101,18,22],RE:[138,0,0],T:[36,-73,32],LH:[-42,0,-18],RH:[28,0,12],LK:[24,0,0],RK:[-25,0,0]}),
  frame(.405,'outCubic',{LS:[152,-111,-45],LE:[77,0,0],RS:[101,17,22],RE:[137,0,0],T:[37,-76,32],LH:[-36,0,-16],RH:[26,0,11]}),
  frame(.510,'sine',{LS:[86,-44,-31],LE:[108,0,0],RS:[93,13,19],RE:[128,0,0],T:[13,-19,9],LH:[-19,0,-11],RH:[15,0,8]}),
  // CHANGED: Clearly recompose into a guarded roundhouse, not a kick teleport.
  frame(.608,'sine',{LS:[84,-14,-18],LE:[120,0,0],RS:[83,13,20],RE:[121,0,0],T:[-16,31,-14],RH:[60,19,17],RK:[-95,0,0],LH:[11,0,-14],LK:[-19,0,0]}),
  frame(.728,'sine',{RH:[123,28,23],RK:[-131,0,0],LH:[17,0,-26],LK:[-33,0,0],LS:[100,-19,-20],LE:[129,0,0],RS:[102,18,21],RE:[129,0,0],T:[-33,54,-29]}),
  frame(.818,'sine',{RH:[136,32,27],RK:[-122,0,0],LH:[19,0,-28],LK:[-35,0,0],LS:[103,-20,-20],LE:[129,0,0],RS:[106,19,22],RE:[130,0,0],T:[-38,62,-31]}),
  frame(.862,'outCubic',{RH:[131,34,30],RK:[-20,0,0],LH:[21,0,-29],LK:[-35,0,0],LS:[106,-21,-20],LE:[131,0,0],RS:[107,20,22],RE:[131,0,0],T:[-40,68,-33]}),
  frame(.900,'outCubic',{RH:[148,36,30],RK:[-3,0,0],LH:[22,0,-30],LK:[-36,0,0],LS:[109,-22,-20],LE:[132,0,0],RS:[111,21,22],RE:[132,0,0],T:[-43,76,-35]}),
  frame(.927,'outCubic',{RH:[150,37,30],RK:[-8,0,0],LH:[22,0,-30],LK:[-35,0,0],LS:[110,-22,-20],LE:[130,0,0],RS:[111,21,22],RE:[130,0,0],T:[-43,79,-36]}),
  frame(1.023,'sine',{RH:[118,24,23],RK:[-122,0,0],LH:[17,0,-24],LK:[-30,0,0],LS:[89,-14,-18],LE:[116,0,0],RS:[91,15,19],RE:[118,0,0],T:[-32,48,-25]}),
  frame(1.132,'sine',{RH:[52,7,10],RK:[-84,0,0],LH:[7,0,-12],LK:[-14,0,0],LS:[43,-7,-13],LE:[70,0,0],RS:[44,8,13],RE:[72,0,0],T:[-11,14,-10]}),
  frame(1.213,'sine',{RH:[14,2,5],RK:[-21,0,0],LH:[-3,0,-4],LS:[20,-4,-10],LE:[26,0,0],RS:[21,4,10],RE:[27,0,0],T:[-1,-3,-3]}),
  frame(1.25,'sine')
 ]}
};
