import SuikaGame from "./components/SuikaGame";

export const metadata = {
  title: "수박게임 🍉 | Dev Playground",
  description: "같은 이모지를 합쳐서 레벨업! 개발자 버전 수박게임",
};

export default function SuikaPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-10">
        {/* Title */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              수박게임
            </span>
            <span className="ml-2">🍉</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            같은 과일을 합쳐서 🍉 수박을 만들어보세요!
          </p>
        </div>

        {/* Game */}
        <SuikaGame />
      </main>
    </div>
  );
}
