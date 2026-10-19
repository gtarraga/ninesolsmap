import { test, expect } from '@playwright/test';

test.skip(process.env.VERCEL_ENV !== 'preview','Only tests Vercel preview behavior.');

test('PR hostname renders only a test-mode unit without production analytics',async({page,request})=>{
  await request.get('http://127.0.0.1:3101/control/ok');
  const hostname='ninesolsmap-example-guillem-tarragas-projects.vercel.app';
  await page.route(`https://${hostname}/**`,async route=>{
    const url=new URL(route.request().url());url.protocol='http:';url.host='localhost:3100';
    await route.fulfill({response:await route.fetch({url:url.href})});
  });
  await page.route('https://map.ninesolsmap.com/**',route=>route.abort());
  const analytics:string[]=[];
  await page.route('https://e.ninesolsmap.com/**',route=>{analytics.push(route.request().url());return route.abort();});
  await page.route('https://pagead2.googlesyndication.com/pagead/js/**',route=>route.fulfill({
    contentType:'application/javascript',body:`window.adsbygoogle={push(){document.querySelector('ins.adsbygoogle').dataset.adStatus='filled';}};`,
  }));
  await page.goto(`https://${hostname}/`);
  await expect(page.getByRole('region',{name:'Local AdSense preview'})).toBeVisible();
  await expect(page.locator('ins.adsbygoogle')).toHaveAttribute('data-adtest','on');
  expect(analytics).toEqual([]);
});
