// 사용법: 이 폴더에서 `python3 fonts_subset.py` 후 `node render.js` → un_d37_card_1.png ~ un_d37_card_4.png (1080×1350) 생성
// 서체는 fonts/ 폴더의 Noto Sans KR 서브셋(SIL OFL). 문구를 바꾸면 서브셋을 다시 받아야 한다.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1080, height: 1400 }, deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/cards.html', { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  const loaded = await p.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family));
  console.log('loaded fonts:', [...new Set(loaded)].join(', '));
  for (let i = 1; i <= 4; i++) await p.locator('#c' + i).screenshot({ path: __dirname + `/un_d37_card_${i}.png` });
  await b.close();
})();
