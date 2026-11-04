// Shared ranking rules. The same functions are copied into docs/ranking/apps-script.gs
// (tests/ranking-core.test.js checks both behave alike), so keep this file free of imports.
export const RANKING_LIMITS = {nickname:8, group:12, maxScore:12000, top:20, groupMembers:5};
const BANNED = ['시발','씨발','ㅅㅂ','병신','ㅂㅅ','개새','존나','좆','미친놈','미친년','fuck','shit','bitch','섹스','sex','자살','죽어'];

export function cleanText(value, max) {
 // A leading = + - @ would make Google Sheets treat the cell as a formula.
 return String(value == null ? '' : value).normalize('NFC').replace(/[\u0000-\u001f<>"'`\\]/g, '').replace(/\s+/g, ' ').trim().replace(/^[=+\-@\s]+/, '').slice(0, max);
}

// Rejects contact details and abusive words so a public board never shows personal information.
export function validateEntry(input) {
 const nickname = cleanText(input.nickname, RANKING_LIMITS.nickname), group = cleanText(input.group, RANKING_LIMITS.group);
 const score = Math.round(Number(input.score)), mode = input.mode === 'challenge' ? 'challenge' : 'normal';
 if (nickname.length < 2) return {ok:false, error:'닉네임을 2~8자로 적어 주세요.'};
 for (const text of [nickname, group]) {
  const compact = text.toLowerCase().replace(/[\s._\-]/g, '');
  if (/\d{4,}|\d{2,4}[-\s.]\d{3,4}/.test(text) || /@|https?:|www\.|\.com|\.kr|\.net/i.test(text)) return {ok:false, error:'연락처·주소처럼 보이는 정보는 쓸 수 없어요.'};
  if (BANNED.some(word => compact.includes(word))) return {ok:false, error:'모두가 보는 랭킹이라 다른 표현을 써 주세요.'};
 }
 if (!Number.isFinite(score) || score < 0 || score > RANKING_LIMITS.maxScore) return {ok:false, error:'점수를 확인할 수 없어요.'};
 return {ok:true, nickname, group, score, mode, cleared:!!input.cleared, maxCombo:Math.max(0, Math.min(99, Math.round(Number(input.maxCombo) || 0))), bosses:Math.max(0, Math.min(3, Math.round(Number(input.bosses) || 0))), seconds:Math.max(0, Math.min(7200, Math.round(Number(input.seconds) || 0)))};
}

export function weekStart(now) {
 // Weeks start on Monday 00:00 in Korea (UTC+9).
 const kst = new Date(now + 9 * 3600000), day = (kst.getUTCDay() + 6) % 7;
 return Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate() - day) - 9 * 3600000;
}

export const playerKey = row => `${row.nickname}\u0001${row.group || ''}`;

// rows: [{nickname, group, score, mode, time(ms), hidden}] → ranked board.
export function buildBoard(rows, {mode = 'normal', period = 'all', view = 'player', now = Date.now()} = {}) {
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
 return {view, mode, period, total:players.length, rows:players.slice(0, RANKING_LIMITS.top).map((row, i) => ({rank:i + 1, nickname:row.nickname, group:row.group || '', score:row.score, key:playerKey(row)})), ranks:Object.fromEntries(players.map((row, i) => [playerKey(row), i + 1]))};
}
