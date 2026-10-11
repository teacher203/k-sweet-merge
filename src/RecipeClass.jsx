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
cake:{ingredients:'케이크 시트, 생크림, 앙금 또는 버터크림 장식',method:['시트를 완전히 식힌 뒤 크림을 발라요.','층을 쌓고 겉면을 매끄럽게 정리해요.','식용 크림·앙금 장식으로 동백꽃을 표현해요.'],tip:'장식에는 먹을 수 있도록 만든 재료를 사용해요.',question:'크림을 바르기 전 시트는?',options:['뜨거울 때 바로 사용','충분히 식히기','물에 완전히 담그기'],answer:1},
cookie:{ingredients:'밀가루, 버터, 설탕, 달걀, 초콜릿, 견과류',method:['버터와 설탕을 섞고 달걀을 넣어 반죽해요.','밀가루와 초콜릿을 섞고 크게 분할해요.','충분히 예열한 오븐에서 중심부의 익힘을 확인하며 구워요.'],tip:'두꺼운 쿠키는 겉면 색뿐 아니라 중심부의 익힘을 확인해야 해요.',question:'두꺼운 쿠키 굽기에서 가장 중요한 것은?',options:['겉면만 태우기','중심부의 익힘 확인','오븐을 사용하지 않기'],answer:1},
financier:{ingredients:'아몬드가루, 밀가루, 슈거파우더, 달걀흰자, 버터',method:['버터를 갈색으로 가열한 후 적절히 식혀요.','가루 재료와 흰자를 섞고 버터를 넣어요.','틀에 팬닝한 다음 오븐에서 노릇하게 구워요.'],tip:'갈색 버터는 고소한 풍미를 더하지만 태우지 않도록 주의해요.',question:'휘낭시에 풍미를 만드는 대표 재료는?',options:['탄산수','솔잎','갈색 버터'],answer:2},
madeleine:{ingredients:'달걀, 설탕, 밀가루, 버터, 베이킹파우더, 레몬 제스트',method:['달걀과 설탕을 섞은 후 가루를 더해요.','녹인 버터를 섞고 반죽을 쉬게 해요.','조개 모양의 틀에 팬닝하고 오븐에서 구워요.'],tip:'틀과 반죽 상태가 마들렌의 모양에 영향을 줘요.',question:'마들렌의 대표적인 틀 모양은?',options:['조개 모양','삼각김밥 모양','긴 막대 모양'],answer:0},
scone:{ingredients:'밀가루, 베이킹파우더, 차가운 버터, 설탕, 우유',method:['밀가루와 차가운 버터를 섞어요.','액체를 더해 짧게 뭉치고 적절한 두께로 밀어요.','분할한 다음 예열된 오븐에서 구워요.'],tip:'반죽을 과하게 치대면 식감이 단단해질 수 있어요.',question:'스콘 반죽을 만들 때 좋은 방법은?',options:['오랫동안 강하게 치대기','반죽을 짧게 뭉치기','물처럼 묽게 만들기'],answer:1},
croissant:{ingredients:'강력분, 버터, 효모, 우유, 설탕, 소금',method:['반죽을 준비하고 버터를 감싸 접어 층을 만들어요.','밀고 접기를 반복한 뒤 삼각형으로 재단해 말아요.','발효 후 예열한 오븐에서 결이 살아나도록 구워요.'],tip:'접기 작업에서는 반죽과 버터의 온도 균형이 중요해요.',question:'크루아상 결을 만드는 핵심 과정은?',options:['집청하기','크림 끓이기','버터와 반죽을 접어 층 만들기'],answer:2}

};
export default function RecipeClass({menu,unlocked,onUnlock,onClose}){
 const [selected,setSelected]=useState(-1);
 const [result,setResult]=useState('');
 const lesson=LESSONS[menu.id];
 function check(i){setSelected(i);if(i===lesson.answer){setResult(unlocked?'✨ 정답! 레시피를 제대로 이해했어요.':'🎉 정답! 새 메뉴를 배울 준비가 됐어요.');onUnlock(menu.id)}else setResult('아쉬워요! 위의 만드는 방법을 읽고 다시 선택해 보세요.')}
 return <article className="recipe-class"><button className="recipe-class-close" onClick={onClose}>← 레시피 목록</button><div className="recipe-class-title"><div>{menu.image?<img className="recipe-hero-food" src={menu.image} alt={menu.name}/>:menu.emoji}</div><span>{unlocked?'📖 복습하기':'🔒 새 레시피 배우기'}</span><h3>{menu.name}</h3></div><section><strong>🥣 필요한 재료</strong><p>{lesson.ingredients}</p></section><section><strong>👩‍🍳 만드는 순서</strong><ol>{lesson.method.map((m,i)=><li key={i}>{m}</li>)}</ol></section><section className="recipe-class-tip"><strong>✨ 파티시에 딸기의 팁</strong><p>{lesson.tip}</p></section><section><strong>🧠 미니 퀴즈</strong><p>{lesson.question}</p><div className="recipe-answers">{lesson.options.map((o,i)=><button key={i} className={selected===i?(i===lesson.answer?'correct':'incorrect'):''} onClick={()=>check(i)}>{i+1}. {o}</button>)}</div><p className="recipe-class-result" role="status">{result}</p></section><small className="recipe-disclaimer">학습용 간단 공정 안내이며, 실제 실습에서는 재료 계량·알레르기·식품 안전을 별도로 확인하세요.</small></article>
}
