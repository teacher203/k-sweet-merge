import React,{useEffect,useRef,useState} from 'react';
import {playSound} from './sound.js';
import './bakery-world.css';

const MENU=[
{id:'cookie',name:'르뱅 쿠키',emoji:'🍪',img:null,price:145,bake:6,kind:'bake',steps:['반죽 분할','초콜릿 토핑','오븐 굽기']},
{id:'scone',name:'버터 스콘',emoji:'🍞',img:'/art/food-scone.svg',price:135,bake:5,kind:'bake',steps:['반죽 성형','우유 바르기','오븐 굽기']},
{id:'madeleine',name:'마들렌',emoji:'🐚',img:'/art/food-madeleine.svg',price:155,bake:5,kind:'bake',steps:['틀에 팬닝','레몬향 더하기','오븐 굽기']},
{id:'cake',name:'동백 케이크',emoji:'🎂',img:'/art/food-camellia.svg',price:245,bake:7,kind:'decorate',steps:['크림 짜기','동백꽃 장식','완성']},
{id:'mochi',name:'찹쌀떡',emoji:'🍡',img:'/art/food-mochi.svg',price:175,bake:5,kind:'decorate',steps:['떡피 펼치기','앙금 넣기','성형']},
{id:'croissant',name:'크루아상',emoji:'🥐',img:null,price:195,bake:7,kind:'bake',steps:['버터 접기','발효 확인','오븐 굽기']},
{id:'latte',name:'딸기라떼',emoji:'🍓',img:null,price:110,bake:4,kind:'drink',steps:['딸기청 넣기','우유 붓기','층 만들기']},
{id:'financier',name:'휘낭시에',emoji:'🧈',img:null,price:160,bake:6,kind:'bake',steps:['버터 섞기','틀에 팬닝','오븐 굽기']}
];
const FACES=['🐹','🐻','🐱','🐼','🦊','🐰','🐥','🐶'];
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
const Product=({menu})=>menu.img?<img className="bw-food-image" src={menu.img} alt={menu.name}/>:<span className="bw-food-emoji">{menu.emoji}</span>;
const UPGRADE=[
{id:'oven',name:'프로 오븐',emoji:'🔥',cost:650,description:'굽기 속도 20% 증가',max:3},
{id:'case',name:'프리미엄 진열대',emoji:'🍰',cost:480,description:'카페 공간에 디저트 진열 추가',max:2},
{id:'seat',name:'윈도우 테이블',emoji:'🪑',cost:550,description:'손님 대기 좌석 확장',max:2},
{id:'garden',name:'동백 정원',emoji:'🌺',cost:750,description:'카페 밖에 동백꽃 장식',max:1}
];
const nextCustomer=(index,level)=>{const menu=MENU[(index*7+Math.floor(index/3)*3)%MENU.length];return {id:index,menu:menu.id,face:FACES[(index*5)%FACES.length],wait:clamp(43+level*3-index%4*3,30,75),x:105+(index%3)*17}};
export default function BakeryWorld({s,setS,flash,onOldCafe}){
 const [tab,setTab]=useState('floor'),[orders,setOrders]=useState([]),[customerIdx,setCustomerIdx]=useState(0),[selected,setSelected]=useState(null),[phase,setPhase]=useState(''),[touches,setTouches]=useState([]),[quality,setQuality]=useState(0),[bakeStart,setBakeStart]=useState(0),[timer,setTimer]=useState(0),[clock,setClock]=useState(0),[anim,setAnim]=useState(null),[feedback,setFeedback]=useState('');
 const last=useRef(Date.now()),ordersRef=useRef([]),orderId=useRef(0),selectedRef=useRef(null),phaseRef=useRef(''),gestureRef=useRef(false),animTimer=useRef(0),sceneRef=useRef(null);
 const world=s.bakeryWorld||{level:1,exp:0,served:0,failed:0,renovations:{},best:0};
 const lv=world.level||1,ren=world.renovations||{};
 const selectedOrder=orders.find(o=>o.id===selected);
 const menu=selectedOrder&&MENU.find(m=>m.id===selectedOrder.menu);
 const ovenBonus=ren.oven||0;
 const duration=menu?Math.max(3,menu.bake*(1-ovenBonus*.2)):0;
 const fixState=(update)=>setS(v=>({...v,bakeryWorld:update(v.bakeryWorld||{level:1,exp:0,served:0,failed:0,renovations:{},best:0})}));
 useEffect(()=>{let alive=true;const id=window.setInterval(()=>{if(!alive)return;const now=Date.now(),delta=clamp((now-last.current)/1000,0,1.5);last.current=now;setClock(now);setTimer(t=>t+delta);
 setOrders(prev=>{let list=prev.map(o=>({...o,wait:o.wait-delta}));const expired=list.filter(o=>o.wait<=0);if(expired.length){fixState(w=>({...w,failed:(w.failed||0)+expired.length}));setFeedback('손님이 기다리다 떠났어요. 다음 주문은 더 빠르게!')}
 list=list.filter(o=>o.wait>0);let count=orderId.current;if(count===0){list=[nextCustomer(1,lv),nextCustomer(2,lv)];count=3}
 if(list.length<(ren.seat?4:3)&&count<9999&&Math.random()<delta*.4){list.push(nextCustomer(count,lv));count++}
 orderId.current=count;ordersRef.current=list;return list;
 })},250);return()=>{alive=false;window.clearInterval(id);window.clearTimeout(animTimer.current)}},[]);
 useEffect(()=>{if(selected!==null&&!orders.some(o=>o.id===selected)){setSelected(null);setPhase('');setTouches([])}},[orders,selected]);
 const selectOrder=o=>{setSelected(o.id);setTouches([]);setQuality(0);setPhase('prepare');setFeedback(o.face+' 손님의 '+MENU.find(m=>m.id===o.menu)?.name+' 주문을 시작해요.');playSound('click')};
 const prepareTap=(position)=>{
 if(!menu||phase!=='prepare')return;
 if(touches.includes(position))return;
 const list=[...touches,position];setTouches(list);playSound('tick');setFeedback(menu.steps[Math.min(list.length-1,2)]+' · '+list.length+'/3');
 if(list.length>=3){setQuality(15);setPhase('bake');setBakeStart(Date.now());playSound('correct');setFeedback(menu.kind==='drink'?'음료 마무리 타이밍을 맞춰주세요!':menu.kind==='decorate'?'장식을 완성할 타이밍을 맞춰주세요!':'오븐에서 색이 나는 순간을 기다려요!')}
 };
 const progress=phase==='bake'?clamp((clock-bakeStart)/(duration*1000),0,1):0;
 const finalise=()=>{
 if(!menu||phase!=='bake')return;
 const good=progress>=.72&&progress<=.94;
 if(progress<.4){setFeedback('아직 덜 익었어요! 기다렸다가 꺼내주세요.');playSound('wrong');return}
 if(progress<.72){setFeedback('조금 이릅니다. 황금색 구간을 노려보세요.');playSound('wrong');return}
 if(progress>=1){setFeedback('너무 늦었어요! 그래도 완성은 할 수 있어요.')}
 const q=good?100:progress<1?68:45,bonus=good?1.45:q===68?1.05:.75;
 const order=ordersRef.current.find(o=>o.id===selected);
 if(!order){setSelected(null);setPhase('');return}
 const coins=Math.round(menu.price*bonus*(1+(ren.case||0)*.08)),xp=Math.round(14+q/10);
 setS(v=>{const w=v.bakeryWorld||{level:1,exp:0,served:0,renovations:{}};const totalXp=(w.exp||0)+xp;return {...v,coins:v.coins+coins,exp:v.exp+xp,served:(v.served||0)+1,bakeryWorld:{...w,exp:totalXp,level:1+Math.floor(totalXp/180),served:(w.served||0)+1,best:Math.max(w.best||0,q)}}});
 setOrders(v=>v.filter(x=>x.id!==selected));ordersRef.current=ordersRef.current.filter(x=>x.id!==selected);
 setAnim({face:order.face,item:menu.name,quality:q});window.clearTimeout(animTimer.current);animTimer.current=window.setTimeout(()=>setAnim(null),2100);
 setSelected(null);setPhase('');setTouches([]);setFeedback('🎉 '+(good?'퍼펙트 제조! ':'제조 완료! ')+'+'+coins+'코인 · '+q+'점');playSound(good?'combo':'win');
 };
 const buy=(id)=>{const u=UPGRADE.find(v=>v.id===id);const level=ren[id]||0;if(!u||level>=u.max)return;const cost=Math.round(u.cost*(1+level*.6));if(s.coins<cost){flash('코인이 부족해요! 주문을 완료하고 다시 시도하세요.');return}setS(v=>{const old=v.bakeryWorld||{level:1,exp:0,served:0,renovations:{}};return {...v,coins:v.coins-cost,bakeryWorld:{...old,renovations:{...(old.renovations||{}),[id]:level+1}}}});playSound('buy');flash(u.name+' 업그레이드 완료! 카페를 확인해 보세요.');setTab('floor')};
 const currentUpgrade=UPGRADE.map(u=>({...u,owned:ren[u.id]||0,cost:Math.round(u.cost*(1+(ren[u.id]||0)*.6))}));
 return <div className="bw-app">
 <header className="bw-top"><div><small>MY BAKERY STORY</small><h1>K-BAKERY <em>WORLD</em></h1></div><div className="bw-top-purse"><span>🪙 {s.coins.toLocaleString()}</span><span>✦ Lv.{lv}</span></div></header>
 <div className="bw-tabs">{[['floor','🏠 카페 운영'],['build','🛠️ 공간 확장'],['story','🏆 성장 기록']].map(([id,t])=><button key={id} onClick={()=>{setTab(id);if(id!=='floor'){setSelected(null);setPhase('')}}} className={tab===id?'active':''}>{t}</button>)}</div>
 {tab==='floor'&&<>
 <div className="bw-scene" ref={sceneRef}>
 <img src="/art/club-cafe-stage.svg" className="bw-room" alt="바다가 보이는 따뜻한 카페 내부"/>
 {ren.garden>0&&<div className="bw-garden">🌺🌿🌺</div>}
 {ren.case>0&&<div className="bw-display">{['🍪','🍰','🥐','🐚'].slice(0,2+ren.case).map((x,i)=><span key={i}>{x}</span>)}</div>}
 {ren.oven>0&&<div className="bw-oven">🔥<small>PRO OVEN {ren.oven}</small></div>}
 {ren.seat>0&&<div className="bw-seats">{Array.from({length:ren.seat},(_,i)=><span key={i}>🪑</span>)}</div>}
 <div className="bw-shop-sign"><span>OPEN</span><b>BAKERY & COFFEE</b><small>MADE WITH LOVE</small></div>
 <div className="bw-worker bw-worker-mocha"><span className="bw-bubble">{selectedOrder&&menu?.kind==='drink'?'바로 만들어볼게!':'어서 오세요!'}</span><img src="/mascots/cute-mocha.svg" alt="바리스타 모카"/><b>MOCHA · BARISTA</b></div>
 <div className={'bw-worker bw-worker-berry '+(phase?'working':'')}><span className="bw-bubble">{phase==='bake'?'완벽한 타이밍은 언제?':phase==='prepare'?'함께 만들어봐!':'오늘도 맛있게!'}</span><img src="/mascots/cute-berry.svg" alt="파티시에 딸기"/><b>BERRY · PATISSIER</b></div>
 <div className="bw-worker bw-worker-bong"><span className="bw-bubble">{orders.length?'손님이 기다려요!':'어서 오세요!'}</span><img src="/mascots/cute-bong.svg" alt="매니저 봉봉"/><b>BONG · MANAGER</b></div>
 <div className="bw-guests">{orders.slice(0,4).map((o,i)=><button key={o.id} className="bw-guest" onClick={()=>selectOrder(o)} title="손님 주문 확인"><span>{o.face}</span><small>{Math.ceil(o.wait)}초</small></button>)}</div>
 <div className="bw-front"><span>🥐</span><span>🍰</span><strong>FRESH BAKERY</strong><span>☕</span><span>🍓</span></div>
 {anim&&<div className="bw-celebrate"><span>✨ GREAT SERVICE! ✨</span><strong>{anim.face} {anim.item}</strong><small>QUALITY {anim.quality}</small></div>}
 </div>
 <div className="bw-shift-head"><div><b>오늘의 카페</b><small>카페 운영 · 제조 · 확장</small></div><div className="bw-stats"><span>🧁 {world.served||0}건</span><span>⭐ {world.exp||0} XP</span></div></div>
 {selectedOrder&&menu?<section className="bw-craft">
 <div className="bw-craft-top"><div><small>NOW MAKING</small><h2>{menu.name}</h2><p>{menu.steps.join(' → ')}</p></div><Product menu={menu}/><button onClick={()=>{setSelected(null);setPhase('');setTouches([])}} aria-label="제조 닫기">✕</button></div>
 {phase==='prepare'&&<><p className="bw-step-title">작업대에서 1 → 2 → 3 순서로 터치해 제조하세요.</p><div className="bw-craft-actions">{menu.steps.map((step,i)=><button key={i} disabled={touches.includes(i)||i!==touches.length} className={touches.includes(i)?'done':''} onClick={()=>prepareTap(i)}><span>{['🥣','🧈','👩‍🍳'][i]}</span><b>{step}</b><small>{touches.includes(i)?'완료 ✓':'STEP 0'+(i+1)}</small></button>)}</div></>}
 {phase==='bake'&&<><div className="bw-meter-heading"><span>{menu.kind==='drink'?'🥤 음료 완성도':menu.kind==='decorate'?'🌺 장식 마무리':'🔥 굽기 완성도'}</span><strong>{Math.round(progress*100)}%</strong></div><div className="bw-meter"><div className="bw-meter-perfect"/><span style={{width:(progress*100)+'%'}}/></div><p className="bw-meter-hint">72~94%의 황금색 구간에서 꺼내면 PERFECT!</p><button className="bw-finish" onClick={finalise}>{menu.kind==='drink'?'🥤 음료 완성하기':menu.kind==='decorate'?'🌺 장식 마무리':'🔥 오븐에서 꺼내기'}</button></>}
 </section>:<section className="bw-orders"><div className="bw-orders-head"><h2>손님 주문</h2><small>손님을 누르거나 주문 카드를 선택하세요</small></div><div className="bw-order-list">{orders.map(o=>{const m=MENU.find(t=>t.id===o.menu)||MENU[0];return <button key={o.id} onClick={()=>selectOrder(o)}><span className="bw-order-face">{o.face}</span><Product menu={m}/><div><b>{m.name}</b><small>남은 대기시간 {Math.ceil(o.wait)}초</small><i style={{width:clamp(o.wait/65*100,0,100)+'%'}}/></div><span className="bw-order-arrow">→</span></button>})}</div></section>}
 <p className="bw-feedback" role="status">{feedback||'손님을 선택하고 디저트를 직접 만들어 보세요.'}</p>
 </>}
 {tab==='build'&&<section className="bw-grow"><div className="bw-grow-hero"><h2>카페를 더 멋지게</h2><p>판매 수익으로 설비를 업그레이드하면 실제 카페 장면이 변합니다.</p></div><div className="bw-grow-list">{currentUpgrade.map(u=><article key={u.id}><span className="bw-upgrade-icon">{u.emoji}</span><div><b>{u.name}</b><p>{u.description}</p><small>Lv.{u.owned} / {u.max}</small></div><button disabled={u.owned>=u.max} onClick={()=>buy(u.id)}>{u.owned>=u.max?'완성':u.cost+' 🪙'}</button></article>)}</div></section>}
 {tab==='story'&&<section className="bw-story"><div className="bw-story-hero"><h2>나의 베이커리 스토리</h2><strong>LEVEL {lv}</strong><p>내가 직접 키운 카페의 성장 기록</p></div><div className="bw-story-grid">{[['누적 제조',world.served||0,'건'],['획득 경험치',world.exp||0,'XP'],['최고 품질',world.best||0,'점'],['놓친 손님',world.failed||0,'명']].map(([l,n,u])=><div key={l}><small>{l}</small><b>{n.toLocaleString()}<i> {u}</i></b></div>)}</div><p className="bw-story-msg">기존 코인·직원·레시피·꾸미기 정보와 함께 새 카페 성장 기록도 이 기기에 저장됩니다.</p><button className="bw-old" onClick={onOldCafe}>이전 카페 꾸미기·레시피 보기 →</button></section>}
 </div>
}
