import Link from "next/link";
import PollVote from "../components/PollVote";

export const metadata = {
  title: "투표 - Dev Playground",
  description: "익명투표에 참여하세요",
};

export default async function VoteDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

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

        {/* Poll */}
        <div className="anim-fade-up w-full flex justify-center" style={{ animationDelay: "0.1s" }}>
          <PollVote pollId={id} />
        </div>
      </main>
    </div>
  );
}
