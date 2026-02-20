"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ScoreBoard from "../components/ScoreBoard";

const SENTENCES = [
  "The quick brown fox jumps over the lazy dog near the riverbank while the sun sets behind the mountains casting golden shadows across the meadow",
  "Programming is not about what you know but about what you can figure out when you sit down and start working through the problem step by step",
  "A good developer writes code that humans can understand and machines can execute efficiently without wasting resources or creating unnecessary complexity",
  "The best way to predict the future is to invent it yourself by building things that solve real problems for real people every single day",
  "In the middle of difficulty lies opportunity and those who embrace challenges often find the greatest rewards waiting on the other side",
  "Every expert was once a beginner who refused to give up and kept practicing their craft until they mastered it through dedication and hard work",
  "Software engineering is the art of balancing trade offs between performance readability maintainability and the ever changing requirements of the business",
  "The internet connects billions of people around the world enabling them to share knowledge collaborate on projects and build communities across borders",
  "Clean code reads like well written prose where every function tells a story and every variable name reveals its purpose without needing extra comments",
  "Debugging is twice as hard as writing the code in the first place so if you write the cleverest code you are not smart enough to debug it",
  "Technology is best when it brings people together and empowers them to create things that were previously impossible or extremely difficult to achieve alone",
  "Learning to code is like learning a new language where practice makes perfect and consistency matters more than occasional bursts of intense study sessions",
  "The most important skill for a developer is not knowing every framework but understanding the fundamentals that all frameworks are built upon",
  "Open source software has transformed the way we build applications by allowing developers to share their work and collaborate with people around the globe",
  "Great user interfaces are invisible because they feel so natural that users can focus entirely on their tasks without thinking about the tools they are using",
  "Artificial intelligence and machine learning are reshaping industries by automating repetitive tasks and uncovering patterns hidden within massive datasets",
  "Version control systems like git allow teams to work together on the same codebase without stepping on each other toes or losing important changes",
  "The command line is a powerful tool that every developer should learn because it provides direct access to the operating system and countless utilities",
  "Responsive web design ensures that websites look great on every device from tiny phone screens to ultra wide desktop monitors and everything in between",
  "Testing your code thoroughly before deployment saves countless hours of debugging in production and protects your users from encountering unexpected errors",
];

function getRandomSentence(exclude?: string): string {
  const pool = exclude ? SENTENCES.filter((s) => s !== exclude) : SENTENCES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function TypingPage() {
  const [sentence, setSentence] = useState("");
  const [input, setInput] = useState("");
  const [phase, setPhase] = useState<"idle" | "typing" | "done">("idle");
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [bestWpm, setBestWpm] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSentence(getRandomSentence());
    const saved = localStorage.getItem("typing-best");
    if (saved) setBestWpm(Number(saved));
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handleInput = useCallback(
    (value: string) => {
      if (phase === "done") return;

      if (phase === "idle" && value.length > 0) {
        setPhase("typing");
        startTimeRef.current = performance.now();
        timerRef.current = setInterval(() => {
          setElapsedMs(performance.now() - startTimeRef.current);
        }, 100);
      }

      setInput(value);

      if (value.length >= sentence.length) {
        clearTimer();
        const totalMs = performance.now() - startTimeRef.current;
        setElapsedMs(totalMs);

        const minutes = totalMs / 60000;
        const chars = sentence.length;
        const calculatedWpm = Math.round(chars / 5 / minutes);

        let correct = 0;
        for (let i = 0; i < sentence.length; i++) {
          if (value[i] === sentence[i]) correct++;
        }
        const acc = Math.round((correct / sentence.length) * 100);

        setWpm(calculatedWpm);
        setAccuracy(acc);
        setPhase("done");

        if (calculatedWpm > bestWpm) {
          setBestWpm(calculatedWpm);
          localStorage.setItem("typing-best", String(calculatedWpm));
        }
        setShowRanking(true);
      }
    },
    [phase, sentence, bestWpm, clearTimer],
  );

  const reset = useCallback(() => {
    clearTimer();
    setSentence((prev) => getRandomSentence(prev));
    setInput("");
    setPhase("idle");
    setWpm(0);
    setAccuracy(100);
    setElapsedMs(0);
    setShowRanking(false);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [clearTimer]);

  const formatTime = (ms: number) => {
    const s = Math.floor(ms / 1000);
    const tenths = Math.floor((ms % 1000) / 100);
    return `${s}.${tenths}s`;
  };

  const liveWpm =
    phase === "typing" && elapsedMs > 500
      ? Math.round(input.length / 5 / (elapsedMs / 60000))
      : 0;

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              타이핑 레이서
            </span>
            <span className="ml-2">⌨️</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            문장을 빠르고 정확하게 입력하세요!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Best
            </span>
            <span className="font-mono text-lg font-bold text-gold">
              {bestWpm ? `${bestWpm}` : "-"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              WPM
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {phase === "done" ? wpm : liveWpm || "-"}
            </span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              시간
            </span>
            <span className="font-mono text-lg font-bold text-white">
              {elapsedMs > 0 ? formatTime(elapsedMs) : "-"}
            </span>
          </div>
          {phase === "done" && (
            <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
                정확도
              </span>
              <span
                className={`font-mono text-lg font-bold ${accuracy >= 95 ? "text-green-400" : accuracy >= 80 ? "text-yellow-400" : "text-red-400"}`}
              >
                {accuracy}%
              </span>
            </div>
          )}
        </div>

        {/* Sentence display */}
        <div className="mb-4 w-full max-w-2xl rounded-2xl border border-card-border bg-card-bg/80 p-5 backdrop-blur-sm">
          <p className="font-mono text-sm leading-7 tracking-wide wrap-break-word">
            {sentence.split("").map((char, i) => {
              let color = "text-zinc-600";
              if (i < input.length) {
                color =
                  input[i] === char ? "text-green-400" : "text-red-400 underline";
              }
              return (
                <span
                  key={i}
                  className={`${color} ${i === input.length ? "border-b-2 border-cyan-400" : ""}`}
                >
                  {char}
                </span>
              );
            })}
          </p>
        </div>

        {/* Progress bar */}
        <div className="mb-4 h-1.5 w-full max-w-2xl overflow-hidden rounded-full bg-zinc-800/50">
          <div
            className="h-full rounded-full bg-linear-to-r from-cyan-400 to-blue-400 transition-all duration-150"
            style={{
              width: `${sentence.length > 0 ? (input.length / sentence.length) * 100 : 0}%`,
            }}
          />
        </div>

        {/* Input field */}
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          disabled={phase === "done"}
          autoFocus
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          placeholder={phase === "idle" ? "여기에 입력을 시작하세요..." : ""}
          className="mb-6 w-full max-w-2xl rounded-xl border border-card-border bg-card-bg/60 px-5 py-3.5 font-mono text-sm text-white outline-none transition-all placeholder:text-zinc-600 focus:border-cyan-500/40 focus:shadow-[0_0_20px_-5px_rgba(34,211,238,0.2)] disabled:opacity-50"
        />

        {/* Result & action */}
        {phase === "done" && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <div className="text-center">
              <p className="font-mono text-3xl font-black text-white">
                {wpm}{" "}
                <span className="text-base font-normal text-zinc-500">WPM</span>
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-500">
                정확도 {accuracy}% · {formatTime(elapsedMs)}
              </p>
              <p className="mt-1 font-mono text-xs text-zinc-400">
                {wpm >= 80
                  ? "프로 타이피스트! 🔥"
                  : wpm >= 60
                    ? "빠르네요! 👏"
                    : wpm >= 40
                      ? "괜찮아요! 💪"
                      : "연습하면 빨라져요! 📝"}
              </p>
            </div>
          </div>
        )}

        <button
          onClick={reset}
          className="rounded-xl border border-card-border bg-card-bg px-6 py-2.5 font-mono text-xs text-zinc-400 transition-all hover:border-zinc-600 hover:text-zinc-200"
        >
          다시 시작
        </button>

        <ScoreBoard
          gameId="typing"
          currentScore={wpm}
          unit="WPM"
          show={showRanking}
          onClose={() => {
            setShowRanking(false);
            reset();
          }}
        />
      </main>
    </div>
  );
}
