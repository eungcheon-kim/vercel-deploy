import BreakoutGame from "./components/BreakoutGame";

export const metadata = {
  title: "벽돌깨기 🧱 | Dev Playground",
  description: "공을 튕겨서 벽돌을 모두 깨세요! 클래식 아케이드 게임.",
};

export default function BreakoutPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-orange-400 via-red-400 to-pink-400 bg-clip-text text-transparent">
              벽돌깨기
            </span>
            <span className="ml-2">🧱</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            공을 튕겨서 벽돌을 모두 깨세요!
          </p>
        </div>

        <BreakoutGame />
      </main>
    </div>
  );
}
