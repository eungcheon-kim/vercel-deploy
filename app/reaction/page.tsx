"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ScoreBoard from "../components/ScoreBoard";

type Phase = "ready" | "waiting" | "go" | "result" | "toosoon";

export default function ReactionPage() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [reactionTime, setReactionTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("reaction-best");
    if (saved) setBestTime(Number(saved));
  }, []);

  const handleClick = useCallback(() => {
    if (phase === "ready" || phase === "toosoon") {
      // Start waiting
      setPhase("waiting");
      const delay = 1500 + Math.random() * 3500; // 1.5~5s
      timerRef.current = setTimeout(() => {
        setPhase("go");
        startTimeRef.current = performance.now();
      }, delay);
    } else if (phase === "waiting") {
      // Too soon!
      if (timerRef.current) clearTimeout(timerRef.current);
      setPhase("toosoon");
    } else if (phase === "go") {
      // Record time
      const elapsed = Math.round(performance.now() - startTimeRef.current);
      setReactionTime(elapsed);

      if (bestTime === 0 || elapsed < bestTime) {
        setBestTime(elapsed);
        localStorage.setItem("reaction-best", String(elapsed));
      }

      setShowRanking(true);
      setPhase("result");
    }
  }, [phase, bestTime]);

  const reset = () => {
    setPhase("ready");
    setReactionTime(0);
  };

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-green-400 via-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              반응속도 테스트
            </span>
            <span className="ml-2">⚡</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">초록색으로 바뀌면 최대한 빨리 클릭!</p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Best</span>
            <span className="font-mono text-lg font-bold text-gold">{bestTime ? `${bestTime}ms` : "-"}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Last</span>
            <span className="font-mono text-lg font-bold text-white">{reactionTime ? `${reactionTime}ms` : "-"}</span>
          </div>
        </div>

        {/* Game Area */}
        <button
          onClick={handleClick}
          disabled={phase === "result"}
          className={`flex h-72 w-full max-w-md select-none flex-col items-center justify-center rounded-3xl border-2 text-center font-mono transition-all duration-100 ${
            phase === "result" ? "cursor-default" : "cursor-pointer"
          } ${
            phase === "ready"
              ? "border-accent/30 bg-accent/5 text-zinc-400 hover:border-accent/50"
              : phase === "waiting"
              ? "border-red-500/50 bg-red-500/10 text-red-400"
              : phase === "go"
              ? "border-green-500/50 bg-green-500/15 text-green-400 shadow-[0_0_60px_-10px_rgba(34,197,94,0.4)]"
              : phase === "toosoon"
              ? "border-yellow-500/50 bg-yellow-500/10 text-yellow-400"
              : "border-accent/30 bg-accent/5 text-zinc-300"
          }`}
        >
          {phase === "ready" && (
            <>
              <span className="text-4xl mb-3">🎯</span>
              <span className="text-lg font-bold">클릭해서 시작</span>
              <span className="mt-1 text-xs text-zinc-500">초록색이 되면 바로 클릭!</span>
            </>
          )}
          {phase === "waiting" && (
            <>
              <span className="text-5xl mb-3">🔴</span>
              <span className="text-xl font-bold">기다리세요...</span>
              <span className="mt-1 text-xs text-red-400/60">지금 누르면 실패!</span>
            </>
          )}
          {phase === "go" && (
            <>
              <span className="text-5xl mb-3">🟢</span>
              <span className="text-2xl font-bold">지금! 클릭!</span>
            </>
          )}
          {phase === "toosoon" && (
            <>
              <span className="text-4xl mb-3">😅</span>
              <span className="text-xl font-bold">너무 빨랐어요!</span>
              <span className="mt-1 text-xs">클릭해서 다시 시도</span>
            </>
          )}
          {phase === "result" && (
            <>
              <span className="text-4xl mb-2">⚡</span>
              <span className={`text-4xl font-black ${reactionTime < 200 ? "text-green-400" : reactionTime < 300 ? "text-yellow-400" : "text-orange-400"}`}>
                {reactionTime}ms
              </span>
              <span className="mt-2 text-sm text-zinc-400">
                {reactionTime < 150 ? "미쳤다 🔥" : reactionTime < 200 ? "엄청 빠름!" : reactionTime < 250 ? "좋아요!" : reactionTime < 350 ? "평균적" : "조금 느림..."}
              </span>
            </>
          )}
        </button>

        <ScoreBoard gameId="reaction" currentScore={reactionTime} unit="ms" show={showRanking} onClose={() => { setShowRanking(false); reset(); }} />
      </main>
    </div>
  );
}
