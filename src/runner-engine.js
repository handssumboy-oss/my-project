export const RUN_SECONDS = 120;
export const JUMP_SECONDS = .88;
export const STAGES = [
 {name:'노을빛 골목',subtitle:'작은 실천으로 출발!',sky:['#292b60','#d66b83','#ffc49a'],ground:'#2e4e58',road:'#546076',neon:'#8ff6cf'},
 {name:'나눔의 거리',subtitle:'마음을 모으면 더 멀리!',sky:['#22205b','#76549c','#f0a58d'],ground:'#293f54',road:'#464d72',neon:'#f8cf7d'},
 {name:'온기 가득한 밤',subtitle:'우리 동네가 반짝여요!',sky:['#101c46','#503d82','#b9719a'],ground:'#23394c',road:'#384361',neon:'#89e5f8'},
];
export function createRun(random = Math.random) {
 return {phase:'playing',time:0,distance:0,score:0,lane:1,visualLane:1,jump:0,jumpElapsed:null,hearts:3,invincible:0,shield:0,magnet:0,combo:0,maxCombo:0,collected:0,objects:[],particles:[],spawn:0,sequence:0,random,stage:0,shake:0,events:[]};
}
export function move(run,direction) {
 if(run.phase !== 'playing') return false;
 const next = Math.min(2,Math.max(0,run.lane+direction));
 if(next===run.lane) return false;
 run.lane=next;return true;
}
export function jump(run) {
 if(run.phase!=='playing'||run.jumpElapsed!==null) return false;
 run.jumpElapsed=0;return true;
}
export function spawnRow(run) {
 const r=run.random, hazard=Math.floor(r()*3), safe=(hazard+1+Math.floor(r()*2))%3;
 const type=run.time<7?'orb':r()<.26?'barrier':'cone';
 if(run.time>=7) run.objects.push({id:run.sequence++,lane:hazard,z:1.04,type,hit:false});
 run.objects.push({id:run.sequence++,lane:safe,z:1.05,type:run.sequence%4===0?'litter':'orb',hit:false});
 run.objects.push({id:run.sequence++,lane:safe,z:1.19,type:'orb',hit:false});
 if(run.sequence%13===0)run.objects.push({id:run.sequence++,lane:(safe+1)%3,z:1.32,type:r()<.5?'shield':'magnet',hit:false});
}
export function update(run,dt) {
 if(run.phase!=='playing')return;
 run.events=[]; run.time+=dt; run.distance+=dt*(10+run.time*.065);
 run.stage=Math.min(2,Math.floor(run.time/40));
 run.visualLane+=(run.lane-run.visualLane)*Math.min(1,dt*15);
 for(const key of ['invincible','shield','magnet','shake'])run[key]=Math.max(0,run[key]-dt);
 if(run.jumpElapsed!==null){run.jumpElapsed+=dt;run.jump=Math.sin(Math.min(1,run.jumpElapsed/JUMP_SECONDS)*Math.PI);if(run.jumpElapsed>=JUMP_SECONDS){run.jumpElapsed=null;run.jump=0;}}
 run.spawn-=dt;if(run.spawn<=0){spawnRow(run);run.spawn=Math.max(.76,1.35-run.time*.003);}
 const speed=.255+run.time*.00095;
 for(const o of run.objects){
  o.z-=dt*speed;
  if(o.hit||o.z>.095||o.z<-.06)continue;
  const sameLane=Math.abs(o.lane-run.visualLane)<.4;
  const collectible=['orb','litter','shield','magnet'].includes(o.type);
  if(!sameLane&&!(collectible&&run.magnet>0&&o.z<.09))continue;
  if(collectible){
   o.hit=true;
   if(o.type==='shield'){run.shield=10;run.events.push({type:'power',text:'보호막! 10초 동안 든든해요',lane:o.lane});}
   else if(o.type==='magnet'){run.magnet=9;run.events.push({type:'power',text:'자석! 온기가 저절로 모여요',lane:o.lane});}
   else {run.combo++;run.maxCombo=Math.max(run.maxCombo,run.combo);run.collected++;const points=10*Math.min(5,1+Math.floor(run.combo/8));run.score+=points;run.events.push({type:'collect',text:`+${points}`,lane:o.lane});}
  } else if(run.jump>.43){o.hit=true;run.score+=5;run.events.push({type:'dodge',text:'NICE JUMP +5',lane:o.lane});}
  else if(run.invincible===0){o.hit=true;if(run.shield>0){run.shield=0;run.invincible=1;run.events.push({type:'power',text:'보호막이 지켜줬어요!',lane:o.lane});}else{run.hearts--;run.combo=0;run.invincible=1.8;run.shake=.28;run.events.push({type:'hurt',text:'앗! 점프하거나 옆으로 피하세요',lane:o.lane});if(run.hearts<=0){run.phase='over';run.events.push({type:'end'});}}}
 }
 run.objects=run.objects.filter(o=>o.z>-.18&&!o.hit);
 if(run.time>=RUN_SECONDS&&run.phase==='playing'){run.phase='clear';run.events.push({type:'end'});}
}
