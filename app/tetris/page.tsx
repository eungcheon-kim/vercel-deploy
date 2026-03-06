import TetrisGame from "./components/TetrisGame";

export const metadata = {
  title: "테트리스 🧱 | Dev Playground",
  description: "떨어지는 블록을 맞춰 줄을 없애세요! 클래식 퍼즐 게임.",
};

export default function TetrisPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-teal-400 bg-clip-text text-transparent">
              테트리스
            </span>
            <span className="ml-2">🧱</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            떨어지는 블록을 맞춰 줄을 없애세요!
          </p>
        </div>

        <TetrisGame />
      </main>
    </div>
  );
}
