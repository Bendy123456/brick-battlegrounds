import {test,expect} from '@playwright/test';

test('artist-authored weapon pack loads and displays in real first-person play',async({page})=>{
 // Three live software-WebGL frames can exceed the generic 95s suite timeout.
 test.setTimeout(240000);
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
 await page.locator('#openLoadout').click();
 await expect(page.locator('#gripChoices button')).toHaveCount(2);
 await page.locator('#gripChoices button').first().click();
 await expect(page.locator('#gripChoices button').first()).toHaveAttribute('aria-pressed','true');
 await page.locator('#gripChoices button').last().click();
 await expect(page.locator('#gripChoices button').last()).toHaveAttribute('aria-pressed','true');
 await page.locator('#loadoutBack').click();
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:60000});
 await expect.poll(async()=>await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.()?.selectedViewmodel),
  {timeout:14000}).toBe(0);
 // Each gun has individual Blender-authored one/two-hand pose hierarchies.
 await expect.poll(async()=>await page.evaluate(
  ()=>(window as any).__AIRSOFT_DEBUG__?.()?.gripTwoHanded
 ),{timeout:10000}).toBe(true);
 await page.keyboard.press('KeyH');
 await expect.poll(async()=>await page.evaluate(
  ()=>(window as any).__AIRSOFT_DEBUG__?.()?.gripTwoHanded
 ),{timeout:10000}).toBe(false);
 await page.keyboard.press('KeyH');
 await expect.poll(async()=>await page.evaluate(
  ()=>(window as any).__AIRSOFT_DEBUG__?.()?.gripTwoHanded
 ),{timeout:10000}).toBe(true);
 // Shoot from a level, forward-looking camera; the old QA screenshot looked
 // almost straight up and could not reveal whether hands were touching the gun.
 for(const [index,label] of [[0,'vanguard'],[5,'breacher'],[7,'echo']] as const){
  await page.evaluate(()=>(window as any).__AIRSOFT_QA_RESET_VIEW__());
  await page.evaluate((weaponIndex)=>(window as any).__AIRSOFT_QA_EQUIP__(weaponIndex),index);
  await expect.poll(async()=>await page.evaluate(
    ()=>(window as any).__AIRSOFT_DEBUG__?.()?.selectedViewmodel
  ),{timeout:20000,intervals:[250,500,1000]}).toBe(index);
  await page.waitForTimeout(1300); // at least one frame in CI's software WebGL
  const image=await page.screenshot({type:'jpeg',quality:65,animations:'disabled'});
  console.log('GRIP_REVIEW_'+label.toUpperCase()+'_JPEG_BASE64='+image.toString('base64'));
 }
 expect(errors).toEqual([]);
});
