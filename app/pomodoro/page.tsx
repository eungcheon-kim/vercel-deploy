"use client";

import { useState, useEffect, useRef, useCallback } from "react";

/* ── 타입 ── */

type TimerMode = "focus" | "shortBreak" | "longBreak";

interface Settings {
  focus: number;
  shortBreak: number;
  longBreak: number;
}

const DEFAULT_SETTINGS: Settings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: "집중 시간",
  shortBreak: "짧은 휴식",
  longBreak: "긴 휴식",
};

/* ── 알림음 (Web Audio API) ── */

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = "sine";
    osc.frequency.setValueAtTime(880, ctx.currentTime);
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.8);

    setTimeout(() => {
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(1100, ctx.currentTime);
      gain2.gain.setValueAtTime(0.3, ctx.currentTime);
      gain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc2.start(ctx.currentTime);
      osc2.stop(ctx.currentTime + 0.6);

      setTimeout(() => ctx.close(), 1000);
    }, 300);
  } catch {
    /* audio not supported */
  }
}

/* ── 시간 포맷 ── */

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
}

/* ── SVG 원형 프로그레스 ── */

const CIRCLE_SIZE = 260;
const STROKE_WIDTH = 8;
const RADIUS = (CIRCLE_SIZE - STROKE_WIDTH) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

function CircleProgress({
  progress,
  mode,
}: {
  progress: number;
  mode: TimerMode;
}) {
  const offset = CIRCUMFERENCE * (1 - progress);
  const isFocus = mode === "focus";

  return (
    <svg
      width={CIRCLE_SIZE}
      height={CIRCLE_SIZE}
      className="drop-shadow-lg"
      style={{ filter: `drop-shadow(0 0 20px ${isFocus ? "rgba(239,68,68,0.15)" : "rgba(16,185,129,0.15)"})` }}
    >
      <circle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth={STROKE_WIDTH}
      />
      <circle
        cx={CIRCLE_SIZE / 2}
        cy={CIRCLE_SIZE / 2}
        r={RADIUS}
        fill="none"
        stroke={`url(#gradient-${mode})`}
        strokeWidth={STROKE_WIDTH}
        strokeLinecap="round"
        strokeDasharray={CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${CIRCLE_SIZE / 2} ${CIRCLE_SIZE / 2})`}
        className="transition-[stroke-dashoffset] duration-1000 ease-linear"
      />
      <defs>
        <linearGradient id="gradient-focus" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ef4444" />
          <stop offset="100%" stopColor="#f97316" />
        </linearGradient>
        <linearGradient id="gradient-shortBreak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
        <linearGradient id="gradient-longBreak" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── 설정 패널 ── */

function SettingsPanel({
  settings,
  onChange,
  onClose,
}: {
  settings: Settings;
  onChange: (s: Settings) => void;
  onClose: () => void;
}) {
  const [local, setLocal] = useState(settings);

  const fields: { key: keyof Settings; label: string; min: number; max: number }[] = [
    { key: "focus", label: "집중 시간 (분)", min: 1, max: 90 },
    { key: "shortBreak", label: "짧은 휴식 (분)", min: 1, max: 30 },
    { key: "longBreak", label: "긴 휴식 (분)", min: 1, max: 60 },
  ];

  return (
    <div className="anim-fade-scale w-full max-w-xs rounded-2xl border border-card-border bg-card-bg p-5">
      <h3 className="mb-4 text-center font-mono text-sm font-semibold text-zinc-300">
        ⚙️ 타이머 설정
      </h3>
      <div className="flex flex-col gap-4">
        {fields.map(({ key, label, min, max }) => (
          <label key={key} className="flex flex-col gap-1.5">
            <span className="font-mono text-xs text-zinc-500">{label}</span>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={min}
                max={max}
                value={local[key]}
                onChange={(e) =>
                  setLocal((prev) => ({ ...prev, [key]: Number(e.target.value) }))
                }
                className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-zinc-800 accent-accent
                  [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4
                  [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full
                  [&::-webkit-slider-thumb]:bg-accent [&::-webkit-slider-thumb]:shadow-md"
              />
              <span className="w-10 text-right font-mono text-sm font-bold text-zinc-200">
                {local[key]}
              </span>
            </div>
          </label>
        ))}
      </div>
      <div className="mt-5 flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 rounded-xl border border-card-border px-4 py-2 font-mono text-xs text-zinc-500 transition-colors hover:border-zinc-600 hover:text-zinc-300"
        >
          취소
        </button>
        <button
          onClick={() => {
            onChange(local);
            onClose();
          }}
          className="flex-1 rounded-xl bg-accent/20 px-4 py-2 font-mono text-xs font-semibold text-accent-2 transition-colors hover:bg-accent/30"
        >
          적용
        </button>
      </div>
    </div>
  );
}

/* ── 메인 페이지 ── */

export default function PomodoroPage() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [timeLeft, setTimeLeft] = useState(DEFAULT_SETTINGS.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [showSettings, setShowSettings] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const originalTitle = useRef("뽀모도로 타이머 | Dev Playground");

  const totalTime = settings[mode === "focus" ? "focus" : mode === "shortBreak" ? "shortBreak" : "longBreak"] * 60;
  const progress = totalTime > 0 ? timeLeft / totalTime : 0;

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const switchMode = useCallback(
    (nextMode: TimerMode) => {
      clearTimer();
      setIsRunning(false);
      setMode(nextMode);
      const duration =
        nextMode === "focus"
          ? settings.focus
          : nextMode === "shortBreak"
            ? settings.shortBreak
            : settings.longBreak;
      setTimeLeft(duration * 60);
    },
    [clearTimer, settings],
  );

  const handleTimerEnd = useCallback(() => {
    playBeep();
    if (mode === "focus") {
      const newCount = completedPomodoros + 1;
      setCompletedPomodoros(newCount);
      const nextMode = newCount % 4 === 0 ? "longBreak" : "shortBreak";
      switchMode(nextMode);
    } else {
      switchMode("focus");
    }
  }, [mode, completedPomodoros, switchMode]);

  useEffect(() => {
    if (!isRunning) {
      clearTimer();
      return;
    }

    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearTimer();
          setIsRunning(false);
          setTimeout(handleTimerEnd, 0);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return clearTimer;
  }, [isRunning, clearTimer, handleTimerEnd]);

  useEffect(() => {
    if (isRunning) {
      document.title = `${formatTime(timeLeft)} - ${MODE_LABELS[mode]}`;
    } else {
      document.title = originalTitle.current;
    }
    return () => {
      document.title = originalTitle.current;
    };
  }, [timeLeft, isRunning, mode]);

  const handleStartPause = () => setIsRunning((prev) => !prev);

  const handleReset = () => {
    clearTimer();
    setIsRunning(false);
    const duration =
      mode === "focus"
        ? settings.focus
        : mode === "shortBreak"
          ? settings.shortBreak
          : settings.longBreak;
    setTimeLeft(duration * 60);
  };

  const handleSettingsChange = (newSettings: Settings) => {
    setSettings(newSettings);
    if (!isRunning) {
      const duration =
        mode === "focus"
          ? newSettings.focus
          : mode === "shortBreak"
            ? newSettings.shortBreak
            : newSettings.longBreak;
      setTimeLeft(duration * 60);
    }
  };

  const isFocus = mode === "focus";

  const modeTabClass = (m: TimerMode) =>
    `rounded-xl px-4 py-2 font-mono text-xs font-medium transition-all ${
      mode === m
        ? m === "focus"
          ? "bg-red-500/15 text-red-400 border border-red-500/30"
          : "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
        : "border border-transparent text-zinc-600 hover:text-zinc-400"
    }`;

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="anim-fade-up text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
              뽀모도로 타이머
            </span>
            <span className="ml-2">🍅</span>
          </h2>
          <p
            className="anim-fade-up mt-2 font-mono text-xs text-zinc-500"
            style={{ animationDelay: "0.1s" }}
          >
            25분 집중, 5분 휴식으로 생산성을 높이세요
          </p>
        </div>

        {/* Mode Tabs */}
        <div
          className="anim-fade-up mb-8 flex gap-2 rounded-2xl border border-card-border bg-card-bg p-1.5"
          style={{ animationDelay: "0.15s" }}
        >
          <button onClick={() => !isRunning && switchMode("focus")} className={modeTabClass("focus")}>
            🎯 집중
          </button>
          <button onClick={() => !isRunning && switchMode("shortBreak")} className={modeTabClass("shortBreak")}>
            ☕ 짧은 휴식
          </button>
          <button onClick={() => !isRunning && switchMode("longBreak")} className={modeTabClass("longBreak")}>
            🌿 긴 휴식
          </button>
        </div>

        {/* Timer Circle */}
        <div
          className="anim-fade-up relative mb-8 flex items-center justify-center"
          style={{ animationDelay: "0.2s" }}
        >
          <CircleProgress progress={progress} mode={mode} />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`font-mono text-5xl font-bold tracking-widest ${
                isFocus ? "text-zinc-100" : "text-emerald-100"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
            <span
              className={`mt-2 font-mono text-xs font-medium ${
                isFocus ? "text-red-400/70" : "text-emerald-400/70"
              }`}
            >
              {MODE_LABELS[mode]}
            </span>
          </div>
        </div>

        {/* Controls */}
        <div
          className="anim-fade-up mb-8 flex items-center gap-3"
          style={{ animationDelay: "0.25s" }}
        >
          <button
            onClick={handleReset}
            className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-card-bg text-zinc-500 transition-all hover:border-zinc-600 hover:text-zinc-300"
            title="리셋"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
          </button>

          <button
            onClick={handleStartPause}
            className={`flex h-14 items-center gap-2 rounded-2xl px-8 font-mono text-sm font-bold transition-all ${
              isRunning
                ? "border border-zinc-600 bg-zinc-800/80 text-zinc-300 hover:bg-zinc-700/80"
                : isFocus
                  ? "bg-linear-to-r from-red-500 to-orange-500 text-white shadow-lg shadow-red-500/20 hover:shadow-red-500/30"
                  : "bg-linear-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30"
            }`}
          >
            {isRunning ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
                일시정지
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3" />
                </svg>
                시작
              </>
            )}
          </button>

          <button
            onClick={() => !isRunning && setShowSettings((prev) => !prev)}
            className={`flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-card-bg transition-all ${
              isRunning
                ? "cursor-not-allowed text-zinc-700"
                : "text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
            }`}
            title="설정"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-8">
            <SettingsPanel
              settings={settings}
              onChange={handleSettingsChange}
              onClose={() => setShowSettings(false)}
            />
          </div>
        )}

        {/* Completed Pomodoros */}
        <div
          className="anim-fade-up w-full max-w-xs rounded-2xl border border-card-border bg-card-bg p-4 text-center"
          style={{ animationDelay: "0.3s" }}
        >
          <p className="mb-2 font-mono text-xs text-zinc-500">완료한 뽀모도로</p>
          <div className="flex items-center justify-center gap-1 text-2xl">
            {completedPomodoros === 0 ? (
              <span className="font-mono text-sm text-zinc-700">아직 없어요</span>
            ) : (
              Array.from({ length: completedPomodoros }, (_, i) => (
                <span key={i} className="inline-block animate-bounce" style={{ animationDelay: `${i * 0.1}s`, animationDuration: "2s" }}>
                  🍅
                </span>
              ))
            )}
          </div>
          {completedPomodoros > 0 && (
            <p className="mt-2 font-mono text-xs text-zinc-600">
              {completedPomodoros}회 완료 · 총 {completedPomodoros * settings.focus}분 집중
            </p>
          )}
        </div>

        {/* Cycle Info */}
        <div
          className="anim-fade-up mt-4 flex items-center gap-3 font-mono text-[10px] text-zinc-600"
          style={{ animationDelay: "0.35s" }}
        >
          <span>현재 사이클</span>
          <div className="flex gap-1">
            {Array.from({ length: 4 }, (_, i) => (
              <div
                key={i}
                className={`h-1.5 w-6 rounded-full transition-colors ${
                  i < completedPomodoros % 4
                    ? "bg-red-500/60"
                    : "bg-zinc-800"
                }`}
              />
            ))}
          </div>
          <span>4번째마다 긴 휴식</span>
        </div>
      </main>
    </div>
  );
}
