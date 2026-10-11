import React,{useEffect,useMemo,useRef,useState} from 'react';
import './order-game.css';

const RECIPES={
latte:{parts:[['🥛','우유'],['🍓','딸기'],['🧊','얼음']],method:['차가운 우유','딸기청','컵을 기울여 천천히 붓기']},
song:{parts:[['🍚','멥쌀가루'],['🫘','달콤한 소'],['🍃','솔잎']],method:['익반죽','소를 넣어 빚기','충분히 찌기']},
tea:{parts:[['💧','탄산수'],['🍋','유자청'],['🧊','얼음']],method:['컵에 청 넣기','얼음 채우기','탄산수 살살 붓기']},
yak:{parts:[['🌾','밀가루'],['🍯','꿀'],['🌼','계피']],method:['반죽 만들기','기름 온도 확인','집청하기']},
bingsu:{parts:[['🧊','눈꽃 얼음'],['🥛','우유'],['🍓','딸기']],method:['그릇 차갑게','얼음 쌓기','과일 올리기']},
coffee:{parts:[['☕','에스프레소'],['🥛','우유'],['☁️','크림']],method:['원두 추출','우유 담기','크림 올리기']},
mochi:{parts:[['🍚','찹쌀반죽'],['🫘','팥앙금'],['🍥','모양 빚기']],method:['반죽 충분히 익히기','소 넣기','오므려 빚기']},
cake:{parts:[['🥚','케이크 시트'],['☁️','생크림'],['🌺','동백 장식']],method:['시트 식히기','크림 바르기','꽃 장식하기']}
};
const POOL=[['🍫','초콜릿'],['🌶️','고추'],['🧀','치즈'],['🥒','오이'],['🍊','귤'],['🍵','말차'],['🫐','블루베리'],['🍋','레몬'],['🍯','꿀'],['🥕','당근'],['🍓','딸기'],['🥛','우유'],['🧊','얼음'],['☕','에스프레소'],['🥥','코코넛'],['🍒','체리'],['🫘','팥앙금'],['🍚','멥쌀가루']];
const ROUNDS=6;
function createRound(recipe,n){
 const speedRound=n===2||n===5;
 if(speedRound)return {type:'timing',title:n===2?'🔥 오븐 타이밍!':'✨ 완벽한 플레이팅!',desc:'달리는 바늘이 분홍색 구간에 올 때 터치!'};
 const part=recipe.parts[n===0?0:n===1?1:n===3?2:Math.floor(Math.random()*3)];
 const used=new Set(recipe.parts.map(p=>p[1]));const pool=POOL.filter(p=>!used.has(p[1])&&p[1]!==part[1]);
 const decoys=[...pool].sort(()=>Math.random()-.5).slice(0,3);
 const choices=[part,...decoys].sort(()=>Math.random()-.5);
 return {type:'pick',title:n===4?'🚨 깜짝 주문! 정답 재료를 찾아요':'🍰 '+part[1]+' 빠르게 선택!',desc:'틀린 재료는 피하고 정확한 재료를 탭!',answer:part[1],choices};
}
export default function OrderGame({menu,customer,onSuccess,onExit,difficulty=1}){
 const recipe=RECIPES[menu.id]||RECIPES.latte;
 const [round,setRound]=useState(0),[lives,setLives]=useState(3),[combo,setCombo]=useState(0),[bestCombo,setBestCombo]=useState(0),[score,setScore]=useState(0),[notice,setNotice]=useState('준비됐나요? 지금 바로 시작!'),[result,setResult]=useState(''),[feedback,setFeedback]=useState(''),[time,setTime]=useState(1),[needle,setNeedle]=useState(0);
 const roundData=useMemo(()=>createRound(recipe,round),[menu.id,round]);
 const ended=useRef(false),lock=useRef(false),deadline=useRef(0),start=useRef(0);
 const level=Math.min(12,Math.max(1,difficulty));
 const roundMs=Math.max(1750,4300-(level-1)*230-round*190);
 const swingMs=Math.max(520,1650-(level-1)*95-round*65);
 useEffect(()=>{
  if(result)return;
  lock.current=false;start.current=performance.now();deadline.current=start.current+roundMs;
  setTime(1);setNeedle(0);
  const interval=setInterval(()=>{
   if(ended.current||lock.current)return;
   const t=performance.now(),left=(deadline.current-t)/roundMs;
   setTime(Math.max(0,left));
   const fraction=((t-start.current)%swingMs)/swingMs;
   setNeedle(fraction<.5?fraction*2:(1-fraction)*2);
   if(left<=0)miss('시간 초과!');
  },35);
  return()=>clearInterval(interval);
 },[round,result]);
 function next(){
  if(round+1>=ROUNDS){ended.current=true;setResult('win');const quality=bestCombo>=3&&lives>=2?'perfect':'good';onSuccess({remaining:Math.round(time*10),mistakes:3-lives,quality,score,combo:bestCombo,difficulty:level});}
  else setRound(r=>r+1);
 }
 function miss(reason){
  if(lock.current||ended.current)return;lock.current=true;
  const newLives=lives-1;setLives(newLives);setCombo(0);setFeedback('💥 '+reason);
  if(newLives<=0){ended.current=true;setResult('lose');setNotice('손님이 떠났어요. 다음 판에서 만회해요!')}
  else setTimeout(()=>{setFeedback('');next()},410);
 }
 function hit(ok){
  if(lock.current||ended.current)return;
  if(!ok){miss('아쉽다! 다시 집중!');return}
  lock.current=true;
  const nextCombo=combo+1;
  const awarded=100+Math.max(0,Math.floor(time*100))+Math.min(150,combo*25);
  const nextScore=score+awarded;
  setScore(nextScore);setCombo(nextCombo);setBestCombo(v=>Math.max(v,nextCombo));setFeedback(nextCombo>=3?'🔥 '+nextCombo+' COMBO! +'+awarded:'✨ PERFECT! +'+awarded);
  if(round+1>=ROUNDS){
   ended.current=true;setResult('win');
   onSuccess({remaining:Math.round(time*10),mistakes:3-lives,quality:nextCombo>=3&&lives>=2?'perfect':'good',score:nextScore,combo:Math.max(bestCombo,nextCombo),difficulty:level});
  }else setTimeout(()=>{setFeedback('');next()},350);
 }
 const active=!result;
 return <section className="arcade" aria-label={menu.name+' 스피드 베이킹 게임'}>
  <div className="arcade-top"><button onClick={onExit}>← 주문 목록</button><span>⚡ K-BAKERY RUSH</span><b>STAGE {level}</b></div>
  <div className="arcade-header"><span className="arcade-customer">{customer||'🐰'}</span><div><small>손님 주문</small><h3>{menu.emoji} {menu.name}</h3><span>정확하게! 더 빠르게! 6라운드 승부</span></div></div>
  <div className="arcade-hud"><div><small>점수</small><strong>{score.toLocaleString()}</strong></div><div><small>콤보</small><strong>🔥 {combo}</strong></div><div><small>기회</small><strong>{'💗'.repeat(lives)}{'🤍'.repeat(3-lives)}</strong></div></div>
  <div className="arcade-progress">{Array.from({length:ROUNDS},(_,i)=><span key={i} className={i<round||result==='win'?'done':i===round?'here':''}/>)}</div>
  {!result?<div className="arcade-play"><div className="arcade-question"><small>ROUND {round+1} / {ROUNDS}</small><h3>{roundData.title}</h3><p>{roundData.desc}</p></div><div className="arcade-clock"><div style={{width:(time*100)+'%'}}/></div>
  {roundData.type==='pick'?<div className="arcade-choices">{roundData.choices.map((c,i)=><button key={i} disabled={!!feedback} onClick={()=>hit(c[1]===roundData.answer)}><span>{c[0]}</span><b>{c[1]}</b></button>)}</div>:
   <div className="arcade-timing"><div className="arcade-track"><div className="arcade-target"/><div className="arcade-needle" style={{left:needle*100+'%'}}/></div><button disabled={!!feedback} onClick={()=>hit(needle>=.39&&needle<=.61)}>⚡ 지금! 타이밍 맞추기</button><small>분홍 영역에 바늘이 들어오는 순간 누르세요!</small></div>}
  <div className={'arcade-feedback '+(feedback?'show':'')} aria-live="polite">{feedback||'🎯 빠르게 반응하세요!'}</div>
  </div>:<div className="arcade-result"><div>{result==='win'?'🏆':'🥺'}</div><h3>{result==='win'?'베이킹 성공!':'도전 실패!'}</h3><b>{score.toLocaleString()}점</b><p>{result==='win'?'퍼펙트 콤보와 보상이 기록됐어요!':'3번 실수하면 손님이 떠나요. 다른 주문에서 재도전!'}</p><button onClick={onExit}>다음 주문 도전 →</button></div>}
  <div className="arcade-tip">✨ 맞히면 콤보가 올라가고, 스테이지가 높을수록 제한시간이 짧아져요.</div>
 </section>
}
