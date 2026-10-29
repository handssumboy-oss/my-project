// 공식 파일을 assets/characters/에 넣은 후 경로를 지정하세요. null이면 임시 도형입니다.
export const CHARACTER_PATH = 'jabongi-10.png'; // 업로드 원본: 점프하는 자봉이
export const MISSIONS = [
 { title: '공원을 깨끗하게!', sub: '작은 손길로 되찾는 초록빛 공원', icon: '♧', target: 35, place: '초록 공원', color: 'green' },
 { title: '나눔 상자를 채워라!', sub: '나누면 두 배가 되는 따뜻한 마음', icon: '▣', target: 40, place: '나눔센터', color: 'peach' },
 { title: '이웃에게 온기를!', sub: '먼저 묻고, 마음을 존중해요', icon: '♡', target: null, place: '이웃집', color: 'lavender' },
];
export const ITEMS = [
 { name: '그림책', icon: '📚', box: 'study' }, { name: '수건', icon: '🧺', box: 'life' },
 { name: '공책', icon: '📓', box: 'study' }, { name: '비누', icon: '🧼', box: 'life' },
 { name: '연필', icon: '✏️', box: 'study' }, { name: '칫솔', icon: '🪥', box: 'life' },
];
export const QUESTIONS = [
 { who: '무거운 짐을 든 이웃', icon: '🛍️', line: '“짐이 조금 무겁네요…”', prompt: '어떻게 다가가면 좋을까요?', options: ['말없이 짐을 들어 옮겨요', '“짐 옮기는 걸 도와드려도 될까요?”', '빨리 가시라고 재촉해요'], answer: 1, hint: '도움이 필요한지 먼저 물어보면 서로 안심할 수 있어요.', feedback: '먼저 의사를 물었어요! 이웃이 동의한 뒤 함께 짐을 옮겨요.' },
 { who: '도움을 사양한 이웃', icon: '🙋', line: '“고마워요. 오늘은 혼자 해볼게요.”', prompt: '이웃의 대답을 들었다면?', options: ['“알겠어요. 필요하면 말씀해 주세요!”', '괜찮다며 계속 따라가요', '도움이 필요하다며 설득해요'], answer: 0, hint: '도움을 받지 않을 권리도 있어요. 이웃의 선택을 존중해요.', feedback: '거절도 존중했어요! 기다려 주는 마음도 따뜻한 배려예요.' },
 { who: '길을 찾는 이웃', icon: '🗺️', line: '“나눔센터는 어디로 가나요?”', prompt: '어떤 도움을 제안할까요?', options: ['손을 잡고 바로 데려가요', '휴대전화를 달라고 해요', '“길을 알려드릴까요? 원하시면 함께 갈게요.”'], answer: 2, hint: '상대가 원하는 도움을 선택할 수 있게 제안해 보세요.', feedback: '원하는 도움을 선택하도록 했어요! 작은 배려가 동네를 바꿔요.' },
];
