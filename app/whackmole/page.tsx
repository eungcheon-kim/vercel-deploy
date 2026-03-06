import WhackMoleGame from "./components/WhackMoleGame";

export const metadata = {
  title: "두더지 잡기 🔨 | Dev Playground",
  description: "올라오는 두더지를 빠르게 클릭! 30초 안에 최고 점수를 노려보세요.",
};

export default function WhackMolePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 bg-clip-text text-transparent">
              두더지 잡기
            </span>
            <span className="ml-2">🔨</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            올라오는 두더지를 빠르게 클릭하세요! 30초 타임어택!
          </p>
        </div>

        <WhackMoleGame />
      </main>
    </div>
  );
}
