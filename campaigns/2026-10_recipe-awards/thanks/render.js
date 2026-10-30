// 사용법: 이 폴더에서 `python3 fonts_subset.py` 후 `NODE_PATH=$(npm root -g) node render.js` → awards-thanks_feed.png(1080×1350), awards-thanks_banner.png(1600×800)
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1600, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/thanks.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.locator('#feed').screenshot({ path: __dirname + '/awards-thanks_feed.png' });
  await p.locator('#banner').screenshot({ path: __dirname + '/awards-thanks_banner.png' });
  await b.close();
})();
