import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { validateEntry, buildBoard, weekStart, cleanText } from '../src/ranking-core.js';
import { appsScriptCore } from '../scripts/sync-apps-script.mjs';
const NOW = Date.UTC(2026, 10, 4, 3); // Wed 2026-11-04 12:00 KST
const row = (nickname, score, extra = {}) => ({nickname, group:'', score, mode:'normal', time:NOW - 1000, hidden:false, ...extra});

test('닉네임·소속 검사: 길이, 연락처·주소, 욕설, 시트 수식 차단',()=>{
 assert.equal(validateEntry({nickname:'자', score:10}).ok, false);
 assert.equal(validateEntry({nickname:'자봉이친구들최고야', score:10}).nickname, '자봉이친구들최고');
 for (const nickname of ['01012345678', '010-1234-5678', 'a@b.kr', 'www.test', 'http://x']) assert.equal(validateEntry({nickname, score:10}).ok, false, nickname);
 assert.equal(validateEntry({nickname:'시 발', score:10}).ok, false);
 assert.equal(validateEntry({nickname:'착한친구', group:'010 1234 5678', score:10}).ok, false);
 assert.equal(cleanText('=HYPERLINK("x")', 20), 'HYPERLINK(x)');
 assert.equal(validateEntry({nickname:'+자봉', score:10}).nickname, '자봉');
 assert.equal(validateEntry({nickname:'자봉', score:300001}).ok, false);
 assert.equal(validateEntry({nickname:'자봉', score:42000, lap:4}).lap, 4);assert.equal(validateEntry({nickname:'자봉', score:10, lap:500}).lap, 99);
 const ok = validateEntry({nickname:' 자봉 짱 ', group:'행복봉사단', score:'3210.4', mode:'challenge', maxCombo:200});
 assert.deepEqual([ok.ok, ok.nickname, ok.group, ok.score, ok.mode, ok.maxCombo], [true, '자봉 짱', '행복봉사단', 3210, 'challenge', 99]);
});
test('개인 순위는 사람별 최고 기록, 모드·이번 주·숨김을 구분',()=>{
 const rows = [row('가', 100), row('가', 300), row('나', 200), row('다', 500, {mode:'challenge'}), row('라', 900, {hidden:true}), row('마', 800, {time:weekStart(NOW) - 1})];
 const all = buildBoard(rows, {now:NOW});
 assert.deepEqual(all.rows.map(r => [r.rank, r.nickname, r.score]), [[1,'마',800],[2,'가',300],[3,'나',200]]);
 assert.deepEqual(buildBoard(rows, {period:'week', now:NOW}).rows.map(r => r.nickname), ['가','나']);
 assert.deepEqual(buildBoard(rows, {mode:'challenge', now:NOW}).rows.map(r => r.nickname), ['다']);
 assert.equal(all.ranks['나\u0001'], 3);
 assert.equal(new Date(weekStart(NOW) + 9 * 3600000).getUTCDay(), 1);
});
test('소속 순위는 구성원 최고 기록 상위 5명의 합계',()=>{
 const rows = [...[100,200,300,400,500,600].map((s, i) => row(`A${i}`, s, {group:'햇살단'})), row('B1', 2500, {group:'별빛단'}), row('C1', 50)];
 const board = buildBoard(rows, {view:'group', now:NOW});
 assert.deepEqual(board.rows.map(r => [r.rank, r.group, r.score, r.members]), [[1,'별빛단',2500,1],[2,'햇살단',2000,6]]);
});
test('Apps Script 파일은 공용 규칙과 같은 코드를 쓰고, 등록·조회·연속 등록 제한이 동작',()=>{
 const gs = readFileSync(new URL('../docs/ranking/apps-script.gs', import.meta.url), 'utf8');
 const core = gs.slice(gs.indexOf('----\n') + 5, gs.indexOf('// ---- end core ----'));
 assert.equal(core, appsScriptCore(readFileSync(new URL('../src/ranking-core.js', import.meta.url), 'utf8')), 'run npm run ranking:sync');
 const sheetRows = [], cache = new Map();
 const sheet = {appendRow:r => sheetRows.push(r), setFrozenRows(){}, getDataRange:() => ({getValues:() => sheetRows}), getLastColumn:() => sheetRows[0].length, getRange:() => ({setValues:v => { sheetRows[0] = v[0]; }})};
 const ctx = {Date, JSON, Math, Number, String, Object, Map, Array, SpreadsheetApp:{getActiveSpreadsheet:() => ({getSheetByName:() => sheetRows.length ? sheet : null, insertSheet:() => sheet})},
  ContentService:{MimeType:{JSON:'json'}, createTextOutput:text => ({text, setMimeType(){ return this; }})},
  CacheService:{getScriptCache:() => ({get:k => cache.get(k) ?? null, put:(k, v) => cache.set(k, v)})}, LockService:{getScriptLock:() => ({waitLock(){}, releaseLock(){}})}};
 vm.createContext(ctx); vm.runInContext(gs, ctx);
 const post = body => JSON.parse(ctx.doPost({postData:{contents:JSON.stringify(body)}}).text);
 assert.deepEqual(post({nickname:'자봉', group:'햇살단', score:1200, clientId:'a'}), {ok:true, rank:1, total:1});assert.equal(sheetRows[1][11], 1);
 assert.equal(post({nickname:'자봉2', score:1500, clientId:'a'}).ok, false, 'rate limited');
 assert.deepEqual(post({nickname:'새싹', score:1500, lap:3, clientId:'b'}), {ok:true, rank:1, total:2});
 assert.equal(post({nickname:'=cmd', score:10, clientId:'c'}).ok, true); assert.equal(sheetRows.at(-1)[1], 'cmd');
 assert.equal(post({nickname:'010-1111-2222', score:10, clientId:'d'}).ok, false);
 assert.deepEqual(JSON.parse(JSON.stringify(sheetRows[0])), ['시간','닉네임','소속','점수','모드','완주','최고콤보','보스','플레이초','기기ID','숨김','레벨']);
 // A sheet made by the first version (11 columns) gets the new 레벨 header on the next request.
 sheetRows[0] = sheetRows[0].slice(0, 11); ctx.doGet({parameter:{}}); assert.equal(sheetRows[0].length, 12);
 sheetRows[1][10] = true; // 관리자가 숨김 처리
 const board = JSON.parse(ctx.doGet({parameter:{mode:'normal', period:'all', view:'player'}}).text);
 assert.equal(board.ok, true); assert.equal(board.ranks, undefined); assert.deepEqual(board.rows.map(r => r.nickname), ['새싹','cmd']); assert.equal(board.rows[0].lap, 3);
});
