import test from 'node:test';
import assert from 'node:assert/strict';
import {createAdventure,updateAdventure,advanceWorld} from '../src/platform-engine.js';
import {collectPower,shootHeart,updateHearts} from '../src/platform-powerups.js';
const tick=g=>updateAdventure(g,1/120,{});
function touchEnemy(g){const e=g.level.enemies.find(e=>e.alive);Object.assign(g.player,{x:e.x,y:370,vx:0,vy:0,grounded:true});g.invincible=0;tick(g);}
test('아이템을 실제로 먹으면 성장→꽃빛, 같은 아이템은 보너스와 단계 유지',()=>{
 const g=createAdventure();for(const [type,power] of [['growth',1],['bloom',2]]){const item=g.level.items.find(i=>i.type===type);Object.assign(g.player,{x:item.x-20,y:370,vy:0,vx:0});tick(g);assert.equal(g.power,power);assert.equal(item.taken,true);}
 const score=g.score;collectPower(g,'growth');assert.equal(g.power,2);assert.equal(g.score,score+30);assert.equal(g.maxPower,2);
});
test('꽃빛→든든→기본 순서로 피해를 막고 그 다음 접촉에서 하트 감소',()=>{
 const g=createAdventure();collectPower(g,'bloom');touchEnemy(g);assert.equal(g.power,1);assert.equal(g.hearts,3);const inv=g.invincible;tick(g);assert.equal(g.power,1);assert.ok(g.invincible<inv);touchEnemy(g);assert.equal(g.power,0);assert.equal(g.hearts,3);touchEnemy(g);assert.equal(g.hearts,2);
});
test('보호막이 진화보다 먼저 피해를 막고 추락은 진화를 초기화',()=>{
 const g=createAdventure();collectPower(g,'bloom');g.level.mission.shield=10;touchEnemy(g);assert.equal(g.power,2);assert.equal(g.level.mission.shield,0);g.invincible=0;g.player.y=640;tick(g);assert.equal(g.power,0);assert.equal(g.hearts,2);assert.equal(g.maxPower,2);
});
test('꽃빛에서만 발사 가능, 쿨다운·동시 발사 상한·소멸',()=>{
 const g=createAdventure();assert.equal(shootHeart(g),false);collectPower(g,'growth');assert.equal(shootHeart(g),false);collectPower(g,'bloom');assert.equal(shootHeart(g),true);assert.equal(shootHeart(g),false);g.shotCooldown=0;shootHeart(g);g.shotCooldown=0;shootHeart(g);g.shotCooldown=0;assert.equal(shootHeart(g),false);assert.equal(g.shots.length,3);updateHearts(g,1.4);assert.equal(g.shots.length,0);
});
test('하트는 먼지를 정화하고 한 번만 점수를 주며 이웃을 해치지 않음',()=>{
 const g=createAdventure();collectPower(g,'bloom');g.player.x=480;shootHeart(g);for(let i=0;i<30;i++)updateHearts(g,1/120);assert.equal(g.level.enemies[0].alive,false);assert.equal(g.purified,1);assert.equal(g.score,30);updateHearts(g,.1);assert.equal(g.score,30);
 g.shotCooldown=0;g.player.x=2500;shootHeart(g);updateHearts(g,.2);assert.equal(g.level.mission.npcs[0].done,false);assert.equal(g.hearts,3);
});
test('블록은 정화 하트를 막고 일시정지는 하트도 멈춤',()=>{
 const g=createAdventure();collectPower(g,'bloom');g.player.x=480;g.level.solids.push({x:550,y:370,w:15,h:60,type:'brick'});shootHeart(g);updateHearts(g,.05);assert.equal(g.shots.length,0);assert.equal(g.level.enemies[0].alive,true);g.level.solids.pop();g.shotCooldown=0;shootHeart(g);g.phase='paused';const x=g.shots[0].x;tick(g);assert.equal(g.shots[0].x,x);
});
test('다음 동네에서도 강화 상태 유지, 날아가는 하트는 초기화',()=>{
 const g=createAdventure();collectPower(g,'bloom');shootHeart(g);g.level.mission.npcs.forEach(n=>n.done=true);Object.assign(g.player,{x:g.level.spec.goal,y:370,vy:0,grounded:true});tick(g);assert.equal(advanceWorld(g),true);assert.equal(g.power,2);assert.equal(g.shots.length,0);
});
