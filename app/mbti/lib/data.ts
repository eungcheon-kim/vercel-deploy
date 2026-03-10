export type Dimension = "EI" | "SN" | "TF" | "JP";

export interface Question {
  id: number;
  text: string;
  scenario: string;
  optionA: { text: string; value: string };
  optionB: { text: string; value: string };
  dimension: Dimension;
}

export interface MbtiResult {
  type: string;
  title: string;
  emoji: string;
  description: string;
  strengths: string[];
  keywords: string[];
  bestMatch: string;
  worstMatch: string;
}

export const QUESTIONS: Question[] = [
  // E vs I (1~3)
  {
    id: 1,
    text: "주말에 에너지를 충전하는 방법은?",
    scenario: "힘든 한 주를 보내고 드디어 주말입니다",
    optionA: {
      text: "친구들과 만나서 수다 떨고 놀기",
      value: "E",
    },
    optionB: {
      text: "집에서 혼자 넷플릭스 보며 쉬기",
      value: "I",
    },
    dimension: "EI",
  },
  {
    id: 2,
    text: "새로운 모임에 갔을 때 당신은?",
    scenario: "친구가 소개해 준 모임에 처음 왔습니다",
    optionA: {
      text: "먼저 다가가서 이것저것 말 걸기",
      value: "E",
    },
    optionB: {
      text: "누군가 말을 걸어줄 때까지 관찰하기",
      value: "I",
    },
    dimension: "EI",
  },
  {
    id: 3,
    text: "고민이 생겼을 때 어떻게 하나요?",
    scenario: "요즘 마음에 걸리는 일이 있습니다",
    optionA: {
      text: "주변 사람들에게 이야기하면서 정리",
      value: "E",
    },
    optionB: {
      text: "혼자 조용히 생각하면서 정리",
      value: "I",
    },
    dimension: "EI",
  },

  // S vs N (4~6)
  {
    id: 4,
    text: "여행 계획을 세울 때 당신의 스타일은?",
    scenario: "다음 달 여행을 준비 중입니다",
    optionA: {
      text: "맛집, 숙소, 시간표를 꼼꼼하게 정리",
      value: "S",
    },
    optionB: {
      text: "대략적인 방향만 잡고 즉흥적으로",
      value: "N",
    },
    dimension: "SN",
  },
  {
    id: 5,
    text: "영화를 볼 때 더 끌리는 장르는?",
    scenario: "오늘 영화 한 편을 고르려고 합니다",
    optionA: {
      text: "실화 기반, 다큐멘터리, 사실적인 이야기",
      value: "S",
    },
    optionB: {
      text: "판타지, SF, 상상력이 넘치는 이야기",
      value: "N",
    },
    dimension: "SN",
  },
  {
    id: 6,
    text: "대화할 때 당신의 스타일은?",
    scenario: "친구와 카페에서 이야기 중입니다",
    optionA: {
      text: "구체적인 사실과 경험 위주로 이야기",
      value: "S",
    },
    optionB: {
      text: "아이디어, 가능성, 미래에 대해 이야기",
      value: "N",
    },
    dimension: "SN",
  },

  // T vs F (7~9)
  {
    id: 7,
    text: "친구가 고민 상담을 할 때 당신은?",
    scenario: "친한 친구가 힘든 일을 이야기합니다",
    optionA: {
      text: "문제의 원인을 분석하고 해결책을 제시",
      value: "T",
    },
    optionB: {
      text: "일단 공감하고 마음을 위로해 주기",
      value: "F",
    },
    dimension: "TF",
  },
  {
    id: 8,
    text: "중요한 결정을 내릴 때 기준은?",
    scenario: "두 가지 선택지 사이에서 고민 중입니다",
    optionA: {
      text: "장단점을 논리적으로 따져서 판단",
      value: "T",
    },
    optionB: {
      text: "내 마음이 끌리는 쪽을 따라서 판단",
      value: "F",
    },
    dimension: "TF",
  },
  {
    id: 9,
    text: "팀 프로젝트에서 의견 충돌이 생기면?",
    scenario: "팀원들 사이에 의견이 갈립니다",
    optionA: {
      text: "객관적 근거를 들어 가장 효율적인 안 주장",
      value: "T",
    },
    optionB: {
      text: "모두가 납득할 수 있는 타협점을 찾기",
      value: "F",
    },
    dimension: "TF",
  },

  // J vs P (10~12)
  {
    id: 10,
    text: "일상생활 스타일은 어떤 편인가요?",
    scenario: "평소 하루를 떠올려 봅시다",
    optionA: {
      text: "할 일 목록을 만들고 하나씩 체크하기",
      value: "J",
    },
    optionB: {
      text: "그때그때 하고 싶은 걸 유연하게 하기",
      value: "P",
    },
    dimension: "JP",
  },
  {
    id: 11,
    text: "약속 시간에 대한 당신의 태도는?",
    scenario: "내일 중요한 약속이 있습니다",
    optionA: {
      text: "미리 준비해서 여유 있게 도착하는 편",
      value: "J",
    },
    optionB: {
      text: "시간에 맞춰 나가거나 살짝 늦는 편",
      value: "P",
    },
    dimension: "JP",
  },
  {
    id: 12,
    text: "방 정리 스타일은?",
    scenario: "방을 한번 둘러봅시다",
    optionA: {
      text: "정해진 자리에 물건을 항상 정리정돈",
      value: "J",
    },
    optionB: {
      text: "어질러져도 나만의 규칙이 있어서 괜찮음",
      value: "P",
    },
    dimension: "JP",
  },
];

export const RESULTS: Record<string, MbtiResult> = {
  INTJ: {
    type: "INTJ",
    title: "전략가",
    emoji: "🏗️",
    description:
      "독창적이고 의지가 강한 전략가. 모든 일에 대해 깊이 생각하고, 장기적인 계획을 세우는 데 탁월합니다. 높은 기준을 가지고 있으며, 효율적인 시스템을 만드는 걸 좋아합니다.",
    strengths: ["전략적 사고", "독립적", "높은 기준"],
    keywords: ["계획형 두뇌", "완벽주의", "혼자서도 강함"],
    bestMatch: "ENFP",
    worstMatch: "ESFP",
  },
  INTP: {
    type: "INTP",
    title: "논리술사",
    emoji: "🧪",
    description:
      "끝없는 호기심을 가진 분석가. \"왜?\"라는 질문을 달고 살며, 복잡한 문제를 풀 때 가장 행복합니다. 조용하지만 머릿속은 항상 바쁘게 돌아가고 있습니다.",
    strengths: ["분석력", "창의적 사고", "지적 호기심"],
    keywords: ["이론 탐구", "호기심 대장", "생각이 많음"],
    bestMatch: "ENTJ",
    worstMatch: "ESFJ",
  },
  ENTJ: {
    type: "ENTJ",
    title: "통솔자",
    emoji: "👑",
    description:
      "타고난 리더이자 카리스마의 소유자. 목표를 세우면 반드시 달성하며, 주변 사람들을 이끌어가는 힘이 있습니다. 비효율을 참지 못하고, 더 나은 방법을 항상 찾습니다.",
    strengths: ["리더십", "결단력", "추진력"],
    keywords: ["타고난 리더", "목표 지향", "카리스마"],
    bestMatch: "INTP",
    worstMatch: "ISFP",
  },
  ENTP: {
    type: "ENTP",
    title: "변론가",
    emoji: "🚀",
    description:
      "재치 있고 대담한 아이디어뱅크. 새로운 도전을 즐기고, 토론에서 빛을 발합니다. 규칙을 당연하게 받아들이지 않고, 항상 더 나은 가능성을 탐색합니다.",
    strengths: ["창의력", "적응력", "토론 능력"],
    keywords: ["아이디어 뱅크", "도전 정신", "말빨 장인"],
    bestMatch: "INFJ",
    worstMatch: "ISFJ",
  },
  INFJ: {
    type: "INFJ",
    title: "옹호자",
    emoji: "🌙",
    description:
      "조용하지만 강한 신념을 가진 이상주의자. 다른 사람의 감정을 깊이 이해하고, 세상을 더 나은 곳으로 만들고 싶어합니다. 겉은 차분하지만 속에는 열정이 가득합니다.",
    strengths: ["공감 능력", "통찰력", "헌신적"],
    keywords: ["이상주의자", "공감왕", "조용한 열정"],
    bestMatch: "ENTP",
    worstMatch: "ESTP",
  },
  INFP: {
    type: "INFP",
    title: "중재자",
    emoji: "🌿",
    description:
      "감성이 풍부한 몽상가. 자신만의 가치관이 뚜렷하고, 진정성 있는 관계를 중요시합니다. 겉으로는 조용하지만, 머릿속에는 풍부한 상상의 세계가 펼쳐져 있습니다.",
    strengths: ["상상력", "감수성", "진정성"],
    keywords: ["감성 충만", "몽상가", "나만의 세계"],
    bestMatch: "ENFJ",
    worstMatch: "ESTJ",
  },
  ENFJ: {
    type: "ENFJ",
    title: "선도자",
    emoji: "🌟",
    description:
      "따뜻한 카리스마를 가진 사람. 다른 사람의 성장을 돕는 데서 기쁨을 느끼며, 주변에 긍정적인 영향력을 끼칩니다. 사람들을 하나로 모으는 놀라운 능력이 있습니다.",
    strengths: ["소통 능력", "리더십", "배려심"],
    keywords: ["인간 비타민", "분위기 메이커", "사람 중심"],
    bestMatch: "INFP",
    worstMatch: "ISTP",
  },
  ENFP: {
    type: "ENFP",
    title: "활동가",
    emoji: "🎉",
    description:
      "열정적이고 자유로운 영혼의 소유자. 새로운 사람을 만나고 새로운 경험을 하는 것을 사랑합니다. 감정이 풍부하고 상상력이 넘치며, 주변을 밝게 만드는 에너지가 있습니다.",
    strengths: ["열정", "사교성", "창의력"],
    keywords: ["인싸 중의 인싸", "자유로운 영혼", "열정 만수르"],
    bestMatch: "INTJ",
    worstMatch: "ISTJ",
  },
  ISTJ: {
    type: "ISTJ",
    title: "현실주의자",
    emoji: "🔧",
    description:
      "책임감 있고 성실한 사람. 한 번 맡은 일은 끝까지 해내며, 약속을 중요하게 생각합니다. 체계적이고 꼼꼼해서 주변 사람들이 가장 믿고 의지하는 타입입니다.",
    strengths: ["책임감", "성실함", "체계적"],
    keywords: ["믿음직한 사람", "약속은 철칙", "꼼꼼왕"],
    bestMatch: "ESFP",
    worstMatch: "ENFP",
  },
  ISFJ: {
    type: "ISFJ",
    title: "수호자",
    emoji: "🛡️",
    description:
      "따뜻하고 헌신적인 수호자. 주변 사람들을 세심하게 챙기고, 조용히 뒤에서 도움을 줍니다. 겸손하지만 놀라울 정도로 든든하며, 은근한 다정함이 매력입니다.",
    strengths: ["배려심", "인내력", "관찰력"],
    keywords: ["은근한 다정", "뒤에서 챙기기", "묵묵한 헌신"],
    bestMatch: "ESTP",
    worstMatch: "ENTP",
  },
  ESTJ: {
    type: "ESTJ",
    title: "경영자",
    emoji: "📊",
    description:
      "원칙과 질서를 중시하는 관리자. 팀을 체계적으로 이끌며, 규칙을 지키는 것을 중요하게 생각합니다. 현실적이고 실용적이며, 맡은 일을 효율적으로 처리합니다.",
    strengths: ["조직력", "실행력", "원칙적"],
    keywords: ["조직의 중심", "규칙 준수", "실행의 달인"],
    bestMatch: "ISFP",
    worstMatch: "INFP",
  },
  ESFJ: {
    type: "ESFJ",
    title: "집정관",
    emoji: "🤝",
    description:
      "사교적이고 따뜻한 인간관계의 달인. 주변 사람들의 기분을 잘 살피고, 화합을 이끌어냅니다. 정이 많고 배려심이 넘치며, 함께 있으면 편안한 사람입니다.",
    strengths: ["사교성", "공감 능력", "협동심"],
    keywords: ["분위기 메이커", "정 많은 사람", "함께하는 기쁨"],
    bestMatch: "ISTP",
    worstMatch: "INTP",
  },
  ISTP: {
    type: "ISTP",
    title: "장인",
    emoji: "🔍",
    description:
      "호기심 많은 실용주의자. 손으로 직접 해보면서 배우는 타입이며, 위기 상황에서 침착하게 대처합니다. 자유롭게 탐색하고, 문제를 효율적으로 해결하는 능력이 뛰어납니다.",
    strengths: ["문제 해결", "침착함", "실용적"],
    keywords: ["만능 손재주", "쿨한 해결사", "자유로운 탐험가"],
    bestMatch: "ESFJ",
    worstMatch: "ENFJ",
  },
  ISFP: {
    type: "ISFP",
    title: "모험가",
    emoji: "🎨",
    description:
      "감각이 뛰어난 예술적 영혼. 아름다운 것을 사랑하고, 자신만의 방식으로 세상을 표현합니다. 조용히 자기 세계를 탐험하며, 진솔하고 따뜻한 사람입니다.",
    strengths: ["미적 감각", "진솔함", "유연함"],
    keywords: ["예술적 감성", "자유로운 영혼", "조용한 탐험"],
    bestMatch: "ESTJ",
    worstMatch: "ENTJ",
  },
  ESTP: {
    type: "ESTP",
    title: "사업가",
    emoji: "⚡",
    description:
      "모험을 즐기는 행동파. 지금 이 순간을 가장 중요하게 여기며, 빠른 판단력과 실행력이 강점입니다. 사교적이고 에너지가 넘치며, 어디서든 적응을 잘합니다.",
    strengths: ["행동력", "적응력", "순발력"],
    keywords: ["액션 히어로", "현재를 즐기기", "도전 정신"],
    bestMatch: "ISFJ",
    worstMatch: "INFJ",
  },
  ESFP: {
    type: "ESFP",
    title: "연예인",
    emoji: "🎤",
    description:
      "파티의 중심이자 분위기 메이커. 사람들과 함께하는 것을 좋아하고, 지금 이 순간을 최대한 즐기는 타입입니다. 유머 감각이 뛰어나고, 주변을 밝게 만드는 매력이 있습니다.",
    strengths: ["사교성", "낙관적", "유머 감각"],
    keywords: ["무대 위의 주인공", "즐거움 추구", "텐션 장인"],
    bestMatch: "ISTJ",
    worstMatch: "INTJ",
  },
};
