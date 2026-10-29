import { test, expect } from '@playwright/test';

test.skip(process.env.VERCEL_ENV !== 'production' || process.env.ADSENSE_LOCAL_PREVIEW === '1','Runs only against production ad wiring.');

test.use({userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1'});

test.afterEach(async({page})=>{await page.unrouteAll({behavior:'wait'});});

test.beforeEach(async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  // Match Safari's browser hints as well as its user agent for SDK bot filtering.
  await page.addInitScript(()=>{
    Object.defineProperty(navigator,'userAgentData',{get:()=>undefined});
    Object.defineProperty(navigator,'webdriver',{get:()=>false});
  });
  await page.route('https://ninesolsmap.com/**',async route=>{
    const target=new URL(route.request().url());target.protocol='http:';target.host='localhost:3100';
    await route.fulfill({response:await route.fetch({url:target.href})});
  });
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  await page.route('https://e.ninesolsmap.com/**',route=>route.fulfill({contentType:'application/json',body:'{}'}));
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:'window.adsbygoogle=[];',
  }));
});

for(const viewport of [{width:390,height:844},{width:1440,height:900}]) {
  test(`${viewport.width}px: loads only Google bottom anchor without flag requests, including after focus and a minute`,async({page})=>{
    await page.setViewportSize(viewport);
    await page.clock.install();
    const flagRequests:string[]=[];
    const analyticsRequests:string[]=[];
    let adRequests=0;
    page.on('request',request=>{
      const url=new URL(request.url());
      if(url.hostname==='e.ninesolsmap.com') {
        if(url.pathname.includes('/flags') || url.pathname.includes('/decide'))flagRequests.push(url.href);
        if(url.pathname==='/e/' || url.pathname.includes('/i/v0/e'))analyticsRequests.push(url.href);
      }
      if(url.hostname==='pagead2.googlesyndication.com' && url.pathname.includes('/pagead/js/'))adRequests++;
    });
    await Promise.all([
      page.waitForResponse(response=>response.url().endsWith('/config')),
      page.goto('https://ninesolsmap.com/'),
    ]);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    await expect(page.locator('#adsense-google-anchor')).toHaveAttribute('data-overlays','collapsed-bottom');
    await expect(page.locator('ins.adsbygoogle,#adsense-banner,.local-ad-close')).toHaveCount(0);
    await page.evaluate(()=>window.dispatchEvent(new Event('focus')));
    await page.clock.runFor(5000);
    await page.clock.fastForward(65000);
    await expect.poll(()=>analyticsRequests.length).toBeGreaterThan(0);
    expect(flagRequests).toEqual([]);
    expect(adRequests).toBe(1);
  });
}

for(const path of ['/about','/privacy','/locations','/zh-TW/about']) {
  test(`${path}: no ad loader on content pages`,async({page})=>{
    const requests:string[]=[];
    page.on('request',request=>{if(request.url().includes('pagead2.googlesyndication.com'))requests.push(request.url());});
    await page.goto(`https://ninesolsmap.com${path}`);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page.locator('#adsense-google-anchor,ins.adsbygoogle')).toHaveCount(0);
    expect(requests).toEqual([]);
  });
}

test('blocked Google script leaves the map usable without an empty banner strip',async({page})=>{
  await page.route('https://pagead2.googlesyndication.com/**',route=>route.abort());
  await page.goto('https://ninesolsmap.com/');
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
  await expect(page.locator('.local-ad-preview,ins.adsbygoogle')).toHaveCount(0);
  const map=await page.locator('#map').boundingBox();
  expect((map?.y ?? 0)+(map?.height ?? 0)).toBeCloseTo(844,0);
  await page.locator('.filter-toggle').tap();
  await expect(page.locator('.filter-dialog')).toBeVisible();
});
