import MbtiTest from "./components/MbtiTest";

export const metadata = {
  title: "개발자 MBTI | Dev Playground",
  description: "12가지 개발 상황으로 알아보는 나의 개발자 MBTI 성격 유형 테스트",
};

export default function MbtiPage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              개발자 MBTI
            </span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            나는 어떤 유형의 개발자일까?
          </p>
        </div>
        <MbtiTest />
      </main>
    </div>
  );
}
