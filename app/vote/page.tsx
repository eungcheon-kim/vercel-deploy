import Link from "next/link";
import PollList from "./components/PollList";

export const metadata = {
  title: "익명투표 - Dev Playground",
  description: "투표를 만들고 익명으로 참여하세요",
};

export default function VotePage() {
  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-20 pb-24">
        {/* Header */}
        <div className="mb-10 flex w-full max-w-3xl flex-col items-center gap-5 text-center">
          <div className="anim-fade-up flex items-center gap-2 rounded-full border border-card-border bg-card-bg/60 px-4 py-1.5 backdrop-blur-sm">
            <span className="text-base">🗳️</span>
            <span className="font-mono text-xs text-zinc-400">익명투표</span>
          </div>

          <h1
            className="anim-fade-up text-3xl font-bold tracking-tight sm:text-4xl"
            style={{ animationDelay: "0.1s" }}
          >
            <span className="bg-linear-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              익명투표
            </span>
          </h1>

          <p
            className="anim-fade-up max-w-md font-mono text-sm text-zinc-500"
            style={{ animationDelay: "0.2s" }}
          >
            투표를 만들고, 공유하고, 결과를 확인하세요
          </p>

          <Link
            href="/vote/create"
            className="anim-fade-up mt-2 inline-flex items-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 font-semibold text-white transition-all hover:bg-violet-500"
            style={{ animationDelay: "0.3s" }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            새 투표 만들기
          </Link>
        </div>

        {/* Poll List */}
        <PollList />
      </main>
    </div>
  );
}
