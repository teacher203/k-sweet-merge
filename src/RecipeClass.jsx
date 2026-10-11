import React,{useState} from 'react';
import './recipe-class.css';
// In-game learning notes: educational outlines, not validated production recipes.
export const LESSONS={
latte:{ingredients:'우유, 딸기, 딸기청, 얼음',method:['딸기를 씻고 물기를 제거해요.','컵에 딸기청과 딸기를 넣어요.','차가운 우유를 천천히 부어 층을 만들어요.'],tip:'차가운 재료를 사용하고 완성 즉시 제공해요.',question:'층이 잘 보이게 우유를 부으려면?',options:['천천히 부어요','끓는 우유를 한 번에 부어요','얼음을 먼저 녹여요'],answer:0},
song:{ingredients:'멥쌀가루, 소, 솔잎',method:['멥쌀가루를 익반죽해 매끄럽게 치대요.','적당량의 소를 넣고 반달 모양으로 빚어요.','솔잎을 깔아 충분히 찐 후 식혀요.'],tip:'쌀가루의 수분에 따라 물 양을 조절해요.',question:'송편의 기본 반죽에 주로 쓰는 가루는?',options:['밀가루','멥쌀가루','옥수수전분만'],answer:1},
tea:{ingredients:'유자청, 탄산수, 얼음, 유자 장식',method:['컵에 유자청을 넣어요.','얼음을 채우고 차가운 탄산수를 천천히 부어요.','가볍게 섞고 유자를 장식해요.'],tip:'탄산은 세게 젓거나 흔들면 빨리 빠져요.',question:'탄산을 유지하는 데 좋은 방법은?',options:['강하게 흔들기','오랫동안 끓이기','천천히 붓고 가볍게 섞기'],answer:2},
yak:{ingredients:'밀가루, 꿀, 참기름, 계피, 식용유',method:['밀가루에 기름과 시럽류를 넣어 반죽해요.','적당한 두께로 밀어 모양을 내요.','낮은 온도에서 속까지 튀겨 집청해요.'],tip:'기름 온도와 반죽 두께를 맞추는 것이 중요해요.',question:'약과를 튀길 때 중요한 것은?',options:['기름 온도를 조절하기','겉면만 급하게 태우기','집청 과정을 생략하기'],answer:0},
bingsu:{ingredients:'빙수 얼음, 우유, 딸기, 소스',method:['차갑게 준비한 그릇에 빙수 얼음을 담아요.','딸기를 깨끗이 손질해 올려요.','우유와 소스를 더한 뒤 즉시 제공해요.'],tip:'녹기 쉬우므로 그릇과 재료를 차갑게 준비해요.',question:'빙수의 식감을 지키는 방법은?',options:['상온에서 오래 기다리기','재료를 차갑게 준비하기','얼음을 미리 다 녹이기'],answer:1},
coffee:{ingredients:'에스프레소, 우유, 생크림',method:['에스프레소를 추출해 준비해요.','우유를 넣고 맛의 균형을 맞춰요.','적당히 휘핑한 크림을 올려 마무리해요.'],tip:'크림을 과하게 휘핑하면 부드럽게 퍼지기 어려워요.',question:'부드럽게 올라가는 크림을 만들려면?',options:['무조건 딱딱하게 휘핑','크림을 끓이기','적절한 농도로 휘핑하기'],answer:2},
mochi:{ingredients:'찹쌀가루, 물, 소, 덧가루',method:['찹쌀가루를 제품 지침에 맞춰 반죽하고 충분히 익혀요.','반죽을 식혀 분할하고 덧가루를 사용해요.','소를 넣고 오므려 부드럽게 빚어요.'],tip:'알파화된 찹쌀가루 등 비가열용 특수 제품은 일반 가루와 조리법이 달라요.',question:'일반 찹쌀가루로 찹쌀떡 피를 만들 때 필요한 것은?',options:['제품에 맞는 충분한 가열·익힘','언제나 찬물만 섞으면 완성','어떤 가루든 같은 공정'],answer:0},
cake:{ingredients:'케이크 시트, 생크림, 앙금 또는 버터크림 장식',method:['시트를 완전히 식힌 뒤 크림을 발라요.','층을 쌓고 겉면을 매끄럽게 정리해요.','식용 크림·앙금 장식으로 동백꽃을 표현해요.'],tip:'장식에는 먹을 수 있도록 만든 재료를 사용해요.',question:'크림을 바르기 전 시트는?',options:['뜨거울 때 바로 사용','충분히 식히기','물에 완전히 담그기'],answer:1}
};
export default function RecipeClass({menu,unlocked,onUnlock,onClose}){
 const [selected,setSelected]=useState(-1);
 const [result,setResult]=useState('');
 const lesson=LESSONS[menu.id];
 function check(i){setSelected(i);if(i===lesson.answer){setResult(unlocked?'✨ 정답! 레시피를 제대로 이해했어요.':'🎉 정답! 새 메뉴를 배울 준비가 됐어요.');onUnlock(menu.id)}else setResult('아쉬워요! 위의 만드는 방법을 읽고 다시 선택해 보세요.')}
 return <article className="recipe-class"><button className="recipe-class-close" onClick={onClose}>← 레시피 목록</button><div className="recipe-class-title"><div>{menu.emoji}</div><span>{unlocked?'📖 복습하기':'🔒 새 레시피 배우기'}</span><h3>{menu.name}</h3></div><section><strong>🥣 필요한 재료</strong><p>{lesson.ingredients}</p></section><section><strong>👩‍🍳 만드는 순서</strong><ol>{lesson.method.map((m,i)=><li key={i}>{m}</li>)}</ol></section><section className="recipe-class-tip"><strong>✨ 파티시에 딸기의 팁</strong><p>{lesson.tip}</p></section><section><strong>🧠 미니 퀴즈</strong><p>{lesson.question}</p><div className="recipe-answers">{lesson.options.map((o,i)=><button key={i} className={selected===i?(i===lesson.answer?'correct':'incorrect'):''} onClick={()=>check(i)}>{i+1}. {o}</button>)}</div><p className="recipe-class-result" role="status">{result}</p></section><small className="recipe-disclaimer">학습용 간단 공정 안내이며, 실제 실습에서는 재료 계량·알레르기·식품 안전을 별도로 확인하세요.</small></article>
}
