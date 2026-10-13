import React,{useEffect,useMemo,useRef,useState} from 'react';
import{createRoot}from'react-dom/client';
import './sweetcafe.css';
import OrderGame from './OrderGame.jsx';
import CafeClub from './CafeClub.jsx';
import BakeryWorld from './BakeryWorld.jsx';
import RecipeClass from './RecipeClass.jsx';
import {playSound,setSoundEnabled,startMusic,stopMusic} from './sound.js';

const CREW=[
{id:'mocha',name:'모카',job:'고양이 바리스타',type:'음료',color:'#ffd7a6',asset:'/mascots/cute-mocha.svg',emoji:'🐱',power:'음료 제조',base:120},
{id:'berry',name:'딸기',job:'토끼 파티시에',type:'디저트',color:'#ffd3e4',asset:'/mascots/cute-berry.svg',emoji:'🐰',power:'디저트 품질',base:210},
{id:'bong',name:'봉봉',job:'판다 매니저',type:'서비스',color:'#efdcba',asset:'/mascots/cute-bong.svg',emoji:'🐼',power:'서빙 속도',base:310}
];
const MENU=[
{id:'latte',name:'딸기라떼',emoji:'🍓',type:'음료',pay:38,need:1},
{id:'song',name:'송편',emoji:'🍡',type:'디저트',pay:48,need:1},
{id:'tea',name:'유자에이드',emoji:'🍋',type:'음료',pay:65,need:2},
{id:'yak',name:'약과',emoji:'🍯',type:'디저트',pay:78,need:2},
{id:'bingsu',name:'딸기빙수',emoji:'🍧',type:'디저트',pay:100,need:3},
{id:'coffee',name:'크림라떼',emoji:'☕',type:'음료',pay:115,need:3},
{id:'mochi',name:'찹쌀떡',emoji:'🍡',image:'/art/food-mochi.svg',type:'디저트',pay:145,need:4},
{id:'cake',name:'동백 케이크',emoji:'🎂',image:'/art/food-camellia.svg',type:'디저트',pay:200,need:5},
{id:'cookie',name:'르뱅 쿠키',emoji:'🍪',type:'디저트',pay:125,need:3},
{id:'financier',name:'휘낭시에',emoji:'🧈',type:'디저트',pay:140,need:4},
{id:'madeleine',name:'마들렌',emoji:'🐚',image:'/art/food-madeleine.svg',type:'디저트',pay:135,need:4},
{id:'scone',name:'버터 스콘',emoji:'🍞',image:'/art/food-scone.svg',type:'디저트',pay:115,need:3},
{id:'croissant',name:'크루아상',emoji:'🥐',type:'디저트',pay:170,need:5}
];
const FURNI=[
{id:'table',name:'레이스 테이블',cost:140,zone:'테이블',type:'테이블'},
{id:'plant',name:'꽃 화분',cost:110,zone:'바닥',type:'바닥'},
{id:'lamp',name:'파스텔 조명',cost:170,zone:'벽',type:'벽'},
{id:'shelf',name:'디저트 벽선반',cost:220,zone:'벽',type:'벽'},
{id:'cat',name:'고양이 장식 인형',cost:190,zone:'테이블',type:'테이블'},
{id:'balloon',name:'하트 풍선',cost:160,zone:'벽',type:'벽'},
{id:'shell',name:'조개 장식',cost:100,zone:'테이블',type:'테이블'},
{id:'flower',name:'동백꽃 화병',cost:120,zone:'테이블',type:'테이블'},
{id:'ribbon',name:'크림 리본 장식',cost:115,zone:'벽',type:'벽'},
{id:'menu',name:'우드 메뉴보드',cost:160,zone:'벽',type:'벽'},
{id:'cake',name:'딸기 케이크',cost:180,zone:'카운터',type:'카운터'},
{id:'macaron',name:'마카롱 스탠드',cost:150,zone:'카운터',type:'카운터'},
{id:'cups',name:'파스텔 머그컵',cost:125,zone:'카운터',type:'카운터'},
{id:'jam',name:'딸기잼 병',cost:95,zone:'카운터',type:'카운터'},
{id:'rug',name:'딸기우유 러그',cost:220,zone:'바닥',type:'바닥'},
{id:'box',name:'베이커리 선물상자',cost:145,zone:'카운터',type:'카운터'},
{id:'cookie',name:'르뱅 쿠키 접시',cost:155,zone:'카운터',type:'카운터'},
{id:'photo',name:'송도 풍경 액자',cost:185,zone:'벽',type:'벽'},
{id:'cushion',name:'핑크 쿠션',cost:110,zone:'테이블',type:'테이블'},
{id:'candle',name:'크림 캔들',cost:135,zone:'테이블',type:'테이블'}
];
const TYPES=['음료','디저트','서비스'];
const init=()=>({coins:500,gems:10,day:1,exp:0,rep:0,served:0,crew:[{id:'mocha',lv:1,station:'음료'},{id:'berry',lv:1,station:'디저트'}],inventory:[{uid:1,id:'table',x:57,y:77},{uid:2,id:'plant',x:22,y:44}],serial:3,recipes:['latte','song'],recipeParts:0,orderCursor:0,orderRotationV2:true,speedWins:0,orders:[],last:Date.now(),offlineGift:0,gachaCount:0,decorCount:0,best:0,claim:{},rushCount:0});
function load(){try{const v=JSON.parse(localStorage.getItem('ksweet-cafe-v2'));if(v&&Array.isArray(v.crew)){const byId={};for(const w of v.crew){const id=w.id==='mimi'?'berry':w.id==='coco'?'mocha':w.id;if(!CREW.some(c=>c.id===id))continue;if(!byId[id]||w.lv>byId[id].lv)byId[id]={...w,id}}return {...init(),...v,...(!v.orderRotationV2?{orders:[],orderCursor:0,orderRotationV2:true}:{}),crew:Object.values(byId)}}const legacy=JSON.parse(localStorage.getItem('ksweet-v1'));if(legacy)return {...init(),coins:Math.max(500,legacy.coins||0),exp:legacy.exp||0,served:legacy.served||0}}catch{}return init()}
// Rotate the full menu across incoming orders. Learning a recipe still awards its own mastery bonus.
const randomOrder=(state,offset=0)=>{const index=((state.orderCursor||0)+offset)%MENU.length;const item=MENU[index];return {id:Date.now()+Math.floor(Math.random()*1e7)+offset,menu:item.id,wait:95+Math.floor(Math.random()*15),customer:['🐻','🐼','🐥','🐱','🐰','🦊'][index%6]}};
function CrewPortrait({crew,small=false}){return <span className={'crew-portrait-frame portrait-'+crew.id+(small?' portrait-small':'')}><img className="crew-portrait" src={crew.asset} alt={crew.name+' '+crew.job} loading="eager" draggable={false}/></span>}
const FoodArt=({item,size='normal'})=>item.image?<img className={'food-art food-art-'+size} src={item.image} alt={item.name} loading="eager"/>:<span className={'food-emoji food-art-'+size}>{item.emoji}</span>;
const DECOR_BOUNDS={벽:{x:[10,90],y:[17,42],initial:[55,26]},카운터:{x:[14,85],y:[45,67],initial:[60,57]},테이블:{x:[12,88],y:[59,79],initial:[51,72]},바닥:{x:[11,89],y:[73,91],initial:[65,83]}};
const DecorIcon=({id})=><img className="bakery-decor-svg" src={'/art/decor/'+id+'.svg'} alt="" loading="eager" draggable={false}/>
function App(){
 const [s,setS]=useState(load);
 const [tab,setTab]=useState('world');
 const [msg,setMsg]=useState('귀여운 카페가 문을 열었어요! 🧁');
 const [now,setNow]=useState(Date.now());
 const [rush,setRush]=useState(null);
 const [activeOrder,setActiveOrder]=useState(null);
 const [chosenDraw,setChosenDraw]=useState(null);
 const [edit,setEdit]=useState(false);
 const [decorHint,setDecorHint]=useState(false);
 const [soundOn,setSoundOn]=useState(true);
 const [musicOn,setMusicOn]=useState(false);
 const [selectedItem,setSelectedItem]=useState(null);
 const [selectedRecipe,setSelectedRecipe]=useState(null);
 const moved=useRef(null);
 const state=useRef(s);state.current=s;
 useEffect(()=>{localStorage.setItem('ksweet-cafe-v2',JSON.stringify(s))},[s]);
 useEffect(()=>{const tick=()=>{const time=Date.now();setNow(time);setS(p=>{
 const steps=Math.min(30,Math.floor((time-p.last)/5000));if(steps<=0)return p;
 const workers=p.crew.filter(w=>w.station);const base=workers.reduce((sum,w)=>sum+(7+w.lv*4),0)*steps;
 const earnings=Math.round(base*(1+(p.marketingTraining||0)*.08)*(p.cafeFocus==='service'?1.1:1));
 const orders=p.orders.map(o=>({...o,wait:Math.max(0,o.wait-steps*5)})).filter(o=>o.wait>0);
 let orderCursor=p.orderCursor||0;
 if(orders.length<3){orders.push(randomOrder({...p,orderCursor}));orderCursor+=1}
 return {...p,last:p.last+steps*5000,coins:p.coins+earnings,orders,orderCursor};
 })};tick();const id=setInterval(tick,1000);return()=>clearInterval(id)},[]);
 useEffect(()=>{const p=state.current;const delta=Math.min(12*60*60*1000,Date.now()-p.last);if(delta>60000){const steps=Math.floor(delta/5000);const pay=p.crew.filter(w=>w.station).reduce((sum,w)=>sum+7+w.lv*4,0)*steps;setS(q=>({...q,last:Date.now(),offlineGift:Math.max(q.offlineGift,pay)}))}},[]);
 useEffect(()=>{if(!rush)return;const id=setInterval(()=>setRush(v=>v?{...v,seconds:Math.max(0,Math.ceil((v.until-Date.now())/1000))}:v),250);return()=>clearInterval(id)},[!!rush]);
 const crewBy=(type)=>s.crew.filter(w=>w.station===type);
 const crewSkill=type=>crewBy(type).reduce((n,w)=>n+w.lv,0);
 const serviceSpeed=Math.max(1,crewSkill('서비스'));
 const price=(m)=>Math.round((m.pay+crewSkill(m.type)*7)*(1+(s.qualityTraining||0)*.055)*(m.type==='디저트'&&s.cafeFocus==='bakery'?1.12:1));
 const lvl=1+Math.floor(s.exp/120);
 const arcadeStage=Math.min(12,1+Math.floor((s.speedWins||0)/5));
 const nextArcadeAt=(Math.floor((s.speedWins||0)/5)+1)*5;
 const earned=Math.round(s.crew.filter(w=>w.station).reduce((n,w)=>n+7+w.lv*4,0)*12*(1+(s.marketingTraining||0)*.08)*(s.cafeFocus==='service'?1.1:1));
 const flash=t=>{setMsg(t);window.setTimeout(()=>setMsg(v=>v===t?'':v),3600)};
 const spend=(value)=>s.coins>=value;
 function hire(id){const spec=CREW.find(x=>x.id===id);if(!spec||s.crew.some(x=>x.id===id))return;if(!spend(spec.base)){flash('코인이 부족해요! 주문을 완료해 보세요.');return}setS(v=>({...v,coins:v.coins-spec.base,crew:[...v.crew,{id,lv:1,station:null}]}));flash(spec.name+' 직원이 카페에 왔어요! 💗')}
 function upgrade(id){const w=s.crew.find(x=>x.id===id);if(!w)return;const cost=90+w.lv*90;if(!spend(cost))return flash('교육 코인이 부족해요');if(w.lv>=10)return flash('최고 레벨입니다');setS(v=>({...v,coins:v.coins-cost,crew:v.crew.map(x=>x.id===id?{...x,lv:x.lv+1}:x)}));flash('직원 교육 성공! 서비스 능력이 올랐어요 ✨')}
 function assign(id,station){setS(v=>({...v,crew:v.crew.map(w=>w.id===id?{...w,station}:w)}));flash('직원 배치가 변경됐어요')}
 function beginOrder(orderId){
 const order=s.orders.find(q=>q.id===orderId);
 if(!order)return flash('손님이 떠났어요! 다음 주문을 기다려주세요.');
 setActiveOrder({id:order.id,menu:order.menu,customer:order.customer});
 flash('⚡ 랜덤 재료 퀴즈와 타이밍 배틀! 6라운드에 도전하세요!');
}
 function finishOrder(info){
 const o=s.orders.find(q=>q.id===activeOrder?.id);
 if(!o){flash('손님이 기다리다 떠났어요. 다음 주문에 도전하세요.');return}
 const item=MENU.find(m=>m.id===o.menu);
 const qualityBonus=info.quality==='perfect'?Math.round(price(item)*.4):0;
 const arcadeBonus=Math.round(Math.min(300,(info.score||0)*.08));
 const bonus=Math.round(price(item)*(1+crewSkill('서비스')*.05)*(1+(s.kitchenTraining||0)*.05))+qualityBonus+arcadeBonus;
 setS(v=>({...v,coins:v.coins+bonus,exp:v.exp+20+Math.min(55,Math.floor((info.score||0)/80))+(qualityBonus?15:0),rep:v.rep+1,served:v.served+1,speedWins:(v.speedWins||0)+1,orders:v.orders.filter(q=>q.id!==o.id),best:rush&&rush.seconds>0?Math.max(v.best||0,(rush.score||0)+1):v.best}));
 if(rush&&rush.seconds>0)setRush(v=>v?{...v,score:v.score+1}:v);
 if(((s.speedWins||0)+1)%5===0)playSound('level');else playSound('win');
 flash('🏆 스테이지 '+arcadeStage+' 클리어! +'+bonus+'코인 · 다음 난도까지 '+Math.max(0,nextArcadeAt-(s.speedWins||0)-1)+'회');
}
 function leaveOrder(){setActiveOrder(null);flash('다음 손님 주문에 도전해 보세요!')}
 function startRush(){
 setRush({until:Date.now()+45000,seconds:45,score:0});
 setActiveOrder(null);
 setS(v=>v.orders.length?v:{...v,orders:[randomOrder(v,0),randomOrder(v,1)],orderCursor:(v.orderCursor||0)+2});
 setTab('service');
 flash('⚡ 45초 주문 러시! 난이도가 올라가는 스피드 배틀에 도전!');
}
 function buyDecor(id){playSound('buy');const item=FURNI.find(x=>x.id===id);if(!item||!spend(item.cost))return flash('코인이 부족해요!');const bounds=DECOR_BOUNDS[item.zone];setS(v=>({...v,coins:v.coins-item.cost,inventory:[...v.inventory,{uid:v.serial,id,x:Math.max(bounds.x[0],Math.min(bounds.x[1],bounds.initial[0]+(v.serial%3)*7)),y:bounds.initial[1]}],serial:v.serial+1,decorCount:v.decorCount+1}));setEdit(true);setDecorHint(true);setTab('cafe');flash('🎨 '+item.name+'을 '+item.zone+' 구역에 배치했어요!')}
 function gacha(kind){const cost=kind==='staff'?5:3;if(s.gems<cost)return flash('보석이 부족해요. 오늘의 미션을 확인해 보세요!');if(kind==='staff'){const missing=CREW.filter(c=>!s.crew.some(w=>w.id===c.id));const chosen=missing[Math.floor(Math.random()*missing.length)];if(!chosen){setS(v=>({...v,gems:v.gems-cost,coins:v.coins+500,gachaCount:v.gachaCount+1}));setChosenDraw('중복 보상 +500코인');return}setS(v=>({...v,gems:v.gems-cost,crew:[...v.crew,{id:chosen.id,lv:1,station:null}],gachaCount:v.gachaCount+1}));setChosenDraw('🎉 '+chosen.name+' 획득!');}else{const item=FURNI[Math.floor(Math.random()*FURNI.length)];setS(v=>({...v,gems:v.gems-cost,inventory:[...v.inventory,{uid:v.serial,id:item.id,x:DECOR_BOUNDS[item.zone].initial[0],y:DECOR_BOUNDS[item.zone].initial[1]}],serial:v.serial+1,gachaCount:v.gachaCount+1,decorCount:v.decorCount+1}));setChosenDraw('🎁 '+item.name+' 획득!');setDecorHint(true)}}
 function combineRecipe(){const cost=90;if(!spend(cost))return flash('90코인이 필요합니다');if(s.recipes.length>=MENU.length)return flash('모든 레시피를 완성했어요!');setS(v=>{const recipeParts=v.recipeParts+1;if(recipeParts<3)return {...v,coins:v.coins-cost,recipeParts};const next=MENU.find(m=>!v.recipes.includes(m.id));return {...v,coins:v.coins-cost,recipeParts:0,recipes:[...v.recipes,next.id]}});flash(s.recipeParts>=2?'🎉 새로운 레시피 개발 성공!':'레시피 조각 +1 🍰')}
 function claimOffline(){setS(v=>({...v,coins:v.coins+v.offlineGift,offlineGift:0}));flash('자리 비운 사이의 수익을 받았어요!')}
 function movePiece(e,uid){if(!edit)return;e.preventDefault();e.stopPropagation();e.currentTarget.setPointerCapture(e.pointerId);moved.current=uid}
 function dragPiece(e){if(moved.current==null)return;const r=e.currentTarget.getBoundingClientRect(),uid=moved.current;const entry=s.inventory.find(q=>q.uid===uid);const spec=FURNI.find(x=>x.id===entry?.id);const bounds=DECOR_BOUNDS[spec?.zone||'테이블'];const x=Math.max(bounds.x[0],Math.min(bounds.x[1],100*(e.clientX-r.left)/r.width));const y=Math.max(bounds.y[0],Math.min(bounds.y[1],100*(e.clientY-r.top)/r.height));setS(v=>({...v,inventory:v.inventory.map(q=>q.uid===uid?{...q,x,y}:q)}))}
 function stopDrag(){moved.current=null}
 function claimMission(id){if(s.claim[id])return;const ok=id==='serve'?s.served>=5:id==='staff'?s.crew.length>=3:id==='decor'?s.inventory.length>=4:false;if(!ok)return;setS(v=>({...v,gems:v.gems+2,claim:{...v.claim,[id]:true}}));flash('보석 +2 획득! 💎')}
 function learnRecipe(id){const m=MENU.find(x=>x.id===id);if(!m)return;setS(v=>v.recipes.includes(id)?v:{...v,recipes:[...v.recipes,id],exp:v.exp+25,coins:v.coins+50});flash('📖 '+m.name+' 레시피 학습 완료! +50코인 +25경험치')}
 function toggleMusic(){if(musicOn){stopMusic();setMusicOn(false)}else{setSoundEnabled(true);setSoundOn(true);setMusicOn(startMusic())}}
 const nav=[['world','✦','월드'],['club','⚡','챌린지'],['cafe','🏠','카페'],['staff','👩‍🍳','직원'],['recipe','📖','배우기'],['interior','🛋️','꾸미기'],['draw','🎁','뽑기']];
 return <div className="sweet-app" onClickCapture={()=>{if(soundOn)playSound('click')}}>
 {tab!=='cafe'&&<header className="sweet-top"><div className="sweet-logo"><span>🍓 달콤한 동물 친구들의 카페</span><strong>K-BAKERY <em>CAFE</em></strong></div><div className="sweet-resources"><button className="sound-switch" onClick={()=>{setSoundOn(v=>{setSoundEnabled(!v);if(v){stopMusic();setMusicOn(false)}return !v})}}>{soundOn?'🔊':'🔇'}</button><span>🪙 {s.coins.toLocaleString()}</span><span>💎 {s.gems}</span><span>⭐ Lv.{lvl}</span></div></header>}
 {s.offlineGift>0&&<div className="offline-shade"><div className="offline-modal"><div className="gift-icon">🎁</div><h2>다시 오셨네요!</h2><p>직원들이 카페를 돌보고 있었어요.</p><strong>🪙 +{s.offlineGift.toLocaleString()}</strong><button onClick={claimOffline}>보상 받기</button></div></div>}
 <div className={tab==='cafe'?'sweet-scroll concept-scroll':'sweet-scroll'}>
 {tab==='cafe'&&<div className="cafe2-home">
  <div className="cafe2-top"><div className="cafe2-brand"><span>🍓 LEARN · BAKE · PLAY</span><h1>K-BAKERY <em>CAFE</em></h1></div><div className="cafe2-level">⭐ Lv.{lvl} <button className="sound-switch" onClick={()=>{setSoundOn(v=>{setSoundEnabled(!v);if(v){stopMusic();setMusicOn(false)}return !v})}} title="효과음 켜고 끄기">{soundOn?'🔊':'🔇'}</button></div></div>
  <div className="audio-control-strip"><button onClick={toggleMusic} aria-pressed={musicOn}>{musicOn?'🎵 배경음 끄기':'🎵 배경음 켜기'}</button><span>효과음 {soundOn?'켜짐 🔊':'꺼짐 🔇'}</span></div>
  <div className="cafe2-wallet"><span>🪙 <b>{s.coins.toLocaleString()}</b></span><span>💎 <b>{s.gems}</b></span><span>💗 <b>{s.crew.length}명</b></span></div>
  <div className="cafe2-title"><strong>🌷 오늘도 카페 오픈!</strong><span>레시피를 배우며 키우는 나만의 카페</span></div>
  <div className="cafe2-scene"><div className={'cafe2-decoration-stage '+(edit?'is-editing':'')} onPointerMove={dragPiece} onPointerUp={stopDrag} onPointerCancel={stopDrag}>
 <img src="/art/k-sweet-hero.webp?v=clean-20261011-3" alt="직원들이 일하는 따뜻한 베이커리 카페" draggable={false}/>
 {s.inventory.map(f=>{const thing=FURNI.find(k=>k.id===f.id);if(!thing)return null;const b=DECOR_BOUNDS[thing.zone];return <div key={f.uid} className={'cafe2-placed-item decor-zone-'+thing.zone+' '+(edit?'can-move':'')} style={{left:Math.max(b.x[0],Math.min(b.x[1],f.x))+'%',top:Math.max(b.y[0],Math.min(b.y[1],f.y))+'%'}} onPointerDown={e=>movePiece(e,f.uid)} title={thing.name+' · '+thing.zone} role="img" aria-label={thing.name}><DecorIcon id={thing.id}/></div>})}
 {edit&&decorHint&&<div className="cafe2-edit-label">👆 소품은 벽·카운터·테이블·바닥 영역 안에서 이동해요</div>}
 </div><div className="cafe2-scene-bottom"><button className={edit?'editing-toggle active':'editing-toggle'} onClick={()=>{setEdit(v=>!v);setDecorHint(false);if(edit)flash('✅ 카페 꾸미기 저장 완료')}}>{edit?'✅ 꾸미기 완료':'🎨 카페 꾸미기'}</button><button onClick={()=>setTab('service')}>⚡ 주문 배틀하기 <span>›</span></button></div></div>
  <div className="cafe2-mission"><div><b>🎀 오늘의 미션</b><small>손님 5명 서빙하기</small></div><div className="cafe2-mission-progress"><span style={{width:(Math.min(5,s.served)/5*100)+'%'}}/></div><strong>{Math.min(s.served,5)}/5</strong><button onClick={()=>setTab('missions')}>확인 ›</button></div>
  <div className="cafe2-section-title"><h2>🐾 우리 카페 친구들</h2><button onClick={()=>setTab('staff')}>직원 교육 ›</button></div>
  <div className="cafe2-crew">{CREW.map(member=>{const hired=s.crew.find(w=>w.id===member.id);return <button className="cafe2-crew-card" onClick={()=>setTab('staff')} key={member.id}><CrewPortrait crew={member}/><b>{member.name}</b><small>{member.job.replace('고양이 ','').replace('토끼 ','').replace('판다 ','')}</small><span>{hired?'Lv.'+hired.lv:'채용하기'} <b>›</b></span></button>})}</div>
  <div className="cafe2-stage-bar"><b>⚡ 스피드 리그 STAGE {arcadeStage}</b><span>다음 단계까지 {Math.max(0,nextArcadeAt-(s.speedWins||0))}회 성공</span><div><i style={{width:(((s.speedWins||0)%5)/5*100)+'%'}}/></div></div>
  <div className="cafe2-stats">☕ 누적 주문 <b>{s.served}건</b><span>·</span> 🪙 자동 수익 <b>+{earned}/분</b></div>
  <div className="cafe2-club-entry"><div><small>K-BAKERY CLUB</small><b>혼자 키우고, 친구와 겨루는 우리 카페</b><span>60초 배틀 · 경영 전략 · 기록 공유</span></div><button onClick={()=>setTab('club')}>클럽 입장 →</button></div>
  <div className="cafe2-nav">{[['world','🏠','카페월드'],['club','🏆','클럽'],['service','🍰','주문'],['staff','🐱','직원'],['recipe','📖','배우기'],['interior','🛋️','꾸미기'],['draw','🎁','뽑기'],['league','🏆','리그']].map(([id,emoji,label])=><button onClick={()=>setTab(id)} key={id}><span>{emoji}</span><small>{label}</small></button>)}</div>
 </div>}
 {tab==='world'&&<BakeryWorld s={s} setS={setS} flash={flash} onOldCafe={()=>setTab('cafe')}/>}
 {tab==='club'&&<CafeClub s={s} setS={setS} flash={flash}/>}
 {tab==='service'&&<section className="screen"><div className="screen-title"><small>🍓 K-BAKERY KITCHEN</small><h2>🍰 주문 받고 직접 만들기</h2><p>🎯 베이커리 중심 다양한 메뉴 + ⚡ 타이밍 배틀! 6라운드마다 속도가 빨라지고, 스피드 배틀 5회 성공마다 스테이지가 올라갑니다.</p><div className="service-stage-banner"><b>🏆 STAGE {arcadeStage}</b><span>다음 난이도까지 {Math.max(0,nextArcadeAt-(s.speedWins||0))}회 · 스피드 배틀 {(s.speedWins||0)}회 성공</span></div></div>
 {activeOrder&&MENU.find(m=>m.id===activeOrder.menu)?<OrderGame key={activeOrder.id} menu={MENU.find(m=>m.id===activeOrder.menu)} customer={activeOrder.customer} difficulty={arcadeStage} onSuccess={finishOrder} onExit={leaveOrder}/>:
 <><div className="service-banner art-service-crew">{CREW.map(member=><div key={member.id}><CrewPortrait crew={member} small/><b>{member.name}</b></div>)}</div>
 <section className="orders-panel"><div className="panel-heading"><h3>🧁 오늘의 손님 주문</h3><span>+{earned}🪙/분</span></div><div className="order-list">{s.orders.map(o=>{const m=MENU.find(x=>x.id===o.menu);return <article key={o.id} className="customer-order"><span className="customer-face">{o.customer}</span><div><b className="order-food-name"><FoodArt item={m} size="mini"/> {m.name}</b><small>남은 시간 {o.wait}초 · 제조 성공 시 +{price(m)}코인</small></div><button onClick={()=>beginOrder(o.id)}>만들기 🎮</button></article>})}</div>{!s.orders.length&&<p className="empty-orders">새 손님이 오는 중이에요 🐰</p>}</section>
 {rush&&<div className="rush-bar"><b>{rush.seconds>0?'⏱️ '+rush.seconds+'초':'🏁 챌린지 종료'}</b><span>제조 성공 {rush.score}건</span><button onClick={startRush}>재도전</button></div>}
 <button className="wide-btn" onClick={startRush}>⚡ 45초 스피드 러시 도전</button><button className="concept-back" onClick={()=>setTab('cafe')}>← 카페로 돌아가기</button></>}</section>}
 {tab==='mail'&&<section className="screen"><div className="screen-title"><small>HAPPY MAILBOX</small><h2>💌 달콤한 우편함</h2><p>카페가 쉬는 동안 들어온 수익을 받을 수 있어요.</p></div><div className="mailbox-gift"><span>🎁</span><strong>{s.offlineGift>0?('+'+s.offlineGift.toLocaleString()+'코인'):('오늘의 우편함')}</strong><p>{s.offlineGift>0?'직원들이 열심히 일했어요!':'지금은 받을 보상이 없어요. 잠시 후 다시 들러주세요.'}</p><button onClick={s.offlineGift>0?claimOffline:()=>setTab('cafe')}>{s.offlineGift>0?'보상 받기':'카페로 돌아가기'}</button></div></section>}
 {tab==='missions'&&<section className="screen"><div className="screen-title"><small>DAILY MISSIONS</small><h2>📋 오늘의 카페 미션</h2><p>카페를 키우면서 무료 보석을 모아보세요.</p></div><div className="mission-special"><b>🍓 손님 5명 서빙하기</b><span>{Math.min(s.served,5)}/5</span><button disabled={s.served<5||s.claim.serve} onClick={()=>claimMission('serve')}>{s.claim.serve?'받기 완료':'💎 +2 받기'}</button></div><div className="mission-special"><b>🐾 직원 3명 채용하기</b><span>{Math.min(s.crew.length,3)}/3</span><button disabled={s.crew.length<3||s.claim.staff} onClick={()=>claimMission('staff')}>{s.claim.staff?'받기 완료':'💎 +2 받기'}</button></div><button className="concept-back" onClick={()=>setTab('cafe')}>← 카페로 돌아가기</button></section>}
 {tab==='staff'&&<section className="screen"><div className="screen-title"><small>CASTING & TRAINING</small><h2>💗 직원 관리</h2><p>일하는 위치를 정하고 교육해서 카페 효율을 높여요.</p></div><div className="staff-cards">{CREW.map(c=>{const w=s.crew.find(x=>x.id===c.id),cost=90+(w?.lv||0)*90;return <article className="staff-entry" key={c.id}><div className="staff-portrait" style={{background:c.color}}><CrewPortrait crew={c}/><span>{w?'Lv.'+w.lv:'NEW'}</span></div><div className="staff-info"><h3>{c.emoji} {c.name}<small>{c.job}</small></h3><p>✨ {c.power}</p>{w?<><div className="staff-select"><label>담당</label><select value={w.station||''} onChange={e=>assign(c.id,e.target.value||null)}><option value="">휴식</option>{TYPES.map(t=><option key={t}>{t}</option>)}</select></div><div className="hearts">{Array.from({length:10},(_,i)=><span key={i} className={i<w.lv?'got':''}>♥</span>)}</div><button onClick={()=>upgrade(c.id)}>📚 교육 🪙{cost}</button></>:<button onClick={()=>hire(c.id)}>💌 채용 🪙{c.base}</button>}</div></article>})}</div></section>}
 {tab==='recipe'&&<section className="screen"><div className="screen-title"><small>K-BAKERY LEARNING LAB</small><h2>📖 나의 베이커리 레시피북</h2><p>레시피를 읽고, 공정을 익히고, 퀴즈를 풀어 새 메뉴를 해금해요!</p></div>{selectedRecipe?
 <RecipeClass key={selectedRecipe} menu={MENU.find(m=>m.id===selectedRecipe)} unlocked={s.recipes.includes(selectedRecipe)} onUnlock={learnRecipe} onClose={()=>setSelectedRecipe(null)}/>:
 <><div className="recipe-learning-banner">🐰 빵·구움과자부터 음료까지 모든 메뉴를 주문 게임에서 연습할 수 있어요! 레시피를 배우고 퀴즈를 맞히면 추가 보상도 받습니다.<br/>📚 학습 완료: <b>{s.recipes.length}/{MENU.length}종</b> · 새 메뉴 퀴즈 정답 시 해금!</div><div className="recipe-gallery">{MENU.map(m=><div className={'recipe-entry '+(s.recipes.includes(m.id)?'known':'unknown')} key={m.id}><FoodArt item={m}/><b>{m.name}</b><small>{s.recipes.includes(m.id)?'✅ 배운 레시피 · '+m.type:'🔒 배우면 해금 · '+m.type}</small><button onClick={()=>setSelectedRecipe(m.id)}>{s.recipes.includes(m.id)?'📖 복습하기':'🧁 레시피 배우기'}</button></div>)}</div></>}</section>}
 {tab==='interior'&&<section className="screen"><div className="screen-title"><small>DECORATE YOUR CAFE</small><h2>🛋️ 꾸미기 상점</h2><p>딸기 베이커리 카페 테마의 소품 20종! 벽·카운터·테이블·바닥 구역에 어울리게 배치해 보세요.</p></div><div className="shop-items">{FURNI.map(f=><article key={f.id}><div className="bakery-shop-illustration"><DecorIcon id={f.id}/></div><b>{f.name}</b><small>📍 {f.zone} · 🪙 {f.cost}</small><button onClick={()=>buyDecor(f.id)}>구매 후 카페에 배치</button></article>)}</div><button className="wide-btn" onClick={()=>{setEdit(true);setDecorHint(false);setTab('cafe')}}>🎨 홈 카페 꾸미기 화면으로</button></section>}
 {tab==='draw'&&<section className="screen"><div className="screen-title"><small>HAPPY LUCKY BOX</small><h2>🎁 두근두근 뽑기</h2><p>직원과 인테리어 뽑기는 별도로 운영됩니다. 실제 결제는 없습니다.</p></div><div className="gacha-cards"><article><div className="gacha-staff-preview">{CREW.map(member=><CrewPortrait key={member.id} crew={member} small/>)}</div><h3>직원 뽑기</h3><p>새로운 카페 친구를 영입해 보세요!</p><button onClick={()=>gacha('staff')}>💎 5개 뽑기</button></article><article><span>🎁</span><h3>인테리어 뽑기</h3><p>귀여운 카페 가구가 랜덤 등장!</p><button onClick={()=>gacha('interior')}>💎 3개 뽑기</button></article></div>{chosenDraw&&<div className="draw-result"><div>✨ 🎊 ✨</div>{CREW.filter(m=>chosenDraw.includes(m.name)).map(m=><CrewPortrait key={m.id} crew={m}/>)}<strong>{chosenDraw}</strong><button onClick={()=>setChosenDraw(null)}>확인</button></div>}</section>}
 {tab==='league'&&<section className="screen"><div className="screen-title"><small>BARISTA LEAGUE</small><h2>🏆 바리스타 리그</h2><p>45초 동안 얼마나 많은 스피드 주문을 성공할 수 있을까요?</p></div><div className="league-hero"><div>🏆</div><strong>나의 최고기록 {s.best||0}건</strong><span>{s.best>=9?'💎 다이아':s.best>=6?'🥇 골드':s.best>=3?'🥈 실버':'🥉 브론즈'} 바리스타</span></div><div className="league-standings">{[[0,3],[1,6],[2,9]].map(([n,v])=><div key={n}><span className="league-member"><CrewPortrait crew={CREW[n]} small/><strong>{CREW[n].emoji} {CREW[n].name}</strong></span><b>{v}건</b></div>)}</div><p className="league-note">현재는 가상 라이벌과 겨루는 연습 리그입니다. 실시간 멀티플레이는 아직 아닙니다.</p><button className="wide-btn" onClick={startRush}>⏱️ 45초 리그 도전</button></section>}
 <section className="missions" style={{display:tab==='cafe'?'none':undefined}}><h3>🎀 반짝반짝 미션</h3>{[['serve','손님 5명 서빙',s.served>=5],['staff','직원 3명 채용',s.crew.length>=3],['decor','가구 4개 모으기',s.inventory.length>=4]].map(([id,title,complete])=><div key={id}><span>{complete?'✅':'🌸'} {title}</span><button disabled={!complete||s.claim[id]} onClick={()=>claimMission(id)}>{s.claim[id]?'완료':'💎 +2'}</button></div>)}</section>
 </div><div className="game-toast" role="status">{msg}</div>{tab!=='cafe'&&<nav className="sweet-nav">{nav.map(([id,icon,label])=><button key={id} className={tab===id?'active':''} onClick={()=>{setTab(id);setEdit(false);setChosenDraw(null)}}><span>{icon}</span><small>{label}</small></button>)}</nav>}
 </div>
}
createRoot(document.getElementById('root')).render(<App/>);
