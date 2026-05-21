"use client";

import { useState, useEffect, useCallback } from "react";
import { getUUID } from "@/app/lib/user";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface PollData {
  id: string;
  title: string;
  description: string;
  options: string[];
  multipleChoice: boolean;
  totalVotes: number;
  counts: number[];
  myVote: number[] | null;
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

export default function PollVote({ pollId }: { pollId: string }) {
  const [poll, setPoll] = useState<PollData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchPoll = useCallback(async () => {
    const uuid = getUUID();
    const res = await fetch(`/api/vote/${pollId}?uuid=${uuid}`);
    if (!res.ok) {
      setError("투표를 찾을 수 없습니다");
      setLoading(false);
      return;
    }
    const data = await res.json();
    setPoll(data);
    if (data.myVote) {
      setSelected(data.myVote);
      setHasVoted(true);
    }
    setLoading(false);
  }, [pollId]);

  useEffect(() => {
    fetchPoll();
  }, [fetchPoll]);

  const toggleOption = (index: number) => {
    if (hasVoted) return;
    if (!poll) return;

    if (poll.multipleChoice) {
      setSelected((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelected([index]);
    }
  };

  const submitVote = async () => {
    if (selected.length === 0 || !poll) return;
    setSubmitting(true);
    setError("");

    try {
      const uuid = getUUID();
      const res = await fetch(`/api/vote/${pollId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uuid, selected }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "오류가 발생했습니다");
        if (res.status === 409) {
          setHasVoted(true);
          fetchPoll();
        }
        return;
      }
      setHasVoted(true);
      fetchPoll();
    } catch {
      setError("네트워크 오류");
    } finally {
      setSubmitting(false);
    }
  };

  const copyUrl = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-violet-500 border-t-transparent" />
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div className="py-20 text-center">
        <p className="text-zinc-400">{error}</p>
      </div>
    );
  }

  if (!poll) return null;

  const maxCount = Math.max(...poll.counts, 1);

  return (
    <div className="w-full max-w-lg space-y-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          {poll.multipleChoice && (
            <span className="rounded-md border border-violet-500/20 bg-violet-500/10 px-1.5 py-0.5 font-mono text-[10px] text-violet-400">
              복수선택
            </span>
          )}
          <span className="font-mono text-[11px] text-zinc-600">
            {poll.totalVotes}명 참여
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white">{poll.title}</h1>
        {poll.description && (
          <div className="prose prose-sm prose-invert max-w-none text-zinc-400 [&_a]:text-violet-400 [&_a]:underline [&_a:hover]:text-violet-300 [&_p]:my-1">
            <Markdown remarkPlugins={[remarkGfm]}>{poll.description}</Markdown>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="space-y-2">
        {poll.options.map((option, i) => {
          const isSelected = selected.includes(i);
          const percentage = poll.totalVotes > 0 ? Math.round((poll.counts[i] / poll.totalVotes) * 100) : 0;
          const barWidth = poll.totalVotes > 0 ? (poll.counts[i] / maxCount) * 100 : 0;

          return (
            <button
              key={i}
              onClick={() => toggleOption(i)}
              disabled={hasVoted}
              className={`relative w-full overflow-hidden rounded-xl border px-4 py-3.5 text-left transition-all ${
                hasVoted
                  ? "border-card-border bg-card-bg/60 cursor-default"
                  : isSelected
                    ? "border-violet-500/50 bg-violet-500/10"
                    : "border-card-border bg-card-bg/60 hover:border-violet-500/30 hover:bg-violet-500/5"
              }`}
            >
              {/* Result bar (shown after voting) */}
              {hasVoted && (
                <div
                  className="absolute inset-y-0 left-0 bg-violet-500/10 transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />
              )}

              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Checkbox/Radio indicator */}
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-${poll.multipleChoice ? "md" : "full"} border transition-all ${
                      isSelected
                        ? "border-violet-500 bg-violet-500"
                        : "border-zinc-600"
                    }`}
                  >
                    {isSelected && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </div>
                  <span className={`text-sm ${isSelected ? "text-white font-medium" : "text-zinc-300"}`}>
                    {option}
                  </span>
                </div>

                {/* Result count (shown after voting) */}
                {hasVoted && (
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-zinc-400">
                      {poll.counts[i]}표
                    </span>
                    <span className="font-mono text-xs font-semibold text-violet-400">
                      {percentage}%
                    </span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <p className="rounded-lg bg-red-500/10 px-3 py-2 text-center font-mono text-xs text-red-400">
          {error}
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        {!hasVoted ? (
          <button
            onClick={submitVote}
            disabled={selected.length === 0 || submitting}
            className="flex-1 rounded-xl bg-violet-600 py-3 font-semibold text-white transition-all hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? "투표 중..." : "투표하기"}
          </button>
        ) : (
          <div className="flex-1 rounded-xl border border-green-500/30 bg-green-500/10 py-3 text-center font-mono text-sm text-green-400">
            투표 완료
          </div>
        )}

        <button
          onClick={copyUrl}
          className="flex items-center gap-1.5 rounded-xl border border-card-border bg-card-bg/80 px-4 py-3 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
        >
          {copied ? (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              복사됨
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
              </svg>
              공유
            </>
          )}
        </button>
      </div>
    </div>
  );
}
