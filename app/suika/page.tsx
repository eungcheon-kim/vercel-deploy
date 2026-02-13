import SuikaGame from "./components/SuikaGame";

export const metadata = {
  title: "수박게임 🍉 | Dev Playground",
  description: "같은 이모지를 합쳐서 레벨업! 개발자 버전 수박게임",
};

export default function SuikaPage() {
  return (
    <div className="noise grid-bg relative h-screen overflow-hidden">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex h-screen flex-col items-center px-4 pt-14 pb-20">
        {/* Title */}
        <div className="mb-3 flex flex-col items-center gap-1 text-center">
          <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent">
              수박게임
            </span>
            <span className="ml-2">🍉</span>
          </h2>
          <p className="font-mono text-[10px] text-zinc-500">
            같은 과일을 합쳐서 수박을 만들어보세요!
          </p>
        </div>

        {/* Game — fills remaining space */}
        <div className="flex min-h-0 w-full flex-1 justify-center">
          <SuikaGame />
        </div>
      </main>
    </div>
  );
}
