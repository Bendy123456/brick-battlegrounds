import {test,expect} from '@playwright/test';
test('main menu loads and VS BOT starts an actual match',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('#menu')).toBeVisible();
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:25000});
 await expect(page.locator('#health')).toContainText('100');
 await expect(page.locator('#ammo')).toContainText('/');
 expect(errors).toEqual([]);
});
test('keyboard binding can be edited and stored',async({page})=>{
 await page.goto('/');
 await page.locator('#openSettings').click();
 const first=page.locator('.binding button').first();
 await expect(first).toBeVisible();
 await first.click();
 await page.keyboard.press('KeyJ');
 await expect(page.locator('.binding button').first()).toHaveText('J');
 const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('airsoft_binds')||'{}'));
 expect(persisted.forward).toBe('KeyJ');
 await page.locator('#settingsBack').click();
 await expect(page.locator('#menu')).toBeVisible();
});
test('private online match connects two browsers',async({browser})=>{
 const c1=await browser.newContext(),c2=await browser.newContext();
 const a=await c1.newPage(),b=await c2.newPage();
 try{
  await a.goto('/');await b.goto('/');
  await a.locator('#private').click();
  await expect(a.locator('#waitTitle')).toHaveText(/^ROOM [A-Z0-9]{6}$/, {timeout:15000});
  const match=(await a.locator('#waitTitle').textContent())?.match(/[A-Z0-9]{6}$/);
  expect(match).toBeTruthy();
  await b.locator('#roomCode').fill(match![0]);
  await b.locator('#join').click();
  await expect(a.locator('#hud')).toBeVisible({timeout:20000});
  await expect(b.locator('#hud')).toBeVisible({timeout:20000});
  await expect(a.locator('#score')).toContainText('0');
  await expect(b.locator('#score')).toContainText('0');
 }finally{await c1.close();await c2.close()}
});

test('actually enter arena, move, aim and shoot in a bot match',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1100,height:680});
 await page.goto('/');
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:30000});
 // Simulate actual player controls and allow server to advance authoritative ticks.
 await page.keyboard.down('KeyW');
 await page.waitForTimeout(850);
 await page.keyboard.up('KeyW');
 await page.mouse.move(610,326);
 await page.mouse.down({button:'right'});
 await page.waitForTimeout(250);
 await page.mouse.up({button:'right'});
 await page.mouse.down({button:'left'});
 await page.waitForTimeout(900);
 await page.mouse.up({button:'left'});
 await expect.poll(async()=>await page.locator('#ammo').innerText(),{timeout:8000}).not.toMatch(/^30\\s*\\/\\s*30/);
 await page.waitForTimeout(700);
 // A compressed screenshot is emitted into CI logs for visual evaluation.
 const screenshot=await page.screenshot({type:'jpeg',quality:32,animations:'disabled'});
 console.log('AIRSOFT_VISUAL_JPEG_B64='+screenshot.toString('base64'));
 const debug=await page.locator('#debug').innerText();
 console.log('PLAYTEST_RENDER_STATS='+debug);
 expect(errors).toEqual([]);
});
