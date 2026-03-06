import BaseballGame from "./components/BaseballGame";

export const metadata = {
  title: "숫자야구 ⚾ | Dev Playground",
  description: "3자리 숫자를 추리하세요! 스트라이크와 볼 힌트로 정답을 맞혀보세요.",
};

export default function BaseballPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-amber-400 via-yellow-400 to-lime-400 bg-clip-text text-transparent">
              숫자야구
            </span>
            <span className="ml-2">⚾</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            3자리 숫자를 추리하세요! 힌트를 보고 정답을 맞혀보세요.
          </p>
        </div>

        <BaseballGame />
      </main>
    </div>
  );
}
