"use client";

import Link from "next/link";

interface Poll {
  id: string;
  title: string;
  description: string;
  optionCount: number;
  multipleChoice: boolean;
  totalVotes: number;
  createdAt: string;
}

function timeAgo(timestamp: string): string {
  const diff = Date.now() - parseInt(timestamp, 10);
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "방금 전";
  if (minutes < 60) return `${minutes}분 전`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}시간 전`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}일 전`;
  return `${Math.floor(days / 30)}달 전`;
}

export default function PollCard({ poll }: { poll: Poll }) {
  return (
    <Link href={`/vote/${poll.id}`} className="block h-full">
      <div className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-card-border bg-gradient-to-br from-violet-500/10 via-purple-500/5 to-fuchsia-500/10 p-5 backdrop-blur-sm transition-all duration-300 hover:border-violet-500/40 hover:-translate-y-1 group-hover:shadow-[0_0_40px_-10px_rgba(139,92,246,0.3)] cursor-pointer">
        <div className="mb-3 flex items-center gap-2">
          {poll.multipleChoice && (
            <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] text-violet-400">
              복수선택
            </span>
          )}
          <span className="rounded-md border border-white/5 bg-white/3 px-1.5 py-0.5 font-mono text-[10px] text-zinc-600">
            {poll.optionCount}개 선택지
          </span>
        </div>

        <h3 className="mb-2 text-base font-bold text-zinc-100 transition-colors group-hover:text-white line-clamp-2">
          {poll.title}
        </h3>

        {poll.description && (
          <p className="mb-3 flex-1 text-sm leading-relaxed text-zinc-500 line-clamp-2">
            {poll.description}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between pt-3 border-t border-card-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-mono text-[11px] text-zinc-500">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              {poll.totalVotes}명 참여
            </span>
            <span className="font-mono text-[11px] text-zinc-600">
              {timeAgo(poll.createdAt)}
            </span>
          </div>
          <span className="font-mono text-xs text-zinc-600 transition-all group-hover:translate-x-1 group-hover:text-zinc-300">
            →
          </span>
        </div>
      </div>
    </Link>
  );
}
