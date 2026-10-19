import type {Obstacle} from './map.ts';
// Collision-matched additions for the Blender objects that are outside
// the original 204 arena-layout.json boxes. One immutable shared list is
// consumed on BOTH sides so clients don't ghost through server blockers.
//
// Only substantial objects are solid. Thin painted floor lines, signage text,
// tiny fasteners, lamp beams, and decorative seams remain non-colliding.
const boxes:Obstacle[]=[];
function add(id:string,x:number,y:number,z:number,w:number,h:number,d:number,material:Obstacle['material']='wood'){
 boxes.push({id,x,y,z,w,h,d,material});
}
for(const side of [-1,1]){
 // The three full-sized protective pads in each back corner form one solid
 // real-height obstacle, matching the stacked meshes in build_arena_v2.py.
 for(const z of [-31,31]){
  add('solid-field-pad-'+side+'-'+z,side*56,.83,z,1.05,1.66,1.9,'foam');
  add('solid-field-pad-cap-'+side+'-'+z,side*56,1.73,z,1.05,.16,1.9,'foam');
 }
 // The original warehouse's extra slatted floor pallets are real props;
 // their compact colliders must be the same on server and client.
 for(const z of [-24,30]){
  add('solid-floor-pallet-'+side+'-'+z,side*31.5,.105,z,1.36,.21,1.35);
 }
 // Raised storage-room doors are broad wood/metal barriers on the mezzanine
 // that previously existed ONLY in the Blender mesh.
 for(const z of [-26,3]){
  add('solid-upper-storage-door-'+side+'-'+z,side*52,6.78,z,3.7,3.0,.15,'metal');
 }
 // Structural competition gateway pieces block overhead BBs and any jumping
 // players, but the walkway and its approaches remain open.
 for(const z of [-12,12]){
  add('solid-entrance-rib-'+side+'-'+z,side*34,6.8,z,.50,4.5,.66,'metal');
 }
 add('solid-entrance-header-'+side,side*34,9.3,0,.64,1.40,26,'metal');
 for(const z of [-30,-14,6,17]){
  // These are mostly already inside the original mezz-support collision:
  // the gussets and bases protrude beyond the original 48cm support box.
  add('solid-mezzanine-gusset-'+side+'-'+z,side*44.3,3.52,z,.80,.38,1.35,'metal');
  add('solid-mezzanine-foot-'+side+'-'+z,side*44.3,.12,z,.74,.24,.74,'metal');
 }
}
// Hanging field banners are solid at their actual physical height, so BBs
// cannot travel through them even when looking up from a platform.
for(const x of [-21,-12,12,21]){
 add('solid-arena-banner-'+x,x,8,-33,5.5,2.7,.08,'metal');
}
for(const x of [-8,8]){
 add('solid-command-bulkhead-'+x,x,8.10,0,.34,2.8,18.2,'metal');
}
for(const z of [-10,10]){
 add('solid-command-overhead-rib-'+z,0,8,z,18,.38,.62,'metal');
}
add('solid-mezzanine-brand-panel',0,8.35,-22.1,20,1.45,.14,'metal');

// Return a fresh list of normal axis-aligned cuboids (meters). These are not
// extra client-only objects; the server and BB raycasts use identical data.
export const SOLID_SCENE_DETAILS:ReadonlyArray<Obstacle>=boxes;
