import { bossCleared } from './platform-features.js';
export const MISSION_NAMES = ['공원 되살리기','세 집에 나눔 전달','이웃의 마음 듣기'];
export const BADGES = ['초록 지킴이','나눔 배달부','마음 친구'];
export function createMission(world) {
 const base = {trash:0,inventory:{study:0,life:0,food:0},stars:0,shield:0,goalHintAt:-10};
 if(world===0) return {...base,npcs:[{id:'recycle',x:2550,name:'공원 지킴이',kind:'recycle',done:false,question:'모아 온 쓰레기, 어떻게 정리할까요?',choices:['종류에 맞게 나누어 배출해요','한 곳에 아무렇게나 던져요','내일 누군가 치우겠지, 그냥 두고 가요'],answer:0,reply:'공원이 다시 깨끗해졌어요! 초록 지킴이 배지 획득!'}]};
 if(world===1) return {...base,npcs:[
  {id:'study',x:640,name:'책을 기다리는 집',kind:'study',done:false,question:'아이들이 읽을 책을 기다리고 있어요.',choices:['준비한 공부 꾸러미를 전해요','아무 상자나 놓고 가요','간식 꾸러미를 대신 건네요'],answer:0,reply:'책과 공책이 도착했어요! 배움이 자라는 집이 됐어요.'},
  {id:'life',x:1560,name:'생활용품이 필요한 집',kind:'life',done:false,question:'깨끗한 수건과 비누가 필요해요.',choices:['생활 꾸러미를 전해요','책만 꺼내 놓아요','필요한지 묻지 않고 문 앞에 쌓아 둬요'],answer:0,reply:'생활 꾸러미를 잘 받았어요! 나눔에 고마워요.'},
  {id:'food',x:2310,name:'간식을 나누는 집',kind:'food',done:false,question:'함께 먹을 간식을 기다리고 있어요.',choices:['간식 꾸러미를 함께 나눠요','내용을 확인하지 않고 놓아요','내가 먼저 다 먹고 빈 상자를 줘요'],answer:0,reply:'간식 꾸러미를 받았어요. 함께 나눌 마음에 고마워요!'}]};
 return {...base,npcs:[
  {id:'ask',x:520,name:'짐을 든 이웃',kind:'neighbor',done:false,question:'“짐이 조금 무겁네요…” 어떻게 다가갈까요?',choices:['“옮기는 걸 도와드려도 될까요?”','말없이 짐을 빼앗아 들어요','도와주는 모습부터 사진 찍어 SNS에 올려요'],answer:0,reply:'먼저 의사를 물었어요. 동의한 이웃과 함께 옮겨요.'},
  {id:'respect',x:1560,name:'혼자 해보려는 이웃',kind:'neighbor',done:false,question:'“고마워요. 오늘은 혼자 해볼게요.”',choices:['“알겠어요. 필요하면 말씀해 주세요!”','계속 따라가며 도와주겠다고 해요','“제가 하는 게 더 빨라요!” 하고 가져가요'],answer:0,reply:'거절도 존중했어요. 기다려 주는 마음도 따뜻해요.'},
  {id:'guide',x:2300,name:'길을 찾는 이웃',kind:'neighbor',done:false,question:'“나눔센터는 어느 쪽으로 가나요?”',choices:['“길을 알려드릴까요? 함께 가도 좋아요.”','손을 잡고 바로 끌고 가요','“저도 잘 몰라요” 하고 지나가요'],answer:0,reply:'원하는 도움을 선택하게 했어요. 이웃집의 불이 켜졌어요!'}]};
}
export function addMissionItems(world, structures, items) {
 let id=1000;
 if(world===0) for(const x of [215,620,1020,1460,1840,2450])items.push({id:id++,x,y:393,r:19,type:'trash',taken:false});
 if(world===1) for(const [x,kind] of [[230,'study'],[1020,'life'],[1990,'food']])items.push({id:id++,x,y:393,r:22,type:'parcel',kind,taken:false});
 for(const index of [0,2,4]){const [x,y,w]=structures[index];items.push({id:id++,x:x+w/2,y:y-44,r:16,type:'star',taken:false});}
 items.push({id:id++,x:world===0?1500:world===1?1640:1680,y:380,r:18,type:'shield',taken:false});
 // Replenishments remain reachable on the main path after the midpoint.
 for(const [x,type] of [[160,'growth'],[700+world*40,'bloom'],[world===0?1880:world===1?2060:2050,'growth'],[world===0?2400:world===1?2300:2350,'bloom']])items.push({id:id++,x,y:393,r:20,type,taken:false});
}
export function missionStatus(game) {
 const m=game.level.mission,done=m.npcs.filter(n=>n.done).length,complete=done===m.npcs.length;
 const detail=game.world===0?(complete?'공원 정리 완료!':m.trash>=3?'지킴이에게 분리배출하기':`쓰레기 ${m.trash}/3개 수거`):game.world===1?`나눔 전달 ${done}/3집`:`이웃 돕기 ${done}/3명`;
 const boss=game.level.boss,bossLeft=complete&&!bossCleared(game.level);
 return {title:MISSION_NAMES[game.world],detail:bossLeft?`${boss.name} 정화 ${boss.maxHp-boss.hp}/${boss.maxHp}`:detail,complete,done,target:m.npcs.length,stars:m.stars,badge:BADGES[game.world],bossLeft};
}
export function nearbyNeighbor(game) {
 const p=game.player;
 return game.level.mission.npcs.find(n=>!n.done&&Math.abs(n.x-(p.x+p.w/2))<125&&Math.abs(p.y+p.h-430)<160)??null;
}
export function missionHint(game) {
 const m=game.level.mission;
 if(game.world===0&&m.trash<3){const item=game.level.items.filter(i=>i.type==='trash'&&!i.taken).sort((a,b)=>Math.abs(a.x-game.player.x)-Math.abs(b.x-game.player.x))[0];return `${item&&item.x<game.player.x?'← 왼쪽':'→ 오른쪽'}의 쓰레기를 모아요 (${m.trash}/3).`;}
 const npc=m.npcs.find(n=>!n.done);if(!npc)return bossCleared(game.level)?'목적지 깃발로 가요!':`→ ${game.level.boss.obj} 밟거나 정화 하트로 맞혀 장벽을 걷어요!`;
 if(game.world===1&&!m.inventory[npc.kind]){const item=game.level.items.find(i=>i.type==='parcel'&&i.kind===npc.kind&&!i.taken);return `${item&&item.x<game.player.x?'← 왼쪽':'→ 오른쪽'}에서 ${ {study:'공부',life:'생활',food:'간식'}[npc.kind]} 꾸러미를 찾아요.`;}
 return `${npc.x<game.player.x?'← 왼쪽':'→ 오른쪽'} ${npc.name} 가까이에서 E 또는 대화 버튼!`;
}
export function answerNeighbor(game,id,choice) {
 const npc=game.level.mission.npcs.find(n=>n.id===id),m=game.level.mission;
 if(!npc||npc.done||!['playing','dialogue'].includes(game.phase)||Math.abs(npc.x-(game.player.x+game.player.w/2))>=125||Math.abs(game.player.y+game.player.h-430)>=160)return {ok:false,text:'이웃 가까이 다가가 주세요.'};
 if(game.world===0&&m.trash<3)return {ok:false,text:`쓰레기를 ${3-m.trash}개 더 모아 주세요. ${missionHint(game)}`};
 if(game.world===1&&!m.inventory[npc.kind])return {ok:false,text:missionHint(game)};
 if(choice!==npc.answer){npc.misses=(npc.misses||0)+1;return {ok:false,text:game.world===2?'먼저 묻고, 이웃의 선택을 존중해 볼까요?':'필요한 것과 정리 방법을 한 번 더 살펴봐요.'};}
 npc.done=true;if(game.world===1)m.inventory[npc.kind]--;const bonus=npc.misses?0:50;game.score+=150+bonus;game.firstTry=(game.firstTry||0)+(bonus?1:0);
 return {ok:true,text:npc.reply,points:150+bonus,bonus};
}
// Display order for dialogue choices. Answers keep their original index, so only the screen order changes.
export function choiceOrder(count,random=Math.random) {
 const order=[...Array(count).keys()];
 for(let i=count-1;i>0;i--){const j=Math.floor(random()*(i+1));[order[i],order[j]]=[order[j],order[i]];}
 return order;
}
