export type Rarity = "SSS" | "SS" | "S" | "A" | "B" | "C";

export interface Stat {
  label: string;
  value: number; // 0~100
  icon: string;
}

export interface Fortune {
  title: string;
  subtitle: string;
  rarity: Rarity;
  stats: Stat[];
  message: string;
  advice: string;
  luckyItem: string;
}

export const RARITY_CONFIG: Record<
  Rarity,
  { label: string; color: string; bg: string; border: string; textColor: string; barColor: string; probability: number }
> = {
  SSS: {
    label: "SSS 전설",
    color: "text-yellow-400",
    bg: "bg-gradient-to-br from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    border: "border-yellow-500/40",
    textColor: "text-yellow-300",
    barColor: "from-yellow-400 to-amber-500",
    probability: 3,
  },
  SS: {
    label: "SS 에픽",
    color: "text-pink-400",
    bg: "bg-gradient-to-br from-pink-500/20 via-rose-500/10 to-fuchsia-500/20",
    border: "border-pink-500/40",
    textColor: "text-pink-300",
    barColor: "from-pink-400 to-rose-500",
    probability: 7,
  },
  S: {
    label: "S 레어",
    color: "text-violet-400",
    bg: "bg-gradient-to-br from-violet-500/20 via-purple-500/10 to-indigo-500/20",
    border: "border-violet-500/40",
    textColor: "text-violet-300",
    barColor: "from-violet-400 to-purple-500",
    probability: 15,
  },
  A: {
    label: "A 희귀",
    color: "text-blue-400",
    bg: "bg-gradient-to-br from-blue-500/15 via-sky-500/10 to-cyan-500/15",
    border: "border-blue-500/30",
    textColor: "text-blue-300",
    barColor: "from-blue-400 to-sky-500",
    probability: 25,
  },
  B: {
    label: "B 일반",
    color: "text-green-400",
    bg: "bg-gradient-to-br from-green-500/10 via-emerald-500/5 to-teal-500/10",
    border: "border-green-500/25",
    textColor: "text-green-300",
    barColor: "from-green-400 to-emerald-500",
    probability: 30,
  },
  C: {
    label: "C 일반",
    color: "text-zinc-400",
    bg: "bg-gradient-to-br from-zinc-500/10 to-zinc-600/10",
    border: "border-zinc-500/20",
    textColor: "text-zinc-400",
    barColor: "from-zinc-400 to-zinc-500",
    probability: 20,
  },
};

// ===== Stat Pools =====
const STAT_LABELS: { label: string; icon: string }[] = [
  { label: "코딩 집중력", icon: "🎯" },
  { label: "디버깅 직감", icon: "🐛" },
  { label: "CSS 감각", icon: "🎨" },
  { label: "야근 내성", icon: "🌙" },
  { label: "구글링 능력", icon: "🔍" },
  { label: "커밋 빈도", icon: "📦" },
  { label: "코드 리뷰 눈썰미", icon: "👁️" },
  { label: "배포 운", icon: "🚀" },
  { label: "타입 안전성", icon: "🛡️" },
  { label: "리팩토링 의지", icon: "♻️" },
  { label: "문서화 성실도", icon: "📝" },
  { label: "회의 생존력", icon: "💬" },
];

// ===== Title Pools =====
const TITLES: Record<Rarity, string[]> = {
  SSS: [
    "전설의 풀스택 마스터",
    "버그 제로의 신",
    "10x Developer",
    "코드 연금술사",
    "CI/CD 정령왕",
  ],
  SS: [
    "시니어 디버거",
    "타입스크립트 현자",
    "컴포넌트 아키텍트",
    "퍼포먼스 마법사",
    "리뷰 달인",
  ],
  S: [
    "React 숙련자",
    "CSS 아티스트",
    "미들웨어 조련사",
    "API 위스퍼러",
    "테스트 수호자",
  ],
  A: [
    "프론트엔드 전사",
    "주니어 해결사",
    "Git 마스터",
    "야근 서바이버",
    "린터 수호기사",
  ],
  B: [
    "꾸준한 커미터",
    "Stack Overflow 탐험가",
    "console.log 전문가",
    "주석 달기 장인",
    "npm install 마스터",
  ],
  C: [
    "수습 개발자",
    "Hello World 시전자",
    "세미콜론 사냥꾼",
    "탭 vs 스페이스 고민러",
    "컴파일 에러 수집가",
  ],
};

const SUBTITLES: Record<Rarity, string[]> = {
  SSS: ["모든 PR이 한 번에 머지되는 날", "오늘 배포하면 무조건 성공한다", "전설급 코드가 탄생할 운명"],
  SS: ["복잡한 버그도 30분 안에 해결", "코드 리뷰에서 칭찬을 받는 날", "성능 최적화의 영감이 떠오른다"],
  S: ["오늘 짠 코드가 내일 부끄럽지 않을 것", "좋은 라이브러리를 발견할 예감", "테스트 커버리지가 올라가는 날"],
  A: ["적당히 생산적인 하루가 될 것", "작은 리팩토링이 큰 변화를 만든다", "동료에게 도움을 받을 수 있는 날"],
  B: ["평범하지만 안정적인 코딩일", "급한 핫픽스는 없을 것 같다", "점심 메뉴 고르기가 제일 어려운 날"],
  C: ["오늘은 공부하는 날로 삼자", "코드보다 문서 정리가 어울리는 날", "커피를 한 잔 더 마시는 게 좋겠다"],
};

const MESSAGES: Record<Rarity, string[]> = {
  SSS: [
    "오늘 당신의 코드는 예술 작품이 될 것입니다. 자신감을 가지세요!",
    "모든 테스트가 초록불! 오늘은 당신의 날입니다.",
    "전설적인 PR을 올릴 운명입니다. 망설이지 마세요.",
  ],
  SS: [
    "복잡한 문제의 해결책이 번뜩 떠오를 거예요.",
    "오늘 작성한 코드가 팀에 큰 도움이 됩니다.",
    "코드 리뷰에서 '이거 좋은데요?'를 들을 수 있어요.",
  ],
  S: [
    "차분하게 접근하면 좋은 결과가 있을 거예요.",
    "새로운 기술을 시도해보기 좋은 날입니다.",
    "오늘의 커밋이 미래의 나를 구원합니다.",
  ],
  A: [
    "한 걸음씩 꾸준히 나아가는 하루가 될 거예요.",
    "동료와의 페어 프로그래밍이 시너지를 낼 수 있어요.",
    "작은 개선이 모여 큰 변화를 만듭니다.",
  ],
  B: [
    "급하지 않게, 천천히 진행해도 괜찮은 날이에요.",
    "기존 코드를 정리하기 좋은 타이밍입니다.",
    "오늘은 인풋의 날. 좋은 글이나 강의를 찾아보세요.",
  ],
  C: [
    "오늘은 무리하지 마세요. 내일의 나에게 맡기는 것도 용기입니다.",
    "커피 한 잔의 여유가 필요한 날이에요.",
    "가끔은 쉬어가는 것도 생산성의 일부입니다.",
  ],
};

const ADVICES: string[] = [
  "커밋하기 전에 diff를 한 번 더 확인하세요",
  "변수명을 더 직관적으로 바꿔보세요",
  "주석보다는 코드 자체가 설명이 되게 하세요",
  "오늘은 타입을 좀 더 엄격하게 써보세요",
  "30분 이상 막히면 동료에게 물어보세요",
  "테스트 한 개만 더 추가하면 마음이 편해질 거예요",
  "package.json을 정리할 좋은 기회입니다",
  "브랜치 이름을 깔끔하게 지어보세요",
  "README를 업데이트할 때입니다",
  "콘솔 로그를 지우는 걸 잊지 마세요",
  "접근성을 한 번 체크해보세요",
  "크롬 개발자 도구를 열어보세요",
  "git stash를 활용해보세요",
  "오늘은 다크모드를 확인해볼 차례입니다",
  "환경변수가 제대로 설정됐는지 확인하세요",
];

const LUCKY_ITEMS: string[] = [
  "기계식 키보드 ⌨️",
  "듀얼 모니터 🖥️",
  "스탠딩 데스크 🪑",
  "에어팟 맥스 🎧",
  "아메리카노 ☕",
  "맥북 프로 💻",
  "GitHub 잔디 🌿",
  "스티커가 붙은 노트북 🏷️",
  "NeoVim 설정 파일 📄",
  "터미널 테마 🎨",
  "도넛 🍩",
  "에너지 드링크 ⚡",
  "관엽식물 🌱",
  "손목 보호대 🤲",
  "노이즈캔슬링 🔇",
];

// ===== Seed-based Random =====
function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function pick<T>(arr: T[], rand: () => number): T {
  return arr[Math.floor(rand() * arr.length)];
}

function pickN<T>(arr: T[], n: number, rand: () => number): T[] {
  const shuffled = [...arr].sort(() => rand() - 0.5);
  return shuffled.slice(0, n);
}

function pickRarity(rand: () => number): Rarity {
  const roll = rand() * 100;
  let cumulative = 0;
  for (const [rarity, config] of Object.entries(RARITY_CONFIG) as [Rarity, typeof RARITY_CONFIG[Rarity]][]) {
    cumulative += config.probability;
    if (roll < cumulative) return rarity;
  }
  return "C";
}

// ===== Generate Fortune for a given date seed =====
export function generateFortune(dateSeed: string): Fortune {
  // Create numeric seed from date string (e.g. "2026-02-12")
  let hash = 0;
  for (let i = 0; i < dateSeed.length; i++) {
    hash = ((hash << 5) - hash + dateSeed.charCodeAt(i)) | 0;
  }
  const rand = seededRandom(Math.abs(hash) + 1);

  const rarity = pickRarity(rand);

  // Pick 5 random stats
  const chosenStats = pickN(STAT_LABELS, 5, rand);
  const stats: Stat[] = chosenStats.map((s) => {
    const baseMin = rarity === "SSS" ? 75 : rarity === "SS" ? 60 : rarity === "S" ? 45 : rarity === "A" ? 30 : rarity === "B" ? 15 : 5;
    const baseMax = rarity === "SSS" ? 100 : rarity === "SS" ? 95 : rarity === "S" ? 85 : rarity === "A" ? 75 : rarity === "B" ? 60 : 45;
    const value = Math.round(baseMin + rand() * (baseMax - baseMin));
    return { label: s.label, value, icon: s.icon };
  });

  return {
    title: pick(TITLES[rarity], rand),
    subtitle: pick(SUBTITLES[rarity], rand),
    rarity,
    stats,
    message: pick(MESSAGES[rarity], rand),
    advice: pick(ADVICES, rand),
    luckyItem: pick(LUCKY_ITEMS, rand),
  };
}
