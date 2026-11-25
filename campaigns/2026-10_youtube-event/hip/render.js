const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ignoreHTTPSErrors:true, viewport: { width: 1080, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + process.cwd() + '/cards.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  console.log(await p.evaluate(() => [...document.fonts].filter(f=>f.status==='loaded').map(f=>f.family).join(',')));
  for (const id of ['c1','c2','c3','c4']) await p.locator('#'+id).screenshot({ path: `card_${id.slice(1)}.png` });
  await b.close();
})();
