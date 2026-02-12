"use client";

import { useState, useCallback, useEffect, useRef, useMemo } from "react";
import { generateFortune, type Fortune, RARITY_CONFIG, type Rarity } from "../data/fortunes";
import GachaCard from "./GachaCard";

/**
 * Phase flow:
 * idle     → 버튼 눌러서 시작
 * tapping  → 수정구슬 연타! 클릭할수록 금이 가고 빛이 새어나옴 (10회 클릭)
 * explode  → 마지막 클릭에 폭발 + 화면 플래시 + 슬롯 릴
 * reveal   → 카드 등장
 */
type Phase = "idle" | "tapping" | "explode" | "reveal";

const MAX_TAPS = 10;

// ===== Rarity colors =====
const RARITY_COLORS: Record<Rarity, { primary: string; glow: string }> = {
  SSS: { primary: "#fbbf24", glow: "rgba(251,191,36,0.6)" },
  SS: { primary: "#ec4899", glow: "rgba(236,72,153,0.6)" },
  S: { primary: "#8b5cf6", glow: "rgba(139,92,246,0.6)" },
  A: { primary: "#3b82f6", glow: "rgba(59,130,246,0.5)" },
  B: { primary: "#22c55e", glow: "rgba(34,197,94,0.4)" },
  C: { primary: "#a1a1aa", glow: "rgba(161,161,170,0.3)" },
};

// ===== Progressive crack SVG lines =====
// Each array = lines that appear at that tap level (cumulative)
const CRACK_STAGES: { x1: number; y1: number; x2: number; y2: number; w: number }[][] = [
  // Tap 1-2: tiny hairline
  [{ x1: 100, y1: 100, x2: 85, y2: 75, w: 1 }],
  [{ x1: 100, y1: 100, x2: 120, y2: 80, w: 1 }],
  // Tap 3-4: spreading
  [
    { x1: 85, y1: 75, x2: 55, y2: 45, w: 1.2 },
    { x1: 100, y1: 100, x2: 70, y2: 110, w: 1 },
  ],
  [
    { x1: 120, y1: 80, x2: 155, y2: 50, w: 1.2 },
    { x1: 100, y1: 100, x2: 130, y2: 130, w: 1 },
  ],
  // Tap 5-6: branching
  [
    { x1: 55, y1: 45, x2: 30, y2: 25, w: 1.5 },
    { x1: 55, y1: 45, x2: 35, y2: 60, w: 1 },
    { x1: 100, y1: 100, x2: 100, y2: 55, w: 1.3 },
  ],
  [
    { x1: 155, y1: 50, x2: 175, y2: 30, w: 1.5 },
    { x1: 155, y1: 50, x2: 170, y2: 65, w: 1 },
    { x1: 130, y1: 130, x2: 160, y2: 155, w: 1.3 },
  ],
  // Tap 7-8: major fractures
  [
    { x1: 70, y1: 110, x2: 35, y2: 140, w: 1.8 },
    { x1: 35, y1: 140, x2: 20, y2: 170, w: 1.5 },
    { x1: 100, y1: 55, x2: 80, y2: 25, w: 1.5 },
  ],
  [
    { x1: 130, y1: 130, x2: 165, y2: 170, w: 1.8 },
    { x1: 100, y1: 100, x2: 100, y2: 160, w: 1.5 },
    { x1: 175, y1: 30, x2: 185, y2: 15, w: 1.3 },
  ],
  // Tap 9-10: about to shatter
  [
    { x1: 30, y1: 25, x2: 15, y2: 10, w: 2 },
    { x1: 20, y1: 170, x2: 10, y2: 190, w: 2 },
    { x1: 80, y1: 25, x2: 65, y2: 10, w: 1.5 },
    { x1: 35, y1: 60, x2: 15, y2: 55, w: 1.2 },
  ],
  [
    { x1: 185, y1: 15, x2: 195, y2: 5, w: 2 },
    { x1: 165, y1: 170, x2: 185, y2: 190, w: 2 },
    { x1: 170, y1: 65, x2: 190, y2: 70, w: 1.5 },
    { x1: 100, y1: 160, x2: 100, y2: 190, w: 1.8 },
  ],
];

// ===== CrackLines: renders all cracks up to current tap level =====
function CrackOverlay({ tapCount, color }: { tapCount: number; color: string }) {
  const allLines = useMemo(() => {
    const lines: { x1: number; y1: number; x2: number; y2: number; w: number; stage: number }[] = [];
    for (let s = 0; s < Math.min(tapCount, CRACK_STAGES.length); s++) {
      for (const l of CRACK_STAGES[s]) {
        lines.push({ ...l, stage: s });
      }
    }
    return lines;
  }, [tapCount]);

  return (
    <svg
      className="pointer-events-none absolute inset-0 h-full w-full"
      viewBox="0 0 200 200"
    >
      {allLines.map((l, i) => (
        <line
          key={i}
          x1={l.x1} y1={l.y1} x2={l.x2} y2={l.y2}
          stroke={color}
          strokeWidth={l.w}
          opacity={0.5 + (l.stage / MAX_TAPS) * 0.5}
          strokeLinecap="round"
        />
      ))}
    </svg>
  );
}

// ===== Impact sparks flying from tap point =====
function TapSparks({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 8 }).map((_, i) => {
        const angle = (i / 8) * 360 + Math.random() * 20;
        const dist = 30 + Math.random() * 40;
        const dx = Math.cos((angle * Math.PI) / 180) * dist;
        const dy = Math.sin((angle * Math.PI) / 180) * dist;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
            style={{
              backgroundColor: color,
              boxShadow: `0 0 6px ${color}`,
              animation: `sparkle-burst 0.4s ease-out forwards`,
              transform: `translate(${dx}px, ${dy}px)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ===== Orbiting energy particles (appears at high crack levels) =====
function OrbitParticles({ color, count }: { color: string; count: number }) {
  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute left-1/2 top-1/2 -ml-1 -mt-1"
          style={{
            animation: `orbit ${1 + i * 0.2}s linear infinite`,
            animationDelay: `${i * 0.12}s`,
          }}
        >
          <div
            className="h-2 w-2 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 8px ${color}`,
              opacity: 0.8,
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ===== Shatter Pieces =====
function ShatterPieces({ color }: { color: string }) {
  const pieces = [
    { cls: "top-0 left-0 w-1/2 h-1/2", anim: "shatter-1", radius: "rounded-tl-full" },
    { cls: "top-0 right-0 w-1/2 h-1/2", anim: "shatter-2", radius: "rounded-tr-full" },
    { cls: "bottom-0 left-0 w-1/2 h-1/2", anim: "shatter-3", radius: "rounded-bl-full" },
    { cls: "bottom-0 right-0 w-1/2 h-1/2", anim: "shatter-4", radius: "rounded-br-full" },
    { cls: "top-1/4 left-1/4 w-1/4 h-1/2", anim: "shatter-5", radius: "rounded-lg" },
    { cls: "top-1/4 right-1/4 w-1/4 h-1/2", anim: "shatter-6", radius: "rounded-lg" },
  ];

  return (
    <div className="pointer-events-none absolute inset-0">
      {pieces.map((p, i) => (
        <div
          key={i}
          className={`absolute ${p.cls} ${p.radius}`}
          style={{
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            border: `1px solid ${color}40`,
            animation: `${p.anim} 0.7s ease-out forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Burst Rays =====
function BurstRays({ color }: { color: string }) {
  return (
    <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
      {Array.from({ length: 16 }).map((_, i) => (
        <div
          key={i}
          className="absolute origin-bottom"
          style={{
            width: "3px",
            height: "140px",
            background: `linear-gradient(to top, ${color}, transparent)`,
            transform: `rotate(${i * 22.5}deg)`,
            transformOrigin: "bottom center",
            animation: `burst-ray 0.8s ease-out ${i * 0.02}s forwards`,
          }}
        />
      ))}
    </div>
  );
}

// ===== Explosion Particles =====
function ExplosionParticles({ rarity }: { rarity: Rarity }) {
  const colors = useMemo(() => {
    const map: Record<string, string[]> = {
      SSS: ["#fbbf24", "#f59e0b", "#fde68a", "#fffbeb", "#fbbf24", "#eab308"],
      SS: ["#ec4899", "#f472b6", "#f9a8d4", "#fce7f3", "#db2777", "#be185d"],
      S: ["#8b5cf6", "#a78bfa", "#c4b5fd", "#ede9fe", "#7c3aed", "#6d28d9"],
      A: ["#3b82f6", "#60a5fa", "#93c5fd", "#dbeafe", "#2563eb", "#1d4ed8"],
      B: ["#22c55e", "#4ade80", "#86efac", "#dcfce7", "#16a34a", "#15803d"],
      C: ["#a1a1aa", "#d4d4d8", "#e4e4e7", "#f4f4f5", "#71717a", "#52525b"],
    };
    return map[rarity] || map.C;
  }, [rarity]);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 50 }).map((_, i) => {
        const angle = (i / 50) * 360;
        const distance = 50 + Math.random() * 160;
        const dx = Math.cos((angle * Math.PI) / 180) * distance;
        const dy = Math.sin((angle * Math.PI) / 180) * distance;
        const size = 3 + Math.random() * 8;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2 rounded-full"
            style={{
              width: `${size}px`,
              height: `${size}px`,
              marginLeft: `-${size / 2}px`,
              marginTop: `-${size / 2}px`,
              backgroundColor: colors[i % colors.length],
              boxShadow: `0 0 ${size}px ${colors[i % colors.length]}`,
              animation: `sparkle-burst ${0.5 + Math.random() * 0.8}s ease-out ${Math.random() * 0.15}s forwards`,
              transform: `translate(${dx}px, ${dy}px) scale(0)`,
            }}
          />
        );
      })}
    </div>
  );
}

// ===== Slot Reel =====
function RaritySlotReel({ finalRarity, onDone }: { finalRarity: Rarity; onDone: () => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [stopped, setStopped] = useState(false);
  const rarities: Rarity[] = ["C", "B", "A", "S", "SS", "SSS"];
  const countRef = useRef(0);

  useEffect(() => {
    if (stopped) return;
    const totalSpins = 22;
    const finalIdx = rarities.indexOf(finalRarity);

    const tick = () => {
      countRef.current++;
      const c = countRef.current;
      setCurrentIndex(c % rarities.length);

      if (c >= totalSpins) {
        setCurrentIndex(finalIdx);
        setStopped(true);
        setTimeout(onDone, 500);
        return;
      }
      // Gradually slow down
      setTimeout(tick, 50 + c * 5);
    };
    setTimeout(tick, 50);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const r = rarities[currentIndex];
  const config = RARITY_CONFIG[r];

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`rounded-xl border-2 px-8 py-3 font-mono text-2xl font-black tracking-widest transition-all duration-75 ${
          stopped ? `${config.border} ${config.color} scale-110` : "border-zinc-700 text-zinc-400"
        }`}
        style={stopped ? { textShadow: `0 0 20px ${RARITY_COLORS[r].glow}` } : {}}
      >
        {config.label}
      </div>
      {!stopped && (
        <div className="flex gap-1">
          {[0, 1, 2].map((j) => (
            <div
              key={j}
              className="h-1 w-6 animate-pulse rounded-full bg-accent/50"
              style={{ animationDelay: `${j * 0.15}s` }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ===== MAIN =====
export default function GachaMachine() {
  const [phase, setPhase] = useState<Phase>("idle");
  const [fortune, setFortune] = useState<Fortune | null>(null);
  const [todayStr, setTodayStr] = useState("");
  const [tapCount, setTapCount] = useState(0);
  const [hitKey, setHitKey] = useState(0); // to re-trigger hit animation
  const [showSlot, setShowSlot] = useState(false);
  const [showCard, setShowCard] = useState(false);
  const [showSparks, setShowSparks] = useState(false);

  useEffect(() => {
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    setTodayStr(dateStr);
  }, []);

  // Start tapping phase
  const handleStart = useCallback(() => {
    if (phase !== "idle" || !todayStr) return;
    setPhase("tapping");
    setTapCount(0);
  }, [phase, todayStr]);

  // Each tap on the orb
  const handleTap = useCallback(() => {
    if (phase !== "tapping") return;

    const next = tapCount + 1;
    setTapCount(next);
    setHitKey((k) => k + 1);

    // Show sparks
    setShowSparks(true);
    setTimeout(() => setShowSparks(false), 400);

    // Final tap → explode!
    if (next >= MAX_TAPS) {
      const f = generateFortune(todayStr);
      setFortune(f);

      setTimeout(() => {
        setPhase("explode");
        setTimeout(() => setShowSlot(true), 700);
      }, 200);
    }
  }, [phase, tapCount, todayStr]);

  const handleSlotDone = useCallback(() => {
    setTimeout(() => {
      setPhase("reveal");
      setTimeout(() => setShowCard(true), 100);
    }, 300);
  }, []);

  const handleReset = useCallback(() => {
    setFortune(null);
    setPhase("idle");
    setTapCount(0);
    setHitKey(0);
    setShowSlot(false);
    setShowCard(false);
    setShowSparks(false);
  }, []);

  const rarityColor = fortune ? RARITY_COLORS[fortune.rarity] : RARITY_COLORS.S;
  // Progress-based color interpolation
  const progress = tapCount / MAX_TAPS;
  const glowIntensity = progress;
  const shakeIntensity = Math.min(progress * 8, 6);

  return (
    <div className="relative flex min-h-[520px] flex-col items-center justify-center gap-8">

      {/* ========== IDLE ========== */}
      {phase === "idle" && (
        <div className="anim-fade-scale flex flex-col items-center gap-10">
          <div className="relative">
            <div className="capsule-float capsule-idle-glow flex h-44 w-44 items-center justify-center rounded-full border border-card-border bg-gradient-to-b from-card-bg to-[#0a0a16]">
              <span className="text-7xl select-none">🔮</span>
            </div>
            <div className="absolute -inset-4 rounded-full border border-accent/10 animate-pulse" />
            <div className="absolute -inset-8 rounded-full border border-accent/5" />
          </div>

          <button
            onClick={handleStart}
            className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-accent-2 px-10 py-4 font-bold text-white transition-all duration-300 hover:scale-105 hover:shadow-[0_0_50px_-8px_rgba(139,92,246,0.6)] active:scale-95"
          >
            <span className="relative z-10 flex items-center gap-2 text-lg">
              <span>오늘의 운세 뽑기</span>
              <span className="transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">✨</span>
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
          </button>

          <p className="font-mono text-xs text-zinc-600">
            매일 1회 · 날짜별 고유 운세 · {todayStr}
          </p>
        </div>
      )}

      {/* ========== TAPPING ========== */}
      {phase === "tapping" && (
        <div className="flex flex-col items-center gap-6">
          {/* Tap prompt */}
          <p className="anim-fade-up font-mono text-sm text-zinc-400">
            🔮 수정구슬을 터치해서 깨뜨리세요!
          </p>

          {/* The Orb - tappable */}
          <div className="relative">
            {/* Glow background based on progress */}
            <div
              className="absolute -inset-6 rounded-full transition-all duration-300"
              style={{
                background: `radial-gradient(circle, rgba(139,92,246,${glowIntensity * 0.4}), transparent 70%)`,
                filter: `blur(${20 + glowIntensity * 20}px)`,
              }}
            />

            {/* Orbiting particles (appear after tap 5) */}
            {tapCount >= 5 && (
              <OrbitParticles
                color={tapCount >= 8 ? "#c084fc" : "#8b5cf6"}
                count={Math.min(tapCount - 4, 6)}
              />
            )}

            {/* Energy rings (appear after tap 7) */}
            {tapCount >= 7 && (
              <>
                <div
                  className="pointer-events-none absolute -inset-2 rounded-full border-2 border-accent/40"
                  style={{ animation: "energy-ring 0.8s ease-out infinite" }}
                />
                <div
                  className="pointer-events-none absolute -inset-2 rounded-full border-2 border-accent-2/30"
                  style={{ animation: "energy-ring 0.8s ease-out 0.4s infinite" }}
                />
              </>
            )}

            {/* Orb itself */}
            <button
              key={hitKey}
              onClick={handleTap}
              className="hit-impact relative flex h-44 w-44 cursor-pointer items-center justify-center rounded-full border-2 bg-gradient-to-b from-card-bg to-[#0a0a16] transition-colors duration-200 active:scale-95"
              style={{
                borderColor: `rgba(139, 92, 246, ${0.2 + glowIntensity * 0.6})`,
                boxShadow: `
                  0 0 ${20 + glowIntensity * 60}px rgba(139,92,246,${glowIntensity * 0.4}),
                  0 0 ${40 + glowIntensity * 100}px rgba(139,92,246,${glowIntensity * 0.2}),
                  inset 0 0 ${glowIntensity * 30}px rgba(139,92,246,${glowIntensity * 0.15})
                `,
                animation: tapCount >= 6
                  ? `rumble ${Math.max(0.15, 0.4 - progress * 0.25)}s ease-in-out infinite, hit-impact 0.35s ease-out`
                  : "hit-impact 0.35s ease-out",
              }}
            >
              {/* Crack overlay */}
              <CrackOverlay
                tapCount={tapCount}
                color={`rgba(139, 92, 246, ${0.5 + glowIntensity * 0.5})`}
              />

              {/* Light leaking through cracks */}
              {tapCount >= 4 && (
                <div
                  className="pointer-events-none absolute inset-0 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(192,132,252,${glowIntensity * 0.3}), transparent 60%)`,
                    mixBlendMode: "screen",
                  }}
                />
              )}

              {/* Emoji */}
              <span
                className="relative z-10 text-7xl select-none transition-all duration-200"
                style={{
                  filter: `brightness(${1 + glowIntensity * 0.8})`,
                  transform: `scale(${1 - progress * 0.05})`,
                }}
              >
                🔮
              </span>

              {/* Hit flash overlay */}
              <div
                className="pointer-events-none absolute inset-0 rounded-full bg-white"
                style={{
                  animation: "hit-flash 0.2s ease-out forwards",
                  opacity: 0,
                }}
                key={`flash-${hitKey}`}
              />
            </button>

            {/* Tap sparks */}
            {showSparks && <TapSparks color="#c084fc" />}
          </div>

          {/* Progress bar */}
          <div className="flex w-56 flex-col items-center gap-2">
            <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2 transition-all duration-200"
                style={{
                  width: `${progress * 100}%`,
                  animation: tapCount > 0 ? "progress-glow 1s ease-in-out infinite" : "none",
                }}
              />
            </div>
            <div className="flex w-full items-center justify-between font-mono text-xs">
              <span className="text-zinc-600">{tapCount}/{MAX_TAPS}</span>
              <span
                className="transition-colors duration-300"
                style={{
                  color: progress < 0.3
                    ? "#71717a"
                    : progress < 0.6
                    ? "#8b5cf6"
                    : progress < 0.9
                    ? "#c084fc"
                    : "#fbbf24",
                }}
              >
                {progress < 0.3
                  ? "금이 가기 시작했다..."
                  : progress < 0.6
                  ? "균열이 퍼지고 있다!"
                  : progress < 0.9
                  ? "곧 깨진다...!"
                  : "마지막 한 방!!! 💥"}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ========== EXPLODE ========== */}
      {phase === "explode" && (
        <>
          {/* Screen flash */}
          <div
            className="screen-flash"
            style={{
              background: `radial-gradient(circle, ${rarityColor.glow}, white 20%, transparent 70%)`,
            }}
          />

          <div className="flex flex-col items-center gap-8">
            {/* Shatter + burst + particles */}
            <div className="relative h-44 w-44">
              <ShatterPieces color={rarityColor.primary} />
              <BurstRays color={rarityColor.primary} />
              {fortune && <ExplosionParticles rarity={fortune.rarity} />}
              <div
                className="explosion-ring absolute inset-0 rounded-full border-2"
                style={{ borderColor: rarityColor.primary }}
              />
              <div
                className="explosion-ring absolute inset-0 rounded-full border"
                style={{ borderColor: rarityColor.primary, animationDelay: "0.15s" }}
              />
            </div>

            {/* Slot reel */}
            {showSlot && fortune && (
              <div className="anim-fade-scale">
                <RaritySlotReel finalRarity={fortune.rarity} onDone={handleSlotDone} />
              </div>
            )}
          </div>
        </>
      )}

      {/* ========== REVEAL ========== */}
      {phase === "reveal" && fortune && (
        <div className="relative flex flex-col items-center gap-6">
          <ExplosionParticles rarity={fortune.rarity} />

          <div
            className={`rarity-slam font-mono text-lg font-black tracking-[0.3em] ${RARITY_CONFIG[fortune.rarity].color}`}
            style={{ textShadow: `0 0 30px ${rarityColor.glow}` }}
          >
            ★ {RARITY_CONFIG[fortune.rarity].label} ★
          </div>

          {showCard && <GachaCard fortune={fortune} />}

          <div className="anim-fade-up flex gap-3" style={{ animationDelay: "1.5s" }}>
            <button
              onClick={handleReset}
              className="rounded-xl border border-card-border bg-card-bg px-6 py-2.5 font-mono text-sm text-zinc-400 transition-all hover:border-accent/30 hover:text-zinc-200"
            >
              다시 보기
            </button>
            <button
              onClick={() => {
                const text = `🎰 오늘의 개발자 운세\n\n${RARITY_CONFIG[fortune.rarity].label} - ${fortune.title}\n"${fortune.message}"\n\n행운 아이템: ${fortune.luckyItem}`;
                navigator.clipboard.writeText(text);
              }}
              className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-6 py-2.5 font-mono text-sm text-accent-2 transition-all hover:bg-accent/20 hover:text-white"
            >
              📋 복사하기
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
