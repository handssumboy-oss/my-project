export const STAT_INFO = {
 empathy:{name:'공감',icon:'♡',color:'#d69da7'}, action:{name:'실행',icon:'✦',color:'#d6b77c'},
 teamwork:{name:'협력',icon:'♧',color:'#8fb69a'}, energy:{name:'체력',icon:'◒',color:'#9bafc8'},
};
export const ACTIVITIES = [
 {id:'train',name:'안전·응급 교육',kind:'배우기',icon:'✚',place:'배움터',cost:12,gains:{action:8,teamwork:2},friend:'peer',description:'작은 위기에 침착하게 대응하는 법을 배워요.'},
 {id:'talk',name:'소통 워크숍',kind:'배우기',icon:'☏',place:'마을 모임방',cost:10,gains:{empathy:8,teamwork:4},friend:'peer',description:'먼저 묻고, 끝까지 듣는 연습을 해요.'},
 {id:'cleanup',name:'공원 정화',kind:'봉사하기',icon:'♧',place:'초록 공원',cost:17,gains:{action:8,teamwork:2,empathy:1},friend:'park',description:'함께 걷는 길에 초록빛을 돌려줘요.'},
 {id:'reading',name:'그림책 친구',kind:'봉사하기',icon:'▤',place:'작은 도서관',cost:13,gains:{empathy:7,action:3},friend:'library',description:'그림책을 사이에 두고 이야기를 나눠요.'},
 {id:'delivery',name:'나눔 꾸러미',kind:'봉사하기',icon:'◇',place:'나눔센터',cost:15,gains:{action:5,teamwork:6},friend:'neighbor',description:'필요한 물건을 확인하고 정성껏 준비해요.'},
 {id:'festival',name:'동네 행사 지원',kind:'봉사하기',icon:'⚑',place:'동네 광장',cost:19,gains:{teamwork:8,action:4},friend:'peer',description:'역할을 나누면 큰 행사도 함께할 수 있어요.'},
 {id:'visit',name:'이웃 안심 동행',kind:'봉사하기',icon:'♡',place:'이웃 골목',cost:16,gains:{empathy:8,teamwork:3},friend:'neighbor',description:'상대가 원하는 도움을 먼저 물어봐요.'},
 {id:'rest',name:'쉬고 산책하기',kind:'쉬고 만나기',icon:'☀',place:'자봉이의 방',cost:0,gains:{energy:30,empathy:2},friend:'park',description:'잘 쉬는 것도 오래 함께하는 방법이에요.'},
];
export const FRIENDS = [
 {id:'park',name:'은솔',role:'공원 지킴이',icon:'♧',color:'#9ebc8d',first:'초록 공원에서 기다리고 있어요.',story:'지난번 정리한 화단에 새 꽃이 피었대요. 은솔이 다음 산책에도 함께하자고 해요.'},
 {id:'library',name:'책봄',role:'작은 도서관 사서',icon:'▤',color:'#b2a6c7',first:'그림책을 좋아하는 친구예요.',story:'자봉이와 읽은 책을 아이들이 다시 찾는대요. 책봄이 새 이야기 시간을 제안해요.'},
 {id:'peer',name:'다온',role:'또래 봉사자',icon:'✦',color:'#d9b18d',first:'마을 모임방에서 만날 수 있어요.',story:'함께해 든든했다는 다온. 이번엔 서로의 강점을 살린 작은 프로젝트를 해보자고 해요.'},
 {id:'neighbor',name:'온유',role:'우리 동네 이웃',icon:'♡',color:'#d4a3ae',first:'이웃 골목과 나눔센터에서 만나요.',story:'도움을 받았던 온유가 이번에는 다른 이웃에게 마음을 전하고 싶다고 해요.'},
];
export const SKILLS = [
 {id:'firstAid',name:'기초 응급처치',icon:'✚',hint:'안전·응급 교육 1회',test:s=>s.counts.train>=1},
 {id:'listening',name:'마음을 듣는 대화',icon:'♡',hint:'소통 워크숍 1회 · 공감 18',test:s=>s.counts.talk>=1&&s.stats.empathy>=18},
 {id:'green',name:'초록 실천',icon:'♧',hint:'공원 정화 2회',test:s=>s.counts.cleanup>=2},
 {id:'story',name:'이야기 친구',icon:'▤',hint:'그림책 친구 2회',test:s=>s.counts.reading>=2},
 {id:'planning',name:'함께하는 기획',icon:'⚑',hint:'행사 지원 2회 · 협력 28',test:s=>s.counts.festival>=2&&s.stats.teamwork>=28},
 {id:'companion',name:'안심 동행',icon:'◇',hint:'응급 교육 + 소통 워크숍 + 이웃 동행',test:s=>s.counts.train>=1&&s.counts.talk>=1&&s.counts.visit>=1},
];
export const TRAITS = [
 {id:'prepared',name:'꼼꼼한 준비',hint:'안전 교육을 반복하고 현장에서 활용했어요.',test:s=>s.counts.train>=2&&s.stats.action>=30},
 {id:'listener',name:'경청하는 친구',hint:'마음과 이야기를 차곡차곡 모았어요.',test:s=>s.stats.empathy>=45},
 {id:'connector',name:'분위기 메이커',hint:'함께할 때의 힘을 발견했어요.',test:s=>s.stats.teamwork>=45},
 {id:'steady',name:'오래 함께하는 마음',hint:'활동과 휴식 사이의 균형을 찾았어요.',test:s=>s.counts.rest>=3&&s.stats.energy>=35},
];
const choice=(text,gains,note,extra={})=>({text,gains,note,...extra});
export const EVENTS = {
 training:{title:'작은 연습이 큰 안심으로',line:'모형으로 응급 상황을 연습해요. 어떤 방식으로 익힐까요?',icon:'✚',choices:[choice('짝과 역할을 바꿔가며 연습해요',{action:4,teamwork:3},'서로 확인해 주니 놓친 부분이 보였어요.',{bond:1}),choice('순서를 적고 차분히 복습해요',{action:6},'자봉이의 첫 안전 메모가 완성됐어요.',{bond:1})]},
 invite:{title:'모임방의 빈자리',line:'새로 온 친구가 모임방 문 앞에서 망설이고 있어요.',icon:'☏',choices:[choice('편한 자리가 있는지 먼저 물어봐요',{empathy:4,teamwork:2},'친구가 고개를 끄덕이며 옆에 앉았어요.',{bond:1}),choice('모임에서 할 일을 짧게 소개해요',{action:2,teamwork:4},'무엇을 할지 알게 되어 마음이 놓였대요.',{bond:1}),choice('배운 경청법으로 이야기를 들어요',{empathy:6,teamwork:3},'새 친구의 관심사를 듣고 함께할 역할을 찾았어요.',{bond:2,skill:'listening'})]},
 rain:{title:'공원에 비가 톡톡',line:'정화 활동을 시작하려는데 비가 내려요. 함께 방법을 정해요.',icon:'☂',choices:[choice('실내 분리배출 안내 활동으로 바꿔요',{action:3,teamwork:3},'비 오는 날에도 할 수 있는 초록 실천을 찾았어요.',{bond:1}),choice('다음 일정을 함께 정하고 준비물을 챙겨요',{action:2,energy:5},'안전한 다음 만남을 약속했어요.',{bond:1}),choice('안전 점검 후 가능한 구역만 함께 정리해요',{action:6,teamwork:3},'배운 안전 지식으로 범위를 정하고 활동했어요.',{bond:2,skill:'firstAid'})]},
 sorting:{title:'깨끗한 분리배출',line:'음료가 조금 남은 용기와 깨끗한 종이가 섞여 있어요.',icon:'♧',choices:[choice('내용물을 비우고 종류별로 나눠요',{action:5,teamwork:2},'다음 사람이 정리하기도 쉬워졌어요.',{bond:1}),choice('담당자에게 지역 분리배출 기준을 확인해요',{empathy:2,action:4},'지역마다 다른 기준도 꼼꼼히 알게 됐어요.',{bond:1}),choice('초록 실천 안내판을 함께 만들어요',{action:5,teamwork:5},'함께 배운 내용을 동네에 남겼어요.',{bond:2,skill:'green'})]},
 shy:{title:'말 없는 그림책 친구',line:'아이가 책을 펼쳐 놓고 가만히 있어요. 어떻게 함께할까요?',icon:'▤',choices:[choice('좋아하는 그림이 있는지 물어봐요',{empathy:5},'아이가 마음에 드는 그림을 손가락으로 가리켰어요.',{bond:1}),choice('편하게 볼 수 있도록 옆에서 기다려요',{empathy:4,energy:3},'조금 뒤 아이가 먼저 페이지를 넘겨 줬어요.',{bond:1}),choice('등장인물의 목소리로 이야기를 나눠요',{empathy:6,action:3},'배운 이야기 기술이 아이의 웃음으로 돌아왔어요.',{bond:2,skill:'story'})]},
 kits:{title:'누구에게 필요한 꾸러미일까?',line:'나눔센터에 여러 물품이 모였어요. 꾸러미를 준비할 차례예요.',icon:'◇',choices:[choice('받는 분에게 필요한 물품을 먼저 확인해요',{empathy:4,action:3},'필요에 맞는 나눔이 되었어요.',{bond:1}),choice('상태와 사용 기한을 팀원과 함께 점검해요',{action:4,teamwork:3},'깨끗하고 안전한 물품으로 준비했어요.',{bond:1}),choice('배운 기획법으로 준비·전달 역할을 나눠요',{action:5,teamwork:5},'빠진 물품 없이 팀이 차분하게 마쳤어요.',{bond:2,skill:'planning'})]},
 lost:{title:'행사장에서 길을 묻는 아이',line:'보호자를 찾는 아이가 안내소 근처에서 도움을 요청했어요.',icon:'⚑',choices:[choice('아이와 안전한 곳에서 담당자에게 알려요',{action:4,empathy:3},'담당자의 절차에 따라 보호자를 만났어요.',{bond:1}),choice('곁을 지키며 안내 담당자를 불러요',{empathy:4,teamwork:3},'아이가 혼자 남지 않도록 함께 기다렸어요.',{bond:1}),choice('배운 안전 대응과 경청을 함께 활용해요',{action:6,empathy:4},'미리 배운 기술 덕분에 침착하게 도왔어요.',{bond:2,skill:'firstAid'})]},
 roles:{title:'우리 역할을 다시 나눠볼까?',line:'행사 준비 중 한쪽에 일이 몰리고 있어요.',icon:'✦',choices:[choice('팀원들과 지금 필요한 일을 정리해요',{teamwork:5,action:2},'서로의 상황을 알고 일을 다시 나눴어요.',{bond:1}),choice('내가 맡을 수 있는 작은 일을 제안해요',{action:4,teamwork:3},'작은 역할 하나가 팀의 여유를 만들었어요.',{bond:1}),choice('각자의 강점에 맞춘 역할표를 만들어요',{teamwork:7,action:3},'기획 기술로 모두가 참여할 자리를 만들었어요.',{bond:2,skill:'planning'})]},
 bags:{title:'도움을 건네기 전에',line:'온유가 무거운 짐을 들고 잠깐 멈췄어요.',icon:'♡',choices:[choice('“옮기는 걸 도와드려도 될까요?”',{empathy:5,teamwork:2},'온유가 동의한 뒤 함께 짐을 옮겼어요.',{bond:1}),choice('“어떤 도움이 편하실까요?”',{empathy:6},'원하는 도움을 듣고 알맞게 함께했어요.',{bond:1}),choice('안전한 동행 방법을 설명하고 의사를 물어요',{empathy:6,action:3},'배운 기술과 배려가 안심이 되었어요.',{bond:2,skill:'companion'})]},
 refusal:{title:'오늘은 혼자 해볼게요',line:'온유가 웃으며 말해요. “고마워요. 오늘은 혼자 해볼게요.”',icon:'♡',choices:[choice('“알겠어요. 필요하면 말씀해 주세요!”',{empathy:5},'도움을 받지 않을 선택도 존중했어요.',{bond:2}),choice('“어떤 도움이 필요하실 때 편히 알려주세요.”',{empathy:4,teamwork:2},'다음에도 편하게 이야기할 수 있는 사이가 됐어요.',{bond:1}),choice('고집을 부리지 않고 마음을 들으며 기다려요',{empathy:6,energy:3},'경청은 말하지 않을 때에도 이어져요.',{bond:2,skill:'listening'})]},
 garden:{title:'쉼표가 있는 오후',line:'창가의 화분 옆에서 잠깐 쉬어요. 오늘은 무엇을 해볼까요?',icon:'☀',choices:[choice('산책하며 은솔과 꽃 이야기를 나눠요',{energy:8,empathy:3},'잘 쉰 마음에 새로운 관심이 자랐어요.',{bond:1}),choice('활동 일지를 적고 일찍 쉬어요',{energy:12,action:2},'내 속도를 살피며 다음 만남을 준비했어요.',{bond:0})]},
 return:{title:'작은 마음이 돌아오는 날',line:'인연의 후속 이야기',icon:'✉',choices:[choice('다음 활동을 함께 의논해요',{teamwork:6,empathy:3},'도움이 오가며 동네의 연결이 깊어졌어요.',{bond:1}),choice('고마운 마음을 활동 일지에 남겨요',{empathy:5,action:3},'지나온 작은 실천이 하나의 이야기가 됐어요.',{bond:1})]},
};
export const EVENT_POOLS={train:['training'],talk:['invite','roles'],cleanup:['rain','sorting'],reading:['shy'],delivery:['kits'],festival:['lost','roles'],visit:['bags','refusal'],rest:['garden']};
export const PROJECTS = [
 {id:'green',name:'우리 동네 초록길',icon:'♧',friend:'park',skill:'green',stat:'action',min:30,master:65,ending:'초록 동네 기획자',masterEnding:'동네의 숲을 잇는 기획자',description:'안전한 범위를 정하고 함께 초록빛을 더해요.',object:'화분',color:'#8daf88'},
 {id:'companion',name:'이웃 안심 동행',icon:'♡',friend:'neighbor',skill:'companion',stat:'empathy',min:30,master:65,ending:'든든한 이웃 친구',masterEnding:'마음을 잇는 안심 동행가',description:'원하는 도움을 묻고 이웃의 속도로 함께 걸어요.',object:'감사 카드',color:'#d29ba8'},
 {id:'festival',name:'작은 나눔 축제',icon:'⚑',friend:'peer',skill:'planning',stat:'teamwork',min:36,master:65,ending:'함께하는 연결자',masterEnding:'모두의 자리를 만드는 기획자',description:'강점에 맞게 역할을 나누고 작은 축제를 열어요.',object:'축제 깃발',color:'#c8ae7e'},
 {id:'story',name:'그림책 속 작은 오후',icon:'▤',friend:'library',skill:'story',stat:'empathy',min:30,master:65,ending:'이야기를 나누는 활동가',masterEnding:'동네의 이야기를 피우는 활동가',description:'좋아하는 이야기를 함께 고르고 나누어요.',object:'그림책',color:'#ad9ec3'},
];
export const WEEK_TITLES=['설레는 첫걸음','마음이 자라는 시간','함께라서 가능한 일','나만의 실천을 준비해요'];
