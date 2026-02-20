import Link from "next/link";

interface AppCard {
  href: string;
  emoji: string;
  title: string;
  description: string;
  tag: string;
  gradient: string;
  border: string;
  glow: string;
}

const GAMES: AppCard[] = [
  {
    href: "/fortune",
    emoji: "🎰",
    title: "개발자 운세",
    description: "수정구슬을 깨뜨려 오늘의 운세를 확인하세요. SSS 등급을 노려봅시다!",
    tag: "가챠 · RPG 카드",
    gradient: "from-violet-500/20 via-purple-500/10 to-fuchsia-500/20",
    border: "hover:border-violet-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)]",
  },
  {
    href: "/game",
    emoji: "🧩",
    title: "2048",
    description: "타일을 밀어서 합치고, 2048을 만들어보세요. 최고 점수에 도전!",
    tag: "퍼즐 · 하이스코어",
    gradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    border: "hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(251,191,36,0.3)]",
  },
  {
    href: "/suika",
    emoji: "🍉",
    title: "수박게임",
    description: "같은 과일을 합쳐서 수박을 만들어보세요! 물리엔진 기반 합치기 게임.",
    tag: "물리 · 합치기",
    gradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
    border: "hover:border-green-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]",
  },
  {
    href: "/reaction",
    emoji: "⚡",
    title: "반응속도 테스트",
    description: "초록불이 켜지면 최대한 빨리 클릭! 당신의 반응속도는 몇 ms?",
    tag: "반응 · 측정",
    gradient: "from-cyan-500/20 via-sky-500/10 to-blue-500/20",
    border: "hover:border-cyan-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]",
  },
  {
    href: "/flappy",
    emoji: "🐤",
    title: "플래피 버드",
    description: "클릭으로 점프하며 파이프를 피하세요! 간단하지만 중독성 있는 게임.",
    tag: "아케이드 · 원터치",
    gradient: "from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    border: "hover:border-yellow-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]",
  },
  {
    href: "/snake",
    emoji: "🐍",
    title: "스네이크",
    description: "먹이를 먹고 점점 커지는 뱀! 벽과 자기 몸을 피하세요.",
    tag: "클래식 · 방향키",
    gradient: "from-emerald-500/20 via-green-500/10 to-lime-500/20",
    border: "hover:border-emerald-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]",
  },
  {
    href: "/mine",
    emoji: "💣",
    title: "지뢰찾기",
    description: "지뢰를 피해 모든 칸을 열어보세요! 우클릭으로 깃발을 꽂으세요.",
    tag: "전략 · 퍼즐",
    gradient: "from-red-500/20 via-rose-500/10 to-pink-500/20",
    border: "hover:border-red-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]",
  },
  {
    href: "/memory",
    emoji: "🃏",
    title: "메모리 카드",
    description: "짝이 맞는 카드를 찾아보세요! 최소 시간에 도전!",
    tag: "퍼즐 · 기억력",
    gradient: "from-pink-500/20 via-rose-500/10 to-fuchsia-500/20",
    border: "hover:border-pink-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]",
  },
  {
    href: "/colormatch",
    emoji: "🎨",
    title: "컬러 매치",
    description: "목표 색상을 RGB 슬라이더로 맞춰보세요! 5라운드 평균 점수 도전!",
    tag: "감각 · 색상",
    gradient: "from-yellow-500/20 via-amber-500/10 to-orange-500/20",
    border: "hover:border-yellow-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(234,179,8,0.3)]",
  },
  {
    href: "/aim",
    emoji: "🎯",
    title: "에임 트레이너",
    description: "30개 타겟을 최대한 빨리 클릭! 평균 반응시간을 측정하세요.",
    tag: "반응 · 에임",
    gradient: "from-red-500/20 via-orange-500/10 to-amber-500/20",
    border: "hover:border-red-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]",
  },
  {
    href: "/maze",
    emoji: "🏁",
    title: "미로 탈출",
    description: "랜덤 생성 미로를 탈출하세요! 난이도 선택 가능, 최단 시간 도전.",
    tag: "퍼즐 · 탈출",
    gradient: "from-purple-500/20 via-pink-500/10 to-fuchsia-500/20",
    border: "hover:border-purple-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(168,85,247,0.3)]",
  },
  {
    href: "/typing",
    emoji: "⌨️",
    title: "타이핑 레이서",
    description: "영문 문장을 빠르고 정확하게 타이핑! WPM으로 실력을 측정하세요.",
    tag: "타이핑 · 속도",
    gradient: "from-cyan-500/20 via-sky-500/10 to-blue-500/20",
    border: "hover:border-cyan-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(6,182,212,0.3)]",
  },
  {
    href: "/wordle",
    emoji: "🟩",
    title: "워들",
    description: "5글자 영단어를 6번 안에 맞춰보세요! 클래식 단어 추리 게임.",
    tag: "단어 · 추리",
    gradient: "from-green-500/20 via-emerald-500/10 to-teal-500/20",
    border: "hover:border-green-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(34,197,94,0.3)]",
  },
  {
    href: "/sudoku",
    emoji: "🔢",
    title: "스도쿠",
    description: "클래식 9x9 스도쿠 퍼즐! 난이도를 선택하고 빈 칸을 채워보세요.",
    tag: "퍼즐 · 논리",
    gradient: "from-indigo-500/20 via-violet-500/10 to-purple-500/20",
    border: "hover:border-indigo-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)]",
  },
  {
    href: "/ranking",
    emoji: "🏆",
    title: "랭킹보드",
    description: "각 게임별 Top 10 랭킹을 확인하세요! 누가 제일 잘할까?",
    tag: "스코어 · 순위",
    gradient: "from-amber-500/20 via-yellow-500/10 to-orange-500/20",
    border: "hover:border-amber-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(245,158,11,0.3)]",
  },
];

const TOOLS: AppCard[] = [
  {
    href: "/json",
    emoji: "📋",
    title: "JSON 포매터",
    description: "JSON을 예쁘게 정렬하고, 트리뷰로 탐색하고, 압축하세요.",
    tag: "도구 · 포맷",
    gradient: "from-sky-500/20 via-blue-500/10 to-indigo-500/20",
    border: "hover:border-sky-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(14,165,233,0.3)]",
  },
  {
    href: "/regex",
    emoji: "🔍",
    title: "정규식 테스터",
    description: "정규식을 입력하면 실시간으로 매칭 결과를 하이라이트합니다.",
    tag: "도구 · 정규식",
    gradient: "from-orange-500/20 via-amber-500/10 to-yellow-500/20",
    border: "hover:border-orange-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(249,115,22,0.3)]",
  },
  {
    href: "/color",
    emoji: "🎨",
    title: "색상 팔레트",
    description: "색상 하나로 보색, 유사색, 삼각 배색 등 팔레트를 자동 생성.",
    tag: "디자인 · 색상",
    gradient: "from-pink-500/20 via-rose-500/10 to-red-500/20",
    border: "hover:border-pink-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]",
  },
  {
    href: "/lorem",
    emoji: "📝",
    title: "더미 텍스트",
    description: "한국어, 영어, 개발자 모드의 Lorem Ipsum 생성기.",
    tag: "도구 · 텍스트",
    gradient: "from-teal-500/20 via-cyan-500/10 to-sky-500/20",
    border: "hover:border-teal-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(20,184,166,0.3)]",
  },
  {
    href: "/pomodoro",
    emoji: "🍅",
    title: "뽀모도로 타이머",
    description: "25분 집중, 5분 휴식. 생산성을 높이는 타이머.",
    tag: "생산성 · 타이머",
    gradient: "from-red-500/20 via-orange-500/10 to-amber-500/20",
    border: "hover:border-red-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(239,68,68,0.3)]",
  },
  {
    href: "/ascii",
    emoji: "🔤",
    title: "ASCII 아트",
    description: "텍스트를 멋진 ASCII 아트로 변환! 다양한 폰트 지원.",
    tag: "재미 · 변환",
    gradient: "from-lime-500/20 via-green-500/10 to-emerald-500/20",
    border: "hover:border-lime-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(132,204,22,0.3)]",
  },
  {
    href: "/quiz",
    emoji: "🧠",
    title: "코딩 퀴즈",
    description: "JS/TS 출력 결과를 맞춰보세요! 호이스팅, 클로저, Promise 등.",
    tag: "학습 · 퀴즈",
    gradient: "from-blue-500/20 via-indigo-500/10 to-violet-500/20",
    border: "hover:border-blue-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]",
  },
  {
    href: "/meme",
    emoji: "😂",
    title: "개발자 한마디",
    description: "개발자 밈, 명언, 유머를 랜덤으로 만나보세요.",
    tag: "재미 · 밈",
    gradient: "from-pink-500/20 via-fuchsia-500/10 to-purple-500/20",
    border: "hover:border-pink-500/40",
    glow: "group-hover:shadow-[0_0_40px_-10px_rgba(236,72,153,0.3)]",
  },
];

function AppCardGrid({ apps, baseDelay = 0 }: { apps: AppCard[]; baseDelay?: number }) {
  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {apps.map((app, i) => (
        <div
          key={app.title}
          className="anim-fade-up"
          style={{ animationDelay: `${baseDelay + i * 0.08}s` }}
        >
          <Link href={app.href} className="block h-full">
            <div
              className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br ${app.gradient} p-6 backdrop-blur-sm transition-all duration-300 ${app.border} ${app.glow} cursor-pointer hover:-translate-y-1`}
            >
              <span className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                {app.emoji}
              </span>
              <h3 className="mb-1.5 text-lg font-bold text-zinc-100 transition-colors group-hover:text-white">
                {app.title}
              </h3>
              <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                {app.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="rounded-md border border-white/5 bg-white/3 px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                  {app.tag}
                </span>
                <span className="font-mono text-xs text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-zinc-300">
                  →
                </span>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-20 pb-16">
        {/* Hero */}
        <div className="mb-16 flex flex-col items-center gap-5 text-center">
          <div className="anim-fade-up flex items-center gap-2 rounded-full border border-card-border bg-card-bg/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <span className="font-mono text-xs text-zinc-400">
              Next.js + Vercel 배포 플레이그라운드
            </span>
          </div>

          <h1
            className="anim-fade-up text-4xl font-bold tracking-tight sm:text-6xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Dev Playground
            </span>
          </h1>

          <p
            className="anim-fade-up max-w-md font-mono text-sm leading-relaxed text-zinc-500"
            style={{ animationDelay: "0.2s" }}
          >
            프론트엔드 개발자를 위한 미니 프로젝트 모음
          </p>
        </div>

        {/* Games Section */}
        <div className="mb-6 flex w-full max-w-3xl items-center gap-3 anim-fade-up" style={{ animationDelay: "0.3s" }}>
          <span className="text-2xl">🎮</span>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">게임</h2>
            <p className="font-mono text-[11px] text-zinc-600">미니게임 모음 · 랭킹 경쟁</p>
          </div>
          <div className="ml-2 rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent-2">
            {GAMES.length}
          </div>
        </div>
        <AppCardGrid apps={GAMES} baseDelay={0.35} />

        {/* Divider */}
        <div className="my-12 flex w-full max-w-3xl items-center gap-4">
          <div className="h-px flex-1 bg-card-border" />
          <span className="font-mono text-[10px] text-zinc-600">· · ·</span>
          <div className="h-px flex-1 bg-card-border" />
        </div>

        {/* Tools Section */}
        <div className="mb-6 flex w-full max-w-3xl items-center gap-3 anim-fade-up" style={{ animationDelay: "0.4s" }}>
          <span className="text-2xl">🛠</span>
          <div>
            <h2 className="text-lg font-bold text-zinc-100">도구 & 유틸</h2>
            <p className="font-mono text-[11px] text-zinc-600">개발에 유용한 도구 모음</p>
          </div>
          <div className="ml-2 rounded-full bg-accent/10 px-2.5 py-0.5 font-mono text-[10px] text-accent-2">
            {TOOLS.length}
          </div>
        </div>
        <AppCardGrid apps={TOOLS} baseDelay={0.45} />

        {/* Footer */}
        <footer
          className="anim-fade-up mt-20 flex flex-col items-center gap-2"
          style={{ animationDelay: "1s" }}
        >
          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-700">
            <span>Built with Next.js</span>
            <span>·</span>
            <span>Deployed on Vercel</span>
            <span>·</span>
            <span>Tailwind CSS</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
