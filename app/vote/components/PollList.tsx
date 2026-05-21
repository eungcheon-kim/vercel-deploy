"use client";

import { useState, useEffect } from "react";
import PollCard from "./PollCard";

interface Poll {
  id: string;
  title: string;
  description: string;
  optionCount: number;
  multipleChoice: boolean;
  totalVotes: number;
  createdAt: string;
}

export default function PollList() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/vote")
      .then((res) => res.json())
      .then((data) => {
        setPolls(data.polls || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="py-16 text-center">
        <p className="text-4xl mb-4">🗳️</p>
        <p className="text-zinc-400 mb-2">아직 투표가 없습니다</p>
        <p className="font-mono text-xs text-zinc-600">첫 번째 투표를 만들어보세요!</p>
      </div>
    );
  }

  return (
    <div className="grid w-full max-w-3xl gap-4 sm:grid-cols-2">
      {polls.map((poll, i) => (
        <div
          key={poll.id}
          className="anim-fade-up"
          style={{ animationDelay: `${0.35 + i * 0.08}s` }}
        >
          <PollCard poll={poll} />
        </div>
      ))}
    </div>
  );
}
