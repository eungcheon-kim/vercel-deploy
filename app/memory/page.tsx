"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ScoreBoard from "../components/ScoreBoard";

const EMOJIS = ["🐶", "🐱", "🐼", "🦊", "🐸", "🐵", "🐰", "🦁"];

interface Card {
  id: number;
  emoji: string;
  flipped: boolean;
  matched: boolean;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function createDeck(): Card[] {
  const pairs = [...EMOJIS, ...EMOJIS];
  return shuffle(pairs).map((emoji, i) => ({
    id: i,
    emoji,
    flipped: false,
    matched: false,
  }));
}

export default function MemoryPage() {
  const [cards, setCards] = useState<Card[]>(createDeck);
  const [selected, setSelected] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [started, setStarted] = useState(false);
  const [finished, setFinished] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [locked, setLocked] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("memory-best");
    if (saved) setBestTime(Number(saved));
  }, []);

  useEffect(() => {
    if (started && !finished) {
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        setElapsed(Math.floor((Date.now() - startTimeRef.current) / 1000));
      }, 200);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [started, finished]);

  const handleFinish = useCallback(
    (finalElapsed: number) => {
      setFinished(true);
      if (timerRef.current) clearInterval(timerRef.current);
      if (bestTime === 0 || finalElapsed < bestTime) {
        setBestTime(finalElapsed);
        localStorage.setItem("memory-best", String(finalElapsed));
      }
      setShowRanking(true);
    },
    [bestTime],
  );

  const handleCardClick = useCallback(
    (id: number) => {
      if (locked || finished) return;
      const card = cards[id];
      if (card.flipped || card.matched) return;

      if (!started) setStarted(true);

      const next = cards.map((c) => (c.id === id ? { ...c, flipped: true } : c));
      setCards(next);

      const newSelected = [...selected, id];
      setSelected(newSelected);

      if (newSelected.length === 2) {
        setMoves((m) => m + 1);
        const [firstId, secondId] = newSelected;

        if (next[firstId].emoji === next[secondId].emoji) {
          const matched = next.map((c) =>
            c.id === firstId || c.id === secondId ? { ...c, matched: true } : c,
          );
          setCards(matched);
          setSelected([]);

          const allMatched = matched.every((c) => c.matched);
          if (allMatched) {
            const finalTime = Math.floor((Date.now() - startTimeRef.current) / 1000);
            setElapsed(finalTime);
            handleFinish(finalTime);
          }
        } else {
          setLocked(true);
          setTimeout(() => {
            setCards((prev) =>
              prev.map((c) =>
                c.id === firstId || c.id === secondId ? { ...c, flipped: false } : c,
              ),
            );
            setSelected([]);
            setLocked(false);
          }, 800);
        }
      }
    },
    [cards, selected, locked, finished, started, handleFinish],
  );

  const restart = () => {
    setCards(createDeck());
    setSelected([]);
    setMoves(0);
    setStarted(false);
    setFinished(false);
    setElapsed(0);
    setLocked(false);
    setShowRanking(false);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
              메모리 카드
            </span>
            <span className="ml-2">🃏</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            짝이 맞는 카드를 찾아보세요!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              시도
            </span>
            <span className="font-mono text-lg font-bold text-white">{moves}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              시간
            </span>
            <span className="font-mono text-lg font-bold text-white">{elapsed}초</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Best
            </span>
            <span className="font-mono text-lg font-bold text-gold">
              {bestTime ? `${bestTime}초` : "-"}
            </span>
          </div>
        </div>

        {/* Card Grid */}
        <div className="mb-6 grid w-full max-w-xs grid-cols-4 gap-2.5">
          {cards.map((card) => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              className="perspective-500 aspect-square"
              style={{ perspective: "500px" }}
            >
              <div
                className={`relative h-full w-full transition-transform duration-500 ${
                  card.flipped || card.matched ? "transform-[rotateY(180deg)]" : ""
                }`}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front (face-down) */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border text-2xl transition-all ${
                    card.flipped || card.matched
                      ? "pointer-events-none"
                      : "cursor-pointer border-card-border bg-card-bg hover:border-pink-500/40 hover:bg-pink-500/5"
                  }`}
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-zinc-600">?</span>
                </div>

                {/* Back (face-up) */}
                <div
                  className={`absolute inset-0 flex items-center justify-center rounded-xl border text-3xl ${
                    card.matched
                      ? "border-pink-500/50 bg-pink-500/10 shadow-[0_0_20px_-5px_rgba(236,72,153,0.4)]"
                      : "border-card-border bg-card-bg"
                  }`}
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  {card.emoji}
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Restart button */}
        <button
          onClick={restart}
          className="rounded-xl border border-card-border bg-card-bg px-6 py-2.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
        >
          🔄 다시 시작
        </button>

        {finished && (
          <div className="mt-6 flex flex-col items-center gap-1 text-center">
            <span className="text-3xl">🎉</span>
            <p className="font-mono text-sm font-bold text-pink-400">
              {moves}번 만에 {elapsed}초로 완성!
            </p>
          </div>
        )}

        <ScoreBoard
          gameId="memory"
          currentScore={elapsed}
          unit="초"
          show={showRanking}
          onClose={() => {
            setShowRanking(false);
            restart();
          }}
        />
      </main>
    </div>
  );
}
