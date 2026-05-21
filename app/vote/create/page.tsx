import Link from "next/link";
import PollForm from "../components/PollForm";

export const metadata = {
  title: "새 투표 만들기 - Dev Playground",
  description: "익명투표를 만들어 공유하세요",
};

export default function CreateVotePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-20 pb-24">
        {/* Back link */}
        <div className="mb-8 w-full max-w-lg">
          <Link
            href="/vote"
            className="inline-flex items-center gap-1.5 font-mono text-xs text-zinc-500 transition-colors hover:text-zinc-200"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
            투표 목록으로
          </Link>
        </div>

        {/* Header */}
        <div className="mb-8 text-center">
          <h1
            className="anim-fade-up text-2xl font-bold tracking-tight sm:text-3xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              새 투표 만들기
            </span>
          </h1>
          <p
            className="anim-fade-up mt-2 font-mono text-xs text-zinc-500"
            style={{ animationDelay: "0.2s" }}
          >
            단건 또는 복수 선택 투표를 만들 수 있어요
          </p>
        </div>

        {/* Form */}
        <div className="anim-fade-up" style={{ animationDelay: "0.3s" }}>
          <PollForm />
        </div>
      </main>
    </div>
  );
}
