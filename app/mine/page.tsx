import MineGame from "./components/MineGame";

export const metadata = {
  title: "지뢰찾기 💣 | Dev Playground",
  description: "지뢰를 피해 모든 칸을 열어보세요! 우클릭으로 깃발을 꽂으세요.",
};

export default function MinePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-red-400 via-rose-400 to-pink-400 bg-clip-text text-transparent">
              지뢰찾기
            </span>
            <span className="ml-2">💣</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            지뢰를 피해 모든 칸을 열어보세요!
          </p>
        </div>

        <MineGame />
      </main>
    </div>
  );
}
