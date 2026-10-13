import React,{useEffect,useMemo,useRef,useState} from 'react';
import {playSound} from './sound.js';
import './cafe-club.css';

// Challenge is reproducible on each device and does not need paid APIs.
// Imported scores are self-reported and NOT verified or live multiplayer.
const ITEMS=[
{id:'scone',name:'버터 스콘',art:'/art/food-scone.svg',type:'bread',points:120},
{id:'madeleine',name:'마들렌',art:'/art/food-madeleine.svg',type:'bread',points:125},
{id:'cookie',name:'르뱅 쿠키',emoji:'🍪',type:'bread',points:150},
{id:'cake',name:'동백 케이크',art:'/art/food-camellia.svg',type:'bread',points:180},
{id:'mochi',name:'찹쌀떡',art:'/art/food-mochi.svg',type:'bread',points:130},
{id:'croissant',name:'크루아상',emoji:'🥐',type:'bread',points:150},
{id:'latte',name:'딸기라떼',emoji:'🍓',type:'drink',points:90},
{id:'coffee',name:'크림라떼',emoji:'☕',type:'drink',points:100},
{id:'financier',name:'휘낭시에',emoji:'🧈',type:'bread',points:130},
{id:'yak',name:'약과',emoji:'🍯',type:'bread',points:120},
{id:'tea',name:'유자에이드',emoji:'🍋',type:'drink',points:95},
{id:'bingsu',name:'딸기빙수',emoji:'🍧',type:'bread',points:110},
{id:'song',name:'송편',emoji:'🍡',type:'bread',points:105}
];
const faces=['🐱','🐰','🐼','🦊','🐻','🐥','🐶'];
const clamp=(v,a,b)=>Math.min(b,Math.max(a,v));
const hash=(str)=>{let h=2166136261;for(let i=0;i<str.length;i++)h=Math.imul(h^str.charCodeAt(i),16777619);return h>>>0};
function rng(seed){let t=seed>>>0;return ()=>{t+=0x6D2B79F5;let z=t;z=Math.imul(z^z>>>15,z|1);z^=z+Math.imul(z^z>>>7,z|61);return ((z^z>>>14)>>>0)/4294967296}}
const today=()=>new Date().toLocaleDateString('sv-SE');
const challengeSeed=(day)=>hash('KBAKERY-DAILY-'+day);
function createTicket(seed,index,level=1){const random=rng((seed+index*0x9e3779b9)>>>0);const item=ITEMS[Math.floor(random()*ITEMS.length)],guest=faces[Math.floor(random()*faces.length)];const duration=clamp(15-level*.4+random()*5,9,20);return {id:index,product:item.id,face:guest,initial:duration,remaining:duration,vip:random()>.86}}
const itemBy=(id)=>ITEMS.find(x=>x.id===id)||ITEMS[0];
const shareCode=(seed,score,name)=>'KB-'+seed.toString(36).toUpperCase()+'-'+Math.max(0,Math.floor(score)).toString(36).toUpperCase()+'-'+encodeURIComponent((name||'카페 친구').slice(0,12));
function parseCode(text){
 const t=(text||'').trim().match(/^KB-([0-9A-Z]+)-([0-9A-Z]+)-(.+)$/i);
 if(!t)return null;const seed=parseInt(t[1],36),score=parseInt(t[2],36);if(!Number.isFinite(seed)||!Number.isFinite(score)||score>1000000)return null;
 try{return {seed,score,name:decodeURIComponent(t[3]).slice(0,12)}}catch{return null}
}
function Product({id}){const item=itemBy(id);return <span className="kc-product">{item.art?<img src={item.art} alt="" draggable={false}/>:<span>{item.emoji}</span>}</span>}
const STAFF=[
{id:'mocha',name:'모카',role:'바리스타',image:'/mascots/cute-mocha.svg',station:'drink'},
{id:'berry',name:'딸기',role:'파티시에',image:'/mascots/cute-berry.svg',station:'bread'},
{id:'bong',name:'봉봉',role:'매니저',image:'/mascots/cute-bong.svg',station:'manager'}
];
function CafeStage({jobs,clock,combo,playing,lastNote,facesInLine}){
 const celebrate=lastNote.includes('PERFECT')||lastNote.includes('COMBO');
 return <div className={'kc-world '+(playing?'kc-world-live':'')+(celebrate?' kc-world-party':'')} aria-label="모카와 딸기와 봉봉이 함께 일하는 베이커리 카페">
 <img className="kc-world-room" src="/art/club-cafe-stage.svg" alt="따뜻한 크림색 카페 내부, 창가와 베이커리 작업대"/>
 <div className="kc-world-marquee"><span>✦ OPEN TODAY</span><strong>K-BAKERY CAFE</strong><span>{playing?'LIVE SHIFT':'COZY BAKERY'}</span></div>
 <div className="kc-world-ambient a1">✦</div><div className="kc-world-ambient a2">✧</div>
 {STAFF.map((staff,i)=>{const work=jobs[staff.station],active=!!work&&playing,ready=active&&clock>=work.readyAt;
 return <div key={staff.id} className={'kc-actor kc-actor-'+staff.id+(active?' kc-busy':'')+(ready?' kc-ready':'')+(celebrate?' kc-cheer':'')} style={{'--actor-delay':i*.22+'s'}}>
 <div className="kc-actor-speech">{ready?'완성! ✨':active?(staff.station==='bread'?'굽는 중…':'제조 중…'):celebrate?'잘했어! 💗':staff.station==='manager'?'어서 오세요!':'준비 완료'}</div>
 <img src={staff.image} alt={staff.name+' '+staff.role} draggable={false}/>
 <div className="kc-actor-tag"><b>{staff.name}</b><span>{staff.role}</span></div>
 {active&&<div className="kc-actor-tool">{staff.station==='bread'?'🥐':'🥤'}</div>}
 </div>})}
 <div className="kc-world-counter"><div><span>🥐</span><span>🍰</span><span>🍪</span></div><span className="kc-counter-caption">FRESH BAKED · MADE WITH LOVE</span><div><span>☕</span><span>🍓</span></div></div>
 {playing&&<div className="kc-world-guests">{facesInLine.slice(0,3).map((face,i)=><span key={i} style={{'--guest-delay':i*.2+'s'}}>{face}</span>)}</div>}
 {celebrate&&playing&&<div className="kc-world-combo">✨ {combo>=5?combo+' COMBO!':'PERFECT!'} ✨</div>}
 </div>
}
export default function CafeClub({s,setS,flash}){
 const [page,setPage]=useState('play'),[playing,setPlaying]=useState(false),[elapsed,setElapsed]=useState(0),[tickets,setTickets]=useState([]),[combo,setCombo]=useState(0),[score,setScore]=useState(0),[miss,setMiss]=useState(0),[total,setTotal]=useState(0),[lastNote,setLastNote]=useState(''),[codeInput,setCodeInput]=useState(''),[friend,setFriend]=useState(null),[nameInput,setNameInput]=useState(s.clubName||''),[result,setResult]=useState(null);
 const currentSeed=challengeSeed(today());
 const [mode,setMode]=useState('daily');
 const [jobs,setJobs]=useState({bread:null,drink:null});
 const jobsRef=useRef({bread:null,drink:null});
 const [clock,setClock]=useState(0);
 const [customSeed,setCustomSeed]=useState(null);
 const seed=customSeed||currentSeed;
 const timeLeft=Math.max(0,60-elapsed);
 const focus=s.cafeFocus||'balanced';
 const level=3; // Daily and friend league run at the SAME fixed difficulty for fair comparison.
 const run=useRef(null);const ticketsRef=useRef([]);const playingRef=useRef(false);const timeRef=useRef(0);const nextIndex=useRef(0);const comboRef=useRef(0);const scoreRef=useRef(0);const missedRef=useRef(0);const servedRef=useRef(0);const lastTick=useRef(0);
 const finish=()=>{
  if(!playingRef.current)return;playingRef.current=false;setPlaying(false);const points=scoreRef.current,served=servedRef.current,missed=missedRef.current;
  const won=points>=900;const coins=Math.round(points/16);const earnedExp=Math.round(points/35);
  setS(v=>({...v,coins:v.coins+coins,exp:v.exp+earnedExp,clubWins:(v.clubWins||0)+(won?1:0),clubRuns:(v.clubRuns||0)+1,clubBest:Math.max(v.clubBest||0,points),clubDaily:v.clubDaily?.seed===seed?{seed,best:Math.max(v.clubDaily.best,points)}:{seed,best:points},clubHistory:[{day:today(),seed,points,served,missed},...(v.clubHistory||[])].slice(0,15)}));
  setResult({points,served,missed,coins,earnedExp,won,seed});playSound(won?'win':'lose');
 };
 const start=()=>{
  const initial=[createTicket(seed,0,level),createTicket(seed,1,level),createTicket(seed,2,level)];
  jobsRef.current={bread:null,drink:null};setJobs({bread:null,drink:null});
  ticketsRef.current=initial;setTickets(initial);nextIndex.current=3;timeRef.current=0;lastTick.current=performance.now();playingRef.current=true;
  scoreRef.current=0;missedRef.current=0;servedRef.current=0;comboRef.current=0;setScore(0);setMiss(0);setCombo(0);setTotal(0);setResult(null);setElapsed(0);setLastNote('시작! 가장 급한 손님부터 처리하세요.');setPlaying(true);playSound('level');
 };
 useEffect(()=>{if(!playing)return;const timer=window.setInterval(()=>{
  if(!playingRef.current)return;
  const n=performance.now(),delta=Math.min(.3,(n-lastTick.current)/1000);lastTick.current=n;timeRef.current+=delta;setElapsed(timeRef.current);
  setClock(n);
  if(timeRef.current>=60){finish();return}
  const drain=delta*(1+.45*(timeRef.current/60)); // Gradually increase pressure for everyone equally.
  let queue=ticketsRef.current.map(t=>({...t,remaining:t.remaining-drain}));
  let spoiled=queue.filter(t=>t.remaining<=0).length;
  if(spoiled){missedRef.current+=spoiled;comboRef.current=0;setMiss(missedRef.current);setCombo(0);setLastNote('손님이 떠났어요! 다음 주문에 집중하세요.');playSound('wrong')}
  queue=queue.filter(t=>t.remaining>0);
  if(spoiled){const valid=new Set(queue.map(t=>t.id));if(Object.values(jobsRef.current).some(j=>j&&!valid.has(j.ticketId))){jobsRef.current={bread:jobsRef.current.bread&&valid.has(jobsRef.current.bread.ticketId)?jobsRef.current.bread:null,drink:jobsRef.current.drink&&valid.has(jobsRef.current.drink.ticketId)?jobsRef.current.drink:null};setJobs({...jobsRef.current})}}
  while(queue.length<3){queue.push(createTicket(seed,nextIndex.current++,level))}
  ticketsRef.current=queue;setTickets(queue);
 },65);
 return()=>clearInterval(timer)},[playing,seed,level]);
 const serve=(ticket,productId)=>{
  if(!playingRef.current)return;
  const active=ticketsRef.current.find(t=>t.id===ticket.id);if(!active)return;
  const correct=active.product===productId;
  if(!correct){missedRef.current++;comboRef.current=0;setMiss(missedRef.current);setCombo(0);setLastNote('잘못된 메뉴예요! 정확도를 확인하세요.');playSound('wrong');return}
  const type=itemBy(active.product).type;
  const job=jobsRef.current[type];
  if(!job||job.ticketId!==active.id||performance.now()<job.readyAt){setLastNote('먼저 '+(type==='bread'?'오븐':'음료 작업대')+'에서 제조해 주세요.');return}
  jobsRef.current={...jobsRef.current,[type]:null};setJobs({...jobsRef.current});
  const earned=Math.round(itemBy(active.product).points*(active.vip?1.4:1)+(active.remaining/active.initial)*85+Math.min(10,comboRef.current)*25);
  scoreRef.current+=earned;servedRef.current++;comboRef.current++;setScore(scoreRef.current);setTotal(servedRef.current);setCombo(comboRef.current);
  ticketsRef.current=ticketsRef.current.filter(t=>t.id!==active.id);
  ticketsRef.current.push(createTicket(seed,nextIndex.current++,level));setTickets([...ticketsRef.current]);
  setLastNote(comboRef.current>=5?'🔥 '+comboRef.current+' COMBO! +'+earned:'PERFECT +'+earned+'점');playSound(comboRef.current>=5?'combo':'correct');
 };
 const prepare=(ticket,choice)=>{
  if(!playingRef.current)return;
  const active=ticketsRef.current.find(t=>t.id===ticket.id);if(!active)return;
  if(active.product!==choice){missedRef.current++;comboRef.current=0;setMiss(missedRef.current);setCombo(0);setLastNote('재료 준비가 잘못됐어요. 다른 메뉴를 확인하세요.');playSound('wrong');return}
  const type=itemBy(choice).type;
  if(jobsRef.current[type]){setLastNote(type==='bread'?'오븐이 사용 중입니다. 음료 주문을 확인해 보세요.':'음료 작업대가 사용 중입니다.');return}
  const duration=(type==='bread'?3200:1700);
  jobsRef.current={...jobsRef.current,[type]:{ticketId:active.id,product:choice,readyAt:performance.now()+duration}};
  setJobs({...jobsRef.current});setLastNote(type==='bread'?'🍞 오븐에서 굽는 중! 다른 작업대도 활용하세요.':'🥤 음료 제조 중! 오븐도 활용해 보세요.');playSound('click');
 };
 const inspect=useMemo(()=>s.clubHistory||[],[s.clubHistory]);
 const dailyScore=s.clubDaily?.seed===currentSeed?s.clubDaily.best:0;
 const yourScore=s.clubDaily?.seed===seed?s.clubDaily.best:0;
 const saveName=()=>{const cleaned=nameInput.trim().slice(0,12)||'베이커리 친구';setS(v=>({...v,clubName:cleaned}));flash('카페 닉네임을 저장했습니다.')};
 const importFriend=()=>{const other=parseCode(codeInput);if(!other){flash('공유 코드 형식이 맞지 않습니다.');return}setFriend(other);setCustomSeed(other.seed);setPage('league');setMode('friend');flash(other.name+'님의 도전 기록을 불러왔습니다.')};
 const copy=()=>{const value=shareCode(result?.seed||seed,result?.points||yourScore,s.clubName||'베이커리 친구');if(navigator.clipboard?.writeText){navigator.clipboard.writeText(value).then(()=>flash('도전 코드가 복사됐어요!')).catch(()=>{setCodeInput(value);flash('아래 코드를 복사해서 친구에게 보내세요.')})}else {setCodeInput(value);flash('코드를 복사해서 친구에게 보내세요.')}}
 const purchase=(next)=>{
  const options={speed:{cost:150,label:'작업 속도 교육',field:'kitchenTraining'},quality:{cost:200,label:'품질 연구',field:'qualityTraining'},marketing:{cost:220,label:'카페 홍보',field:'marketingTraining'}};
  const item=options[next];if(!item)return;
  if(s.coins<item.cost)return flash('코인이 부족합니다. 손님 주문을 완료해 보세요.');
  if((s[item.field]||0)>=5)return flash('최고 단계까지 투자했어요.');
  setS(v=>({...v,coins:v.coins-item.cost,[item.field]:(v[item.field]||0)+1}));flash(item.label+'에 투자했어요!');playSound('buy');
 };
 return <section className="kc-shell">
 <div className="kc-heading"><div><small>YOUR OWN BAKERY. YOUR OWN LEAGUE.</small><h2>✦ K-BAKERY CLUB</h2><p>키우고, 도전하고, 친구의 기록에 도전하세요.</p></div><span className="kc-season">SEASON 01</span></div>
 <div className="kc-tabs">{[['play','⚡ 배틀'],['manage','☕ 경영'],['league','🏆 친구·리그']].map(([v,label])=><button key={v} className={page===v?'active':''} onClick={()=>{if(!playing)setPage(v)}} disabled={playing}>{label}</button>)}</div>
 {page==='play'&&<div className="kc-section">
  <div className="kc-game-head"><div><span>✦ PREMIUM BAKERY SHIFT</span><h3>오늘의 카페 러시</h3><p>모카·딸기·봉봉과 함께, 60초 동안 나만의 카페를 운영하세요.</p></div><b>SEASON 01</b></div>
 <CafeStage jobs={jobs} clock={clock} combo={combo} playing={playing} lastNote={lastNote} facesInLine={tickets.map(t=>t.face)}/>
  <div className="kc-stats"><div><small>남은 시간</small><strong>{Math.ceil(timeLeft)}<span>초</span></strong></div><div><small>점수</small><strong>{score.toLocaleString()}</strong></div><div><small>콤보</small><strong>×{combo}</strong></div></div>
  {!playing&&!result&&<div className="kc-intro"><p>손님 3명이 동시에 도착합니다. <b>주문서의 메뉴를 골라 제조한 뒤 완성되면 서빙</b>하세요. 주문이 밀리면 손님이 떠나고, 오븐과 음료 작업대를 동시에 활용하면 더 높은 점수를 얻습니다.</p><div className="kc-tiprow"><span>🎯 동일 조건 일일 도전</span><span>🧠 우선순위 판단</span><span>🔥 2개 작업대 병렬 가동</span><span>⏩ 후반부 속도 증가</span><span>🔥 콤보 보너스</span></div><button className="kc-main-btn" onClick={start}>오늘의 60초 경기 시작 <span>→</span></button></div>}
  {playing&&<><div className="kc-orders">{tickets.map((t,i)=><div className={'kc-ticket '+(t.remaining<6?'urgent':'')} key={t.id}><div className="kc-ticket-top"><span>{t.face} {t.vip?'VIP 손님':'손님 '+(i+1)}</span><b>{Math.ceil(t.remaining)}초</b></div><div className="kc-ticket-main"><Product id={t.product}/><div><strong>{itemBy(t.product).name}</strong><small>{t.vip?'VIP 보너스 ×1.4':'빠른 서빙 보너스'}</small></div></div><div className="kc-ticket-timer"><span style={{width:(t.remaining/t.initial*100)+'%'}}/></div><div className="kc-ticket-actions">{jobs[itemBy(t.product).type]?.ticketId===t.id?<button className="kc-deliver" onClick={()=>serve(t,t.product)} disabled={clock<jobs[itemBy(t.product).type].readyAt}>{clock>=jobs[itemBy(t.product).type].readyAt?"✅ 완성! 서빙하기":"⏳ 제조 중..."}</button>:[t.product,ITEMS[(ITEMS.findIndex(x=>x.id===t.product)+4)%ITEMS.length].id,ITEMS[(ITEMS.findIndex(x=>x.id===t.product)+7)%ITEMS.length].id].sort((a,b)=>hash(String(t.id)+a)%11-hash(String(t.id)+b)%11).map((id,j)=><button key={j} disabled={!!jobs[itemBy(id).type]} onClick={()=>prepare(t,id)} title={itemBy(id).name+" 준비"} aria-label={itemBy(id).name+" 제조 시작"}><Product id={id}/></button>)}</div></div>)}</div><div className="kc-stations"><span>🔥 오븐 {jobs.bread?(clock>=jobs.bread.readyAt?"✅ 완성":"⏳ 가동 중"):"대기"}</span><span>🥤 음료 {jobs.drink?(clock>=jobs.drink.readyAt?"✅ 완성":"⏳ 가동 중"):"대기"}</span></div><div className="kc-live"><span>{lastNote}</span><span>완료 {total}건 · 실수 {miss}회</span></div></>}
  {!playing&&result&&<div className="kc-results"><span className="kc-result-icon">{result.won?'🏆':'☕'}</span><small>{result.won?'SHIFT COMPLETE':'SHIFT FINISHED'}</small><h3>{result.points.toLocaleString()}점</h3><p>서빙 {result.served}건 · 실수 {result.missed}회</p><div className="kc-reward"><span>🪙 +{result.coins}코인</span><span>⭐ +{result.earnedExp}경험치</span></div><button className="kc-main-btn" onClick={start}>다시 도전하기 ↗</button><button className="kc-secondary" onClick={()=>{setPage('league');setCustomSeed(result.seed)}}>친구에게 도전장 보내기 →</button></div>}
  <div className="kc-footnote">실력형 플레이 모드 · 매일 같은 주문 순서로 친구 기록에 도전할 수 있습니다. 서버 검증 없는 기록은 공식 순위가 아닙니다.</div>
 </div>}
 {page==='manage'&&<div className="kc-section">
  <div className="kc-section-title"><div><small>BAKERY MANAGEMENT</small><h3>우리 카페 운영 전략</h3></div><span>🪙 {s.coins.toLocaleString()}</span></div>
  <div className="kc-strategy-grid">{[['balanced','⚖️','균형 운영','수익과 품질의 균형'],['bakery','🥐','베이커리 특화','구움과자 제조 중심'],['service','💗','손님 만족','빠른 서비스 중심']].map(([id,icon,title,desc])=><button className={focus===id?'selected':''} key={id} onClick={()=>{setS(v=>({...v,cafeFocus:id}));flash(title+' 전략으로 변경했습니다.')}}><span>{icon}</span><b>{title}</b><small>{desc}</small></button>)}</div>
  <div className="kc-investment"><h4>카페 성장 투자</h4>{[['speed','⚡','작업 속도 교육','kitchenTraining',150],['quality','🍰','품질 연구','qualityTraining',200],['marketing','📣','카페 홍보','marketingTraining',220]].map(([id,icon,title,key,cost])=><div className="kc-invest-row" key={id}><span>{icon}</span><div><b>{title}</b><small>교육 Lv.{s[key]||0}/5 · {id==='speed'?'제조 수익 개선':id==='quality'?'완성 보상 증가':'카페 자동 수익 증가'}</small></div><button onClick={()=>purchase(id)} disabled={(s[key]||0)>=5}>🪙 {cost}</button></div>)}</div>
  <div className="kc-management-summary"><b>오늘의 경영 현황</b><span>누적 주문 {s.served||0}건</span><span>매장 장식 {s.inventory?.length||0}개</span><span>배운 레시피 {s.recipes?.length||0}종</span></div>
  <p className="kc-footnote">경영 전략과 투자 효과는 주문 수익 및 자동 수익에 반영됩니다. 이전 코인·직원·레시피 기록은 유지됩니다.</p>
 </div>}
 {page==='league'&&<div className="kc-section">
 <div className="kc-section-title"><div><small>FRIEND CHALLENGE</small><h3>오늘의 카페 리그</h3></div><span>🎯 표준 난이도</span></div>
 <div className="kc-scoreboard"><div><small>내 최고 기록</small><b>{(s.clubBest||0).toLocaleString()}</b></div><div><small>오늘 최고</small><b>{dailyScore.toLocaleString()}</b></div><div><small>도전 횟수</small><b>{s.clubRuns||0}</b></div></div>
 <label className="kc-label">내 카페 닉네임 (실명 대신 사용)</label><div className="kc-inline"><input maxLength={12} value={nameInput} onChange={e=>setNameInput(e.target.value)} placeholder="예: 딸기마카롱"/><button onClick={saveName}>저장</button></div>
 <div className="kc-share"><strong>💌 친구에게 도전장을 보내세요</strong><p>친구가 아래 공유 코드를 입력하면 <b>같은 경기 조건</b>에서 내 점수에 도전할 수 있어요.</p><button onClick={copy}>📋 내 최고 점수 코드 복사하기</button><div className="kc-inline"><input value={codeInput} onChange={e=>setCodeInput(e.target.value)} placeholder="친구에게 받은 KB-... 코드를 붙여넣기"/><button onClick={importFriend}>불러오기</button></div></div>
 {friend&&<div className="kc-rival"><strong>🥊 {friend.name}님의 도전</strong><div><span>친구 기록 <b>{friend.score.toLocaleString()}점</b></span><span>내 기록 <b>{yourScore.toLocaleString()}점</b></span></div><button className="kc-main-btn" onClick={()=>{setPage('play');setResult(null)}}>같은 조건으로 승부하기 →</button></div>}
 <div className="kc-history"><strong>최근 경기 기록</strong>{inspect.length?inspect.slice(0,6).map((g,i)=><div key={i}><span>{g.day} · {g.served}건 서빙</span><b>{g.points.toLocaleString()}점</b></div>):<p>아직 기록이 없어요. 첫 경기에 도전해 보세요!</p>}</div>
 <p className="kc-footnote">현재 친구 교류는 코드 공유형 비동기 도전입니다. 실시간 채팅·다른 휴대폰의 점수 자동 동기화·공식 검증 랭킹은 아직 제공하지 않습니다.</p>
 </div>}
 </section>
}
