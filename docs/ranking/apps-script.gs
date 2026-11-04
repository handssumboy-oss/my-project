// 자봉이의 동네 구하기 · 랭킹 Apps Script
// 구글 시트 → 확장 프로그램 → Apps Script에 이 파일 전체를 붙여 넣고 웹 앱으로 배포하세요.
// 설정 방법: docs/ranking/RANKING_SETUP.md

// ---- core: copy of src/ranking-core.js (tests keep them identical) ----
const RANKING_LIMITS = {nickname:8, group:12, maxScore:300000, top:20, groupMembers:5};
const BANNED = ['시발','씨발','ㅅㅂ','병신','ㅂㅅ','개새','존나','좆','미친놈','미친년','fuck','shit','bitch','섹스','sex','자살','죽어'];

function cleanText(value, max) {
 // A leading = + - @ would make Google Sheets treat the cell as a formula.
 return String(value == null ? '' : value).normalize('NFC').replace(/[\u0000-\u001f<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@\s]+/, '').slice(0, max);
}

// Rejects contact details and abusive words so a public board never shows personal information.
function validateEntry(input) {
 const nickname = cleanText(input.nickname, RANKING_LIMITS.nickname), group = cleanText(input.group, RANKING_LIMITS.group);
 const score = Math.round(Number(input.score)), mode = input.mode === 'challenge' ? 'challenge' : 'normal';
 if (nickname.length < 2) return {ok:false, error:'닉네임을 2~8자로 적어 주세요.'};
 for (const text of [nickname, group]) {
  const compact = text.toLowerCase().replace(/[\s._\-]/g, '');
  if (/\d{4,}|\d{2,4}[-\s.]\d{3,4}/.test(text) || /@|https?:|www\.|\.com|\.kr|\.net/i.test(text)) return {ok:false, error:'연락처·주소처럼 보이는 정보는 쓸 수 없어요.'};
  if (BANNED.some(word => compact.includes(word))) return {ok:false, error:'모두가 보는 랭킹이라 다른 표현을 써 주세요.'};
 }
 if (!Number.isFinite(score) || score < 0 || score > RANKING_LIMITS.maxScore) return {ok:false, error:'점수를 확인할 수 없어요.'};
 return {ok:true, nickname, group, score, mode, lap:Math.max(1, Math.min(99, Math.round(Number(input.lap) || 1))), cleared:!!input.cleared, maxCombo:Math.max(0, Math.min(99, Math.round(Number(input.maxCombo) || 0))), bosses:Math.max(0, Math.min(3, Math.round(Number(input.bosses) || 0))), seconds:Math.max(0, Math.min(7200, Math.round(Number(input.seconds) || 0)))};
}

function weekStart(now) {
 // Weeks start on Monday 00:00 in Korea (UTC+9).
 const kst = new Date(now + 9 * 3600000), day = (kst.getUTCDay() + 6) % 7;
 return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - day) - 9 * 3600000;
}

const playerKey = row => `${row.nickname}\u0001${row.group || ''}`;

// rows: [{nickname, group, score, mode, lap, time(ms), hidden}] → ranked board.
function buildBoard(rows, {mode = 'normal', period = 'all', view = 'player', now = Date.now()} = {}) {
 const since = period === 'week' ? weekStart(now) : 0, best = new Map();
 for (const row of rows) {
  if (row.hidden || row.mode !== mode || row.time < since) continue;
  const key = playerKey(row), old = best.get(key);
  if (!old || row.score > old.score || (row.score === old.score && row.time < old.time)) best.set(key, row);
 }
 const players = [...best.values()].sort((a, b) => b.score - a.score || a.time - b.time);
 if (view === 'group') {
  const groups = new Map();
  for (const row of players) if (row.group) { const list = groups.get(row.group) || []; list.push(row.score); groups.set(row.group, list); }
  const ranked = [...groups].map(([group, scores]) => ({group, members:scores.length, score:scores.slice(0, RANKING_LIMITS.groupMembers).reduce((a, b) => a + b, 0)})).sort((a, b) => b.score - a.score || b.members - a.members);
  return {view, mode, period, total:ranked.length, rows:ranked.slice(0, RANKING_LIMITS.top).map((row, i) => ({rank:i + 1, ...row}))};
 }
 return {view, mode, period, total:players.length, rows:players.slice(0, RANKING_LIMITS.top).map((row, i) => ({rank:i + 1, nickname:row.nickname, group:row.group || '', score:row.score, lap:row.lap || 1, key:playerKey(row)})), ranks:Object.fromEntries(players.map((row, i) => [playerKey(row), i + 1]))};
}
// ---- end core ----

// ---- Apps Script web app (glue) ----
const SHEET_NAME = '랭킹';
const HEADERS = ['시간', '닉네임', '소속', '점수', '모드', '완주', '최고콤보', '보스', '플레이초', '기기ID', '숨김', '레벨'];
function sheet_() {
 const book = SpreadsheetApp.getActiveSpreadsheet();
 let sheet = book.getSheetByName(SHEET_NAME);
 if (!sheet) { sheet = book.insertSheet(SHEET_NAME); sheet.appendRow(HEADERS); sheet.setFrozenRows(1); }
 // Sheets created by an older version get the new column names added in place.
 else if (sheet.getLastColumn() < HEADERS.length) sheet.getRange(1, 1, 1, HEADERS.length).setValues([HEADERS]);
 return sheet;
}
function rows_() {
 return sheet_().getDataRange().getValues().slice(1).map(v => ({time:new Date(v[0]).getTime(), nickname:String(v[1]), group:String(v[2] || ''), score:Number(v[3]), mode:String(v[4]), hidden:v[10] === true || String(v[10]).toUpperCase() === 'TRUE', lap:Number(v[11]) || 1})).filter(row => row.nickname && Number.isFinite(row.score));
}
function json_(data) { return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON); }
function doGet(e) {
 const p = (e && e.parameter) || {};
 const board = buildBoard(rows_(), {mode:p.mode === 'challenge' ? 'challenge' : 'normal', period:p.period === 'week' ? 'week' : 'all', view:p.view === 'group' ? 'group' : 'player', now:Date.now()});
 delete board.ranks;
 return json_(Object.assign({ok:true}, board));
}
function doPost(e) {
 let data;
 try { data = JSON.parse(e.postData.contents); } catch (error) { return json_({ok:false, error:'요청을 읽을 수 없어요.'}); }
 const entry = validateEntry(data);
 if (!entry.ok) return json_(entry);
 const clientId = cleanText(data.clientId, 64) || 'unknown', cache = CacheService.getScriptCache();
 // One record per device every 20 seconds keeps scripted flooding out of the sheet.
 if (cache.get('rate:' + clientId)) return json_({ok:false, error:'잠시 후 다시 등록해 주세요.'});
 const lock = LockService.getScriptLock();
 lock.waitLock(10000);
 try {
  sheet_().appendRow([new Date(), entry.nickname, entry.group, entry.score, entry.mode, entry.cleared, entry.maxCombo, entry.bosses, entry.seconds, clientId, false, entry.lap]);
  cache.put('rate:' + clientId, '1', 20);
  const board = buildBoard(rows_(), {mode:entry.mode, now:Date.now()});
  return json_({ok:true, rank:board.ranks[playerKey(entry)], total:board.total});
 } finally { lock.releaseLock(); }
}
