import { test, expect } from '@playwright/test';

const pixel = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=','base64');

test.beforeEach(async ({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  await page.route('https://map.ninesolsmap.com/**',route=>route.fulfill({contentType:'image/png',body:pixel}));
  await page.route(/posthog|googlesyndication|doubleclick/,route=>route.abort());
});

for (const locale of ['en','zh-CN','zh-TW']) {
  test(`${locale}: phone layout, one sprite, merged boss filters`,async({page,request})=>{
    const icons:string[] = [];
    page.on('request',request=>{
      const path = new URL(request.url()).pathname;
      if (path.startsWith('/icons/') || path.startsWith('/sprites/')) icons.push(path);
    });
    await page.goto(`/${locale}`);
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    const geometry = await page.evaluate(()=>{
      const map = document.querySelector('#map')?.getBoundingClientRect();
      const title = document.querySelector('h1')?.getBoundingClientRect();
      const support = document.querySelector('.support-link')?.getBoundingClientRect();
      return {width:innerWidth,height:innerHeight,scroll:document.documentElement.scrollWidth,
        mapBottom:map?.bottom,titleLeft:title?.left,supportRight:support?.right};
    });
    expect(geometry.scroll).toBeLessThanOrEqual(geometry.width);
    expect(geometry.titleLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.supportRight).toBeLessThanOrEqual(geometry.width);
    expect(geometry.mapBottom).toBeCloseTo(geometry.height,0);
    expect(icons.filter(path=>path.startsWith('/icons/'))).toEqual([]);
    expect(new Set(icons.filter(path=>path.startsWith('/sprites/'))).size).toBe(1);
    const spritePath = icons.find(path=>path.startsWith('/sprites/'));
    if (!spritePath) throw new Error('Sprite was not requested');
    const sprite = await request.get(spritePath);
    expect(sprite.status()).toBe(200);
    expect(sprite.headers()['cache-control']).toContain('max-age=31536000, immutable');
    const zoom = await page.locator('.leaflet-control-zoom-in').boundingBox();
    if (!zoom) throw new Error('Zoom control was not visible');
    expect(zoom.width).toBeGreaterThanOrEqual(44);
    expect(zoom.height).toBeGreaterThanOrEqual(44);
    await page.locator('.filter-toggle').tap();
    await expect(page.locator('.filter-dialog')).toBeVisible();
    await expect(page.locator('.filter-row')).toHaveCount(3);
    const bosses = locale === 'en' ? 'Bosses' : locale === 'zh-CN' ? '頭目戰' : '头目战';
    await page.locator('.filter-row').filter({hasText:bosses}).locator('input').uncheck();
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(2);
    await page.keyboard.press('Escape');
    await expect(page.locator('.filter-dialog')).not.toBeVisible();
    const help = locale === 'en' ? 'Help' : locale === 'zh-CN' ? '帮助' : '說明';
    await page.getByRole('button',{name:help,exact:true}).tap();
    await expect(page.locator('.help-dialog')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.locator('.help-dialog')).not.toBeVisible();
  });
}

test('shared marker, missing translation, copy feedback, and all markers',async({page,context})=>{
  await context.grantPermissions(['clipboard-read','clipboard-write']);
  await page.goto('/zh-CN/chest-one');
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(1);
  await expect(page.locator('.leaflet-popup')).toContainText('Basic component chest');
  await page.getByRole('button',{name:'复制 URL'}).tap();
  await expect(page.getByRole('button',{name:'已复制'})).toBeVisible();
  expect(await page.evaluate(()=>navigator.clipboard.readText())).toBe('https://ninesolsmap.com/zh-CN/chest-one');
  await page.getByRole('button',{name:'显示所有标记'}).tap();
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
});

test('320px and phone landscape stay within the viewport',async({page})=>{
  for (const size of [{width:320,height:568},{width:844,height:390}]) {
    await page.setViewportSize(size);
    await page.goto('/zh-TW');
    await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
    const box = await page.locator('#map').boundingBox();
    if (!box) throw new Error('Map was not visible');
    expect(box.y+box.height).toBeCloseTo(size.height,0);
    expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(size.width);
    await page.locator('.filter-toggle').tap();
    const sheet = await page.locator('.filter-dialog').boundingBox();
    if (!sheet) throw new Error('Filter dialog was not visible');
    expect(sheet.y).toBeGreaterThanOrEqual(0);
    expect(sheet.y+sheet.height).toBeLessThanOrEqual(size.height);
    await page.keyboard.press('Escape');
  }
});

test('language change keeps a shared marker URL',async({page})=>{
  await page.goto('/en/boss-one');
  await expect(page.locator('.leaflet-popup')).toBeVisible();
  await page.getByRole('combobox').tap();
  await page.getByRole('option',{name:'繁體中文'}).tap();
  await expect(page).toHaveURL('/zh-TW/boss-one');
  await expect(page.locator('.leaflet-popup')).toContainText('第一位頭目');
});

test('API ignores session cookies and caches only valid successful data',async({request})=>{
  const response = await request.get('/api/markers',{headers:{Cookie:'session=must-not-reach-upstream'}});
  expect(response.status()).toBe(200);
  expect(response.headers()['content-type']).toContain('application/json');
  expect(response.headers()['cache-control']).toContain('s-maxage=3600');
  const payload:unknown = await response.json();
  expect(payload).toEqual(expect.arrayContaining([expect.objectContaining({id:'boss-two',type:'Boss'}),expect.objectContaining({id:'chest-one',traditional:'Basic component chest'})]));
  for (const mode of ['error','invalid']) {
    await request.get(`http://127.0.0.1:3101/control/${mode}`);
    const failed = await request.get('/api/markers');
    expect(failed.status()).toBe(503);
    expect(failed.headers()['cache-control']).toBe('no-store');
    expect(await failed.json()).toEqual({error:'Marker data is temporarily unavailable.'});
  }
});

test('failed load offers a working retry',async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/error');
  await page.goto('/en');
  await expect(page.locator('.map-status[role="alert"]')).toContainText('The map could not load');
  await request.get('http://127.0.0.1:3101/control/ok');
  await page.getByRole('button',{name:'Try again'}).tap();
  await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
});
