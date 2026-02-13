import SnakeGame from "./components/SnakeGame";

export const metadata = {
  title: "스네이크 🐍 | Dev Playground",
  description: "방향키로 뱀을 조종하고 먹이를 먹어서 최고 점수에 도전!",
};

export default function SnakePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-lime-400 bg-clip-text text-transparent">
              스네이크
            </span>
            <span className="ml-2">🐍</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            먹이를 먹고 점점 커지는 뱀! 벽과 자기 몸을 피하세요.
          </p>
        </div>

        <SnakeGame />
      </main>
    </div>
  );
}
