import {test,expect} from '@playwright/test';

test('artist-authored weapon pack loads and displays in real first-person play',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:960,height:540});
 await page.goto('/?debug=1');
 await expect.poll(async()=>{
  const s=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return s?.weaponModelCount;
 },{timeout:90000,intervals:[500,1000,2000]}).toBe(9);
 const loaded=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 expect(loaded.failedWeaponModels).toEqual([]);
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:60000});
 await expect.poll(async()=>await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.()?.selectedViewmodel),
  {timeout:14000}).toBe(0);
 const image=await page.screenshot({type:'jpeg',quality:24,animations:'disabled'});
 console.log('AUTHORED_FPS_SCREENSHOT_JPEG_BASE64='+image.toString('base64'));
 expect(errors).toEqual([]);
});
