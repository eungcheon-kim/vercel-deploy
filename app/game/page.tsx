import Board from "./components/Board";

export const metadata = {
  title: "2048 Game | Dev Playground",
  description: "2048 퍼즐 게임 - 타일을 합쳐서 2048을 만들어보세요!",
};

export default function GamePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-10">
        {/* Title */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              2048
            </span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            같은 숫자를 합쳐서 2048을 만들어보세요
          </p>
        </div>

        {/* Game Board */}
        <Board />

        {/* Footer */}
        <footer className="mt-10 flex flex-col items-center gap-2">
          <div className="flex items-center gap-3 font-mono text-[10px] text-zinc-700">
            <span>Built with Next.js</span>
            <span>·</span>
            <span>Deployed on Vercel</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
