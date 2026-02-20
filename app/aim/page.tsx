"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ScoreBoard from "../components/ScoreBoard";

type Phase = "idle" | "playing" | "done";

export default function AimPage() {
  const TOTAL_TARGETS = 30;

  const [phase, setPhase] = useState<Phase>("idle");
  const [targetPos, setTargetPos] = useState({ x: 50, y: 50 });
  const [current, setCurrent] = useState(0);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [avgTime, setAvgTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showRanking, setShowRanking] = useState(false);

  const areaRef = useRef<HTMLDivElement>(null);
  const spawnTimeRef = useRef(0);
  const timesRef = useRef<number[]>([]);
  const currentRef = useRef(0);
  const hitsRef = useRef(0);
  const missesRef = useRef(0);

  useEffect(() => {
    const saved = localStorage.getItem("aim-best");
    if (saved) setBestTime(Number(saved));
  }, []);

  const spawnTarget = useCallback(() => {
    const padding = 12;
    const x = padding + Math.random() * (100 - padding * 2);
    const y = padding + Math.random() * (100 - padding * 2);
    setTargetPos({ x, y });
    spawnTimeRef.current = performance.now();
  }, []);

  const start = useCallback(() => {
    setPhase("playing");
    setCurrent(0);
    setHits(0);
    setMisses(0);
    setAvgTime(0);
    timesRef.current = [];
    currentRef.current = 0;
    hitsRef.current = 0;
    missesRef.current = 0;
    spawnTarget();
  }, [spawnTarget]);

  const finishGame = useCallback(() => {
    const times = timesRef.current;
    const avg = times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0;
    setAvgTime(avg);
    setPhase("done");

    if (avg > 0 && (bestTime === 0 || avg < bestTime)) {
      setBestTime(avg);
      localStorage.setItem("aim-best", String(avg));
    }

    setShowRanking(true);
  }, [bestTime]);

  const advance = useCallback(() => {
    const next = currentRef.current + 1;
    currentRef.current = next;
    setCurrent(next);

    if (next >= TOTAL_TARGETS) {
      finishGame();
    } else {
      spawnTarget();
    }
  }, [finishGame, spawnTarget]);

  const handleTargetClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (phase !== "playing") return;

      const elapsed = Math.round(performance.now() - spawnTimeRef.current);
      timesRef.current.push(elapsed);
      hitsRef.current += 1;
      setHits(hitsRef.current);
      advance();
    },
    [phase, advance]
  );

  const handleAreaClick = useCallback(() => {
    if (phase !== "playing") return;

    missesRef.current += 1;
    setMisses(missesRef.current);
  }, [phase]);

  const accuracy =
    hitsRef.current + missesRef.current > 0
      ? Math.round((hitsRef.current / (hitsRef.current + missesRef.current)) * 100)
      : 100;

  const getTimeLabel = (ms: number) => {
    if (ms < 250) return "번개 ⚡";
    if (ms < 350) return "빠름 🔥";
    if (ms < 500) return "보통 👍";
    return "느긋 🐢";
  };

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              에임 트레이너
            </span>
            <span className="ml-2">🎯</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            타겟을 최대한 빨리 클릭하세요! 30개 도전
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Best</span>
            <span className="font-mono text-lg font-bold text-gold">{bestTime ? `${bestTime}ms` : "-"}</span>
          </div>
          {phase === "playing" && (
            <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">진행</span>
              <span className="font-mono text-lg font-bold text-white">
                {current}/{TOTAL_TARGETS}
              </span>
            </div>
          )}
          {phase === "playing" && (
            <>
              <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">적중</span>
                <span className="font-mono text-lg font-bold text-green-400">{hits}</span>
              </div>
              <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
                <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">빗나감</span>
                <span className="font-mono text-lg font-bold text-red-400">{misses}</span>
              </div>
            </>
          )}
        </div>

        {/* Game area */}
        {phase === "idle" && (
          <div className="flex w-full max-w-xl flex-col items-center">
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-card-border bg-card-bg/50">
              <span className="mb-4 text-6xl">🎯</span>
              <p className="mb-2 font-mono text-sm text-zinc-300">30개의 타겟이 나타납니다</p>
              <p className="mb-6 font-mono text-xs text-zinc-500">최대한 빨리 클릭해서 평균 반응시간을 줄이세요</p>
              <button
                onClick={start}
                className="rounded-xl border border-red-500/30 bg-red-500/10 px-8 py-3 font-mono text-sm font-bold text-red-400 transition-all hover:bg-red-500/20"
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {phase === "playing" && (
          <div
            ref={areaRef}
            onClick={handleAreaClick}
            className="relative h-[400px] w-full max-w-xl cursor-crosshair select-none overflow-hidden rounded-2xl border-2 border-red-500/20 bg-card-bg/80"
            style={{ touchAction: "none" }}
          >
            <div
              onClick={handleTargetClick}
              className="absolute flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full bg-linear-to-r from-red-500 to-orange-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] transition-transform hover:scale-110"
              style={{
                left: `${targetPos.x}%`,
                top: `${targetPos.y}%`,
              }}
            >
              <div className="h-3 w-3 rounded-full bg-white/80" />
            </div>

            {/* Progress bar at bottom */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-white/5">
              <div
                className="h-full bg-linear-to-r from-red-500 to-orange-500 transition-all duration-200"
                style={{ width: `${(current / TOTAL_TARGETS) * 100}%` }}
              />
            </div>
          </div>
        )}

        {phase === "done" && (
          <div className="flex w-full max-w-xl flex-col items-center">
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-card-border bg-card-bg/80 p-8">
              <span className="text-5xl">
                {avgTime < 300 ? "🔥" : avgTime < 400 ? "⚡" : "🎯"}
              </span>
              <div className="text-center">
                <p className="font-mono text-3xl font-black text-white">{avgTime}ms</p>
                <p className="mt-1 font-mono text-sm text-zinc-400">평균 반응시간</p>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center rounded-xl border border-card-border bg-white/3 px-4 py-2">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">정확도</span>
                  <span className="font-mono text-lg font-bold text-green-400">{accuracy}%</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-card-border bg-white/3 px-4 py-2">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">적중</span>
                  <span className="font-mono text-lg font-bold text-white">{hits}/{TOTAL_TARGETS}</span>
                </div>
                <div className="flex flex-col items-center rounded-xl border border-card-border bg-white/3 px-4 py-2">
                  <span className="font-mono text-[10px] uppercase text-zinc-500">빗나감</span>
                  <span className="font-mono text-lg font-bold text-red-400">{misses}</span>
                </div>
              </div>

              <p className="font-mono text-sm text-zinc-400">{getTimeLabel(avgTime)}</p>

              <button
                onClick={start}
                className="mt-2 rounded-xl border border-red-500/30 bg-red-500/10 px-8 py-3 font-mono text-sm font-bold text-red-400 transition-all hover:bg-red-500/20"
              >
                다시 시작
              </button>
            </div>
          </div>
        )}

        <ScoreBoard
          gameId="aim"
          currentScore={avgTime}
          unit="ms"
          show={showRanking}
          onClose={() => {
            setShowRanking(false);
          }}
        />
      </main>
    </div>
  );
}
