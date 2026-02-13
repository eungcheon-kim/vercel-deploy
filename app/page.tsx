import Link from "next/link";

const APPS = [
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

export default function Home() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      {/* Background orbs */}
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
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Dev Playground
            </span>
          </h1>

          <p
            className="anim-fade-up max-w-md font-mono text-sm leading-relaxed text-zinc-500"
            style={{ animationDelay: "0.2s" }}
          >
            프론트엔드 개발자를 위한 미니 프로젝트 모음
            <br />
            재밌는 거 하나 골라보세요 👇
          </p>
        </div>

        {/* App Cards */}
        <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app, i) => {
            const inner = (
              <div
                className={`group relative flex h-full flex-col overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br ${app.gradient} p-6 backdrop-blur-sm transition-all duration-300 ${app.border} ${app.glow} ${app.href ? "cursor-pointer hover:-translate-y-1" : "opacity-50 cursor-default"}`}
              >
                {/* Emoji */}
                <span className="mb-4 text-4xl transition-transform duration-300 group-hover:scale-110">
                  {app.emoji}
                </span>

                {/* Title */}
                <h2 className="mb-1.5 text-lg font-bold text-zinc-100 transition-colors group-hover:text-white">
                  {app.title}
                </h2>

                {/* Description */}
                <p className="mb-4 flex-1 text-sm leading-relaxed text-zinc-500 transition-colors group-hover:text-zinc-400">
                  {app.description}
                </p>

                {/* Tag + Arrow */}
                <div className="flex items-center justify-between">
                  <span className="rounded-md border border-white/5 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-zinc-600">
                    {app.tag}
                  </span>
                  {app.href && (
                    <span className="font-mono text-xs text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-zinc-300">
                      →
                    </span>
                  )}
                </div>
              </div>
            );

            return (
              <div
                key={app.title}
                className="anim-fade-up"
                style={{ animationDelay: `${0.3 + i * 0.1}s` }}
              >
                {app.href ? (
                  <Link href={app.href} className="block h-full">
                    {inner}
                  </Link>
                ) : (
                  inner
                )}
              </div>
            );
          })}
        </div>

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
