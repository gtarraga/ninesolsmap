import { test, expect } from '@playwright/test';

test.skip(process.env.VERCEL_ENV !== 'production' || process.env.ADSENSE_LOCAL_PREVIEW === '1','Runs only against production ad wiring.');

test.beforeEach(async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  await page.route('https://ninesolsmap.com/**',async route=>{
    const target=new URL(route.request().url());target.protocol='http:';target.host='localhost:3100';
    await route.fulfill({response:await route.fetch({url:target.href})});
  });
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:`window.adsbygoogle={push(){const node=document.querySelector('ins.adsbygoogle');if(node)node.dataset.adStatus='filled';}};`,
  }));
});

test('custom assignment loads only manual unit, closes until reload, and respects off',async({page})=>{
  let variant:string|boolean='custom';
  await page.route('https://e.ninesolsmap.com/**',route=>route.request().url().includes('/flags/') ? route.fulfill({
    contentType:'application/json',body:JSON.stringify({featureFlags:{'ad-banner-enabled':variant},featureFlagPayloads:{}}),
  }) : route.abort());
  await page.goto('https://ninesolsmap.com/');
  const banner=page.getByRole('region',{name:'Advertisement',exact:true});
  await expect(banner).toBeVisible();
  await expect(banner.locator('ins')).toHaveAttribute('data-ad-status','filled');
  await expect(banner.locator('ins')).not.toHaveAttribute('data-adtest');
  await expect(page.locator('#adsense-banner')).not.toHaveAttribute('data-overlays');
  await expect(page.locator('#adsense-google-anchor')).toHaveCount(0);
  await page.getByRole('button',{name:'Hide ad until reload'}).click();
  await expect(banner).toHaveCount(0);
  await page.reload();
  await expect(banner).toBeVisible();
  variant='google-anchor';
  const refresh=page.waitForResponse(response=>response.url().includes('/flags/'));
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));await refresh;
  await expect(banner).toBeVisible();
  await expect(page.locator('#adsense-google-anchor')).toHaveCount(0);
  variant=false;
  await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
  await expect(banner).toHaveCount(0);
  await page.goto('https://ninesolsmap.com/about');
  await expect(banner).toHaveCount(0);
});

test('Google assignment loads only regular bottom anchor with no manual unit',async({page})=>{
  await page.route('https://e.ninesolsmap.com/**',route=>route.request().url().includes('/flags/') ? route.fulfill({
    contentType:'application/json',body:JSON.stringify({featureFlags:{'ad-banner-enabled':'google-anchor'},featureFlagPayloads:{}}),
  }) : route.abort());
  let requests=0;page.on('request',request=>{if(request.url().includes('/pagead/js/adsbygoogle.js'))requests++;});
  await page.goto('https://ninesolsmap.com/');
  await expect(page.locator('#adsense-google-anchor')).toHaveAttribute('data-overlays','collapsed-bottom');
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0);
  await expect(page.locator('.local-ad-close')).toHaveCount(0);
  await expect(page.locator('#adsense-banner')).toHaveCount(0);
  expect(requests).toBe(1);
});

for(const mode of ['off','missing','invalid','failed'] as const) test(`${mode} flag does not load ads or honor old tester URLs`,async({page})=>{
  let evaluated=false;
  await page.route('https://e.ninesolsmap.com/**',route=>{
    if(!route.request().url().includes('/flags/'))return route.abort();
    evaluated=true;
    return mode==='failed' ? route.abort() : route.fulfill({contentType:'application/json',body:JSON.stringify({
      featureFlags:mode==='missing' ? {} : {'ad-banner-enabled':mode==='invalid' ? 'unexpected' : false},featureFlagPayloads:{},
    })});
  });
  const requests:string[]=[];
  await page.route('https://pagead2.googlesyndication.com/**',route=>{requests.push(route.request().url());return route.abort();});
  await page.goto('https://ninesolsmap.com/?ads-test=on');
  await expect.poll(()=>evaluated).toBe(true);
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
  await expect(page.locator('ins.adsbygoogle')).toHaveCount(0);
  expect(requests).toEqual([]);
});
