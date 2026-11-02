import {ACTIVITIES,EVENTS,EVENT_POOLS,FRIENDS,SKILLS,TRAITS,PROJECTS} from './maker-data.js';
const clamp=(n,min=0,max=100)=>Math.min(max,Math.max(min,n));
const activity=id=>ACTIVITIES.find(a=>a.id===id);
export function createMaker(){
 return {version:1,phase:'plan',week:0,day:0,cursor:0,schedule:[null,null,null],stats:{empathy:10,action:10,teamwork:10,energy:80},counts:Object.fromEntries(ACTIVITIES.map(a=>[a.id,0])),bonds:Object.fromEntries(FRIENDS.map(f=>[f.id,0])),skills:[],traits:[],seenStories:[],logs:[],pending:null,eventId:null,summary:null,project:null,strategy:null,ending:null};
}
function addGains(s,gains){for(const [key,value] of Object.entries(gains))if(key in s.stats)s.stats[key]=clamp(s.stats[key]+value);}
function unlock(s){const skills=[],traits=[];for(const k of SKILLS)if(!s.skills.includes(k.id)&&k.test(s)){s.skills.push(k.id);skills.push(k.id);}for(const t of TRAITS)if(!s.traits.includes(t.id)&&t.test(s)){s.traits.push(t.id);traits.push(t.id);}return {skills,traits};}
export function setActivity(s,id,slot=s.cursor){
 if(s.phase!=='plan'||!activity(id)||!Number.isInteger(slot)||slot<0||slot>2)return false;
 s.schedule[slot]=id;s.cursor=s.schedule.findIndex(x=>x===null);if(s.cursor<0)s.cursor=(slot+1)%3;return true;
}
export function clearSlot(s,slot){if(s.phase!=='plan'||slot<0||slot>2)return false;s.schedule[slot]=null;s.cursor=slot;return true;}
export function scheduleForecast(s){
 let energy=s.stats.energy;const gains={empathy:0,action:0,teamwork:0};let needsRest=false;
 for(const id of s.schedule){const a=activity(id);if(!a)continue;if(energy<a.cost)needsRest=true;energy=clamp(energy-a.cost+(a.gains.energy||0));for(const k of Object.keys(gains))gains[k]+=a.gains[k]||0;}
 return {energy,gains,needsRest,complete:s.schedule.every(id=>!!activity(id))};
}
function beginDay(s){
 const requested=activity(s.schedule[s.day]),tired=s.stats.energy<requested.cost,a=tired?activity('rest'):requested;
 const before={...s.stats},bondBefore=s.bonds[a.friend];s.stats.energy-=a.cost;addGains(s,a.gains);s.counts[a.id]++;s.bonds[a.friend]=clamp(s.bonds[a.friend]+1,0,5);
 const newUnlocks=unlock(s);s.pending={activity:a.id,requested:requested.id,tired,before,bondBefore,newSkills:newUnlocks.skills,newTraits:newUnlocks.traits};
 const pool=EVENT_POOLS[a.id];s.eventId=pool[(s.counts[a.id]-1)%pool.length];
 if(a.id!=='rest'&&s.bonds[a.friend]>=4&&!s.seenStories.includes(a.friend)){s.eventId='return';s.seenStories.push(a.friend);}
 s.phase='event';s.summary=null;
}
export function beginWeek(s){if(s.phase!=='plan'||!scheduleForecast(s).complete)return false;s.day=0;beginDay(s);return true;}
export function currentEvent(s){
 if(!s.pending||!EVENTS[s.eventId])return null;
 const base=EVENTS[s.eventId],a=activity(s.pending.activity),friend=FRIENDS.find(f=>f.id===a.friend);
 return {...base,line:s.eventId==='return'?friend.story:base.line,friend,activity:a,choices:base.choices.map((c,index)=>({...c,index,available:!c.skill||s.skills.includes(c.skill)}))};
}
export function chooseEvent(s,index){
 if(s.phase!=='event')return {ok:false};const event=currentEvent(s),c=event?.choices[index];if(!c||!c.available)return {ok:false};
 addGains(s,c.gains);s.bonds[event.friend.id]=clamp(s.bonds[event.friend.id]+(c.bond??1),0,5);const learned=unlock(s);
 const summary={week:s.week,day:s.day,activity:s.pending.activity,requested:s.pending.requested,eventId:s.eventId,choice:index,tired:s.pending.tired,friend:event.friend.id,note:c.note,delta:Object.fromEntries(Object.keys(s.stats).map(k=>[k,s.stats[k]-s.pending.before[k]])),newSkills:[...s.pending.newSkills,...learned.skills],newTraits:[...s.pending.newTraits,...learned.traits],bondBefore:s.pending.bondBefore,bondAfter:s.bonds[event.friend.id]};
 s.summary=summary;s.logs.push(summary);s.phase='feedback';return {ok:true,summary};
}
export function continueDay(s){if(s.phase!=='feedback')return false;if(s.day<2){s.day++;beginDay(s);}else{s.phase='weekly';s.pending=null;s.eventId=null;}return true;}
export function nextWeek(s){if(s.phase!=='weekly')return false;if(s.week<3){s.week++;s.day=0;s.schedule=[null,null,null];s.cursor=0;s.stats.energy=clamp(s.stats.energy+15);s.phase='plan';s.pending=null;s.summary=null;}else{s.phase='projects';}return true;}
export function projectReadiness(s,id){
 const p=PROJECTS.find(p=>p.id===id);if(!p)return null;
 const checks=[{label:SKILLS.find(k=>k.id===p.skill).name,ready:s.skills.includes(p.skill)},{label:`${{empathy:'공감',action:'실행',teamwork:'협력'}[p.stat]} ${s.stats[p.stat]}/${p.min}`,ready:s.stats[p.stat]>=p.min},{label:`${FRIENDS.find(f=>f.id===p.friend).name}와 인연 ${s.bonds[p.friend]}/3`,ready:s.bonds[p.friend]>=3}];
 const ready=checks.every(c=>c.ready),master=ready&&s.stats[p.stat]>=p.master&&s.bonds[p.friend]>=5&&s.stats.energy>=25;
 return {checks,ready,master,tier:master?3:ready?2:1};
}
export function selectProject(s,id){if(s.phase!=='projects'||!PROJECTS.some(p=>p.id===id))return false;s.project=id;s.phase='finale';return true;}
export function deriveEnding(s){
 const p=PROJECTS.find(p=>p.id===s.project);if(!p)return null;const r=projectReadiness(s,p.id);
 return {project:p.id,tier:r.tier,title:r.master?p.masterEnding:r.ready?p.ending:`작게 시작하는 ${p.ending}`,label:r.master?'함께 피운 결실':r.ready?'차곡차곡 준비한 실천':'첫걸음의 가능성',text:r.ready?`${FRIENDS.find(f=>f.id===p.friend).name}와 준비한 ${p.name}을 마쳤어요. 배운 기술과 쌓아 온 인연이 동네의 변화로 이어졌어요.`:`${p.name}을 작은 체험 활동으로 시작했어요. 더 배우고 싶은 것과 다음에 만날 이웃을 발견한 첫걸음이었어요.`,object:p.object};
}
export function finishProject(s,strategy){
 if(s.phase!=='finale'||![0,1].includes(strategy))return false;s.strategy=strategy;addGains(s,strategy===0?{teamwork:4,empathy:2}:{action:4,energy:5});const p=PROJECTS.find(p=>p.id===s.project);s.bonds[p.friend]=clamp(s.bonds[p.friend]+1,0,5);unlock(s);s.phase='ending';s.ending=deriveEnding(s);return true;
}
// Saved games contain data only. Rebuild prose and IDs from the trusted catalogs.
export function hydrateMaker(raw){
 if(!raw||raw.version!==1||!['plan','event','feedback','weekly','projects','finale','ending'].includes(raw.phase))return null;
 const s=createMaker(),number=(v,f,min=0,max=100)=>typeof v==='number'&&Number.isFinite(v)?clamp(v,min,max):f;
 s.phase=raw.phase;s.week=Math.floor(number(raw.week,0,0,3));s.day=Math.floor(number(raw.day,0,0,2));s.cursor=Math.floor(number(raw.cursor,0,0,2));
 for(const k of Object.keys(s.stats))s.stats[k]=number(raw.stats?.[k],s.stats[k]);
 for(const k of Object.keys(s.counts)){const v=raw.counts?.[k];if(v!==undefined&&(!Number.isInteger(v)||v<0||v>12))return null;s.counts[k]=v??0;}
 if(Object.values(s.counts).reduce((a,b)=>a+b,0)>12)return null;
 for(const k of Object.keys(s.bonds))s.bonds[k]=Math.floor(number(raw.bonds?.[k],0,0,5));
 const ids=(input,allowed)=>Array.isArray(input)?[...new Set(input.filter(x=>allowed.includes(x)))]:[];
 s.skills=ids(raw.skills,SKILLS.map(k=>k.id));s.traits=ids(raw.traits,TRAITS.map(t=>t.id));s.seenStories=ids(raw.seenStories,FRIENDS.map(f=>f.id));
 s.schedule=Array.from({length:3},(_,i)=>activity(raw.schedule?.[i])?raw.schedule[i]:null);
 if(Array.isArray(raw.logs))for(const log of raw.logs.slice(0,12)){
  const a=activity(log?.activity),e=EVENTS[log?.eventId],c=e?.choices[log?.choice];if(!a||!c||!Number.isInteger(log.choice))return null;
  s.logs.push({week:Math.floor(number(log.week,0,0,3)),day:Math.floor(number(log.day,0,0,2)),activity:a.id,requested:activity(log.requested)?.id||a.id,eventId:log.eventId,choice:log.choice,tired:log.tired===true,friend:a.friend,note:c.note,delta:Object.fromEntries(Object.keys(s.stats).map(k=>[k,number(log.delta?.[k],0,-100,100)])),newSkills:ids(log.newSkills,SKILLS.map(k=>k.id)),newTraits:ids(log.newTraits,TRAITS.map(k=>k.id)),bondBefore:number(log.bondBefore,0,0,5),bondAfter:number(log.bondAfter,0,0,5)});
 }
 s.summary=s.logs.at(-1)||null;
 if(['event','feedback'].includes(s.phase)){
  const p=raw.pending,a=activity(p?.activity);if(!a||!EVENTS[raw.eventId])return null;
  s.pending={activity:a.id,requested:activity(p.requested)?.id||a.id,tired:p.tired===true,before:Object.fromEntries(Object.keys(s.stats).map(k=>[k,number(p.before?.[k],s.stats[k])])),bondBefore:number(p.bondBefore,0,0,5),newSkills:ids(p.newSkills,SKILLS.map(k=>k.id)),newTraits:ids(p.newTraits,TRAITS.map(k=>k.id))};s.eventId=raw.eventId;
 }
 if(s.phase==='feedback'&&!s.summary)return null;
 s.project=PROJECTS.some(p=>p.id===raw.project)?raw.project:null;s.strategy=[0,1].includes(raw.strategy)?raw.strategy:null;
 if(['finale','ending'].includes(s.phase)&&!s.project)return null;
 if(['projects','finale','ending'].includes(s.phase)&&s.logs.length!==12)return null;
 if(s.phase==='ending')s.ending=deriveEnding(s);
 return s;
}
