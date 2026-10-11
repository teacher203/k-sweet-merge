import React,{useEffect,useMemo,useRef,useState} from 'react';
import './order-game.css';
import {playSound} from './sound.js';

const PLANS={
latte:{group:'🥤 음료 제조',steps:[
['pick','딸기라떼에 먼저 넣을 재료는?','🍓','딸기청',['우유','고추장','탄산수']],
['tap','🍓 딸기청을 컵에 담아요','컵 채우기',5],
['pick','딸기청 다음에는?','🧊','얼음',['밀가루','뜨거운 물','솔잎']],
['timing','🥛 우유를 천천히 부어요','우유 붓기'],
['pick','마지막 장식은?','🍓','딸기',['솔잎','계피','소금']],
['timing','✨ 라떼 층을 예쁘게 마무리!','층 맞추기']]},
song:{group:'🍡 떡 빚기',steps:[
['pick','송편 반죽에 필요한 가루는?','🍚','멥쌀가루',['강력분','코코아가루','옥수수만']],
['tap','🤲 반죽을 부드럽게 치대요','반죽 치대기',6],
['pick','송편 속에 넣을 것은?','🫘','달콤한 소',['얼음','생크림','유자청']],
['timing','🌙 반달 모양으로 오므려요','송편 빚기'],
['pick','찔 때 아래에 까는 것은?','🍃','솔잎',['냅킨','초콜릿','빨대']],
['timing','♨️ 찜기에서 충분히 익혀요','찜 타이밍']]},
tea:{group:'🥤 탄산 음료',steps:[
['pick','유자에이드의 맛을 내는 것은?','🍋','유자청',['된장','생크림','팥앙금']],
['tap','🍋 유자청을 컵에 담아요','유자청 채우기',5],
['pick','시원한 에이드에 넣을 것은?','🧊','얼음',['밀가루','솔잎','버터']],
['timing','💦 탄산수를 살살 부어요','탄산수 붓기'],
['pick','마무리 장식은?','🍊','유자 조각',['송편','소금','밀가루']],
['timing','✨ 거품이 넘치지 않게 완성!','거품 조절']]},
yak:{group:'🍯 전통 디저트',steps:[
['pick','약과 반죽의 주재료는?','🌾','밀가루',['찹쌀떡','딸기청','탄산수']],
['tap','🤲 약과 반죽을 치대요','반죽 준비',6],
['pick','모양을 만든 뒤 조리법은?','🍳','기름에 튀기기',['얼리기','우유에 담그기','스팀 밀크']],
['timing','🍯 기름 속에서 알맞게 익혀요','튀김 타이밍'],
['pick','익힌 약과를 담그는 것은?','🍯','집청 시럽',['생수','식초','아이스티']],
['timing','✨ 알맞은 시간에 집청 마무리!','집청 타이밍']]},
bingsu:{group:'🍧 빙수 조립',steps:[
['pick','딸기빙수의 베이스는?','🧊','눈꽃 얼음',['뜨거운 물','강력분','마른쌀']],
['tap','🍧 얼음을 높이 쌓아 올려요','얼음 쌓기',6],
['pick','빙수에 어울리는 과일은?','🍓','딸기',['양파','솔잎','고추']],
['timing','🥛 우유를 고르게 부어요','우유 붓기'],
['pick','딸기빙수 마지막 토핑은?','🍓','딸기 소스',['소금','간장','후추']],
['timing','✨ 녹기 전에 플레이팅!','장식 타이밍']]},
coffee:{group:'☕ 바리스타',steps:[
['pick','크림라떼 베이스로 사용할 것은?','☕','에스프레소',['찹쌀반죽','솔잎','유자청']],
['tap','☕ 에스프레소 추출을 준비!','추출 준비',5],
['pick','라떼에 넣을 유제품은?','🥛','우유',['식초','간장','탄산수만']],
['timing','🥛 우유를 적당히 부어요','우유 붓기'],
['pick','마지막으로 올릴 것은?','☁️','휘핑크림',['쌀가루','송편','솔잎']],
['timing','✨ 크림을 부드럽게 올려요','크림 올리기']]},
mochi:{group:'🍥 찹쌀떡 성형',steps:[
['pick','찹쌀떡 피에 사용하는 것은?','🍚','준비된 찹쌀떡 피',['유자탄산수','식빵','에스프레소']],
['tap','🤲 떡피를 알맞게 펼쳐요','떡피 펼치기',5],
['pick','속에 들어갈 앙금은?','🫘','팥앙금',['소금','탄산수','계피가루만']],
['timing','🤲 떡피를 부드럽게 오므려요','성형 타이밍'],
['pick','손에 붙지 않도록 쓰는 것은?','🌾','덧가루',['딸기청','생크림','버터시럽']],
['timing','✨ 동그랗고 매끈하게 마무리!','마감 타이밍']]},
cake:{group:'🎂 케이크 장식',steps:[
['pick','케이크를 만들기 전에 필요한 것은?','🍰','식힌 케이크 시트',['얼음만','유자청만','송편']],
['tap','🎂 케이크에 크림을 골고루 발라요','크림 바르기',6],
['pick','케이크 층 사이에 넣을 것은?','☁️','생크림',['탄산수','간장','솔잎']],
['timing','🍰 시트를 가지런히 쌓아요','시트 쌓기'],
['pick','동백 케이크의 장식은?','🌹','식용 앙금꽃',['생화 그대로','플라스틱 꽃','빨대']],
['timing','✨ 꽃 장식을 정교하게 마무리!','데코 타이밍']]}
,
cookie:{group:'🍪 구움과자 · 쿠키',steps:[
['pick','르뱅 쿠키의 기본 재료는?','🧈','버터',['탄산수','솔잎','유자청']],
['tap','🧈 버터와 설탕을 섞어요','반죽 섞기',5],
['pick','쿠키 반죽에 넣으면 좋은 것은?','🍫','초콜릿',['간장','탄산수만','솔잎']],
['timing','🍪 반죽을 큼직하게 분할해요','반죽 분할'],
['pick','구운 쿠키의 핵심은?','🍪','겉바속촉',['얼음만','생수','휘핑크림']],
['timing','🔥 오븐에서 구워 익힘을 확인해요','굽기 판정']]},
financier:{group:'🧈 구움과자 · 휘낭시에',steps:[
['pick','휘낭시에 특유의 풍미는?','🧈','태운 버터',['탄산수만','팥앙금','솔잎']],
['tap','🥣 가루와 흰자를 섞어요','반죽 섞기',5],
['pick','휘낭시에 반죽에 많이 사용하는 가루는?','🌰','아몬드가루',['멥쌀가루','솔잎','생수']],
['timing','🧈 버터를 반죽에 섞어요','혼합 타이밍'],
['pick','휘낭시에 반죽을 담는 것은?','🧁','휘낭시에 틀',['음료 컵','빨대','찜기']],
['timing','🔥 오븐에서 가장자리를 노릇하게 구워요','굽기 판정']]},
madeleine:{group:'🐚 구움과자 · 마들렌',steps:[
['pick','마들렌을 만들 때 필요한 것은?','🥚','달걀',['유자탄산수','팥앙금','솔잎']],
['tap','🥣 달걀과 설탕을 섞어요','휘핑 준비',5],
['pick','마들렌의 대표적인 틀 모양은?','🐚','조개 모양',['별 모양만','우동 면발','빨대']],
['timing','🧁 틀에 반죽을 고르게 팬닝해요','팬닝 타이밍'],
['pick','마들렌 향을 더하는 재료는?','🍋','레몬 제스트',['고추장','생수','간장']],
['timing','🔥 오븐에서 봉긋하게 구워요','굽기 판정']]},
scone:{group:'🥐 베이커리 · 스콘',steps:[
['pick','스콘의 기본 재료는?','🌾','밀가루',['탄산수','팥앙금','솔잎']],
['tap','🧈 차가운 버터를 가루에 섞어요','버터 섞기',6],
['pick','스콘 반죽을 다룰 때 중요한 것은?','🤲','과하게 치대지 않기',['오랫동안 끓이기','찬물만 붓기','얼음에 담그기']],
['timing','🥐 두께를 맞춰 반죽을 성형해요','성형 타이밍'],
['pick','스콘을 구울 때 사용하는 것은?','🔥','오븐',['냉장고만','찜기만','에스프레소 머신']],
['timing','✨ 황금빛으로 구워졌을 때 꺼내요','굽기 판정']]},
croissant:{group:'🥐 베이커리 · 크루아상',steps:[
['pick','크루아상 층을 만드는 재료는?','🧈','버터',['딸기청','팥앙금','탄산수']],
['tap','🥐 반죽과 버터를 차갑게 접어요','겹치기',6],
['pick','크루아상의 핵심 작업은?','📐','접기와 밀기',['끓이기만','집청','얼음 넣기']],
['timing','🥐 삼각형 반죽을 돌돌 말아요','말기 타이밍'],
['pick','굽기 전에 필요한 과정은?','🍞','발효',['냉동만','탄산수 붓기','팥소 넣기']],
['timing','🔥 오븐에서 결이 살아나도록 구워요','굽기 판정']]}
};
const EMOJI={"우유":"🥛","얼음":"🧊","밀가루":"🌾","딸기":"🍓","솔잎":"🌿","생크림":"🍦","탄산수":"🫧","강력분":"🌾","고추장":"🌶️","뜨거운 물":"♨️","계피":"🪵","소금":"🧂","코코아가루":"🍫","옥수수만":"🌽","냅킨":"🧻","초콜릿":"🍫","빨대":"🥤","된장":"🫘","팥앙금":"🫘","버터":"🧈","송편":"🍡","찹쌀떡":"🍥","기름에 튀기기":"🍳","얼리기":"🧊","우유에 담그기":"🥛","스팀 밀크":"☕","생수":"💧","식초":"🍶","아이스티":"🧋","마른쌀":"🍚","양파":"🧅","고추":"🌶️","간장":"🍶","후추":"🧂","찹쌀반죽":"🍚","유자청":"🍋","탄산수만":"🫧","쌀가루":"🍚","유자탄산수":"🥤","식빵":"🍞","에스프레소":"☕","계피가루만":"🪵","버터시럽":"🍯","얼음만":"🧊","유자청만":"🍋","식힌 케이크 시트":"🍰","생화 그대로":"🌺","플라스틱 꽃":"🪷","달콤한 소":"🫘","딸기청":"🍓","유자 조각":"🍊","집청 시럽":"🍯","눈꽃 얼음":"🍧","딸기 소스":"🍓","휘핑크림":"🍦","준비된 찹쌀떡 피":"🍥","덧가루":"🌾","식용 앙금꽃":"🌺"};
function randomize(a){const v=[...a];for(let i=v.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[v[i],v[j]]=[v[j],v[i]]}return v}
const EXTRA_EMOJI={버터:'🧈',초콜릿:'🍫','겉바속촉':'🍪','태운 버터':'🧈','아몬드가루':'🌰','멥쌀가루':'🍚','휘낭시에 틀':'🧁','음료 컵':'🥤','찜기':'♨️','달걀':'🥚','조개 모양':'🐚','별 모양만':'⭐','우동 면발':'🍜','레몬 제스트':'🍋','과하게 치대지 않기':'🤲','오랫동안 끓이기':'♨️','찬물만 붓기':'💧','얼음에 담그기':'🧊','오븐':'🔥','냉장고만':'🧊','찜기만':'♨️','에스프레소 머신':'☕','접기와 밀기':'📐','끓이기만':'♨️','집청':'🍯','얼음 넣기':'🧊','발효':'🍞','냉동만':'🧊','탄산수 붓기':'💧','팥소 넣기':'🫘'};
const FoodArt=({menu})=>menu.image?<img className="arcade-food-art" src={menu.image} alt={menu.name}/>:<span>{menu.emoji}</span>;
export default function OrderGame({menu,customer,onSuccess,onExit,difficulty=1}){
 const plan=PLANS[menu.id]||PLANS.latte;
 const [round,setRound]=useState(0),[lives,setLives]=useState(3),[combo,setCombo]=useState(0),[bestCombo,setBestCombo]=useState(0),[score,setScore]=useState(0),[result,setResult]=useState(''),[feedback,setFeedback]=useState(''),[time,setTime]=useState(1),[needle,setNeedle]=useState(0),[taps,setTaps]=useState(0);
 const ended=useRef(false),lock=useRef(false),deadline=useRef(0),start=useRef(0),tapCount=useRef(0);
 const level=Math.min(12,Math.max(1,difficulty));
 const step=plan.steps[Math.min(5,round)];
 const choices=useMemo(()=>step[0]==='pick'?randomize([[step[2],step[3]],...step[4].map(v=>[EXTRA_EMOJI[v]||EMOJI[v]||'🍽️',v])]):[],[menu.id,round]);
 const roundMs=Math.max(2700,7200-(level-1)*340-round*100);
 const swingMs=Math.max(850,2300-(level-1)*125-round*65);
 useEffect(()=>{if(result)return;lock.current=false;tapCount.current=0;setTaps(0);start.current=performance.now();deadline.current=start.current+roundMs;setTime(1);setNeedle(0);
 const timer=setInterval(()=>{if(ended.current||lock.current)return;const n=performance.now();const frac=Math.max(0,(deadline.current-n)/roundMs);setTime(frac);const phase=((n-start.current)%swingMs)/swingMs;setNeedle(phase<.5?phase*2:(1-phase)*2);if(frac<=0)miss('시간 초과!')},35);
 return()=>clearInterval(timer)},[round,result]);
 function next(){if(round+1<6)setRound(v=>v+1)}
 function miss(reason){if(lock.current||ended.current)return;playSound('wrong');lock.current=true;const count=lives-1;setLives(count);setCombo(0);setFeedback('💥 '+reason);
 if(count<=0||round===5){playSound('lose');ended.current=true;setResult('lose')}
 else setTimeout(()=>{setFeedback('');next()},450)}
 function hit(ok){
 if(lock.current||ended.current)return;if(!ok){miss('정답이 아니에요!');return}
 playSound(combo>=2?'combo':'correct');lock.current=true;const chain=combo+1;const gained=110+Math.round(time*95)+Math.min(180,combo*30),total=score+gained;
 setScore(total);setCombo(chain);setBestCombo(v=>Math.max(v,chain));setFeedback(chain>=3?'🔥 '+chain+' COMBO! +'+gained:'✨ PERFECT! +'+gained);
 if(round===5){playSound('win');ended.current=true;setResult('win');onSuccess({remaining:Math.round(time*10),mistakes:3-lives,quality:lives>=2&&chain>=3?'perfect':'good',score:total,combo:Math.max(bestCombo,chain),difficulty:level})}
 else setTimeout(()=>{setFeedback('');next()},390)
 }
 function tap(){if(lock.current||ended.current)return;playSound('tick');tapCount.current+=1;setTaps(tapCount.current);if(tapCount.current>=step[3])hit(true)}
 return <section className="arcade" aria-label={menu.name+' 메뉴별 제작 챌린지'}>
 <div className="arcade-top"><button onClick={onExit}>← 주문 목록</button><span>🍓 K-BAKERY RUSH</span><b>STAGE {level}</b></div>
 <div className="arcade-header"><span className="arcade-customer">{customer||'🐰'}</span><div><small>{plan.group} · 손님 주문</small><h3><FoodArt menu={menu}/> {menu.name}</h3><span>재료 · 손놀림 · 정확한 타이밍</span></div></div>
 <div className="arcade-hud"><div><small>점수</small><strong>{score.toLocaleString()}</strong></div><div><small>연속 성공</small><strong>🔥 {combo}</strong></div><div><small>기회</small><strong>{'💗'.repeat(lives)}{'🤍'.repeat(3-lives)}</strong></div></div>
 <div className="arcade-progress">{Array.from({length:6},(_,i)=><span key={i} className={i<round||result==='win'?'done':i===round?'here':''}/>)}</div>
 {!result?<div className="arcade-play"><div className="arcade-question"><small>ROUND {round+1}/6 · {step[0]==='pick'?'재료 판단':step[0]==='tap'?'스피드 액션':'정밀 타이밍'}</small><h3>{step[1]}</h3><p>{step[0]==='pick'?'정답 재료를 빠르게 골라주세요!':step[0]==='tap'?'버튼을 빠르게 반복해서 목표 횟수를 채워요!':'분홍 구간에 바늘이 올 때 누르세요!'}</p></div>
 <div className="arcade-clock"><div style={{width:time*100+'%'}}/></div>
 {step[0]==='pick'?<div className="arcade-choices">{choices.map((item,i)=><button key={i} disabled={!!feedback} onClick={()=>hit(item[1]===step[3])}><span>{item[1]==='식용 앙금꽃'?<img className="arcade-choice-art" src="/art/food-camellia.svg" alt="빨간 동백 앙금꽃"/>:item[1]==='준비된 찹쌀떡 피'||item[1]==='찹쌀떡'?<img className="arcade-choice-art" src="/art/food-mochi.svg" alt="둥근 찹쌀떡"/>:item[0]}</span><b>{item[1]}</b></button>)}</div>:step[0]==='tap'?
 <div className="bakery-tap-game"><div className="bakery-tap-scene"><FoodArt menu={menu}/><span className="bakery-sprinkle">✨</span><span className="bakery-sprinkle">💫</span></div><div className="bakery-tap-progress"><div style={{width:Math.min(100,taps/step[3]*100)+'%'}}/></div><button disabled={!!feedback} onClick={tap}>{step[2]} <b>{taps}/{step[3]}</b></button></div>:
 <div className="arcade-timing"><div className="arcade-track"><div className="arcade-target"/><div className="arcade-needle" style={{left:needle*100+'%'}}/></div><button disabled={!!feedback} onClick={()=>hit(needle>=.39&&needle<=.61)}>⚡ {step[2]} — 지금!</button><small>메뉴에 맞는 제조 타이밍을 잡아주세요.</small></div>}
 <div className={'arcade-feedback '+(feedback?'show':'')} aria-live="polite">{feedback||'🎯 빠르게, 정확하게!'}</div></div>:
 <div className="arcade-result"><div>{result==='win'?'🏆':'🥺'}</div><h3>{result==='win'?'주문 완성!':'이번 주문 실패!'}</h3><b>{score.toLocaleString()}점</b><p>{result==='win'?'콤보와 점수가 보상에 반영돼요.':'실수 세 번 또는 마지막 단계 실패 시 주문 종료!'}</p><button onClick={onExit}>다른 주문 도전 →</button></div>}
 <div className="arcade-tip">🥛 음료는 붓기, 🍡 송편은 빚기·찌기, 🍯 약과는 튀기기처럼 메뉴별로 다른 공정을 체험합니다.</div>
 </section>
}
