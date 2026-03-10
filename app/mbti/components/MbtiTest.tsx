"use client";

import { useState, useCallback } from "react";
import { QUESTIONS, RESULTS, type Dimension } from "../lib/data";

type Phase = "intro" | "question" | "calculating" | "result";

const DIM_LABELS: Record<string, string> = {
  E: "외향 (E)",
  I: "내향 (I)",
  S: "감각 (S)",
  N: "직관 (N)",
  T: "사고 (T)",
  F: "감정 (F)",
  J: "판단 (J)",
  P: "인식 (P)",
};

export default function MbtiTest() {
  const [phase, setPhase] = useState<Phase>("intro");
  const [currentQ, setCurrentQ] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({
    E: 0,
    I: 0,
    S: 0,
    N: 0,
    T: 0,
    F: 0,
    J: 0,
    P: 0,
  });
  const [resultType, setResultType] = useState("");
  const [animDir, setAnimDir] = useState<"enter" | "exit" | "">("");
  const [selectedOption, setSelectedOption] = useState<"A" | "B" | null>(null);

  const startTest = useCallback(() => {
    setScores({ E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0 });
    setCurrentQ(0);
    setResultType("");
    setPhase("question");
    setAnimDir("enter");
  }, []);

  const handleAnswer = useCallback(
    (value: string, option: "A" | "B") => {
      if (selectedOption) return;
      setSelectedOption(option);

      const newScores = { ...scores, [value]: scores[value] + 1 };
      setScores(newScores);

      setTimeout(() => {
        if (currentQ < QUESTIONS.length - 1) {
          setAnimDir("exit");
          setTimeout(() => {
            setCurrentQ((prev) => prev + 1);
            setSelectedOption(null);
            setAnimDir("enter");
          }, 300);
        } else {
          setPhase("calculating");
          setTimeout(() => {
            const type = calculateType(newScores);
            setResultType(type);
            setPhase("result");
          }, 2000);
        }
      }, 400);
    },
    [scores, currentQ, selectedOption]
  );

  const calculateType = (s: Record<string, number>) => {
    const dims: [string, string, Dimension][] = [
      ["E", "I", "EI"],
      ["S", "N", "SN"],
      ["T", "F", "TF"],
      ["J", "P", "JP"],
    ];
    return dims.map(([a, b]) => (s[a] >= s[b] ? a : b)).join("");
  };

  const restart = useCallback(() => {
    setPhase("intro");
    setAnimDir("");
    setSelectedOption(null);
  }, []);

  const shareResult = useCallback(() => {
    if (!resultType || !RESULTS[resultType]) return;
    const r = RESULTS[resultType];
    const text = `나의 MBTI: ${r.type} - ${r.emoji} ${r.title}\n${r.description}\n\nDev Playground에서 테스트해보세요!`;
    if (navigator.share) {
      navigator.share({ title: "MBTI 성격유형 테스트", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        alert("결과가 클립보드에 복사되었습니다!");
      });
    }
  }, [resultType]);

  const progress = ((currentQ + (selectedOption ? 1 : 0)) / QUESTIONS.length) * 100;
  const question = QUESTIONS[currentQ];
  const result = resultType ? RESULTS[resultType] : null;

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6">
      {/* Intro */}
      {phase === "intro" && (
        <div className="anim-fade-scale flex w-full flex-col items-center gap-8 text-center">
          <div className="relative">
            <div className="text-8xl">🧬</div>
            <div className="absolute -inset-4 -z-10 rounded-full bg-violet-500/10 blur-2xl" />
          </div>

          <div className="flex flex-col gap-3">
            <h3 className="text-2xl font-bold text-zinc-100">
              MBTI 성격유형 테스트
            </h3>
            <p className="text-sm leading-relaxed text-zinc-400">
              12가지 일상 속 선택으로
              <br />
              나의 성격 유형을 알아보세요!
            </p>
          </div>

          <div className="flex flex-col gap-2 rounded-xl border border-card-border bg-card-bg/60 px-6 py-4 text-left">
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>📋</span>
              <span>총 12문항</span>
              <span className="text-zinc-700">·</span>
              <span>⏱ 약 2~3분</span>
              <span className="text-zinc-700">·</span>
              <span>🧬 16가지 유형</span>
            </div>
          </div>

          <button
            onClick={startTest}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-10 py-4 font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-105 hover:shadow-violet-500/40 active:scale-95"
          >
            <span className="relative z-10">테스트 시작하기</span>
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        </div>
      )}

      {/* Question */}
      {phase === "question" && question && (
        <div className="flex w-full flex-col gap-6">
          {/* Progress */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-xs text-zinc-500">
              <span>
                Q{currentQ + 1} / {QUESTIONS.length}
              </span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
              <div
                className="h-full rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <div
            className={`flex flex-col gap-5 transition-all duration-300 ${
              animDir === "enter"
                ? "animate-[fade-in-up_0.4s_ease-out_forwards]"
                : animDir === "exit"
                  ? "translate-x-[-30px] opacity-0"
                  : ""
            }`}
          >
            {/* Scenario */}
            <div className="rounded-xl border border-card-border bg-card-bg/60 px-5 py-3">
              <p className="font-mono text-xs text-violet-400/80">
                💬 {question.scenario}
              </p>
            </div>

            {/* Question text */}
            <h3 className="text-center text-xl font-bold leading-snug text-zinc-100">
              {question.text}
            </h3>

            {/* Options */}
            <div className="flex flex-col gap-3">
              <button
                onClick={() => handleAnswer(question.optionA.value, "A")}
                disabled={!!selectedOption}
                className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                  selectedOption === "A"
                    ? "border-violet-500/60 bg-violet-500/15 shadow-lg shadow-violet-500/10"
                    : selectedOption === "B"
                      ? "border-zinc-800 bg-zinc-900/30 opacity-50"
                      : "border-card-border bg-card-bg/60 hover:border-violet-500/30 hover:bg-violet-500/5 active:scale-[0.98]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      selectedOption === "A"
                        ? "bg-violet-500 text-white"
                        : "bg-zinc-800 text-zinc-500 group-hover:bg-violet-500/20 group-hover:text-violet-400"
                    }`}
                  >
                    A
                  </span>
                  <span
                    className={`text-sm leading-relaxed transition-colors ${
                      selectedOption === "A" ? "text-violet-200" : "text-zinc-300"
                    }`}
                  >
                    {question.optionA.text}
                  </span>
                </div>
              </button>

              <button
                onClick={() => handleAnswer(question.optionB.value, "B")}
                disabled={!!selectedOption}
                className={`group relative w-full overflow-hidden rounded-2xl border p-5 text-left transition-all duration-300 ${
                  selectedOption === "B"
                    ? "border-fuchsia-500/60 bg-fuchsia-500/15 shadow-lg shadow-fuchsia-500/10"
                    : selectedOption === "A"
                      ? "border-zinc-800 bg-zinc-900/30 opacity-50"
                      : "border-card-border bg-card-bg/60 hover:border-fuchsia-500/30 hover:bg-fuchsia-500/5 active:scale-[0.98]"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-bold transition-colors ${
                      selectedOption === "B"
                        ? "bg-fuchsia-500 text-white"
                        : "bg-zinc-800 text-zinc-500 group-hover:bg-fuchsia-500/20 group-hover:text-fuchsia-400"
                    }`}
                  >
                    B
                  </span>
                  <span
                    className={`text-sm leading-relaxed transition-colors ${
                      selectedOption === "B" ? "text-fuchsia-200" : "text-zinc-300"
                    }`}
                  >
                    {question.optionB.text}
                  </span>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Calculating */}
      {phase === "calculating" && (
        <div className="anim-fade-scale flex flex-col items-center gap-6 py-12 text-center">
          <div className="relative">
            <div className="text-6xl animate-spin" style={{ animationDuration: "3s" }}>
              🧬
            </div>
            <div className="absolute -inset-8 -z-10 animate-pulse rounded-full bg-violet-500/20 blur-3xl" />
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-lg font-bold text-zinc-200">분석 중...</p>
            <p className="font-mono text-xs text-zinc-500">
              당신의 성격 유형을 분석하고 있습니다
            </p>
          </div>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-2 w-2 animate-bounce rounded-full bg-violet-500"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {phase === "result" && result && (
        <div className="anim-fade-scale flex w-full flex-col items-center gap-6">
          {/* Type badge */}
          <div className="relative flex flex-col items-center gap-3">
            <div className="relative">
              <span className="text-7xl">{result.emoji}</span>
              <div className="absolute -inset-6 -z-10 rounded-full bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 blur-2xl" />
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-1.5 font-mono text-xl font-black tracking-widest text-white shadow-lg shadow-violet-500/25">
                {result.type}
              </span>
            </div>
            <h3 className="text-2xl font-bold text-zinc-100">{result.title}</h3>
          </div>

          {/* Description */}
          <div className="w-full rounded-2xl border border-card-border bg-card-bg/60 p-5">
            <p className="text-sm leading-relaxed text-zinc-300">
              {result.description}
            </p>
          </div>

          {/* Dimension bars */}
          <div className="w-full rounded-2xl border border-card-border bg-card-bg/60 p-5">
            <h4 className="mb-4 text-sm font-bold text-zinc-300">성향 분석</h4>
            <div className="flex flex-col gap-3">
              {(["EI", "SN", "TF", "JP"] as const).map((dim) => {
                const left = dim[0];
                const right = dim[1];
                const total = scores[left] + scores[right];
                const leftPct = total > 0 ? (scores[left] / total) * 100 : 50;
                const rightPct = 100 - leftPct;
                const dominant = leftPct >= rightPct ? left : right;
                return (
                  <div key={dim} className="flex flex-col gap-1">
                    <div className="flex justify-between font-mono text-[11px]">
                      <span
                        className={
                          dominant === left
                            ? "font-bold text-violet-400"
                            : "text-zinc-600"
                        }
                      >
                        {DIM_LABELS[left]} {Math.round(leftPct)}%
                      </span>
                      <span
                        className={
                          dominant === right
                            ? "font-bold text-fuchsia-400"
                            : "text-zinc-600"
                        }
                      >
                        {Math.round(rightPct)}% {DIM_LABELS[right]}
                      </span>
                    </div>
                    <div className="flex h-2 overflow-hidden rounded-full bg-zinc-800">
                      <div
                        className="rounded-l-full bg-gradient-to-r from-violet-500 to-violet-400 transition-all duration-1000 ease-out"
                        style={{ width: `${leftPct}%` }}
                      />
                      <div
                        className="rounded-r-full bg-gradient-to-r from-fuchsia-400 to-fuchsia-500 transition-all duration-1000 ease-out"
                        style={{ width: `${rightPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Strengths & Keywords */}
          <div className="grid w-full grid-cols-2 gap-3">
            <div className="rounded-2xl border border-card-border bg-card-bg/60 p-4">
              <h4 className="mb-3 text-xs font-bold text-zinc-400">💪 강점</h4>
              <div className="flex flex-col gap-1.5">
                {result.strengths.map((s) => (
                  <span
                    key={s}
                    className="rounded-lg bg-violet-500/10 px-2.5 py-1 text-center text-xs text-violet-300"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="rounded-2xl border border-card-border bg-card-bg/60 p-4">
              <h4 className="mb-3 text-xs font-bold text-zinc-400">
                ✨ 키워드
              </h4>
              <div className="flex flex-col gap-1.5">
                {result.keywords.map((k) => (
                  <span
                    key={k}
                    className="rounded-lg bg-fuchsia-500/10 px-2.5 py-1 text-center text-xs text-fuchsia-300"
                  >
                    {k}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Compatibility */}
          <div className="flex w-full gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
              <span className="text-2xl">💚</span>
              <div>
                <p className="text-[10px] font-bold text-emerald-400/70">
                  찰떡 궁합
                </p>
                <p className="font-mono text-sm font-bold text-emerald-300">
                  {result.bestMatch}
                </p>
              </div>
            </div>
            <div className="flex flex-1 items-center gap-3 rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="text-[10px] font-bold text-red-400/70">
                  도전적 관계
                </p>
                <p className="font-mono text-sm font-bold text-red-300">
                  {result.worstMatch}
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex w-full gap-3">
            <button
              onClick={shareResult}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl border border-card-border bg-card-bg/60 px-4 py-3.5 text-sm font-bold text-zinc-300 transition-all hover:border-zinc-600 hover:bg-white/5 active:scale-95"
            >
              <span>📤</span>
              공유하기
            </button>
            <button
              onClick={restart}
              className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-violet-500/25 transition-all hover:scale-[1.02] hover:shadow-violet-500/40 active:scale-95"
            >
              <span>🔄</span>
              다시 하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
