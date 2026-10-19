import { test, expect } from '@playwright/test';

test.skip(process.env.VERCEL_ENV !== 'production' || process.env.ADSENSE_LOCAL_PREVIEW === '1','Runs only when testing production banner wiring.');

test('production domain gets live ad mode and reload restores the closed banner',async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  // Serve the local app under its production hostname without contacting the live site.
  await page.route('https://ninesolsmap.com/**',async route=>{
    const target = new URL(route.request().url());
    target.protocol = 'http:';target.host = 'localhost:3100';
    await route.fulfill({response:await route.fetch({url:target.href})});
  });
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  let flagEnabled = true;
  await page.route('https://e.ninesolsmap.com/**',route=>route.request().url().includes('/flags/') ? route.fulfill({
    contentType:'application/json',body:JSON.stringify({featureFlags:{'ad-banner-enabled':flagEnabled},featureFlagPayloads:{}}),
  }) : route.abort());
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:`window.adsbygoogle={push(){document.querySelector('ins.adsbygoogle').dataset.adStatus='filled';}};`,
  }));
  await page.goto('https://ninesolsmap.com/');
  const banner = page.getByRole('region',{name:'Advertisement',exact:true});
  await expect(banner).toBeVisible();
  await expect(banner.locator('ins')).toHaveAttribute('data-ad-status','filled');
  await expect(banner.locator('ins')).not.toHaveAttribute('data-adtest');
  await expect(banner.locator('ins')).toHaveAttribute('data-ad-slot','9790698796');
  await page.getByRole('button',{name:'Hide ad until reload'}).click();
  await expect(banner).toHaveCount(0);
  await page.reload();
  await expect(banner).toBeVisible();
  flagEnabled = false;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(banner).toHaveCount(0);
  await page.goto('https://ninesolsmap.com/about');
  await expect(banner).toHaveCount(0);
});

for (const mode of ['off','missing','failed'] as const) test(`production flag ${mode} does not load ads`,async({page})=>{
  await page.route('https://ninesolsmap.com/**',async route=>{
    const target = new URL(route.request().url());target.protocol='http:';target.host='localhost:3100';
    await route.fulfill({response:await route.fetch({url:target.href})});
  });
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  let flagsRequested = false;
  await page.route('https://e.ninesolsmap.com/**',route=>{
    if (!route.request().url().includes('/flags/')) return route.abort();
    flagsRequested = true;
    return mode === 'failed' ? route.abort() : route.fulfill({contentType:'application/json',
      body:JSON.stringify({featureFlags:mode === 'missing' ? {} : {'ad-banner-enabled':false},featureFlagPayloads:{}})});
  });
  const adRequests:string[] = [];
  await page.route('https://pagead2.googlesyndication.com/**',route=>{adRequests.push(route.request().url());return route.abort();});
  await page.goto('https://ninesolsmap.com/');
  await expect.poll(()=>flagsRequested).toBe(true);
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0);
  expect(adRequests).toEqual([]);
});
