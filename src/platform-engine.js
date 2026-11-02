import { collectPower, updateHearts } from './platform-powerups.js';
import { createMission, addMissionItems, missionStatus, missionHint } from './platform-missions.js';
import { CHALLENGE, buildEnemies, addFeatures, bossCleared, solidActive, addCombo, moveEnemy, updateGimmicks, updateBoss } from './platform-features.js';
export const PLAYER = {w:40,h:60,speed:245,jump:700,gravity:1850};
export const WORLDS = [
 {name:'초록 공원',tag:'잃어버린 초록빛을 찾아서',sky:['#b7e2dd','#f8e9b9'],grass:'#7fbc89',soil:'#cfa77d',accent:'#eab974',length:2800,goal:2640,gaps:[[770,890],[1640,1770]],checkpoint:1390},
 {name:'나눔 골목',tag:'작은 나눔이 이어지는 길',sky:['#edc7ba','#ffedbb'],grass:'#baa995',soil:'#b38e85',accent:'#9baac8',length:3000,goal:2840,gaps:[[860,1000],[1790,1930],[2400,2530]],checkpoint:1580},
 {name:'별빛 이웃 마을',tag:'마지막 온기를 전하러 가요',sky:['#666fa0','#d5a6b6'],grass:'#83a9ab',soil:'#8a8eaa',accent:'#f5cd8c',length:3100,goal:2940,gaps:[[910,1050],[1850,1990],[2470,2610]],checkpoint:1630},
];
export function makeLevel(index,challenge=false){
 const spec=WORLDS[index],solids=[];let start=0;
 for(const [left,right] of spec.gaps){solids.push({x:start,y:430,w:left-start,h:180,type:'ground'});start=right;}
 solids.push({x:start,y:430,w:spec.length-start,h:180,type:'ground'});
 const structures=index===0?[[360,326,126],[1080,330,126],[1248,237,84],[1910,326,126],[2210,280,126]]:index===1?[[390,326,126],[1190,330,126],[1358,237,126],[2080,326,126],[2640,326,84]]:[[400,326,126],[1190,326,126],[1358,230,84],[2110,326,126],[2740,326,84]];
 structures.forEach(([x,y,w],j)=>{for(let a=0;a<w;a+=42)solids.push({x:x+a,y,w:42,h:36,type:a===42||w===84&&a===0?'gift':'brick',used:false});});
 const items=[];let id=0;
 for(const solid of solids.filter(s=>s.type==='ground'))for(let x=solid.x+120;x<solid.x+solid.w-35;x+=115)items.push({id:id++,x,y:385,r:12,type:id%4===0?'leaf':'heart',taken:false});
 structures.forEach(([x,y,w])=>{for(let a=20;a<w;a+=42)items.push({id:id++,x:x+a,y:y-33,r:12,type:'heart',taken:false});});
 const enemies=buildEnemies(index,challenge);
 addMissionItems(index,structures,items);
 const mission=createMission(index);
 const springs=[{x: index===0?2090:index===1?2365:2440,y:413,w:42,h:17,cooldown:0}];
 const moving=index===1?[{x:900,y:365,w:72,h:18,type:'moving',baseX:900,baseY:365}]:[];
 solids.push(...moving);
 const level={spec,solids,items,enemies,mission,springs,time:0};addFeatures(level,index,challenge);return level;
}
export function createAdventure(options={}){const challenge=!!options.challenge,maxHearts=challenge?CHALLENGE.hearts:3;return {phase:'playing',challenge,maxHearts,world:0,level:makeLevel(0,challenge),player:{x:80,y:370,vx:0,vy:0,w:PLAYER.w,h:PLAYER.h,facing:1,grounded:true,coyote:.1,jumpBuffer:0,jumpHeld:false},hearts:maxHearts,score:0,collected:0,stomps:0,time:0,checkpoint:80,checkpointActive:false,invincible:0,events:[],particles:[],worldStartScore:0,worldResults:[],power:0,maxPower:0,powerFlash:0,shots:[],shotCooldown:0,purified:0,combo:0,comboTimer:0,maxCombo:0,bossesCleared:0};}
export function pressJump(game){if(game.phase!=='playing')return false;game.player.jumpBuffer=.14;game.player.jumpHeld=true;return true;}
export function releaseJump(game){game.player.jumpHeld=false;if(game.player.vy < -280)game.player.vy=-280;}
const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
function hit(game,fall=false){if(game.phase!=='playing'||(!fall&&game.invincible>0))return;if(!fall&&game.level.mission.shield>0){game.level.mission.shield=0;game.invincible=1;game.events.push({type:'shield',text:'보호막이 지켜줬어요!'});return;}if(!fall&&game.power>0){game.power--;game.invincible=1.65;game.powerFlash=.5;game.player.vy=-260;game.events.push({type:'powerdown',text:game.power===1?'꽃빛 능력이 보호해줬어요! 든든 자봉이로 돌아가요.':'성장 하트가 보호해줬어요! 하트는 줄지 않았어요.'});return;}
 if(fall){game.power=0;game.shots=[];}game.combo=0;game.comboTimer=0;game.hearts--;game.invincible=1.65;game.events.push({type:'hurt',text:fall?'마지막 깃발에서 다시 출발해요.':'앗! 잠깐 반짝이는 동안은 안전해요.'});if(game.hearts<=0){game.phase='over';return;}if(fall){const p=game.player;p.x=game.checkpoint;p.y=350;p.vx=0;p.vy=0;p.jumpBuffer=0;game.events[game.events.length-1].text='괜찮아요! 마지막 깃발에서 다시 출발.';}else{game.player.vy=-310;game.player.vx=-game.player.facing*160;}}
export function advanceWorld(game){if(game.phase!=='worldClear'||game.world>=2)return false;game.world++;game.level=makeLevel(game.world,game.challenge);Object.assign(game.player,{x:80,y:370,vx:0,vy:0,grounded:true,coyote:.1,jumpBuffer:0,jumpHeld:false});game.checkpoint=80;game.checkpointActive=false;game.invincible=1;game.hearts=Math.min(game.maxHearts,game.hearts+1);game.phase='playing';game.worldStartScore=game.score;game.events=[];game.shots=[];game.shotCooldown=0;return true;}
export function updateAdventure(game,dt,input={left:false,right:false}){
 if(game.phase!=='playing')return;
 // Fixed substeps make landing and head collisions reliable even after a slow frame.
 game.events=[];const steps=Math.max(1,Math.ceil(dt/(1/120))),step=dt/steps;
 for(let i=0;i<steps&&game.phase==='playing';i++)stepAdventure(game,step,input);
}
function stepAdventure(game,dt,input){
 const p=game.player,l=game.level;game.time+=dt;l.time+=dt;
 updateHearts(game,dt);game.comboTimer=Math.max(0,game.comboTimer-dt);if(!game.comboTimer)game.combo=0;
 for(const s of l.solids)if(s.type==='moving'){const ox=s.x,oy=s.y;s.x=s.baseX+Math.sin(l.time*1.4)*26;s.y=s.baseY+Math.sin(l.time*1.8)*22;if(p.support===s){p.x+=s.x-ox;p.y+=s.y-oy;}}
 updateGimmicks(game,dt);
 p.support=null;
 for(const spring of l.springs)spring.cooldown=Math.max(0,spring.cooldown-dt);
 l.mission.shield=Math.max(0,l.mission.shield-dt);game.invincible=Math.max(0,game.invincible-dt);p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.coyote=p.grounded?.11:Math.max(0,p.coyote-dt);
 const dir=Number(!!input.right)-Number(!!input.left),target=dir*PLAYER.speed;p.vx+=(target-p.vx)*Math.min(1,dt*(dir?16:22));if(dir)p.facing=dir;
 if(p.jumpBuffer>0&&p.coyote>0){p.vy=-PLAYER.jump;p.grounded=false;p.coyote=0;p.jumpBuffer=0;game.events.push({type:'jump'});}
 p.vy=Math.min(950,p.vy+PLAYER.gravity*dt);
 p.x+=p.vx*dt;
 for(const s of l.solids)if(solidActive(l,s)&&overlap(p,s)){if(p.vx>0)p.x=s.x-p.w;else if(p.vx<0)p.x=s.x+s.w;p.vx=0;}
 p.x=Math.max(0,Math.min(l.spec.length-p.w,p.x));
 const oldBottom=p.y+p.h;p.y+=p.vy*dt;p.grounded=false;
 for(const s of l.solids)if(solidActive(l,s)&&overlap(p,s)){
  if(p.vy>=0&&oldBottom<=s.y+4){p.y=s.y-p.h;p.vy=0;p.grounded=true;p.support=s;}
  else if(p.vy<0){p.y=s.y+s.h;p.vy=0;if(s.type==='gift'&&!s.used){s.used=true;game.score+=50;game.collected++;game.events.push({type:'gift',x:s.x+21,y:s.y,text:'나눔 발견! +50'});}}
 }
 if(p.y>620){hit(game,true);return;}
 for(const spring of l.springs)if(spring.cooldown===0&&p.vy>=0&&p.x+p.w>spring.x&&p.x<spring.x+spring.w&&p.y+p.h>=spring.y&&p.y+p.h<spring.y+35){p.vy=-890;p.grounded=false;p.coyote=0;spring.cooldown=.5;game.events.push({type:'spring',text:'슈퍼 점프! 위쪽 별을 찾아봐요!'});}
 for(const item of l.items)if(!item.taken&&overlap(p,{x:item.x-item.r,y:item.y-item.r,w:item.r*2,h:item.r*2})){item.taken=true;game.collected++;
  const points={leaf:20,heart:10,trash:25,parcel:25,star:100,shield:0,growth:0,bloom:0}[item.type]??10;game.score+=points;
  if(item.type==='trash')l.mission.trash++;
  if(item.type==='parcel')l.mission.inventory[item.kind]++;
  if(item.type==='star')l.mission.stars++;
  if(item.type==='shield')l.mission.shield=12;
  if(item.type==='growth'||item.type==='bloom'){collectPower(game,item.type);continue;}
  const text={trash:(l.mission.trash>3?'추가 청소 +25':`쓰레기 수거 ${l.mission.trash}/3`),parcel:'나눔 꾸러미 발견!',star:'숨은 별 +100',shield:'12초 보호막!'}[item.type]??(item.type==='leaf'?'초록 실천 +20':'+10');
  game.events.push({type:item.type==='heart'||item.type==='leaf'?'collect':'missionItem',x:item.x,y:item.y,text});}
 for(const e of l.enemies){if(!e.alive)continue;moveEnemy(e,dt,l.time);if(overlap(p,e)){if(p.vy>60&&oldBottom<=e.y+12){e.alive=false;p.vy=-430;p.grounded=false;game.stomps++;game.events.push({type:'stomp',...addCombo(game,30,e.x+e.w/2,e.y,e.kind==='flyer'?'비닐봉지 수거!':'먼지 퇴치!')});}else hit(game);}}
 if(game.phase!=='playing'||updateBoss(game,dt,oldBottom,hit))return;
 if(!game.checkpointActive&&p.x>=l.spec.checkpoint){game.checkpoint=l.spec.checkpoint;game.checkpointActive=true;game.events.push({type:'checkpoint',text:'중간 깃발 도착! 여기서 다시 시작할 수 있어요.'});}
 if(p.x>=l.spec.goal&&p.grounded){
  if(!missionStatus(game).complete||!bossCleared(l)){if(game.time-l.mission.goalHintAt>3){l.mission.goalHintAt=game.time;game.events.push({type:'objective',text:missionHint(game)});}}
  else{game.score+=100;game.worldResults.push({world:game.world,stars:l.mission.stars,badge:missionStatus(game).badge});game.phase=game.world===2?'clear':'worldClear';game.events.push({type:'finish',text:'우리 동네에 온기를 더했어요! +100'});}
 }
}
