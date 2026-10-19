import { test, expect } from '@playwright/test';

test.skip(process.env.ADSENSE_LOCAL_PREVIEW !== '1','Only runs against the explicitly enabled local ad preview.');

test.beforeEach(async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',
    body:`window.adsbygoogle={push(){const node=document.querySelector('ins.adsbygoogle');if(node){node.dataset.adStatus='filled';queueMicrotask(()=>node.dataset.adStatus='filled');}}};`,
  }));
  await page.addInitScript(()=>{
    const events:unknown[] = [];
    Reflect.set(window,'adPreviewEvents',events);
    window.addEventListener('ninesolsmap:ad-banner-event',event=>{
      if (event instanceof CustomEvent) events.push(event.detail);
    });
  });
});

test('close records one event, frees the map, and resets on reload without cookies or storage',async({page,context})=>{
  await page.goto('/');
  await expect.poll(()=>page.evaluate(()=>Reflect.get(window,'adPreviewEvents').length)).toBe(3);
  await expect(page.locator('ins.adsbygoogle')).toHaveAttribute('data-adtest','on');
  const cookies = await context.cookies();
  await expect(page.locator('.local-ad-preview')).not.toContainText(/ADVERTISEMENT|LOCAL TEST|Google returned|Waiting/);
  await expect(page.getByRole('button',{name:'Hide ad until reload'})).toHaveText('×');
  const close = page.getByRole('button',{name:'Hide ad until reload'});
  const box = await close.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await close.click();
  await expect(page.locator('.local-ad-preview')).toHaveCount(0);
  const events = await page.evaluate(()=>Reflect.get(window,'adPreviewEvents'));
  const common = {ad_variant:'custom',ad_slot:'9790698796',ad_layout:'mobile',ad_request_id:expect.any(String),ms_since_request:expect.any(Number)};
  expect(events).toEqual([
    {event:'ad_banner_requested',properties:{...common,ad_status:'pending',was_shown:false}},
    {event:'ad_banner_result',properties:{...common,ad_status:'filled',was_shown:false}},
    {event:'ad_banner_shown',properties:{...common,ad_status:'filled',was_shown:true}},
    {event:'ad_banner_dismissed',properties:{...common,ad_status:'filled',was_shown:true,ms_since_shown:expect.any(Number)}},
  ]);
  expect(new Set(events.map((item:{properties:{ad_request_id:string}})=>item.properties.ad_request_id)).size).toBe(1);
  expect(await context.cookies()).toEqual(cookies);
  expect(await page.evaluate(()=>sessionStorage.getItem('ninesolsmap:ad-banner-dismissed'))).toBeNull();
  const map = await page.locator('#map').boundingBox();
  expect(map).not.toBeNull();
  expect((map?.y ?? 0)+(map?.height ?? 0)).toBeCloseTo(844,0);
  await page.reload();
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
  await expect(page.locator('.local-ad-preview')).toBeVisible();
  await expect.poll(()=>page.evaluate(()=>Reflect.get(window,'adPreviewEvents').length)).toBe(3);
  await page.goto('/zh-TW');
  await expect(page.locator('.local-ad-preview')).toBeVisible();
});

test('unfilled slot collapses without a false dismissal event',async({page})=>{
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:`window.adsbygoogle={push(){document.querySelector('ins.adsbygoogle').dataset.adStatus='unfilled';}};`,
  }));
  await page.goto('/');
  await expect(page.locator('.local-ad-preview')).toHaveAttribute('data-preview-status',/empty slot/);
  await expect(page.locator('.local-ad-preview')).toBeHidden();
  expect(await page.evaluate(()=>Reflect.get(window,'adPreviewEvents'))).toEqual([
    {event:'ad_banner_requested',properties:expect.objectContaining({ad_status:'pending',was_shown:false})},
    {event:'ad_banner_result',properties:expect.objectContaining({ad_status:'unfilled',was_shown:false})},
  ]);
});


test('blocked script records one failure event without a shown event',async({page})=>{
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.abort());
  await page.goto('/');
  await expect(page.locator('.local-ad-preview')).toHaveAttribute('data-preview-status',/blocked/);
  await expect(page.locator('.local-ad-preview')).toBeHidden();
  expect(await page.evaluate(()=>Reflect.get(window,'adPreviewEvents'))).toEqual([
    {event:'ad_banner_requested',properties:expect.objectContaining({ad_status:'pending'})},
    {event:'ad_banner_failed',properties:expect.objectContaining({ad_status:'error',failure_stage:'script',was_shown:false})},
  ]);
});

test('silent ad loader timeout collapses unused space',async({page})=>{
  await page.clock.install();
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:'window.adsbygoogle={push(){}};',
  }));
  await page.goto('/');
  await expect(page.locator('.local-ad-preview')).toBeVisible();
  await page.clock.fastForward(16000);
  await expect(page.locator('.local-ad-preview')).toBeHidden();
});
