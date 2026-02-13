"use client";

import { useState, useEffect, useCallback } from "react";
import { getOrCreateUser } from "../lib/user";

interface ScoreEntry {
  nickname: string;
  score: number;
  uuid: string;
}

interface ScoreBoardProps {
  gameId: string;
  currentScore: number;
  unit?: string;
  show: boolean;
  onClose?: () => void;
}

export default function ScoreBoard({ gameId, currentScore, unit = "점", show, onClose }: ScoreBoardProps) {
  const [entries, setEntries] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [myUUID, setMyUUID] = useState("");

  // Init user
  useEffect(() => {
    const user = getOrCreateUser();
    setMyUUID(user.uuid);
  }, []);

  // Fetch leaderboard
  const fetchScores = useCallback(async () => {
    try {
      const res = await fetch(`/api/scores?game=${gameId}`);
      if (res.ok) {
        const data = await res.json();
        setEntries(data.entries ?? []);
      }
    } catch {
      // silently fail
    }
  }, [gameId]);

  // Fetch on show
  useEffect(() => {
    if (show) {
      fetchScores();
      setSubmitted(false);
      setError("");
    }
  }, [show, fetchScores]);

  const handleSubmit = async () => {
    const user = getOrCreateUser();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/scores", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ game: gameId, uuid: user.uuid, nickname: user.nickname, score: currentScore }),
      });

      if (res.ok) {
        setSubmitted(true);
        await fetchScores();
      } else {
        setError("등록 실패. 다시 시도해주세요.");
      }
    } catch {
      setError("네트워크 오류");
    } finally {
      setLoading(false);
    }
  };

  if (!show) return null;

  const myEntry = entries.find((e) => e.uuid === myUUID);
  const myRank = entries.findIndex((e) => e.uuid === myUUID);

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div
        className="relative mx-4 flex w-full max-w-sm flex-col gap-3 rounded-2xl border border-card-border bg-[#0c0c18]/95 p-5 shadow-2xl shadow-black/60"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        {onClose && (
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-7 w-7 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-white/5 hover:text-zinc-200"
          >
            ✕
          </button>
        )}

        {/* Header */}
        <div className="text-center">
          <p className="font-mono text-lg font-bold text-white">
            {currentScore}<span className="ml-1 text-sm font-normal text-zinc-500">{unit}</span>
          </p>
          {myEntry && myRank >= 0 && (
            <p className="font-mono text-[10px] text-zinc-500">
              내 최고: {myEntry.score}{unit} (#{myRank + 1})
            </p>
          )}
        </div>

        {/* Submit button — no nickname input, uses saved nickname */}
        {!submitted ? (
          <div className="flex flex-col gap-2">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="w-full rounded-lg border border-accent/30 bg-accent/10 py-2.5 font-mono text-xs text-accent-2 transition-all hover:bg-accent/20 disabled:opacity-50"
            >
              {loading ? "등록 중..." : "🏆 랭킹에 등록하기"}
            </button>
            <p className="text-center font-mono text-[9px] text-zinc-600">
              상단 닉네임으로 등록됩니다 · 최고 기록만 저장
            </p>
            {error && <p className="text-center font-mono text-[10px] text-red-400">{error}</p>}
          </div>
        ) : (
          <div className="rounded-lg border border-green-500/20 bg-green-500/10 px-3 py-2 text-center">
            <p className="font-mono text-xs text-green-400">등록 완료!</p>
          </div>
        )}

        {/* Divider */}
        <div className="h-px bg-card-border" />

        {/* Leaderboard */}
        <div>
          <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-wider text-zinc-500">
            {entries.length > 0 ? `Top ${entries.length} 랭킹` : "랭킹"}
          </p>

          {entries.length > 0 ? (
            <div className="flex max-h-52 flex-col gap-0.5 overflow-y-auto scrollbar-none">
              {entries.map((entry, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}`;
                const isMe = entry.uuid === myUUID;
                return (
                  <div
                    key={entry.uuid}
                    className={`flex items-center justify-between rounded-lg px-3 py-1.5 font-mono text-xs ${
                      isMe ? "bg-accent/10 border border-accent/20" : i < 3 ? "bg-white/3" : ""
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="w-6 text-center text-sm">{medal}</span>
                      <span className={isMe ? "text-accent-2 font-bold" : i < 3 ? "text-zinc-200" : "text-zinc-500"}>
                        {entry.nickname}
                        {isMe && <span className="ml-1 text-[9px] text-accent/60">(나)</span>}
                      </span>
                    </div>
                    <span className={`font-bold ${i === 0 ? "text-gold" : i < 3 ? "text-zinc-300" : "text-zinc-500"}`}>
                      {entry.score}{unit}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-center font-mono text-[10px] text-zinc-600">
              아직 기록이 없습니다. 첫 번째로 등록해보세요!
            </p>
          )}
        </div>

        {/* Close */}
        {onClose && (
          <button
            onClick={onClose}
            className="mt-1 w-full rounded-lg border border-card-border bg-white/2 py-2 font-mono text-xs text-zinc-500 transition-all hover:bg-white/5 hover:text-zinc-300"
          >
            닫기
          </button>
        )}
      </div>
    </div>
  );
}
