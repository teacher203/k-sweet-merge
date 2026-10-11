import React,{useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import './sweetcafe.css';

const CREW=[
{id:'mocha',name:'모카',job:'고양이 바리스타',type:'음료',color:'#ffd7a6',asset:'/crew/portrait-mocha.webp',emoji:'🐱',power:'음료 제조',base:120},
{id:'berry',name:'딸기',job:'토끼 파티시에',type:'디저트',color:'#ffd3e4',asset:'/crew/portrait-berry.webp',emoji:'🐰',power:'디저트 품질',base:210},
{id:'bong',name:'봉봉',job:'판다 매니저',type:'서비스',color:'#efdcba',asset:'/crew/portrait-bong.webp',emoji:'🐼',power:'서빙 속도',base:310}
];
const MENU=[
{id:'latte',name:'딸기라떼',emoji:'🍓',type:'음료',pay:38,need:1},
{id:'song',name:'송편',emoji:'🍡',type:'디저트',pay:48,need:1},
{id:'tea',name:'유자에이드',emoji:'🍋',type:'음료',pay:65,need:2},
{id:'yak',name:'약과',emoji:'🍯',type:'디저트',pay:78,need:2},
{id:'bingsu',name:'딸기빙수',emoji:'🍧',type:'디저트',pay:100,need:3},
{id:'coffee',name:'크림라떼',emoji:'☕',type:'음료',pay:115,need:3},
{id:'mochi',name:'찹쌀떡',emoji:'🍥',type:'디저트',pay:145,need:4},
{id:'cake',name:'동백 케이크',emoji:'🎂',type:'디저트',pay:200,need:5}
];
const FURNI=[
{id:'table',name:'딸기 테이블',emoji:'🪑',cost:140,type:'가구'},
{id:'plant',name:'꽃 화분',emoji:'🌷',cost:110,type:'가구'},
{id:'lamp',name:'별빛 조명',emoji:'✨',cost:170,type:'가구'},
{id:'shelf',name:'디저트 진열대',emoji:'🍰',cost:220,type:'가구'},
{id:'cat',name:'고양이 인형',emoji:'🧸',cost:190,type:'가구'},
{id:'balloon',name:'하트 풍선',emoji:'🎈',cost:160,type:'가구'},
{id:'shell',name:'조개 소품',emoji:'🐚',cost:100,type:'가구'},
{id:'flower',name:'동백 꽃다발',emoji:'💐',cost:120,type:'가구'}
];
const TYPES=['음료','디저트','서비스'];
const init=()=>({coins:500,gems:10,day:1,exp:0,rep:0,served:0,crew:[{id:'mocha',lv:1,station:'음료'},{id:'berry',lv:1,station:'디저트'}],inventory:[{uid:1,id:'table',x:57,y:77},{uid:2,id:'plant',x:22,y:44}],serial:3,recipes:['latte','song'],recipeParts:0,orders:[],last:Date.now(),offlineGift:0,gachaCount:0,decorCount:0,best:0,claim:{},rushCount:0});
function load(){try{const v=JSON.parse(localStorage.getItem('ksweet-cafe-v2'));if(v&&Array.isArray(v.crew)){const byId={};for(const w of v.crew){const id=w.id==='mimi'?'berry':w.id==='coco'?'mocha':w.id;if(!CREW.some(c=>c.id===id))continue;if(!byId[id]||w.lv>byId[id].lv)byId[id]={...w,id}}return {...init(),...v,crew:Object.values(byId)}}const legacy=JSON.parse(localStorage.getItem('ksweet-v1'));if(legacy)return {...init(),coins:Math.max(500,legacy.coins||0),exp:legacy.exp||0,served:legacy.served||0}}catch{}return init()}
const randomOrder=(state)=>{const available=MENU.filter(m=>state.recipes.includes(m.id));const item=available[Math.floor(Math.random()*available.length)]||MENU[0];return {id:Date.now()+Math.floor(Math.random()*1e6),menu:item.id,wait:42+Math.floor(Math.random()*12),customer:['🐻','🐼','🐥','🐱','🐰','🦊'][Math.floor(Math.random()*6)]}};
function CrewPortrait({crew,small=false}){return <img className={'crew-portrait '+(small?'crew-portrait-small ':'')+'crew-portrait-'+crew.id} src={crew.asset} alt={crew.name+' '+crew.job} loading="eager" draggable={false}/>}
function App(){
 const [s,setS]=useState(load);
 const [tab,setTab]=useState('cafe');
 const [msg,setMsg]=useState('귀여운 카페가 문을 열었어요! 🧁');
 const [now,setNow]=useState(Date.now());
 const [rush,setRush]=useState(null);
 const [chosenDraw,setChosenDraw]=useState(null);
 const [edit,setEdit]=useState(false);
 const [selectedItem,setSelectedItem]=useState(null);
 const moved=useRef(null);
 const state=useRef(s);state.current=s;
 useEffect(()=>{localStorage.setItem('ksweet-cafe-v2',JSON.stringify(s))},[s]);
 useEffect(()=>{const tick=()=>{const time=Date.now();setNow(time);setS(p=>{
 const steps=Math.min(30,Math.floor((time-p.last)/5000));if(steps<=0)return p;
 const workers=p.crew.filter(w=>w.station);const earnings=workers.reduce((sum,w)=>sum+(7+w.lv*4),0)*steps;
 const orders=p.orders.map(o=>({...o,wait:Math.max(0,o.wait-steps*5)})).filter(o=>o.wait>0);
 if(orders.length<3)orders.push(randomOrder(p));
 return {...p,last:p.last+steps*5000,coins:p.coins+earnings,orders};
 })};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
 useEffect(()=>{const p=state.current;const delta=Math.min(12*60*60*1000,Date.now()-p.last);if(delta>60000){const steps=Math.floor(delta/5000);const pay=p.crew.filter(w=>w.station).reduce((sum,w)=>sum+7+w.lv*4,0)*steps;setS(q=>({...q,last:Date.now(),offlineGift:Math.max(q.offlineGift,pay)}))}},[]);
 useEffect(()=>{if(!rush)return;const id=setInterval(()=>setRush(v=>v?{...v,seconds:Math.max(0,Math.ceil((v.until-Date.now())/1000))}:v),250);return()=>clearInterval(id)},[!!rush]);
 const crewBy=(type)=>s.crew.filter(w=>w.station===type);
 const crewSkill=type=>crewBy(type).reduce((n,w)=>n+w.lv,0);
 const serviceSpeed=Math.max(1,crewSkill('서비스'));
 const price=(m)=>m.pay+crewSkill(m.type)*7;
 const lvl=1+Math.floor(s.exp/120);
 const earned=s.crew.filter(w=>w.station).reduce((n,w)=>n+7+w.lv*4,0)*12;
 const flash=t=>{setMsg(t);window.setTimeout(()=>setMsg(v=>v===t?'':v),3600)};
 const spend=(value)=>s.coins>=value;
 function hire(id){const spec=CREW.find(x=>x.id===id);if(!spec||s.crew.some(x=>x.id===id))return;if(!spend(spec.base)){flash('코인이 부족해요! 주문을 완료해 보세요.');return}setS(v=>({...v,coins:v.coins-spec.base,crew:[...v.crew,{id,lv:1,station:null}]}));flash(spec.name+' 직원이 카페에 왔어요! 💗')}
 function upgrade(id){const w=s.crew.find(x=>x.id===id);if(!w)return;const cost=90+w.lv*90;if(!spend(cost))return flash('교육 코인이 부족해요');if(w.lv>=10)return flash('최고 레벨입니다');setS(v=>({...v,coins:v.coins-cost,crew:v.crew.map(x=>x.id===id?{...x,lv:x.lv+1}:x)}));flash('직원 교육 성공! 서비스 능력이 올랐어요 ✨')}
 function assign(id,station){setS(v=>({...v,crew:v.crew.map(w=>w.id===id?{...w,station}:w)}));flash('직원 배치가 변경됐어요')}
 function serve(orderId){const o=s.orders.find(q=>q.id===orderId);if(!o)return;const item=MENU.find(m=>m.id===o.menu);if(!item)return;const bonus=Math.round(price(item)*(1+crewSkill('서비스')*.05));setS(v=>({...v,coins:v.coins+bonus,exp:v.exp+14,rep:v.rep+1,served:v.served+1,orders:v.orders.filter(q=>q.id!==orderId)}));if(rush&&rush.seconds>0){setRush(v=>v?{...v,score:v.score+1}:v);setS(v=>({...v,best:Math.max(v.best||0,(rush.score||0)+1)}))}flash('주문 성공! +'+bonus+'코인 🌟')}
 function startRush(){setRush({until:Date.now()+60000,seconds:60,score:0});setTab('cafe');flash('60초 주문 챌린지 시작! ⏱️')}
 function buyDecor(id){const item=FURNI.find(x=>x.id===id);if(!item||!spend(item.cost))return flash('코인이 부족해요!');setS(v=>({...v,coins:v.coins-item.cost,inventory:[...v.inventory,{uid:v.serial,id,x:27+(v.serial*13)%48,y:52+(v.serial*7)%30}],serial:v.serial+1,decorCount:v.decorCount+1}));setEdit(true);flash(item.name+' 구입! 원하는 위치로 끌어주세요')}
 function gacha(kind){const cost=kind==='staff'?5:3;if(s.gems<cost)return flash('보석이 부족해요. 오늘의 미션을 확인해 보세요!');if(kind==='staff'){const missing=CREW.filter(c=>!s.crew.some(w=>w.id===c.id));const chosen=missing[Math.floor(Math.random()*missing.length)];if(!chosen){setS(v=>({...v,gems:v.gems-cost,coins:v.coins+500,gachaCount:v.gachaCount+1}));setChosenDraw('중복 보상 +500코인');return}setS(v=>({...v,gems:v.gems-cost,crew:[...v.crew,{id:chosen.id,lv:1,station:null}],gachaCount:v.gachaCount+1}));setChosenDraw('🎉 '+chosen.name+' 획득!');}else{const item=FURNI[Math.floor(Math.random()*FURNI.length)];setS(v=>({...v,gems:v.gems-cost,inventory:[...v.inventory,{uid:v.serial,id:item.id,x:38+(v.serial*9)%32,y:55+(v.serial*6)%25}],serial:v.serial+1,gachaCount:v.gachaCount+1,decorCount:v.decorCount+1}));setChosenDraw('🎁 '+item.name+' 획득!')}}
 function combineRecipe(){const cost=90;if(!spend(cost))return flash('90코인이 필요합니다');if(s.recipes.length>=MENU.length)return flash('모든 레시피를 완성했어요!');setS(v=>{const recipeParts=v.recipeParts+1;if(recipeParts<3)return {...v,coins:v.coins-cost,recipeParts};const next=MENU.find(m=>!v.recipes.includes(m.id));return {...v,coins:v.coins-cost,recipeParts:0,recipes:[...v.recipes,next.id]}});flash(s.recipeParts>=2?'🎉 새로운 레시피 개발 성공!':'레시피 조각 +1 🍰')}
 function claimOffline(){setS(v=>({...v,coins:v.coins+v.offlineGift,offlineGift:0}));flash('자리 비운 사이의 수익을 받았어요!')}
 function movePiece(e,uid){if(!edit)return;e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);moved.current=uid}
 function dragPiece(e){if(moved.current==null)return;const rect=e.currentTarget.getBoundingClientRect();const x=Math.max(12,Math.min(88,100*(e.clientX-rect.left)/rect.width));const y=Math.max(34,Math.min(89,100*(e.clientY-rect.top)/rect.height));const uid=moved.current;setS(v=>({...v,inventory:v.inventory.map(q=>q.uid===uid?{...q,x,y}:q)}))}
 function stopDrag(){moved.current=null}
 function claimMission(id){if(s.claim[id])return;const ok=id==='serve'?s.served>=5:id==='staff'?s.crew.length>=3:id==='decor'?s.inventory.length>=4:false;if(!ok)return;setS(v=>({...v,gems:v.gems+2,claim:{...v.claim,[id]:true}}));flash('보석 +2 획득! 💎')}
 const nav=[['cafe','🏠','카페'],['staff','👩‍🍳','직원'],['recipe','🍰','레시피'],['interior','🛋️','꾸미기'],['draw','🎁','뽑기'],['league','🏆','리그']];
 return <div className="sweet-app">
 {tab!=='cafe'&&<header className="sweet-top"><div className="sweet-logo"><span>🍓 달콤한 동물 친구들의 카페</span><strong>K-SWEET <em>CAFE</em></strong></div><div className="sweet-resources"><span>🪙 {s.coins.toLocaleString()}</span><span>💎 {s.gems}</span><span>⭐ Lv.{lvl}</span></div></header>}
 {s.offlineGift>0&&<div className="offline-shade"><div className="offline-modal"><div className="gift-icon">🎁</div><h2>다시 오셨네요!</h2><p>직원들이 카페를 돌보고 있었어요.</p><strong>🪙 +{s.offlineGift.toLocaleString()}</strong><button onClick={claimOffline}>보상 받기</button></div></div>}
 <div className={tab==='cafe'?'sweet-scroll concept-scroll':'sweet-scroll'}>
 {tab==='cafe'&&<div className="cafe2-home">
  <div className="cafe2-top"><div className="cafe2-brand"><span>🍓 SWEET LITTLE DAYS</span><h1>K-SWEET <em>CAFE</em></h1></div><div className="cafe2-level">⭐ Lv.{lvl}</div></div>
  <div className="cafe2-wallet"><span>🪙 <b>{s.coins.toLocaleString()}</b></span><span>💎 <b>{s.gems}</b></span><span>💗 <b>{s.crew.length}명</b></span></div>
  <div className="cafe2-title"><span>✿ 달콤한 동물 친구들의 카페 ✿</span><strong>오늘도 카페 오픈!</strong></div>
  <div className="cafe2-scene" role="img" aria-label="고양이 모카와 토끼 딸기, 판다 봉봉이 있는 화사하고 아름다운 K-디저트 카페"><img src="/art/k-sweet-hero.webp" alt="따뜻한 햇살과 꽃으로 꾸민 K-SWEET CAFE에서 직원들이 일하는 모습" loading="eager" draggable={false}/><div className="cafe2-scene-bottom"><span>🍰 손님과 만드는 달콤한 하루</span><button onClick={()=>setTab('service')}>주문받기 <span>›</span></button></div></div>
  <div className="cafe2-mission"><div><b>🎀 오늘의 미션</b><small>손님 5명 서빙하기</small></div><div className="cafe2-mission-progress"><span style={{width:(Math.min(5,s.served)/5*100)+'%'}}/></div><strong>{Math.min(s.served,5)}/5</strong><button onClick={()=>setTab('missions')}>확인 ›</button></div>
  <div className="cafe2-section-title"><h2>🐾 우리 카페 친구들</h2><button onClick={()=>setTab('staff')}>직원 교육 ›</button></div>
  <div className="cafe2-crew">{CREW.map(member=>{const hired=s.crew.find(w=>w.id===member.id);return <button className="cafe2-crew-card" onClick={()=>setTab('staff')} key={member.id}><img src={member.asset} alt={member.name+' 캐릭터'} loading="eager"/><b>{member.name}</b><small>{member.job.replace('고양이 ','').replace('토끼 ','').replace('판다 ','')}</small><span>{hired?'Lv.'+hired.lv:'채용하기'} <b>›</b></span></button>})}</div>
  <div className="cafe2-stats">☕ 누적 주문 <b>{s.served}건</b><span>·</span> 🪙 자동 수익 <b>+{earned}/분</b></div>
  <div className="cafe2-nav">{[['service','🍰','주문'],['staff','🐱','직원'],['recipe','📖','레시피'],['interior','🛋️','꾸미기'],['draw','🎁','뽑기'],['league','🏆','리그']].map(([id,emoji,label])=><button onClick={()=>setTab(id)} key={id}><span>{emoji}</span><small>{label}</small></button>)}</div>
 </div>}
 {tab==='service'&&<section className="screen"><div className="screen-title"><small>CAFE SERVICE</small><h2>🍰 손님 주문 서빙하기</h2><p>손님의 주문을 완성하고 코인을 모아 카페를 성장시키세요.</p></div><div className="service-banner art-service-crew">{CREW.map(member=><div key={member.id}><CrewPortrait crew={member} small/><b>{member.name}</b></div>)}</div><section className="orders-panel"><div className="panel-heading"><h3>🍮 손님 주문</h3><span>+{earned}🪙/분</span></div><div className="order-list">{s.orders.map(o=>{const m=MENU.find(x=>x.id===o.menu);return <article key={o.id} className="customer-order"><span className="customer-face">{o.customer}</span><div><b>{m.emoji} {m.name}</b><small>남은 시간 {o.wait}초 · +{price(m)}코인</small></div><button onClick={()=>serve(o.id)}>서빙 🍓</button></article>})}</div>{!s.orders.length&&<p className="empty-orders">새 손님이 오는 중이에요 🐰</p>}</section>{rush&&<div className="rush-bar"><b>⏱️ {rush.seconds}초</b><span>서빙 {rush.score}건</span><button onClick={startRush}>재도전</button></div>}<button className="wide-btn" onClick={startRush}>⚡ 60초 주문 러시 시작</button><button className="concept-back" onClick={()=>setTab('cafe')}>← 카페로 돌아가기</button></section>}
 {tab==='mail'&&<section className="screen"><div className="screen-title"><small>HAPPY MAILBOX</small><h2>💌 달콤한 우편함</h2><p>카페가 쉬는 동안 들어온 수익을 받을 수 있어요.</p></div><div className="mailbox-gift"><span>🎁</span><strong>{s.offlineGift>0?('+'+s.offlineGift.toLocaleString()+'코인'):('오늘의 우편함')}</strong><p>{s.offlineGift>0?'직원들이 열심히 일했어요!':'지금은 받을 보상이 없어요. 잠시 후 다시 들러주세요.'}</p><button onClick={s.offlineGift>0?claimOffline:()=>setTab('cafe')}>{s.offlineGift>0?'보상 받기':'카페로 돌아가기'}</button></div></section>}
 {tab==='missions'&&<section className="screen"><div className="screen-title"><small>DAILY MISSIONS</small><h2>📋 오늘의 카페 미션</h2><p>카페를 키우면서 무료 보석을 모아보세요.</p></div><div className="mission-special"><b>🍓 손님 5명 서빙하기</b><span>{Math.min(s.served,5)}/5</span><button disabled={s.served<5||s.claim.serve} onClick={()=>claimMission('serve')}>{s.claim.serve?'받기 완료':'💎 +2 받기'}</button></div><div className="mission-special"><b>🐾 직원 3명 채용하기</b><span>{Math.min(s.crew.length,3)}/3</span><button disabled={s.crew.length<3||s.claim.staff} onClick={()=>claimMission('staff')}>{s.claim.staff?'받기 완료':'💎 +2 받기'}</button></div><button className="concept-back" onClick={()=>setTab('cafe')}>← 카페로 돌아가기</button></section>}
 {tab==='staff'&&<section className="screen"><div className="screen-title"><small>CASTING & TRAINING</small><h2>💗 직원 관리</h2><p>일하는 위치를 정하고 교육해서 카페 효율을 높여요.</p></div><div className="staff-cards">{CREW.map(c=>{const w=s.crew.find(x=>x.id===c.id),cost=90+(w?.lv||0)*90;return <article className="staff-entry" key={c.id}><div className="staff-portrait" style={{background:c.color}}><CrewPortrait crew={c}/><span>{w?'Lv.'+w.lv:'NEW'}</span></div><div className="staff-info"><h3>{c.emoji} {c.name}<small>{c.job}</small></h3><p>✨ {c.power}</p>{w?<><div className="staff-select"><label>담당</label><select value={w.station||''} onChange={e=>assign(c.id,e.target.value||null)}><option value="">휴식</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div><div className="hearts">{Array.from({length:10},(_,i)=><span key={i} className={i<w.lv?'got':''}>♥</span>)}</div><button onClick={()=>upgrade(c.id)}>📚 교육 🪙{cost}</button></>:<button onClick={()=>hire(c.id)}>💌 채용 🪙{c.base}</button>}</div></article>})}</div></section>}
 {tab==='recipe'&&<section className="screen"><div className="screen-title"><small>RECIPE LABORATORY</small><h2>🍰 디저트 연구소</h2><p>레시피 조각 3개를 모으면 새로운 메뉴를 발견합니다.</p></div><div className="recipe-progress"><strong>🍓 레시피 연구</strong><span>{s.recipeParts}/3 조각</span><div className="recipe-dots">{[0,1,2].map(i=><i key={i} className={i<s.recipeParts?'on':''}/>)}</div><button onClick={combineRecipe} disabled={s.recipes.length===MENU.length}>{s.recipes.length===MENU.length?'모든 메뉴 개발 완료':'✨ 재료 합성 · 90코인'}</button></div><div className="recipe-gallery">{MENU.map(m=><div className={'recipe-entry '+(s.recipes.includes(m.id)?'known':'unknown')} key={m.id}><span>{s.recipes.includes(m.id)?m.emoji:'🔒'}</span><b>{s.recipes.includes(m.id)?m.name:'미발견 레시피'}</b><small>{m.type} · +{m.pay}🪙</small></div>)}</div></section>}
 {tab==='interior'&&<section className="screen"><div className="screen-title"><small>DECORATE YOUR CAFE</small><h2>🛋️ 꾸미기 상점</h2><p>가구를 구매한 뒤 카페 화면에서 위치를 자유롭게 변경할 수 있어요.</p></div><div className="shop-items">{FURNI.map(f=><article key={f.id}><span>{f.emoji}</span><b>{f.name}</b><small>🪙 {f.cost}</small><button onClick={()=>buyDecor(f.id)}>구매하기</button></article>)}</div><button className="wide-btn" onClick={()=>{setEdit(true);setTab('cafe')}}>🎨 내 카페에 직접 배치하기</button></section>}
 {tab==='draw'&&<section className="screen"><div className="screen-title"><small>HAPPY LUCKY BOX</small><h2>🎁 두근두근 뽑기</h2><p>직원과 인테리어 뽑기는 별도로 운영됩니다. 실제 결제는 없습니다.</p></div><div className="gacha-cards"><article><div className="gacha-staff-preview">{CREW.map(member=><CrewPortrait key={member.id} crew={member} small/>)}</div><h3>직원 뽑기</h3><p>새로운 카페 친구를 영입해 보세요!</p><button onClick={()=>gacha('staff')}>💎 5개 뽑기</button></article><article><span>🎁</span><h3>인테리어 뽑기</h3><p>귀여운 카페 가구가 랜덤 등장!</p><button onClick={()=>gacha('interior')}>💎 3개 뽑기</button></article></div>{chosenDraw&&<div className="draw-result"><div>✨ 🎊 ✨</div>{CREW.filter(m=>chosenDraw.includes(m.name)).map(m=><CrewPortrait key={m.id} crew={m}/>)}<strong>{chosenDraw}</strong><button onClick={()=>setChosenDraw(null)}>확인</button></div>}</section>}
 {tab==='league'&&<section className="screen"><div className="screen-title"><small>BARISTA LEAGUE</small><h2>🏆 바리스타 리그</h2><p>60초 동안 얼마나 많은 손님에게 서빙할 수 있을까요?</p></div><div className="league-hero"><div>🏆</div><strong>나의 최고기록 {s.best||0}건</strong><span>{s.best>=9?'💎 다이아':s.best>=6?'🥇 골드':s.best>=3?'🥈 실버':'🥉 브론즈'} 바리스타</span></div><div className="league-standings">{[[0,3],[1,6],[2,9]].map(([n,v])=><div key={n}><span className="league-member"><CrewPortrait crew={CREW[n]} small/><strong>{CREW[n].emoji} {CREW[n].name}</strong></span><b>{v}건</b></div>)}</div><p className="league-note">현재는 가상 라이벌과 겨루는 연습 리그입니다. 실시간 멀티플레이는 아직 아닙니다.</p><button className="wide-btn" onClick={startRush}>⏱️ 60초 리그 도전</button></section>}
 <section className="missions" style={{display:tab==='cafe'?'none':undefined}}><h3>🎀 반짝반짝 미션</h3>{[['serve','손님 5명 서빙',s.served>=5],['staff','직원 3명 채용',s.crew.length>=3],['decor','가구 4개 모으기',s.inventory.length>=4]].map(([id,title,complete])=><div key={id}><span>{complete?'✅':'🌸'} {title}</span><button disabled={!complete||s.claim[id]} onClick={()=>claimMission(id)}>{s.claim[id]?'완료':'💎 +2'}</button></div>)}</section>
 </div><div className="game-toast" role="status">{msg}</div>{tab!=='cafe'&&<nav className="sweet-nav">{nav.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setEdit(false);setChosenDraw(null)}}><span>{icon}</span><small>{label}</small></button>)}</nav>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
