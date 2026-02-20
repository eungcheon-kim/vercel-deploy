import SudokuGame from "./components/SudokuGame";

export const metadata = {
  title: "스도쿠 | Dev Playground",
  description: "클래식 9x9 스도쿠 퍼즐 - 난이도별 도전!",
};

export default function SudokuPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">
              스도쿠
            </span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            빈 칸을 채워 모든 행·열·박스에 1~9를 완성하세요
          </p>
        </div>

        <SudokuGame />
      </main>
    </div>
  );
}
