import FlappyGame from "./components/FlappyGame";

export const metadata = {
  title: "플래피 버드 🐤 | Dev Playground",
  description: "클릭/스페이스로 점프! 파이프를 피해서 최고 점수에 도전하세요.",
};

export default function FlappyPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              플래피 버드
            </span>
            <span className="ml-2">🐤</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            파이프를 피해서 최고 점수에 도전!
          </p>
        </div>

        <FlappyGame />
      </main>
    </div>
  );
}
