import GachaMachine from "./components/GachaMachine";

export default function Home() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center justify-center px-6 py-16">
        {/* Header */}
        <div className="mb-12 flex flex-col items-center gap-4 text-center">
          <div className="anim-fade-up flex items-center gap-2 rounded-full border border-card-border bg-card-bg/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-violet-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-violet-500" />
            </span>
            <span className="font-mono text-xs text-zinc-400">
              오늘의 운세가 준비되었습니다
            </span>
          </div>

          <h1
            className="anim-fade-up text-4xl font-bold tracking-tight sm:text-5xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              개발자 운세
            </span>
            <span className="ml-2">🎰</span>
          </h1>

          <p
            className="anim-fade-up max-w-sm font-mono text-sm leading-relaxed text-zinc-500"
            style={{ animationDelay: "0.2s" }}
          >
            매일 달라지는 당신의 개발 운세를 확인하세요
            <br />
            오늘은 어떤 등급의 개발자일까요?
          </p>
        </div>

        {/* Gacha Machine */}
        <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
          <GachaMachine />
        </div>

        {/* Footer */}
        <footer
          className="anim-fade-up mt-16 flex flex-col items-center gap-2"
          style={{ animationDelay: "0.5s" }}
        >
          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-700">
            <span>Built with Next.js</span>
            <span>·</span>
            <span>Deployed on Vercel</span>
            <span>·</span>
            <span>Tailwind CSS</span>
          </div>
          <p className="font-mono text-[10px] text-zinc-800">
            SSS 등급 확률 3% · SS 7% · S 15% · A 25% · B 30% · C 20%
          </p>
        </footer>
      </main>
    </div>
  );
}
