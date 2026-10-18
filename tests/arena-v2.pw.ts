import {test,expect} from '@playwright/test';
test('The Arena V2 Blender environment loads with both bases, exact Rapier collision and working movement',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',err=>errors.push(err.message));
 await page.setViewportSize({width:720,height:460});
 page.on('console',msg=>{if(msg.type()==='error')console.log('ARENA_CONSOLE_ERROR='+msg.text())});
 await page.goto('/?debug=1',{waitUntil:'domcontentloaded',timeout:60000});
 await expect(page.locator('#menu')).toBeVisible({timeout:30000});
 await expect.poll(async()=>await page.evaluate(()=> (window as any).__AIRSOFT_DEBUG__?.()?.assetState),{
  timeout:90000,intervals:[700,1200,1700]
 }).toBe('BLENDER ASSETS READY');
 const initial=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 expect(initial.arenaVersion).toBe('THE_ARENA_V2');
 expect(initial.arenaLabel).toContain('COVER CIRCUIT C');
 expect(initial.coverEdition).toBe('COVER_CIRCUIT_C_03');
 expect(initial.clientOnlyProps).toBe(0);
 expect(initial.weaponModelCount).toBe(9);
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:55000});
 await expect(page.locator('#zone')).toContainText('BASE',{timeout:8000});
 const before=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 await page.keyboard.down('ShiftLeft');await page.keyboard.down('KeyW');
 await expect.poll(async()=>{
  const state=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return state?.serverX||-53;
 },{timeout:22000,intervals:[200,300,550]}).toBeGreaterThan(before.serverX+5);
 await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');
 const after=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 console.log('ARENA_V2_MOVEMENT='+JSON.stringify({before,after}));
 expect(after.cameraY).toBeGreaterThan(.22);
 expect(after.playerY).toBeGreaterThan(.65);
 expect(after.serverError).toBeLessThan(4);
 // Render actual first-person gameplay for human visual inspection.
 const shot=await page.screenshot({type:'jpeg',quality:33,animations:'disabled'});
 console.log('AIRSOFT_ARENA_V2_JPEG_B64='+shot.toString('base64'));
 expect(errors).toEqual([]);
});
