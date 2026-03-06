"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface ScoreEntry {
  nickname: string;
  score: number;
  uuid: string;
}

const GAMES = [
  { id: "2048", label: "2048", emoji: "🧩", unit: "점", href: "/game" },
  { id: "flappy", label: "플래피", emoji: "🐤", unit: "점", href: "/flappy" },
  { id: "snake", label: "스네이크", emoji: "🐍", unit: "점", href: "/snake" },
  { id: "suika", label: "수박", emoji: "🍉", unit: "점", href: "/suika" },
  { id: "reaction", label: "반응속도", emoji: "⚡", unit: "ms", href: "/reaction" },
  { id: "mine", label: "지뢰찾기", emoji: "💣", unit: "초", href: "/mine" },
  { id: "memory", label: "메모리 카드", emoji: "🃏", unit: "초", href: "/memory" },
  { id: "colormatch", label: "컬러 매치", emoji: "🎨", unit: "점", href: "/colormatch" },
  { id: "aim", label: "에임 트레이너", emoji: "🎯", unit: "ms", href: "/aim" },
  { id: "maze", label: "미로 탈출", emoji: "🏁", unit: "초", href: "/maze" },
  { id: "sudoku", label: "스도쿠", emoji: "🔢", unit: "초", href: "/sudoku" },
  { id: "typing", label: "타이핑 레이서", emoji: "⌨️", unit: "WPM", href: "/typing" },
  { id: "wordle", label: "워들", emoji: "🟩", unit: "회", href: "/wordle" },
  { id: "breakout", label: "벽돌깨기", emoji: "🧱", unit: "점", href: "/breakout" },
  { id: "baseball", label: "숫자야구", emoji: "⚾", unit: "회", href: "/baseball" },
  { id: "tetris", label: "테트리스", emoji: "🧱", unit: "점", href: "/tetris" },
];

const UUID_KEY = "dev-playground-uuid";

export default function RankingPage() {
  const [rankings, setRankings] = useState<Record<string, ScoreEntry[]>>({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(GAMES[0].id);
  const [myUUID, setMyUUID] = useState<string | null>(null);

  useEffect(() => {
    setMyUUID(localStorage.getItem(UUID_KEY));

    const fetchAll = async () => {
      setLoading(true);
      const results: Record<string, ScoreEntry[]> = {};

      await Promise.all(
        GAMES.map(async (game) => {
          try {
            const res = await fetch(`/api/scores?game=${game.id}`);
            if (res.ok) {
              const data = await res.json();
              results[game.id] = data.entries ?? [];
            }
          } catch {
            results[game.id] = [];
          }
        })
      );

      setRankings(results);
      setLoading(false);
    };

    fetchAll();
  }, []);

  const activeGame = GAMES.find((g) => g.id === activeTab)!;
  const entries = rankings[activeTab] ?? [];

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-4 pt-16 pb-24">
        {/* Title */}
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            <span className="bg-linear-to-r from-yellow-400 via-amber-400 to-orange-400 bg-clip-text text-transparent">
              랭킹보드
            </span>
            <span className="ml-2">🏆</span>
          </h2>
          <p className="font-mono text-xs text-zinc-500">
            각 게임별 Top 10 랭킹을 확인하세요!
          </p>
        </div>

        {/* Game tabs — grid, always fully visible */}
        <div className="mb-5 grid w-full max-w-2xl grid-cols-4 gap-1.5 sm:grid-cols-7">
          {GAMES.map((game) => {
            const isActive = activeTab === game.id;
            const count = rankings[game.id]?.length ?? 0;
            return (
              <button
                key={game.id}
                onClick={() => setActiveTab(game.id)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-2 py-2.5 font-mono text-[10px] transition-all duration-150 ${
                  isActive
                    ? "border-accent/30 bg-accent/10 text-accent-2"
                    : "border-card-border bg-card-bg/60 text-zinc-500 hover:border-zinc-600 hover:text-zinc-200"
                }`}
              >
                <span className="text-base">{game.emoji}</span>
                <span className="leading-none">{game.label}</span>
                {count > 0 && (
                  <span className={`rounded px-1 py-0.5 text-[8px] leading-none ${isActive ? "bg-accent/20 text-accent-2" : "bg-white/5 text-zinc-600"}`}>
                    {count}명
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Ranking table */}
        <div className="w-full max-w-lg rounded-2xl border border-card-border bg-card-bg/80 p-4 backdrop-blur-sm">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{activeGame.emoji}</span>
              <div>
                <p className="font-mono text-sm font-bold text-zinc-200">{activeGame.label}</p>
                <p className="font-mono text-[10px] text-zinc-600">
                  {entries.length > 0 ? `${entries.length}명 참가` : "아직 기록 없음"}
                </p>
              </div>
            </div>
            <Link
              href={activeGame.href}
              className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-1.5 font-mono text-[10px] text-accent-2 transition-all hover:bg-accent/10"
            >
              플레이 →
            </Link>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-accent" />
            </div>
          ) : entries.length > 0 ? (
            <div className="flex flex-col gap-1">
              {/* Column labels */}
              <div className="flex items-center justify-between px-3 py-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600">
                <span>순위</span>
                <span>점수</span>
              </div>

              {entries.map((entry, i) => {
                const medal = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : null;
                const isMe = entry.uuid === myUUID;
                return (
                  <div
                    key={entry.uuid}
                    className={`flex items-center justify-between rounded-xl px-3 py-2.5 font-mono text-xs transition-colors ${
                      isMe ? "bg-accent/10 border border-accent/20" : i < 3 ? "bg-white/3" : "hover:bg-white/2"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {medal ? (
                        <span className="w-7 text-center text-base">{medal}</span>
                      ) : (
                        <span className="w-7 text-center text-zinc-600">{i + 1}</span>
                      )}
                      <span className={isMe ? "font-bold text-accent-2" : i < 3 ? "font-bold text-zinc-100" : "text-zinc-400"}>
                        {entry.nickname}
                        {isMe && <span className="ml-1 text-[9px] text-accent/60">(나)</span>}
                      </span>
                    </div>
                    <span className={`font-bold ${i === 0 ? "text-gold" : i < 3 ? "text-zinc-200" : "text-zinc-500"}`}>
                      {entry.score}
                      <span className="ml-0.5 text-[10px] font-normal text-zinc-600">{activeGame.unit}</span>
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <span className="text-4xl opacity-30">🏆</span>
              <p className="font-mono text-xs text-zinc-600">아직 기록이 없습니다</p>
              <Link
                href={activeGame.href}
                className="rounded-lg border border-accent/30 bg-accent/10 px-4 py-2 font-mono text-xs text-accent-2 transition-all hover:bg-accent/20"
              >
                첫 번째 기록 남기러 가기
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
