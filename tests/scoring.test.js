import test from 'node:test';
import assert from 'node:assert/strict';
import { timedScore, neighborScore } from '../src/scoring.js';
test('완벽한 미션은 100점, 시간 초과도 수행과 완료 점수 유지', () => {
 assert.equal(timedScore({completed:6,combo:5,elapsed:0,target:35}).total,100);
 assert.deepEqual(timedScore({completed:6,combo:5,elapsed:70,target:35}),{performance:60,completion:20,combo:10,speed:0,total:90});
});
test('미완료는 완료 및 속도 보너스 없음, 콤보는 10점 상한', () => {
 assert.deepEqual(timedScore({completed:3,combo:20,elapsed:3,target:40}),{performance:30,completion:0,combo:10,speed:0,total:40});
});
test('시간 보너스는 목표시간에 비례하고 0 미만으로 내려가지 않음', () => {
 assert.equal(timedScore({completed:6,combo:0,elapsed:20,target:40}).speed,5);
 assert.equal(timedScore({completed:6,combo:0,elapsed:40,target:40}).speed,0);
});
test('이웃 미션은 적절한 선택 60점과 완료 40점', () => {
 assert.equal(neighborScore(3,true).total,100);
 assert.equal(neighborScore(2,false).total,40);
});
