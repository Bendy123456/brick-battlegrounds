import {test,expect} from '@playwright/test';

test('FartNite opens as the active game with an original battle royale menu',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page).toHaveTitle(/FartNite/);
 await expect(page.locator('#home')).toBeVisible();
 await expect(page.locator('#play')).toHaveText(/READY!/);
 await expect(page.locator('#world canvas')).toBeVisible();
 await page.waitForTimeout(900);
 await page.screenshot({path:'artifacts/fartnite-lobby.png',animations:'disabled'});
 await page.locator('#how').click();
 await expect(page.locator('#instructions')).toBeVisible();
 await expect(page.locator('#instructions')).toContainText('BUILDING');
 await page.locator('#backFromHow').click();
 await expect(page.locator('#home')).toBeVisible();
 expect(errors).toEqual([]);
});

test('solo match starts, renders the HUD, toggles building, map and pause',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await page.locator('#play').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.waitForTimeout(1100);
 await page.screenshot({path:'artifacts/fartnite-glider-gameplay.png',animations:'disabled'});
 await expect(page.locator('#aliveText')).toHaveText('20');
 await expect(page.locator('#hotbar .slot')).toHaveCount(6);
 await page.keyboard.press('KeyV');
 await expect(page.locator('#buildBar')).toBeVisible();
 await page.screenshot({path:'artifacts/fartnite-build-ui.png',animations:'disabled'});
 await page.keyboard.press('KeyG');
 await expect(page.locator('#buildChoice')).toHaveText('RAMP');
 await page.keyboard.press('KeyV');
 await expect(page.locator('#buildBar')).toBeHidden();
 await page.keyboard.press('KeyM');
 await expect(page.locator('#bigmap')).toBeVisible();
 await expect(page.locator('#fullmap')).toBeVisible();
 await page.screenshot({path:'artifacts/fartnite-map.png',animations:'disabled'});
 await page.locator('#closeMap').click();
 await expect(page.locator('#hud')).toBeVisible();
 await page.keyboard.press('Escape');
 await expect(page.locator('#pause')).toBeVisible();
 await page.locator('#resume').click();
 await expect(page.locator('#hud')).toBeVisible();
 expect(errors).toEqual([]);
});


test('classic position lobby tabs, usable locker, mode and persistence',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 await expect(page.locator('.fn-nav [data-tab]')).toHaveCount(8);
 await expect(page.locator('.fn-progression')).toBeVisible();
 await expect(page.locator('.fn-ready')).toBeVisible();
 await expect(page.locator('#fnSkinName')).toBeVisible();
 await page.screenshot({path:'artifacts/fartnite-classic-lobby.png',animations:'disabled'});
 await page.locator('[data-tab="LOCKER"]').click();
 await expect(page.locator('#fnPanelHeading')).toHaveText('LOCKER');
 await expect(page.locator('[data-skin]')).toHaveCount(25);
 await page.locator('[data-skin="2"]').click();
 await expect(page.locator('.fn-scout-tile.selected')).toContainText('TIDAL SCOUT');
 await page.locator('[data-tab="SHOP"]').click();
 await expect(page.locator('#fnPanelHeading')).toHaveText('SHOP');
 await expect(page.locator('.fn-shop-card')).toHaveCount(4);
 await expect(page.locator('.fn-shop-skin')).toHaveCount(17);
 await page.locator('[data-tab="PASS"]').click();
 await expect(page.locator('.fn-pass-row')).toHaveCount(5);
 await page.locator('[data-tab="CHALLENGES"]').click();
 await expect(page.locator('.fn-mission')).toHaveCount(6);
 await page.locator('[data-tab="PROFILE"]').click();
 await expect(page.locator('.fn-profile-lead')).toContainText('TIDAL SCOUT');
 await page.locator('[data-tab="LEADERBOARDS"]').click();
 await expect(page.locator('.fn-empty-state')).toBeVisible();
 await page.locator('[data-tab="SETTINGS"]').click();
 await expect(page.locator('[data-setting]')).toHaveCount(3);
 await page.locator('[data-setting="stats"]').uncheck();
 await page.reload();
 await page.locator('[data-tab="LOCKER"]').click();
 await expect(page.locator('.fn-scout-tile.selected')).toContainText('TIDAL SCOUT');
 await page.locator('[data-tab="SETTINGS"]').click();
 await expect(page.locator('[data-setting="stats"]')).not.toBeChecked();
 await page.locator('#fnClose').click();
 await page.locator('#fnChangeMode').click();
 await expect(page.locator('#fnModeTitle')).toHaveText('SCOUT TRAINING');
 await page.locator('#play').click();
 await expect(page.locator('#hud')).toBeVisible();
 await expect(page.locator('#aliveText')).toHaveText('10');
 expect(errors).toEqual([]);
});


test('all 25 detailed 3D cosmetics appear and a purchased skin equips in both lobby and gameplay',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 const names=await page.evaluate(()=>(window as any).__FARTNITE_ART_QA__?.().characterSkins||[]);
 expect(names).toHaveLength(25);
 await page.locator('[data-tab="LOCKER"]').click();
 await expect(page.locator('[data-skin]')).toHaveCount(25);
 await expect(page.locator('.fn-scout-tile.locked')).toHaveCount(17);
 await expect(page.locator('.fn-skin-portrait .fn-actual-model-thumbnail')).toHaveCount(25,{timeout:30000});
 await page.screenshot({path:'artifacts/fartnite-25-skin-locker.png',animations:'disabled'});
 await expect(page.locator('.fn-scout-tile:not(.locked)')).toHaveCount(8);
 await page.locator('[data-skin="8"]').click();
 await expect(page.locator('#fnNotice')).toContainText('UNLOCK IN SUPPLY SHOP');
 await page.evaluate(()=>{
  const k='fartnite_lobby_season_zero_v1';
  const o=JSON.parse(localStorage.getItem(k)||'{}');o.credits=1000;
  localStorage.setItem(k,JSON.stringify(o))
 });
 await page.reload();
 await page.locator('[data-tab="SHOP"]').click();
 await expect(page.locator('.fn-shop-skin')).toHaveCount(17);
 await expect(page.locator('.fn-skin-shop-avatar .fn-actual-model-thumbnail')).toHaveCount(17,{timeout:30000});
 await page.screenshot({path:'artifacts/fartnite-17-skin-shop.png',animations:'disabled'});
 await page.locator('[data-buy-skin="8"]').click();
 await page.locator('[data-tab="LOCKER"]').click();
 await expect(page.locator('.fn-scout-tile:not(.locked)')).toHaveCount(9);
 await page.locator('[data-skin="8"]').click();
 await expect(page.locator('.fn-scout-tile.selected')).toContainText('NEON FRONTIER');
 await page.reload();
 await expect(page.locator('#fnSkinName')).toHaveText('NEON FRONTIER');
 await page.waitForTimeout(600);
 await page.screenshot({path:'artifacts/fartnite-neon-frontier-on-stage.png',animations:'disabled'});
 await page.locator('#play').click();
 await expect(page.locator('#hud')).toBeVisible();
 const live=await page.evaluate(()=>(window as any).__FARTNITE_ART_QA__?.());
 expect(live?.activeSkin).toBe('Neon Frontier');
 expect(errors).toEqual([]);
});


test('solo lobby shows no fake party members; actual joins and leaves control side characters',async({browser})=>{
 const hostContext=await browser.newContext();
 const guestContext=await browser.newContext();
 const guest2Context=await browser.newContext();
 const host=await hostContext.newPage();
 const guest=await guestContext.newPage();
 const guest2=await guest2Context.newPage();
 const errors:string[]=[];
 for(const p of [host,guest,guest2])p.on('pageerror',e=>errors.push(e.message));
 try{
  await host.goto('/');
  await expect(host.locator('#fnPartyStatus')).toHaveText('ALONE IN LOBBY');
  await expect(host.locator('#fnPartyLeft')).toBeHidden();
  await expect(host.locator('#fnPartyRight')).toBeHidden();
  await expect(host.locator('#play')).toBeEnabled();
  await expect.poll(()=>host.evaluate(()=>(window as any).__FARTNITE_ART_QA__().partyMemberCount)).toBe(1);
  await host.screenshot({path:'artifacts/fartnite-solo-only-player.png',animations:'disabled'});

  await host.locator('#fnPlayerName').fill('Host Scout');
  await host.locator('#fnCreateParty').click();
  await expect(host.locator('#fnPartyStatus')).toHaveText('YOUR PARTY');
  await expect(host.locator('#fnPartyCount')).toHaveText('1 / 3');
  const code=(await host.locator('#fnPartyCode').textContent())?.trim()||'';
  expect(code).toMatch(/^[A-F0-9]{6}$/);
  await expect(host.locator('#fnPartyLeft')).toBeHidden();

  await guest.goto('/');
  await guest.locator('#fnPlayerName').fill('Guest One');
  await guest.locator('#fnJoinCode').fill(code);
  await guest.locator('#fnJoinParty').click();
  await expect(host.locator('#fnPartyCount')).toHaveText('2 / 3');
  await expect(host.locator('#fnPartyLeftName')).toHaveText('Guest One');
  await expect(host.locator('#fnPartyLeft')).toBeVisible();
  await expect(host.locator('#fnPartyRight')).toBeHidden();
  await expect(guest.locator('#fnPartyLeftName')).toHaveText('Host Scout');
  await expect(host.locator('#play')).toBeDisabled();
  await host.screenshot({path:'artifacts/fartnite-two-real-party-members.png',animations:'disabled'});

  await guest2.goto('/');
  await guest2.locator('#fnPlayerName').fill('Guest Two');
  await guest2.locator('#fnJoinCode').fill(code);
  await guest2.locator('#fnJoinParty').click();
  await expect(host.locator('#fnPartyCount')).toHaveText('3 / 3');
  await expect(host.locator('#fnPartyRightName')).toHaveText('Guest Two');
  await expect(host.locator('#fnPartyRight')).toBeVisible();
  await host.screenshot({path:'artifacts/fartnite-three-real-party-members.png',animations:'disabled'});

  await guest.locator('#fnLeaveParty').click();
  await expect(host.locator('#fnPartyCount')).toHaveText('2 / 3');
  await expect(host.locator('#fnPartyLeftName')).toHaveText('Guest Two');
  await expect(host.locator('#fnPartyRight')).toBeHidden();
  await host.locator('#fnLeaveParty').click();
  await expect(guest2.locator('#fnPartyStatus')).toHaveText('ALONE IN LOBBY');
  await expect(host.locator('#fnPartyLeft')).toBeHidden();
  await expect(host.locator('#play')).toBeEnabled();
  expect(errors).toEqual([]);
 }finally{
  await Promise.all([hostContext.close(),guestContext.close(),guest2Context.close()]);
 }
});


test('new smooth mannequin body base carries across both genders and into gameplay',async({page})=>{
 const errors:string[]=[];
 page.on('pageerror',e=>errors.push(e.message));
 await page.goto('/');
 // Showcase a bare, featureless male humanoid mannequin.
 await page.locator('[data-tab="LOCKER"]').click();
 await page.locator('[data-skin="1"]').click();
 await page.locator('#fnClose').click();
 await expect(page.locator('#fnSkinName')).toHaveText('COPPER COURIER');
 await expect.poll(()=>page.evaluate(()=>(window as any).__FARTNITE_ART_QA__?.().bodyGender)).toBe('male');
 await page.screenshot({path:'artifacts/fartnite-smooth-male-body.png',animations:'disabled'});
 // Female mannequin remains featureless, with a distinct body template.
 await page.locator('[data-tab="LOCKER"]').click();
 await page.locator('[data-skin="0"]').click();
 await page.locator('#fnClose').click();
 await expect.poll(()=>page.evaluate(()=>(window as any).__FARTNITE_ART_QA__?.().bodyGender)).toBe('female');
 await page.screenshot({path:'artifacts/fartnite-smooth-female-body.png',animations:'disabled'});
 await page.locator('#play').click();
 await expect(page.locator('#hud')).toBeVisible();
 const body=await page.evaluate(()=>(window as any).__FARTNITE_ART_QA__?.().bodyBase);
 expect(body).toBe('blank-humanoid-v3');
 expect(errors).toEqual([]);
});
