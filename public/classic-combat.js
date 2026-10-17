// CHANGED: CRIMSON / VERDANT exclusively. Stylized anime battlegrounds poses.
// Seconds are real elapsed time, XYZ Euler rotations are DEGREES.
// Existing hit contacts are left untouched in arena.js. Keys:
// LS/RS shoulders, LE/RE elbows, LH/RH hips, LK/RK knees, T waist, H head.
// Full body keys are present at every frame, so absent keys never inherit the
// other seven fighters' raised-guard stance.
export const CLASSIC_RELAXED={
 LS:[8,-4,-9],LE:[9,0,0],RS:[10,4,9],RE:[9,0,0],
 LH:[-6,0,-3],RH:[7,0,3],LK:[3,0,0],RK:[3,0,0],
 T:[1,-4,0],H:[0,0,0]
};
const frame=(t,e,j={})=>({t,e,j:{...CLASSIC_RELAXED,...j}});
export const CLASSIC_COMBAT_POSES={
 light:[
  // 1: lead jab. Wind back, torso turns, fast near-horizontal extension.
  {name:'LEFT JAB',len:.48,blend:.050,frames:[
   frame(0,'sine'),
   frame(.092,'sine',{LS:[-33,-19,-23],LE:[125,0,0],RS:[72,9,13],RE:[105,0,0],T:[-8,32,-10],LH:[-16,0,-5],RH:[10,0,3]}),
   frame(.155,'sine',{LS:[38,-14,-14],LE:[105,0,0],RS:[76,9,14],RE:[105,0,0],T:[5,-15,5],LH:[-20,0,-5],RH:[11,0,4]}),
   frame(.205,'outCubic',{LS:[109,-16,-9],LE:[17,0,0],RS:[80,10,15],RE:[111,0,0],T:[14,-35,9],LH:[-20,0,-6],RH:[12,0,4],RK:[-9,0,0]}),
   frame(.2304,'outCubic',{LS:[125,-20,-8],LE:[1,0,0],RS:[81,10,15],RE:[112,0,0],T:[18,-41,12],LH:[-22,0,-7],RH:[13,0,4],RK:[-10,0,0]}),
   frame(.277,'sine',{LS:[103,-12,-10],LE:[22,0,0],RS:[75,9,13],RE:[107,0,0],T:[11,-24,7],LH:[-16,0,-5]}),
   frame(.356,'sine',{LS:[43,-6,-12],LE:[65,0,0],RS:[37,5,12],RE:[66,0,0],T:[3,-9,1]}),
   frame(.48,'sine')
  ]},
  // 2: rear straight. Opposite torso twist and meaningful foot plant.
  {name:'RIGHT CROSS',len:.48,blend:.05,frames:[
   frame(0,'sine'),
   frame(.100,'sine',{RS:[-39,21,24],RE:[126,0,0],LS:[75,-8,-14],LE:[107,0,0],T:[-10,-34,12],RH:[-20,0,6],LH:[10,0,-5]}),
   frame(.160,'sine',{RS:[42,14,14],RE:[102,0,0],LS:[77,-8,-16],LE:[110,0,0],T:[7,16,-6],RH:[-23,0,7],LH:[13,0,-5]}),
   frame(.208,'outCubic',{RS:[109,15,11],RE:[16,0,0],LS:[82,-9,-17],LE:[111,0,0],T:[16,37,-10],RH:[-23,0,7],LH:[14,0,-6],LK:[-11,0,0]}),
   frame(.2304,'outCubic',{RS:[127,20,9],RE:[1,0,0],LS:[83,-10,-17],LE:[111,0,0],T:[20,45,-13],RH:[-25,0,9],LH:[14,0,-6],LK:[-14,0,0]}),
   frame(.282,'sine',{RS:[102,12,10],RE:[28,0,0],LS:[74,-8,-15],LE:[110,0,0],T:[11,27,-6]}),
   frame(.37,'sine',{RS:[40,5,12],RE:[65,0,0],LS:[40,-5,-12],LE:[67,0,0],T:[3,8,-2]}),
   frame(.48,'sine')
  ]},
  // 3: front kick. Knee shoots HIGH, shin folds, then snaps fully straight.
  {name:'RIGHT KICK',len:.69,blend:.065,frames:[
   frame(0,'sine'),
   frame(.14,'sine',{RH:[111,-4,12],RK:[-112,0,0],LH:[11,0,-13],LK:[-22,0,0],LS:[74,-6,-14],LE:[110,0,0],RS:[75,7,14],RE:[111,0,0],T:[-20,9,-14]}),
   frame(.228,'sine',{RH:[122,-3,15],RK:[-119,0,0],LH:[12,0,-14],LK:[-24,0,0],LS:[76,-7,-15],LE:[113,0,0],RS:[78,8,15],RE:[113,0,0],T:[-24,12,-17]}),
   frame(.332,'outCubic',{RH:[113,-2,15],RK:[-23,0,0],LH:[13,0,-15],LK:[-24,0,0],LS:[78,-8,-15],LE:[113,0,0],RS:[79,9,15],RE:[113,0,0],T:[-23,15,-17]}),
   frame(.3795,'outCubic',{RH:[132,-2,17],RK:[-2,0,0],LH:[14,0,-15],LK:[-24,0,0],LS:[80,-9,-16],LE:[114,0,0],RS:[80,10,16],RE:[114,0,0],T:[-26,19,-19]}),
   frame(.440,'sine',{RH:[108,-2,15],RK:[-108,0,0],LH:[12,0,-14],LK:[-23,0,0],LS:[74,-7,-13],LE:[108,0,0],RS:[75,8,14],RE:[108,0,0],T:[-19,12,-13]}),
   frame(.56,'sine',{RH:[52,-1,7],RK:[-71,0,0],LH:[6,0,-8],LK:[-11,0,0],LS:[38,-5,-11],LE:[64,0,0],RS:[37,5,11],RE:[65,0,0],T:[-7,3,-5]}),
   frame(.625,'sine',{RH:[13,0,4],RK:[-20,0,0],LH:[-3,0,-4],LK:[5,0,0],T:[0,-3,0]}),
   frame(.69,'sine')
  ]},
  // 4: sweeping left hook. BENT forearm at contact, wide silhouette, not straight jab.
  {name:'LEFT HOOK',len:.50,blend:.05,frames:[
   frame(0,'sine'),
   frame(.112,'sine',{LS:[-38,-32,-34],LE:[122,0,0],RS:[75,9,14],RE:[110,0,0],T:[-12,42,-17],LH:[-20,0,-9],RH:[12,0,5]}),
   frame(.173,'sine',{LS:[46,-57,-42],LE:[106,0,0],RS:[77,8,14],RE:[112,0,0],T:[-1,20,-10],LH:[-20,0,-9],RH:[14,0,5]}),
   frame(.219,'outCubic',{LS:[100,-70,-42],LE:[78,0,0],RS:[79,9,15],RE:[112,0,0],T:[18,-33,15],LH:[-22,0,-10],RH:[15,0,5]}),
   frame(.240,'outCubic',{LS:[120,-83,-41],LE:[66,0,0],RS:[81,9,15],RE:[113,0,0],T:[24,-54,22],LH:[-25,0,-10],RH:[17,0,6]}),
   frame(.293,'sine',{LS:[98,-58,-36],LE:[78,0,0],RS:[75,8,15],RE:[108,0,0],T:[15,-32,13]}),
   frame(.408,'sine',{LS:[35,-12,-17],LE:[57,0,0],RS:[35,5,11],RE:[65,0,0],T:[3,-11,2]}),
   frame(.50,'sine')
  ]}
 ],
 // Heavy is one animation with TWO existing damaging contact frames.
 heavy:{name:'HOOK + ROUNDHOUSE',len:1.25,blend:.065,frames:[
  frame(0,'sine'),
  frame(.245,'sine',{LS:[-47,-41,-44],LE:[133,0,0],RS:[77,10,17],RE:[118,0,0],T:[-14,52,-22],LH:[-22,0,-12],RH:[13,0,7]}),
  frame(.317,'sine',{LS:[54,-58,-48],LE:[102,0,0],RS:[80,10,17],RE:[115,0,0],T:[6,11,-4],LH:[-23,0,-12],RH:[14,0,7]}),
  frame(.350,'outCubic',{LS:[116,-74,-43],LE:[68,0,0],RS:[82,10,17],RE:[117,0,0],T:[22,-45,19],LH:[-25,0,-13],RH:[15,0,7]}),
  frame(.375,'outCubic',{LS:[134,-89,-41],LE:[56,0,0],RS:[84,12,18],RE:[118,0,0],T:[28,-63,25],LH:[-27,0,-14],RH:[17,0,8]}),
  frame(.460,'sine',{LS:[95,-52,-34],LE:[87,0,0],RS:[77,10,17],RE:[112,0,0],T:[17,-24,14]}),
  frame(.557,'sine',{LS:[33,-13,-16],LE:[68,0,0],RS:[38,7,13],RE:[67,0,0],T:[-4,16,-7]}),
  frame(.686,'sine',{RH:[111,22,21],RK:[-120,0,0],LH:[13,0,-19],LK:[-27,0,0],LS:[84,-10,-18],LE:[117,0,0],RS:[82,10,18],RE:[114,0,0],T:[-24,42,-23]}),
  frame(.792,'sine',{RH:[126,28,25],RK:[-117,0,0],LH:[14,0,-22],LK:[-29,0,0],LS:[88,-12,-18],LE:[121,0,0],RS:[83,12,18],RE:[117,0,0],T:[-30,50,-27]}),
  frame(.854,'outCubic',{RH:[116,30,26],RK:[-21,0,0],LH:[16,0,-22],LK:[-30,0,0],LS:[85,-11,-18],LE:[118,0,0],RS:[86,11,18],RE:[118,0,0],T:[-29,57,-28]}),
  frame(.900,'outCubic',{RH:[135,32,26],RK:[-2,0,0],LH:[16,0,-23],LK:[-30,0,0],LS:[88,-12,-18],LE:[118,0,0],RS:[88,12,18],RE:[118,0,0],T:[-32,65,-29]}),
  frame(.988,'sine',{RH:[112,22,22],RK:[-112,0,0],LH:[14,0,-20],LK:[-26,0,0],LS:[75,-9,-16],LE:[110,0,0],RS:[75,10,16],RE:[111,0,0],T:[-24,38,-21]}),
  frame(1.105,'sine',{RH:[53,7,10],RK:[-77,0,0],LH:[6,0,-11],LK:[-13,0,0],LS:[37,-5,-12],LE:[72,0,0],RS:[38,6,12],RE:[73,0,0],T:[-9,11,-8]}),
  frame(1.188,'sine',{RH:[15,2,5],RK:[-23,0,0],LH:[-3,0,-3],LS:[17,-3,-10],LE:[26,0,0],RS:[18,4,10],RE:[27,0,0],T:[-2,-2,-2]}),
  frame(1.25,'sine')
 ]}
};
