// Generated music and effects: no audio files, and nothing plays until the player turns sound on.
const SCALE = [0,2,4,7,9,12,14,16];
const SONGS = [
 {root:60,tempo:.26,melody:[0,2,4,2,5,4,2,1, 0,2,4,5,7,5,4,2],bass:[0,0,3,3,4,4,3,3]},
 {root:57,tempo:.24,melody:[4,2,0,2,4,4,4,-1, 2,2,2,-1,4,6,6,-1],bass:[0,0,5,5,3,3,4,4]},
 {root:62,tempo:.3,melody:[7,-1,5,4,5,-1,2,4, 4,-1,2,0,1,-1,0,-1],bass:[0,0,3,3,5,5,4,4]},
];
const FX = {
 jump:[[380,620,.12,'triangle']],collect:[[880,1180,.09,'triangle'],[1180,1320,.09,'triangle',.07]],
 stomp:[[300,140,.12,'square'],[600,900,.08,'triangle',.08]],hurt:[[200,90,.22,'sawtooth']],
 power:[[520,780,.1,'triangle'],[780,1040,.1,'triangle',.09],[1040,1560,.16,'triangle',.18]],
 boss:[[140,110,.35,'sawtooth'],[110,90,.35,'sawtooth',.25]],bossHit:[[260,520,.12,'square'],[520,330,.12,'triangle',.1]],
 bossDown:[[523,523,.14,'triangle'],[659,659,.14,'triangle',.14],[784,784,.14,'triangle',.28],[1047,1047,.3,'triangle',.42]],
 lamp:[[660,990,.18,'sine'],[990,1320,.2,'sine',.12]],wind:[[300,700,.3,'sine']],
};
const freq = note => 440*2**((note-69)/12);
export function createAudio() {
 let ctx=null,master=null,timer=null,step=0,next=0,song=null;
 const ensure=()=>{if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();master=ctx.createGain();master.gain.value=.5;master.connect(ctx.destination);}ctx.resume?.().catch(()=>{});return ctx;};
 function tone(at,from,to,length,type='triangle',volume=.05){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.connect(g);g.connect(master);
  o.frequency.setValueAtTime(from,at);o.frequency.exponentialRampToValueAtTime(Math.max(30,to),at+length);
  g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(volume,at+.015);g.gain.exponentialRampToValueAtTime(.0001,at+length);o.start(at);o.stop(at+length+.02);
 }
 function schedule(){
  // Look ahead a little so timer jitter never causes gaps in the loop.
  while(song&&next<ctx.currentTime+.25){
   const m=song.melody[step%song.melody.length];
   if(m>=0){const n=song.root+12+SCALE[m%SCALE.length];tone(next,freq(n),freq(n),song.tempo*.9,'triangle',.022);}
   if(step%2===0){const b=song.root-12+SCALE[song.bass[(step/2)%song.bass.length]];tone(next,freq(b),freq(b),song.tempo*1.8,'sine',.03);}
   next+=song.tempo;step++;
  }
 }
 return {
  play(type){try{if(!ensure())return;for(const [a,b,len,wave,delay=0] of FX[type]??FX.collect)tone(ctx.currentTime+delay,a,b,len,wave,.045);}catch{/* Audio is optional. */}},
  music(world){try{if(!ensure())return;this.stop();song=SONGS[world]??SONGS[0];step=0;next=ctx.currentTime+.05;schedule();timer=setInterval(schedule,90);}catch{/* Audio is optional. */}},
  stop(){clearInterval(timer);timer=null;song=null;},
 };
}
