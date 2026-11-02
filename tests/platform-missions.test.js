import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventure,updateAdventure,advanceWorld} from '../src/platform-engine.js';
import {answerNeighbor,nearbyNeighbor,missionStatus} from '../src/platform-missions.js';
const tick=g=>updateAdventure(g,1/60,{});
function visit(g,x){Object.assign(g.player,{x:x-20,y:370,vy:0,vx:0,grounded:true});}
function next(g){g.level.mission.npcs.forEach(n=>n.done=true);g.level.boss.hp=0;Object.assign(g.player,{x:g.level.spec.goal,y:370,vy:0,vx:0,grounded:true});tick(g);advanceWorld(g);}
test('공원 미션: 쓰레기 수거·잘못된 답 힌트·올바른 분리배출·중복 보상 없음',()=>{
 const g=createAdventure();visit(g,2550);assert.equal(answerNeighbor(g,'recycle',0).ok,false);
 for(const item of g.level.items.filter(i=>i.type==='trash').slice(0,3)){visit(g,item.x);tick(g);}
 assert.equal(g.level.mission.trash,3);visit(g,2550);assert.equal(nearbyNeighbor(g).id,'recycle');assert.equal(answerNeighbor(g,'recycle',1).ok,false);assert.equal(answerNeighbor(g,'recycle',0).ok,true);assert.equal(missionStatus(g).complete,true);const score=g.score;answerNeighbor(g,'recycle',0);assert.equal(g.score,score);
});
test('미션을 하지 않고 깃발만 지나가면 완료되지 않음',()=>{
 const g=createAdventure();g.player.x=g.level.spec.goal;tick(g);assert.equal(g.phase,'playing');assert.equal(g.worldResults.length,0);assert.ok(g.events.some(e=>e.type==='objective'));
});
test('나눔 미션: 세 종류 꾸러미와 세 집이 서로 맞아야 전달',()=>{
 const g=createAdventure();next(g);visit(g,640);assert.equal(answerNeighbor(g,'study',0).ok,false);
 for(const kind of ['study','life','food']){const item=g.level.items.find(i=>i.kind===kind);visit(g,item.x);tick(g);assert.equal(g.level.mission.inventory[kind],1);const n=g.level.mission.npcs.find(n=>n.kind===kind);visit(g,n.x);assert.equal(answerNeighbor(g,n.id,0).ok,true);assert.equal(g.level.mission.inventory[kind],0);}
 assert.equal(missionStatus(g).complete,true);
});
test('이웃 미션: 거절을 존중해야 성공하고 완료 뒤 중복 대화 방지',()=>{
 const g=createAdventure();next(g);next(g);for(const n of g.level.mission.npcs){visit(g,n.x);assert.equal(answerNeighbor(g,n.id,1).ok,false);assert.equal(n.done,false);assert.equal(answerNeighbor(g,n.id,0).ok,true);assert.equal(answerNeighbor(g,n.id,0).ok,false);}assert.equal(missionStatus(g).complete,true);
});
test('보호막은 한 번의 피해를 막고, 별은 체크포인트 재시작 후 재지급되지 않음',()=>{
 const g=createAdventure(),shield=g.level.items.find(i=>i.type==='shield');visit(g,shield.x);tick(g);assert.ok(g.level.mission.shield>11);const e=g.level.enemies[0];visit(g,e.x);tick(g);assert.equal(g.hearts,3);assert.equal(g.level.mission.shield,0);
 const star=g.level.items.find(i=>i.type==='star');Object.assign(g.player,{x:star.x-20,y:star.y-30,vy:0});tick(g);assert.equal(g.level.mission.stars,1);const score=g.score;tick(g);assert.equal(g.score,score);
});
test('스프링 슈퍼 점프와 움직이는 발판의 탑승 이동',()=>{
 const g=createAdventure(),spring=g.level.springs[0];visit(g,spring.x+20);tick(g);assert.ok(g.player.vy<-800);
 next(g);const platform=g.level.solids.find(s=>s.type==='moving');Object.assign(g.player,{x:platform.x+15,y:platform.y-60,vy:0,grounded:true,support:platform});const oldY=g.player.y;for(let i=0;i<25;i++)tick(g);assert.equal(g.player.support,platform);assert.notEqual(g.player.y,oldY);assert.ok(Math.abs(g.player.y+60-platform.y)<1);
});
