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
  techStack: string[];
  bestMatch: string;
  worstMatch: string;
}

export const QUESTIONS: Question[] = [
  // E vs I (1~3)
  {
    id: 1,
    text: "새 프로젝트를 시작할 때 당신은?",
    scenario: "PM이 새 프로젝트 킥오프를 알렸습니다",
    optionA: {
      text: "팀원들과 화이트보드 앞에서 브레인스토밍부터",
      value: "E",
    },
    optionB: {
      text: "혼자 조용히 구상한 뒤 정리해서 공유",
      value: "I",
    },
    dimension: "EI",
  },
  {
    id: 2,
    text: "프로덕션에서 버그가 터졌을 때?",
    scenario: "슬랙에 장애 알림이 울립니다",
    optionA: {
      text: "바로 팀 채널에 공유하고 같이 디버깅",
      value: "E",
    },
    optionB: {
      text: "로그부터 조용히 파고들어 원인 찾기",
      value: "I",
    },
    dimension: "EI",
  },
  {
    id: 3,
    text: "이상적인 개발 환경은?",
    scenario: "회사에서 근무 환경을 선택할 수 있습니다",
    optionA: {
      text: "동료들과 바로 대화할 수 있는 오피스",
      value: "E",
    },
    optionB: {
      text: "방해받지 않는 조용한 재택 환경",
      value: "I",
    },
    dimension: "EI",
  },

  // S vs N (4~6)
  {
    id: 4,
    text: "코드 리뷰할 때 주로 보는 것은?",
    scenario: "동료의 PR이 올라왔습니다",
    optionA: {
      text: "변수명, 포맷, 엣지 케이스 등 세부 구현",
      value: "S",
    },
    optionB: {
      text: "전체 아키텍처 설계와 확장성",
      value: "N",
    },
    dimension: "SN",
  },
  {
    id: 5,
    text: "새 프레임워크를 배울 때?",
    scenario: "핫한 새 기술이 등장했습니다",
    optionA: {
      text: "공식 문서를 처음부터 순서대로 읽기",
      value: "S",
    },
    optionB: {
      text: "일단 프로젝트 만들면서 부딪혀보기",
      value: "N",
    },
    dimension: "SN",
  },
  {
    id: 6,
    text: "프로젝트 일정을 산정할 때?",
    scenario: "PM이 일정을 물어봅니다",
    optionA: {
      text: "과거 비슷한 작업 기준으로 현실적 산정",
      value: "S",
    },
    optionB: {
      text: "새로운 접근법을 고려한 도전적 일정",
      value: "N",
    },
    dimension: "SN",
  },

  // T vs F (7~9)
  {
    id: 7,
    text: "PR 리뷰에서 코드가 마음에 안 들 때?",
    scenario: "주니어 개발자의 PR을 보고 있습니다",
    optionA: {
      text: "명확하게 개선점과 이유를 제시",
      value: "T",
    },
    optionB: {
      text: "좋은 점 먼저 언급 후 부드럽게 제안",
      value: "F",
    },
    dimension: "TF",
  },
  {
    id: 8,
    text: "기술 스택을 결정할 때 가장 중요한 건?",
    scenario: "신규 서비스의 기술 스택을 정해야 합니다",
    optionA: {
      text: "벤치마크 수치와 객관적 비교 자료",
      value: "T",
    },
    optionB: {
      text: "팀원들의 숙련도와 학습 의욕",
      value: "F",
    },
    dimension: "TF",
  },
  {
    id: 9,
    text: "레거시 코드를 만났을 때?",
    scenario: "5년 된 스파게티 코드를 발견했습니다",
    optionA: {
      text: "즉시 리팩토링 계획을 세우고 제안",
      value: "T",
    },
    optionB: {
      text: "당시 상황과 맥락을 먼저 파악",
      value: "F",
    },
    dimension: "TF",
  },

  // J vs P (10~12)
  {
    id: 10,
    text: "당신의 코딩 스타일은?",
    scenario: "새 기능을 구현해야 합니다",
    optionA: {
      text: "설계 문서 작성 → 구조 잡기 → 코딩",
      value: "J",
    },
    optionB: {
      text: "일단 프로토타입부터, 구조는 나중에",
      value: "P",
    },
    dimension: "JP",
  },
  {
    id: 11,
    text: "스프린트 마감이 내일인데?",
    scenario: "금요일 오후 5시, 마감은 내일입니다",
    optionA: {
      text: "이미 수요일에 끝냈지 뭐 (여유)",
      value: "J",
    },
    optionB: {
      text: "마감 전 폭발하는 집중력이 진짜 실력",
      value: "P",
    },
    dimension: "JP",
  },
  {
    id: 12,
    text: "사이드 프로젝트 관리 스타일은?",
    scenario: "주말에 시간이 생겼습니다",
    optionA: {
      text: "하나를 끝까지 완성한 후 다음 프로젝트",
      value: "J",
    },
    optionB: {
      text: "흥미로운 게 생기면 바로 새 repo 생성",
      value: "P",
    },
    dimension: "JP",
  },
];

export const RESULTS: Record<string, MbtiResult> = {
  INTJ: {
    type: "INTJ",
    title: "시스템 아키텍트",
    emoji: "🏗️",
    description:
      "완벽한 설계를 추구하는 전략가. 코드 한 줄도 전체 시스템의 맥락에서 바라봅니다. 기술 부채를 참지 못하고, 누구보다 깔끔한 아키텍처를 만들어냅니다.",
    strengths: ["시스템 설계", "기술 의사결정", "장기적 비전"],
    techStack: ["Rust", "Kubernetes", "시스템 디자인"],
    bestMatch: "ENTP",
    worstMatch: "ESFP",
  },
  INTP: {
    type: "INTP",
    title: "알고리즘 탐구자",
    emoji: "🧪",
    description:
      "모든 것의 원리를 파헤치는 이론파. 왜 동작하는지 모르면 잠을 못 자고, 새벽까지 소스코드를 뜯어봅니다. Stack Overflow보다 GitHub 소스를 직접 읽는 타입.",
    strengths: ["알고리즘 설계", "문제 분석", "깊은 기술 이해"],
    techStack: ["Haskell", "알고리즘", "컴파일러"],
    bestMatch: "ENTJ",
    worstMatch: "ESFJ",
  },
  ENTJ: {
    type: "ENTJ",
    title: "테크 리드",
    emoji: "👑",
    description:
      "팀을 이끌고 프로젝트를 성공시키는 리더. 기술적 판단이 빠르고, 복잡한 문제를 명확한 태스크로 쪼개는 능력이 뛰어납니다. 스탠드업 미팅의 진행자.",
    strengths: ["기술 리딩", "의사결정", "프로젝트 관리"],
    techStack: ["풀스택", "CI/CD", "클라우드 인프라"],
    bestMatch: "INTP",
    worstMatch: "ISFP",
  },
  ENTP: {
    type: "ENTP",
    title: "풀스택 해커",
    emoji: "🚀",
    description:
      "\"이거 되게 재밌을 것 같은데?\"로 시작해서 48시간 해커톤을 우승하는 타입. 새로운 기술과 아이디어를 조합해 프로토타입을 순식간에 만들어냅니다.",
    strengths: ["프로토타이핑", "창의적 해결", "기술 트렌드"],
    techStack: ["Next.js", "최신 프레임워크", "해커톤 필수 스택"],
    bestMatch: "INTJ",
    worstMatch: "ISFJ",
  },
  INFJ: {
    type: "INFJ",
    title: "UX 엔지니어",
    emoji: "🎭",
    description:
      "사용자의 마음을 읽는 개발자. 기술적으로 완벽해도 사용자가 불편하면 의미 없다고 생각합니다. 코드에 철학을 담고, 접근성을 항상 고려합니다.",
    strengths: ["사용자 공감", "UI/UX 설계", "접근성"],
    techStack: ["React", "Figma", "웹 접근성(a11y)"],
    bestMatch: "ENFP",
    worstMatch: "ESTP",
  },
  INFP: {
    type: "INFP",
    title: "인디 개발자",
    emoji: "🌿",
    description:
      "의미 있는 프로젝트를 추구하는 이상주의자. 오픈소스에 기여하고, 세상을 조금이라도 나아지게 하는 코드를 작성하고 싶어합니다. 커밋 메시지에도 영혼을 담는 타입.",
    strengths: ["창의적 코딩", "오픈소스 기여", "가치 중심 개발"],
    techStack: ["Python", "오픈소스", "크리에이티브 코딩"],
    bestMatch: "ENFJ",
    worstMatch: "ESTJ",
  },
  ENFJ: {
    type: "ENFJ",
    title: "멘토 개발자",
    emoji: "🌟",
    description:
      "주니어의 성장이 곧 나의 기쁨. 코드 리뷰를 교육 기회로 만들고, 팀 문화를 만들어가는 데 앞장섭니다. 기술 블로그와 컨퍼런스 발표를 즐기는 타입.",
    strengths: ["멘토링", "팀 빌딩", "지식 공유"],
    techStack: ["풀스택", "기술 블로그", "교육 콘텐츠"],
    bestMatch: "INFP",
    worstMatch: "ISTP",
  },
  ENFP: {
    type: "ENFP",
    title: "아이디어 머신",
    emoji: "💡",
    description:
      "\"이것도 만들고 싶고, 저것도 만들고 싶어!\" GitHub에 미완성 repo가 30개. 하지만 그 열정 덕분에 팀에 에너지를 불어넣고, 기발한 솔루션을 제시합니다.",
    strengths: ["아이디어 발상", "팀 에너지", "빠른 학습"],
    techStack: ["React", "크리에이티브 코딩", "노코드/로우코드"],
    bestMatch: "INFJ",
    worstMatch: "ISTJ",
  },
  ISTJ: {
    type: "ISTJ",
    title: "시니어 엔지니어",
    emoji: "🔧",
    description:
      "안정적이고 신뢰할 수 있는 팀의 기둥. 테스트 커버리지 100%를 향해 달리고, 문서화를 습관처럼 합니다. 이 사람이 리뷰한 코드는 프로덕션에서 안 터집니다.",
    strengths: ["코드 품질", "문서화", "안정적 운영"],
    techStack: ["Java", "Spring", "테스트 프레임워크"],
    bestMatch: "ESFP",
    worstMatch: "ENFP",
  },
  ISFJ: {
    type: "ISFJ",
    title: "데브옵스 수호자",
    emoji: "🛡️",
    description:
      "조용히 시스템을 지키는 수호자. 모니터링 대시보드를 항상 주시하고, 장애가 나기 전에 예방합니다. 팀원들이 편하게 개발할 수 있도록 인프라를 묵묵히 관리합니다.",
    strengths: ["시스템 안정화", "모니터링", "팀 서포트"],
    techStack: ["Docker", "Grafana", "AWS"],
    bestMatch: "ESTP",
    worstMatch: "ENTP",
  },
  ESTJ: {
    type: "ESTJ",
    title: "프로젝트 매니저 개발자",
    emoji: "📊",
    description:
      "Jira 보드를 완벽하게 관리하면서 직접 코드도 짜는 만능 개발자. 일정 관리와 기술적 판단을 동시에 해내며, 프로젝트를 제 시간에 딜리버리합니다.",
    strengths: ["프로젝트 관리", "일정 산정", "체계적 개발"],
    techStack: ["엔터프라이즈 스택", "Jira", "스크럼"],
    bestMatch: "ISFP",
    worstMatch: "INFP",
  },
  ESFJ: {
    type: "ESFJ",
    title: "커뮤니티 빌더",
    emoji: "🤝",
    description:
      "개발 커뮤니티의 중심에 서는 사람. 스터디를 만들고, 밋업을 주최하고, 신입 온보딩 문서를 작성합니다. 팀의 분위기 메이커이자 갈등 해결사.",
    strengths: ["커뮤니티 운영", "온보딩", "팀 화합"],
    techStack: ["풀스택", "기술 문서", "위키"],
    bestMatch: "ISTP",
    worstMatch: "INTP",
  },
  ISTP: {
    type: "ISTP",
    title: "디버깅 장인",
    emoji: "🔍",
    description:
      "\"재현 가능?\"이 첫 마디인 개발자. 복잡한 버그를 차분하게 추적하고, 최소한의 코드로 문제를 해결합니다. 터미널 하나로 모든 걸 해결하는 CLI 덕후.",
    strengths: ["디버깅", "문제 해결", "최적화"],
    techStack: ["Go", "리눅스", "성능 프로파일링"],
    bestMatch: "ESFJ",
    worstMatch: "ENFJ",
  },
  ISFP: {
    type: "ISFP",
    title: "프론트엔드 아티스트",
    emoji: "🎨",
    description:
      "코드로 예술을 만드는 개발자. 1px의 차이를 눈으로 잡아내고, 애니메이션에 완벽한 이징 커브를 적용합니다. CSS로 못 만드는 게 없는 마법사.",
    strengths: ["UI 구현", "CSS 마스터", "디테일"],
    techStack: ["CSS", "Framer Motion", "Three.js"],
    bestMatch: "ESTJ",
    worstMatch: "ENTJ",
  },
  ESTP: {
    type: "ESTP",
    title: "스타트업 CTO",
    emoji: "⚡",
    description:
      "\"일단 배포하고 고치자!\"는 이 사람의 철학. 빠른 의사결정과 실행력으로 MVP를 순식간에 만들어냅니다. 완벽보다 속도, 이론보다 실전을 중시합니다.",
    strengths: ["빠른 실행", "MVP 개발", "실용적 판단"],
    techStack: ["Node.js", "Firebase", "Vercel"],
    bestMatch: "ISFJ",
    worstMatch: "INFJ",
  },
  ESFP: {
    type: "ESFP",
    title: "데모데이 스타",
    emoji: "🎤",
    description:
      "프레젠테이션 하면 누구보다 빛나는 개발자. 라이브 코딩도 거뜬하고, 복잡한 기술을 쉽게 설명합니다. 해커톤의 분위기 메이커이자 팀의 사기 충전기.",
    strengths: ["프레젠테이션", "라이브 코딩", "커뮤니케이션"],
    techStack: ["React", "데모/프로토타입", "인터랙티브 웹"],
    bestMatch: "ISTJ",
    worstMatch: "INTJ",
  },
};
