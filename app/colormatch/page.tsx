"use client";

import { useState, useEffect, useCallback } from "react";
import ScoreBoard from "../components/ScoreBoard";

const MAX_DISTANCE = Math.sqrt(255 * 255 * 3);
const TOTAL_ROUNDS = 5;

function randomColor(): [number, number, number] {
  return [
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
    Math.floor(Math.random() * 256),
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}

function colorDistance(a: [number, number, number], b: [number, number, number]): number {
  return Math.sqrt((a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2);
}

function calcScore(target: [number, number, number], guess: [number, number, number]): number {
  const dist = colorDistance(target, guess);
  return Math.round((100 - (dist / MAX_DISTANCE) * 100) * 10) / 10;
}

export default function ColorMatchPage() {
  const [target, setTarget] = useState<[number, number, number]>([128, 128, 128]);
  const [guess, setGuess] = useState<[number, number, number]>([128, 128, 128]);
  const [round, setRound] = useState(1);
  const [scores, setScores] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [roundScore, setRoundScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [averageScore, setAverageScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("colormatch-best");
    if (saved) setBestScore(Number(saved));
    setTarget(randomColor());
  }, []);

  const handleSubmit = useCallback(() => {
    const score = calcScore(target, guess);
    setRoundScore(score);
    const newScores = [...scores, score];
    setScores(newScores);
    setSubmitted(true);

    if (newScores.length >= TOTAL_ROUNDS) {
      const avg = Math.round((newScores.reduce((a, b) => a + b, 0) / newScores.length) * 10) / 10;
      setAverageScore(avg);
      setFinished(true);
      if (avg > bestScore) {
        setBestScore(avg);
        localStorage.setItem("colormatch-best", String(avg));
      }
      setShowRanking(true);
    }
  }, [target, guess, scores, bestScore]);

  const nextRound = () => {
    setRound((r) => r + 1);
    setTarget(randomColor());
    setGuess([128, 128, 128]);
    setSubmitted(false);
    setRoundScore(0);
  };

  const restart = () => {
    setRound(1);
    setScores([]);
    setSubmitted(false);
    setRoundScore(0);
    setFinished(false);
    setAverageScore(0);
    setShowRanking(false);
    setTarget(randomColor());
    setGuess([128, 128, 128]);
  };

  const setChannel = (index: number, value: number) => {
    setGuess((prev) => {
      const next = [...prev] as [number, number, number];
      next[index] = value;
      return next;
    });
  };

  const runningTotal = scores.length > 0
    ? Math.round((scores.reduce((a, b) => a + b, 0) / scores.length) * 10) / 10
    : 0;

  const channelLabels = ["R", "G", "B"] as const;
  const channelColors = [
    { track: "bg-red-500/30", thumb: "accent-red-500", text: "text-red-400" },
    { track: "bg-green-500/30", thumb: "accent-green-500", text: "text-green-400" },
    { track: "bg-blue-500/30", thumb: "accent-blue-500", text: "text-blue-400" },
  ];

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-yellow-400 to-amber-400 bg-clip-text text-transparent">
              컬러 매치
            </span>
            <span className="ml-2">🎨</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            목표 색상을 RGB로 맞춰보세요!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              라운드
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {round}/{TOTAL_ROUNDS}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              평균
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {scores.length > 0 ? `${runningTotal}점` : "-"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Best
            </span>
            <span className="font-mono text-lg font-bold text-gold">
              {bestScore ? `${bestScore}점` : "-"}
            </span>
          </div>
        </div>

        {/* Color swatches */}
        <div className="mb-6 flex w-full max-w-sm items-stretch gap-3">
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              목표
            </span>
            <div
              className="aspect-square w-full rounded-2xl border border-card-border shadow-lg"
              style={{ backgroundColor: `rgb(${target[0]}, ${target[1]}, ${target[2]})` }}
            />
            {submitted && (
              <span className="font-mono text-[11px] text-zinc-400">
                {rgbToHex(...target)}
              </span>
            )}
          </div>
          <div className="flex flex-1 flex-col items-center gap-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              내 색상
            </span>
            <div
              className="aspect-square w-full rounded-2xl border border-card-border shadow-lg"
              style={{ backgroundColor: `rgb(${guess[0]}, ${guess[1]}, ${guess[2]})` }}
            />
            <span className="font-mono text-[11px] text-zinc-400">
              {rgbToHex(...guess)}
            </span>
          </div>
        </div>

        {/* Sliders */}
        <div className="mb-6 flex w-full max-w-sm flex-col gap-4">
          {channelLabels.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <span className={`w-5 font-mono text-sm font-bold ${channelColors[i].text}`}>
                {label}
              </span>
              <input
                type="range"
                min={0}
                max={255}
                value={guess[i]}
                disabled={submitted}
                onChange={(e) => setChannel(i, Number(e.target.value))}
                className={`h-2 flex-1 cursor-pointer appearance-none rounded-full ${channelColors[i].track} ${channelColors[i].thumb} disabled:cursor-not-allowed disabled:opacity-50`}
              />
              <span className="w-8 text-right font-mono text-xs text-zinc-400">
                {guess[i]}
              </span>
            </div>
          ))}
        </div>

        {/* Action buttons */}
        {!submitted && !finished && (
          <button
            onClick={handleSubmit}
            className="mb-4 rounded-xl border border-amber-500/30 bg-amber-500/10 px-8 py-3 font-mono text-sm font-bold text-amber-400 transition-all hover:bg-amber-500/20"
          >
            확인
          </button>
        )}

        {submitted && !finished && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-card-border bg-card-bg px-6 py-3">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                이번 라운드
              </span>
              <span
                className={`font-mono text-2xl font-black ${
                  roundScore >= 90
                    ? "text-green-400"
                    : roundScore >= 70
                      ? "text-yellow-400"
                      : roundScore >= 50
                        ? "text-orange-400"
                        : "text-red-400"
                }`}
              >
                {roundScore}점
              </span>
              <span className="font-mono text-[10px] text-zinc-600">
                목표: {rgbToHex(...target)}
              </span>
            </div>
            <button
              onClick={nextRound}
              className="rounded-xl border border-accent/30 bg-accent/10 px-6 py-2.5 font-mono text-xs text-accent-2 transition-all hover:bg-accent/20"
            >
              다음 라운드 →
            </button>
          </div>
        )}

        {finished && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="flex flex-col items-center gap-1 rounded-xl border border-amber-500/30 bg-amber-500/10 px-6 py-4">
              <span className="text-3xl">🏆</span>
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                최종 평균 점수
              </span>
              <span className="font-mono text-3xl font-black text-amber-400">
                {averageScore}점
              </span>
              <div className="mt-1 flex gap-2">
                {scores.map((s, i) => (
                  <span key={i} className="font-mono text-[10px] text-zinc-500">
                    R{i + 1}: {s}
                  </span>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Restart button */}
        <button
          onClick={restart}
          className="rounded-xl border border-card-border bg-card-bg px-6 py-2.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
        >
          🔄 다시 시작
        </button>

        <ScoreBoard
          gameId="colormatch"
          currentScore={averageScore}
          unit="점"
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
