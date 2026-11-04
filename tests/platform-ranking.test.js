import test from 'node:test';
import assert from 'node:assert/strict';
import { createRanking, gradeFor } from '../src/platform-ranking.js';
const memory = () => { const m = new Map(); return {getItem:k => m.get(k) ?? null, setItem:(k, v) => m.set(k, v)}; };
test('랭킹 서버가 없으면 이 기기 랭킹에 저장하고 닉네임을 기억',async()=>{
 const r = createRanking({endpoint:'', storage:memory()});
 assert.equal(r.online, false);
 assert.equal((await r.submit({nickname:'a', score:10})).ok, false);
 assert.deepEqual(await r.submit({nickname:'자봉', group:'햇살단', score:900}), {ok:true, online:false, rank:1, total:1});
 const second = await r.submit({nickname:'새싹', score:1500});assert.equal(second.rank, 1);assert.equal(second.total, 2);
 assert.deepEqual(r.profile(), {nickname:'새싹', group:''});
 const board = await r.board({mode:'normal', period:'all', view:'player'});assert.deepEqual(board.rows.map(x => x.nickname), ['새싹','자봉']);
 assert.deepEqual((await r.board({mode:'normal', period:'all', view:'group'})).rows.map(x => x.group), ['햇살단']);
});
test('랭킹 서버에 text/plain POST로 등록하고, 실패하면 기기에 저장',async()=>{
 const calls = [];const fetchImpl = async (url, options) => { calls.push({url, options}); return {ok:true, json:async () => options.method === 'POST' ? {ok:true, rank:4, total:30} : {ok:true, rows:[{rank:1, nickname:'일등', group:'', score:9000}], total:30}}; };
 const r = createRanking({endpoint:'https://script.google.com/macros/s/test/exec', storage:memory(), fetchImpl});
 assert.deepEqual(await r.submit({nickname:'자봉', score:1200, mode:'challenge'}), {ok:true, rank:4, total:30, online:true});
 assert.equal(calls[0].options.method, 'POST');assert.equal(calls[0].options.headers, undefined);
 const sent = JSON.parse(calls[0].options.body);assert.equal(sent.mode, 'challenge');assert.ok(sent.clientId.length > 8);
 const board = await r.board({mode:'normal', period:'week', view:'player'});assert.equal(board.online, true);assert.match(calls[1].url, /mode=normal&period=week&view=player/);
 const down = createRanking({endpoint:'https://x', storage:memory(), fetchImpl:async () => { throw Error('offline'); }});
 const saved = await down.submit({nickname:'자봉', score:100});assert.equal(saved.ok, true);assert.equal(saved.offline, true);
 assert.equal((await down.board({mode:'normal', period:'all', view:'player'})).offline, true);
});
test('점수 등급',()=>{assert.deepEqual([5000, 4999, 3800, 2500, 2499].map(gradeFor), ['S','A','A','B','C']);});
