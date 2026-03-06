"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const MAX_ATTEMPTS = 10;
const DIGITS_COUNT = 3;

interface GuessResult {
  guess: number[];
  strike: number;
  ball: number;
  out: number;
}

function generateAnswer(): number[] {
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9];
  for (let i = digits.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [digits[i], digits[j]] = [digits[j], digits[i]];
  }
  return digits.slice(0, DIGITS_COUNT);
}

function evaluate(answer: number[], guess: number[]): { strike: number; ball: number; out: number } {
  let strike = 0;
  let ball = 0;
  let out = 0;
  for (let i = 0; i < DIGITS_COUNT; i++) {
    if (guess[i] === answer[i]) {
      strike++;
    } else if (answer.includes(guess[i])) {
      ball++;
    } else {
      out++;
    }
  }
  return { strike, ball, out };
}

type GameState = "playing" | "won" | "lost";

export default function BaseballGame() {
  const [answer, setAnswer] = useState<number[]>([]);
  const [input, setInput] = useState<(number | null)[]>([null, null, null]);
  const [history, setHistory] = useState<GuessResult[]>([]);
  const [gameState, setGameState] = useState<GameState>("playing");
  const [finalScore, setFinalScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [best, setBest] = useState<number | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const initGame = useCallback(() => {
    setAnswer(generateAnswer());
    setInput([null, null, null]);
    setHistory([]);
    setGameState("playing");
    setFinalScore(0);
    setShowRanking(false);
    setShowCelebration(false);
  }, []);

  useEffect(() => {
    initGame();
    const saved = localStorage.getItem("baseball-best");
    if (saved) setBest(Number(saved));
  }, [initGame]);

  const handleDigitInput = (index: number, value: string) => {
    if (gameState !== "playing") return;
    const num = parseInt(value);
    if (value === "" || value === "Backspace") {
      setInput((prev) => {
        const next = [...prev];
        next[index] = null;
        return next;
      });
      if (value === "Backspace" && input[index] === null && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
      return;
    }
    if (isNaN(num) || num < 1 || num > 9) return;
    setInput((prev) => {
      const next = [...prev];
      next[index] = num;
      return next;
    });
    if (index < DIGITS_COUNT - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleNumpad = (num: number) => {
    if (gameState !== "playing") return;
    const firstEmpty = input.findIndex((d) => d === null);
    if (firstEmpty === -1) return;
    setInput((prev) => {
      const next = [...prev];
      next[firstEmpty] = num;
      return next;
    });
  };

  const handleNumpadDelete = () => {
    if (gameState !== "playing") return;
    const lastFilled = input.reduce<number>((acc, d, i) => (d !== null ? i : acc), -1);
    if (lastFilled < 0) return;
    const idx = lastFilled;
    setInput((prev) => {
      const next = [...prev];
      next[idx] = null;
      return next;
    });
  };

  const isValidGuess = (): boolean => {
    if (input.some((d) => d === null)) return false;
    const digits = input as number[];
    return new Set(digits).size === DIGITS_COUNT;
  };

  const submitGuess = () => {
    if (gameState !== "playing" || !isValidGuess()) return;
    const guess = input as number[];
    const result = evaluate(answer, guess);
    const newHistory = [...history, { guess: [...guess], ...result }];
    setHistory(newHistory);
    setInput([null, null, null]);
    inputRefs.current[0]?.focus();

    if (result.strike === DIGITS_COUNT) {
      const attempts = newHistory.length;
      setFinalScore(attempts);
      setGameState("won");
      setShowCelebration(true);
      const currentBest = best;
      if (currentBest === null || attempts < currentBest) {
        setBest(attempts);
        localStorage.setItem("baseball-best", String(attempts));
      }
      setTimeout(() => {
        setShowCelebration(false);
        setShowRanking(true);
      }, 2000);
    } else if (newHistory.length >= MAX_ATTEMPTS) {
      setGameState("lost");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      submitGuess();
    }
  };

  const attemptsUsed = history.length;
  const attemptsLeft = MAX_ATTEMPTS - attemptsUsed;
  const duplicateWarning = (() => {
    const filled = input.filter((d) => d !== null) as number[];
    return new Set(filled).size !== filled.length && filled.length > 1;
  })();

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-5" onKeyDown={handleKeyDown}>
      {/* Attempt counter */}
      <div className="flex items-center gap-3 font-mono text-xs">
        <span className="text-zinc-500">
          시도 <span className="font-bold text-zinc-200">{attemptsUsed}</span> / {MAX_ATTEMPTS}
        </span>
        <span className="text-zinc-700">|</span>
        <span className="text-zinc-500">
          남은 기회 <span className={`font-bold ${attemptsLeft <= 3 ? "text-red-400" : "text-zinc-200"}`}>{attemptsLeft}</span>
        </span>
        {best !== null && (
          <>
            <span className="text-zinc-700">|</span>
            <span className="text-amber-400/70">최고 {best}회</span>
          </>
        )}
      </div>

      {/* Input area */}
      {gameState === "playing" && (
        <div className="flex flex-col items-center gap-4">
          {/* Digit inputs */}
          <div className="flex items-center gap-3">
            {input.map((digit, i) => (
              <input
                key={i}
                ref={(el) => { inputRefs.current[i] = el; }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit ?? ""}
                onChange={(e) => handleDigitInput(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    handleDigitInput(i, "Backspace");
                  }
                }}
                className={`h-16 w-16 rounded-xl border-2 bg-zinc-900/80 text-center font-mono text-3xl font-bold text-white outline-none transition-all focus:border-amber-400 focus:shadow-[0_0_20px_-5px_rgba(251,191,36,0.4)] sm:h-20 sm:w-20 sm:text-4xl ${
                  digit !== null ? "border-amber-400/40" : "border-zinc-700"
                }`}
                placeholder="·"
              />
            ))}
          </div>

          {/* Validation warning */}
          {duplicateWarning && (
            <p className="font-mono text-[11px] text-red-400">숫자가 중복되었습니다!</p>
          )}

          {/* Submit button */}
          <button
            onClick={submitGuess}
            disabled={!isValidGuess()}
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-8 py-3 font-mono text-sm font-bold text-amber-300 transition-all hover:bg-amber-400/20 hover:shadow-[0_0_24px_-6px_rgba(251,191,36,0.3)] disabled:opacity-30 disabled:hover:bg-amber-400/10 disabled:hover:shadow-none"
          >
            추리하기
          </button>

          {/* Numpad */}
          <div className="grid grid-cols-5 gap-2 sm:hidden">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const alreadyUsed = input.includes(num);
              return (
                <button
                  key={num}
                  onClick={() => handleNumpad(num)}
                  disabled={alreadyUsed}
                  className={`flex h-11 w-11 items-center justify-center rounded-lg border font-mono text-lg font-bold transition-all ${
                    alreadyUsed
                      ? "border-zinc-800 bg-zinc-900/50 text-zinc-700"
                      : "border-zinc-700 bg-zinc-800/80 text-zinc-200 active:bg-amber-400/20 active:border-amber-400/40"
                  }`}
                >
                  {num}
                </button>
              );
            })}
            <button
              onClick={handleNumpadDelete}
              className="flex h-11 w-11 items-center justify-center rounded-lg border border-zinc-700 bg-zinc-800/80 font-mono text-sm text-zinc-400 transition-all active:bg-red-400/20"
            >
              ←
            </button>
          </div>
        </div>
      )}

      {/* Win celebration */}
      {showCelebration && (
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/10 px-8 py-6">
          <span className="text-5xl">🎉</span>
          <p className="font-mono text-lg font-bold text-green-400">정답!</p>
          <p className="font-mono text-sm text-zinc-400">
            <span className="font-bold text-green-300">{finalScore}회</span> 만에 맞혔습니다!
          </p>
        </div>
      )}

      {/* Loss screen */}
      {gameState === "lost" && (
        <div className="flex flex-col items-center gap-4 rounded-2xl border border-red-500/30 bg-red-500/10 px-8 py-6">
          <span className="text-5xl">😥</span>
          <p className="font-mono text-lg font-bold text-red-400">게임 오버</p>
          <p className="font-mono text-sm text-zinc-400">
            정답은 <span className="font-bold text-white">{answer.join("")}</span> 이었습니다
          </p>
          <button
            onClick={initGame}
            className="rounded-xl border border-amber-400/30 bg-amber-400/10 px-6 py-2.5 font-mono text-sm font-bold text-amber-300 transition-all hover:bg-amber-400/20"
          >
            다시 도전하기
          </button>
        </div>
      )}

      {/* History */}
      {history.length > 0 && (
        <div className="flex w-full flex-col gap-2">
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            추리 기록
          </p>
          <div className="flex flex-col gap-1.5">
            {[...history].reverse().map((entry, i) => {
              const idx = history.length - i;
              return (
                <div
                  key={i}
                  className={`flex items-center justify-between rounded-xl border px-4 py-3 font-mono text-sm transition-all ${
                    entry.strike === DIGITS_COUNT
                      ? "border-green-500/30 bg-green-500/10"
                      : "border-card-border bg-card-bg/60"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 text-center text-xs text-zinc-600">#{idx}</span>
                    <div className="flex gap-1.5">
                      {entry.guess.map((d, di) => (
                        <span
                          key={di}
                          className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold ${
                            answer[di] === d
                              ? "bg-green-500/20 text-green-400"
                              : answer.includes(d)
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-zinc-800 text-zinc-500"
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    {entry.strike > 0 && (
                      <span className="rounded-md bg-green-500/15 px-2 py-1 font-bold text-green-400">
                        {entry.strike}S
                      </span>
                    )}
                    {entry.ball > 0 && (
                      <span className="rounded-md bg-yellow-500/15 px-2 py-1 font-bold text-yellow-400">
                        {entry.ball}B
                      </span>
                    )}
                    {entry.out > 0 && (
                      <span className="rounded-md bg-red-500/15 px-2 py-1 font-bold text-red-400">
                        {entry.out}O
                      </span>
                    )}
                    {entry.strike === 0 && entry.ball === 0 && (
                      <span className="rounded-md bg-zinc-800 px-2 py-1 font-bold text-zinc-500">
                        OUT
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rules */}
      {history.length === 0 && gameState === "playing" && (
        <div className="mt-2 flex flex-col gap-2 rounded-xl border border-card-border bg-card-bg/60 px-5 py-4">
          <p className="text-center font-mono text-[10px] uppercase tracking-wider text-zinc-600">
            게임 규칙
          </p>
          <div className="flex flex-col gap-1.5 font-mono text-xs text-zinc-500">
            <p>
              <span className="mr-2 inline-block rounded bg-green-500/15 px-1.5 py-0.5 text-green-400">S</span>
              스트라이크: 숫자와 위치 모두 정확
            </p>
            <p>
              <span className="mr-2 inline-block rounded bg-yellow-500/15 px-1.5 py-0.5 text-yellow-400">B</span>
              볼: 숫자는 맞지만 위치가 다름
            </p>
            <p>
              <span className="mr-2 inline-block rounded bg-red-500/15 px-1.5 py-0.5 text-red-400">O</span>
              아웃: 해당 숫자가 없음
            </p>
            <p className="mt-1 text-zinc-600">1~9 중 서로 다른 3자리를 {MAX_ATTEMPTS}번 안에 맞히세요!</p>
          </div>
        </div>
      )}

      <ScoreBoard
        gameId="baseball"
        currentScore={finalScore}
        unit="회"
        show={showRanking}
        onClose={() => {
          setShowRanking(false);
          initGame();
        }}
      />
    </div>
  );
}
