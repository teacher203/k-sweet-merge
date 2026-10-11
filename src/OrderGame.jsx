import React,{useEffect,useRef,useState} from 'react';
import './order-game.css';

const STEPS={
latte:[['🥛','우유'],['🍓','딸기'],['🧊','얼음']],
song:[['🍚','쌀반죽'],['🫘','달콤한 소'],['🍃','솔잎']],
tea:[['💧','탄산수'],['🍋','유자'],['🧊','얼음']],
yak:[['🌾','밀가루'],['🍯','꿀'],['🌼','꽃 장식']],
bingsu:[['🧊','눈꽃 얼음'],['🥛','우유'],['🍓','딸기']],
coffee:[['☕','에스프레소'],['🥛','우유'],['☁️','크림']],
mochi:[['🍚','찹쌀반죽'],['🫘','팥앙금'],['🍥','모양 만들기']],
cake:[['🥚','케이크 시트'],['☁️','생크림'],['🌺','동백 장식']]
};
const DECOYS=[
[['🍋','유자'],['🍫','초콜릿'],['🍚','쌀반죽']],
[['🧀','치즈'],['🫐','블루베리'],['🍵','말차']],
[['🌶️','고추'],['🍊','감귤'],['🥒','오이']]
];
const TIME_LIMIT=26;
export default function OrderGame({menu,customer,onSuccess,onExit}){
 const [stage,setStage]=useState(0),[remaining,setRemaining]=useState(TIME_LIMIT),[mistakes,setMistakes]=useState(0),[drag,setDrag]=useState(null),[notice,setNotice]=useState('재료를 컵으로 쓱 밀어주세요!');
 const [complete,setComplete]=useState(false),[failed,setFailed]=useState(false);
 const dropRef=useRef(null),active=useRef(false),dragRef=useRef(null),completeRef=useRef(false),failedRef=useRef(false);
 const items=STEPS[menu.id]||STEPS.latte;
 const correct=items[stage]||items[2];
 const options=[correct,...DECOYS[stage]].slice(0,4).sort((a,b)=>((a[1].length*7+stage*9)%13)-((b[1].length*7+stage*9)%13));
 // Stable but varied chip order on each step; the correct ingredient always exists.
 useEffect(()=>{if(complete||failed)return;const id=setInterval(()=>setRemaining(t=>{if(t<=1){failedRef.current=true;setFailed(true);setNotice('시간 초과! 다시 도전해보세요.');return 0}return t-1}),1000);return()=>clearInterval(id)},[complete,failed]);
 function submit(item){
  if(completeRef.current||failedRef.current)return;
  if(item[1]!==correct[1]){
   setMistakes(m=>m+1);setRemaining(t=>Math.max(1,t-3));setNotice('앗, 다른 재료예요! 3초가 줄었어요.');
   return;
  }
  if(stage===2){
   completeRef.current=true;setComplete(true);setNotice('🎉 완성! 손님에게 서빙해요!');
   onSuccess({remaining,mistakes,quality:mistakes===0&&remaining>=12?'perfect':'good'});
  }else{setStage(s=>s+1);setNotice('✨ 잘했어요! 다음 재료를 넣어주세요.')}
 }
 function down(e,item){
  if(complete||failed)return;
  if(e.button!==undefined&&e.button!==0)return;
  e.preventDefault();e.currentTarget.setPointerCapture(e.pointerId);active.current=true;dragRef.current=item;
  setDrag({item,x:e.clientX,y:e.clientY});
 }
 function move(e){if(!active.current)return;e.preventDefault();setDrag(d=>d?{...d,x:e.clientX,y:e.clientY}:null)}
 function up(e){
  if(!active.current)return;e.preventDefault();const item=dragRef.current;active.current=false;dragRef.current=null;setDrag(null);
  const r=dropRef.current?.getBoundingClientRect();
  if(r&&e.clientX>=r.left-25&&e.clientX<=r.right+25&&e.clientY>=r.top-25&&e.clientY<=r.bottom+25)submit(item);
  else setNotice('그릇까지 쭉 밀어서 놓아주세요! 👆');
 }
 function cancel(){active.current=false;dragRef.current=null;setDrag(null)}
 return <section className="order-minigame" role="dialog" aria-modal="true" aria-label={menu.name+' 만들기 게임'}>
  <div className="om-top"><button onClick={onExit} className="om-close" aria-label="주문 게임 나가기">← 주문으로</button><span>🍓 K-BAKERY KITCHEN</span></div>
  <div className="om-order"><div className="om-customer">{customer||'🐰'}</div><div><small>손님이 기다리고 있어요!</small><h3>{menu.emoji} {menu.name}</h3><p>3가지 재료를 순서대로 드래그!</p></div></div>
  <div className="om-timer"><strong className={remaining<=7?'danger':''}>⏱️ {remaining}초</strong><span>실수 {mistakes}회</span></div>
  <div className="om-time-track"><div style={{width:(remaining/TIME_LIMIT*100)+'%'}}/></div>
  <div className="om-steps">{items.map((v,i)=><div key={i} className={i<stage||complete?'done':i===stage?'current':''}><b>{i<stage||complete?'✓':i+1}</b><small>{v[1]}</small></div>)}</div>
  <div className="om-kitchen">
   <div className="om-drop" ref={dropRef}><div className="om-bowl">{menu.type==='음료'?'🥤':'🥣'}</div><strong>{complete?'완성!':failed?'시간 초과':correct[1]+' 넣기'}</strong><small>재료를 이곳으로 밀어주세요 ↓</small></div>
   <p className="om-notice" role="status">{notice}</p>
   {!complete&&!failed&&<div className="om-tray">{options.map((opt,i)=><button type="button" key={i} className="om-chip" onPointerDown={e=>down(e,opt)} onPointerMove={move} onPointerUp={up} onPointerCancel={cancel} style={{touchAction:'none'}} aria-label={opt[1]+' 끌어서 그릇에 넣기'}><span>{opt[0]}</span><b>{opt[1]}</b><small>잡고 밀기 ↗</small></button>)}</div>}
   {drag&&<div className="om-ghost" style={{left:drag.x,top:drag.y}}>{drag.item[0]}</div>}
   {complete&&<div className="om-success">🌟 디저트 완성! <b>서빙 보상이 지급되었어요.</b><button onClick={onExit}>다른 주문 받기 →</button></div>}
   {failed&&<div className="om-success fail">🥺 손님을 놓쳤어요.<button onClick={onExit}>다른 주문 도전 →</button></div>}
  </div>
  <p className="om-guide">손가락으로 재료를 잡고 컵 위로 밀어 놓으면 제조됩니다. 틀리면 시간이 줄어들어요.</p>
 </section>;
}
