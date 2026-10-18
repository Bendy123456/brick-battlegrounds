import {test,expect} from '@playwright/test';
test('main menu loads and VS BOT starts an actual match',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('#menu')).toBeVisible();
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:25000});
 await expect(page.locator('#health')).toHaveText(/^(100|[1-9][0-9]?)$/);
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
 await page.setViewportSize({width:800,height:500});
 await page.goto('/?debug=1');
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:45000});
 // Capture the level itself before match results or menus obscure the screen.
 const arenaScreenshot=await page.screenshot({type:'jpeg',quality:32,animations:'disabled'});
 console.log('AIRSOFT_ARENA_JPEG_B64='+arenaScreenshot.toString('base64'));
 // Simulate actual player controls and allow server to advance authoritative ticks.
 await page.keyboard.down('KeyW');
 await page.waitForTimeout(850);
 await page.keyboard.up('KeyW');
 // Keep the camera level during the firing test; excessive pointer movement looks at the ceiling.
 await page.mouse.down({button:'right'});
 await page.waitForTimeout(250);
 await page.mouse.up({button:'right'});
 await page.mouse.down({button:'left'});
 await page.waitForTimeout(2300);
 // Capture test state while fire is still held, not after all input is released.
 const firingState=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 console.log('PLAYTEST_STATE='+JSON.stringify(firingState));
 expect(firingState?.ready).toBe(true);
 expect(firingState?.localAmmo).toBeLessThan(30);
 await page.mouse.up({button:'left'});
 const screenshot=await page.screenshot({type:'jpeg',quality:34,animations:'disabled'});
 console.log('AIRSOFT_VISUAL_JPEG_B64='+screenshot.toString('base64'));
 console.log('PLAYTEST_RENDER_STATS='+await page.locator('#debug').innerText());
 // Do not inspect ammo after screenshot capture: the bot may tag / respawn the player in between.
 expect(errors).toEqual([]);
});

test('sprinting stays above the modeled collision floor even at reduced render FPS',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:1000,height:650});
 await page.goto('/?debug=1');
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:45000});
 await page.keyboard.down('ShiftLeft');
 await page.keyboard.down('KeyW');
 // Sustained full-speed running through the modeled Blender floor.
 await expect.poll(async()=>{
  const state=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return state?.velocity||0;
 },{timeout:18000,intervals:[200,400,500]}).toBeGreaterThan(7);
 const before=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 console.log('SPRINT_BEFORE='+JSON.stringify(before));
 expect(before.ready).toBe(true);
 expect(before.playerY).toBeGreaterThan(.65);
 expect(before.cameraY).toBeGreaterThan(.25);
 expect(Number.isFinite(before.renderFPS)).toBe(true);
 // Headless SwiftShader can run around 3fps and reach an outer wall before
 // it can process the next input. Slide/cooldown behavior is tested in Vitest;
 // the browser test verifies camera-floor clearance during sustained sprint.
 expect(before.serverError).toBeLessThan(3.6);
 console.log('RUNNING_FLOOR_OK='+JSON.stringify({cameraY:before.cameraY,rootY:before.playerY,fps:before.renderFPS,asset:before.assetState}));
 await page.keyboard.up('KeyW');
 await page.keyboard.up('ShiftLeft');
 expect(errors).toEqual([]);
});

test('Blender arena uses shared collision only and slow-render movement keeps camera above floor',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:800,height:500});
 await page.goto('/?debug=1');
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:55000});
 await expect.poll(async()=>{
  const s=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return s?.assetState;
 },{timeout:18000}).toBe('BLENDER ASSETS READY');
 const initial=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 expect(initial.clientOnlyProps).toBe(0);
 expect(initial.shadowMapEnabled).toBe(false);
 await page.keyboard.down('KeyW');
 await page.waitForTimeout(2600);
 const later=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 await page.keyboard.up('KeyW');
 console.log('FLOOR_WALK_DIAGNOSTICS='+JSON.stringify({initial,later}));
 expect(later.cameraY).toBeGreaterThan(.20);
 expect(later.playerY).toBeGreaterThan(.65);
 expect(later.clientOnlyProps).toBe(0);
 expect(later.shadowMapEnabled).toBe(false);
 if(later.lowFpsMode){
  expect(later.serverError).toBeLessThan(2);
  expect(Math.abs(later.playerX-later.serverX)).toBeLessThan(1);
  expect(Math.abs(later.playerZ-later.serverZ)).toBeLessThan(1);
 }
 expect(errors).toEqual([]);
});

test('render throttling does not starve authoritative sprint input packets',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:650,height:390});
 // Render a maximum of 2fps, but allow normal browser timers and sockets.
 // The old code sent movement only in requestAnimationFrame, causing an
 // input timeout and the server repeatedly stopping the sprint.
 await page.addInitScript(()=>{
  const native=requestAnimationFrame.bind(window);
  window.requestAnimationFrame=(cb:FrameRequestCallback)=>{
   return window.setTimeout(()=>native(cb),430) as unknown as number;
  };
 });
 await page.goto('/?debug=1');
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:55000});
 await expect.poll(async()=>{
  const d=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return d?.ackSeq||0;
 },{timeout:14000}).toBeGreaterThan(0);
 const before=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 await page.keyboard.down('ShiftLeft');
 await page.keyboard.down('KeyW');
 await page.waitForTimeout(2400);
 const after=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 await page.keyboard.up('KeyW');
 await page.keyboard.up('ShiftLeft');
 console.log('THROTTLED_INPUT='+JSON.stringify({before,after}));
 expect(after.ready).toBe(true);
 expect(after.ackSeq).toBeGreaterThan(before.ackSeq+10);
 expect(after.inputAgeMs).toBeLessThan(600);
 const distance=Math.hypot(after.serverX-before.serverX,after.serverZ-before.serverZ);
 // Cover Circuit C intentionally places an impact-rated plywood bunker
 // ~6m ahead of red spawn. The authoritative runner should advance to it
 // even when requestAnimationFrame is throttled, then stop at its collider.
 // The former >9m expectation predated the protective cover.
 expect(distance).toBeGreaterThan(4.8);
 expect(distance).toBeLessThan(6.5);
 expect(after.serverX).toBeGreaterThan(-49);
 expect(after.serverX).toBeLessThan(-47.25);
 expect(after.cameraY).toBeGreaterThan(.2);
 expect(errors).toEqual([]);
});

test('all nine distinct Blender weapons load and loadout selection uses selected model',async({page})=>{
 const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
 await page.setViewportSize({width:860,height:525});
 await page.goto('/?debug=1');
 await expect.poll(async()=>{
  const d=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return d?.weaponModelCount??-1;
 },{timeout:65000,intervals:[300,700,1000]}).toBe(9);
 const state=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
 expect(state.assetState).toBe('BLENDER ASSETS READY');
 expect(state.failedWeaponModels).toEqual([]);
 expect(new Set(state.weaponModelIds).size).toBe(9);
 await page.locator('#openLoadout').click();
 const choices=page.locator('#loadoutButtons button');
 await expect(choices).toHaveCount(9);
 for(let i=0;i<9;i++){
  await choices.nth(i).click();
  await expect(choices.nth(i)).toHaveClass(/selected/);
 }
 await page.locator('#loadoutBack').click();
 await page.locator('#vsBot').click();
 await expect(page.locator('#hud')).toBeVisible({timeout:55000});
 await expect.poll(async()=>{
  const d=await page.evaluate(()=>(window as any).__AIRSOFT_DEBUG__?.());
  return d?.selectedViewmodel;
 },{timeout:16000}).toBe(8);
 // Capture the real first-person rendering of the distinct Tempo sidearm.
 const pistolFrame=await page.screenshot({type:'jpeg',quality:32,animations:'disabled'});
 console.log('AIRSOFT_TEMPO_JPEG_B64='+pistolFrame.toString('base64'));
 expect(errors).toEqual([]);
});


test('new menu illustrations load and every menu action has interactive hover styling',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',error=>errors.push(error.message));
 await page.goto('/');
 await expect(page.locator('#menu')).toBeVisible();
 for(const id of ['vsBot','quick','private']){
  const button=page.locator('#'+id);
  await expect(button).toBeVisible();
  const illustration=button.locator('img.bb-card-art');
  await expect(illustration).toHaveJSProperty('complete',true);
  expect(await illustration.evaluate((img:HTMLImageElement)=>img.naturalWidth)).toBeGreaterThan(0);
  await button.hover();
  await expect(button).toHaveCSS('cursor','pointer');
  expect(await button.evaluate(el=>el.matches(':hover'))).toBe(true);
  expect(await button.evaluate(el=>getComputedStyle(el).transitionProperty)).toContain('transform');
 }
 for(const id of ['join','openSettings','openLoadout']){
  const button=page.locator('#'+id);
  await expect(button).toBeVisible();
  await button.hover();
  await expect(button).toHaveCSS('cursor','pointer');
 }
 await page.locator('#openLoadout').click();
 await expect(page.locator('#loadout')).toBeVisible();
 await page.locator('#loadoutBack').click();
 await page.locator('#openSettings').click();
 await expect(page.locator('#settings')).toBeVisible();
 await page.locator('#settingsBack').click();
 await expect(page.locator('#menu')).toBeVisible();
 expect(errors).toEqual([]);
});
