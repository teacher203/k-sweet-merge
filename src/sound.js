let ctx=null;
let enabled=true;
export function setSoundEnabled(value){enabled=!!value;if(enabled)playSound('click')}
export function isSoundEnabled(){return enabled}
export function playSound(type='click'){
 if(!enabled||typeof window==='undefined')return;
 try{
 const AudioCtx=window.AudioContext||window.webkitAudioContext;
 if(!AudioCtx)return;
 if(!ctx)ctx=new AudioCtx();
 if(ctx.state==='suspended')ctx.resume().catch(()=>{});
 const patterns={
 click:[[620,.035,'sine',.045]],
 correct:[[660,.07,'sine',.09],[880,.09,'sine',.075]],
 combo:[[660,.07,'triangle',.1],[880,.09,'triangle',.09],[1174,.11,'sine',.07]],
 wrong:[[190,.10,'sawtooth',.065],[125,.14,'triangle',.05]],
 tick:[[800,.035,'sine',.055]],
 win:[[523,.10,'triangle',.10],[659,.10,'triangle',.11],[784,.10,'triangle',.10],[1047,.22,'sine',.1]],
 lose:[[280,.13,'triangle',.08],[200,.19,'triangle',.07]],
 buy:[[540,.07,'triangle',.07],[790,.10,'sine',.08]],
 level:[[440,.10,'triangle',.07],[660,.13,'triangle',.09],[880,.16,'sine',.08]]
 };
 let at=ctx.currentTime+.008;
 for(const [frequency,duration,wave,volume] of patterns[type]||patterns.click){
  const osc=ctx.createOscillator(),gain=ctx.createGain();
  osc.type=wave;osc.frequency.setValueAtTime(frequency,at);
  gain.gain.setValueAtTime(.0001,at);
  gain.gain.exponentialRampToValueAtTime(volume,at+.01);
  gain.gain.exponentialRampToValueAtTime(.0001,at+duration);
  osc.connect(gain);gain.connect(ctx.destination);osc.start(at);osc.stop(at+duration+.01);
  at+=duration*.8;
 }
 }catch(e){/* Browser can restrict audio until the first user gesture. */ }
}
