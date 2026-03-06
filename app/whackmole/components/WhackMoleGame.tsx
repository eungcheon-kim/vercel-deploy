"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const GRID_SIZE = 3;
const HOLES = GRID_SIZE * GRID_SIZE;
const GAME_DURATION = 30;
const MOLE_BASE_DURATION = 1200;
const MOLE_MIN_DURATION = 500;
const SPAWN_BASE_INTERVAL = 900;
const SPAWN_MIN_INTERVAL = 400;
const MAX_ACTIVE_MOLES = 3;
const LS_BEST = "whackmole-best";

type GameState = "idle" | "playing" | "ended";

interface Mole {
  id: number;
  holeIndex: number;
  spawnedAt: number;
  duration: number;
  whacked: boolean;
}

export default function WhackMoleGame() {
  const [gameState, setGameState] = useState<GameState>("idle");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_DURATION);
  const [best, setBest] = useState(0);
  const [moles, setMoles] = useState<Mole[]>([]);
  const [finalScore, setFinalScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [combo, setCombo] = useState(0);
  const [hitEffects, setHitEffects] = useState<{ id: number; holeIndex: number; points: number }[]>([]);

  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const molesRef = useRef<Mole[]>([]);
  const moleIdCounter = useRef(0);
  const spawnTimerRef = useRef<ReturnType<typeof setTimeout>>(null);
  const gameTimerRef = useRef<ReturnType<typeof setInterval>>(null);
  const stateRef = useRef<GameState>("idle");
  const timeRef = useRef(GAME_DURATION);
  const effectIdRef = useRef(0);
  const lastWhackTime = useRef(0);

  useEffect(() => {
    const stored = localStorage.getItem(LS_BEST);
    if (stored) setBest(Number(stored));
  }, []);

  const saveBest = useCallback(
    (s: number) => {
      if (s > best) {
        setBest(s);
        localStorage.setItem(LS_BEST, String(s));
      }
    },
    [best],
  );

  const cleanup = useCallback(() => {
    if (spawnTimerRef.current) clearTimeout(spawnTimerRef.current);
    if (gameTimerRef.current) clearInterval(gameTimerRef.current);
  }, []);

  const endGame = useCallback(() => {
    stateRef.current = "ended";
    setGameState("ended");
    cleanup();
    const final = scoreRef.current;
    setFinalScore(final);
    saveBest(final);
    setShowRanking(true);
  }, [cleanup, saveBest]);

  const getSpawnInterval = useCallback(() => {
    const elapsed = GAME_DURATION - timeRef.current;
    const progress = elapsed / GAME_DURATION;
    return Math.max(
      SPAWN_MIN_INTERVAL,
      SPAWN_BASE_INTERVAL - progress * (SPAWN_BASE_INTERVAL - SPAWN_MIN_INTERVAL),
    );
  }, []);

  const getMoleDuration = useCallback(() => {
    const elapsed = GAME_DURATION - timeRef.current;
    const progress = elapsed / GAME_DURATION;
    return Math.max(
      MOLE_MIN_DURATION,
      MOLE_BASE_DURATION - progress * (MOLE_BASE_DURATION - MOLE_MIN_DURATION),
    );
  }, []);

  const removeMole = useCallback((moleId: number) => {
    molesRef.current = molesRef.current.filter((m) => m.id !== moleId);
    setMoles([...molesRef.current]);
  }, []);

  const spawnMole = useCallback(() => {
    if (stateRef.current !== "playing") return;

    const activeMoles = molesRef.current.filter((m) => !m.whacked);
    if (activeMoles.length < MAX_ACTIVE_MOLES) {
      const occupied = new Set(activeMoles.map((m) => m.holeIndex));
      const available = Array.from({ length: HOLES }, (_, i) => i).filter(
        (i) => !occupied.has(i),
      );

      if (available.length > 0) {
        const holeIndex = available[Math.floor(Math.random() * available.length)];
        const duration = getMoleDuration();
        const mole: Mole = {
          id: ++moleIdCounter.current,
          holeIndex,
          spawnedAt: Date.now(),
          duration,
          whacked: false,
        };

        molesRef.current.push(mole);
        setMoles([...molesRef.current]);

        setTimeout(() => {
          if (!molesRef.current.find((m) => m.id === mole.id)?.whacked) {
            comboRef.current = 0;
            setCombo(0);
          }
          removeMole(mole.id);
        }, duration);
      }
    }

    spawnTimerRef.current = setTimeout(spawnMole, getSpawnInterval());
  }, [getMoleDuration, getSpawnInterval, removeMole]);

  const startGame = useCallback(() => {
    cleanup();
    scoreRef.current = 0;
    comboRef.current = 0;
    timeRef.current = GAME_DURATION;
    moleIdCounter.current = 0;
    molesRef.current = [];
    lastWhackTime.current = 0;

    setScore(0);
    setCombo(0);
    setTimeLeft(GAME_DURATION);
    setMoles([]);
    setHitEffects([]);
    stateRef.current = "playing";
    setGameState("playing");

    gameTimerRef.current = setInterval(() => {
      timeRef.current -= 1;
      setTimeLeft(timeRef.current);
      if (timeRef.current <= 0) {
        endGame();
      }
    }, 1000);

    spawnTimerRef.current = setTimeout(spawnMole, 500);
  }, [cleanup, endGame, spawnMole]);

  const whackMole = useCallback(
    (moleId: number, holeIndex: number) => {
      if (stateRef.current !== "playing") return;

      const mole = molesRef.current.find((m) => m.id === moleId);
      if (!mole || mole.whacked) return;

      mole.whacked = true;

      const now = Date.now();
      if (now - lastWhackTime.current < 1500) {
        comboRef.current = Math.min(comboRef.current + 1, 10);
      } else {
        comboRef.current = 1;
      }
      lastWhackTime.current = now;

      const comboMultiplier = 1 + Math.floor(comboRef.current / 3) * 0.5;
      const points = Math.round(10 * comboMultiplier);
      scoreRef.current += points;

      setScore(scoreRef.current);
      setCombo(comboRef.current);

      const effectId = ++effectIdRef.current;
      setHitEffects((prev) => [...prev, { id: effectId, holeIndex, points }]);
      setTimeout(() => {
        setHitEffects((prev) => prev.filter((e) => e.id !== effectId));
      }, 600);

      setTimeout(() => removeMole(moleId), 150);
    },
    [removeMole],
  );

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const activeMoleAtHole = (holeIndex: number) =>
    moles.find((m) => m.holeIndex === holeIndex && !m.whacked);

  const timePercent = (timeLeft / GAME_DURATION) * 100;
  const timeColor =
    timeLeft <= 5 ? "bg-red-500" : timeLeft <= 10 ? "bg-amber-500" : "bg-emerald-500";

  return (
    <div className="flex flex-col items-center gap-4" style={{ touchAction: "none" }}>
      {/* HUD */}
      <div className="flex w-full max-w-[340px] items-center justify-between gap-4">
        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase text-zinc-600">점수</span>
          <span className="font-mono text-2xl font-bold text-white">{score}</span>
        </div>

        <div className="flex flex-1 flex-col items-center gap-1">
          <span className="font-mono text-[10px] uppercase text-zinc-600">
            {gameState === "playing" ? `${timeLeft}초` : "시간"}
          </span>
          <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${timeColor}`}
              style={{ width: `${timePercent}%` }}
            />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <span className="font-mono text-[10px] uppercase text-zinc-600">최고</span>
          <span className="font-mono text-2xl font-bold text-zinc-500">{best}</span>
        </div>
      </div>

      {/* Combo indicator */}
      <div className="h-5">
        {combo >= 3 && gameState === "playing" && (
          <span className="animate-pulse font-mono text-sm font-bold text-amber-400">
            {combo >= 9 ? "🔥🔥🔥" : combo >= 6 ? "🔥🔥" : "🔥"} x
            {(1 + Math.floor(combo / 3) * 0.5).toFixed(1)} 콤보!
          </span>
        )}
      </div>

      {/* Game Grid */}
      <div
        className="relative grid grid-cols-3 gap-3 sm:gap-4"
        onContextMenu={(e) => e.preventDefault()}
      >
        {Array.from({ length: HOLES }).map((_, i) => {
          const mole = activeMoleAtHole(i);
          const effect = hitEffects.find((e) => e.holeIndex === i);

          return (
            <div
              key={i}
              className="relative flex items-center justify-center"
            >
              {/* Hole */}
              <div
                className={`relative flex h-[90px] w-[90px] cursor-pointer items-end justify-center overflow-hidden rounded-2xl border-2 sm:h-[100px] sm:w-[100px] ${
                  mole
                    ? "border-amber-500/40 bg-amber-900/20"
                    : "border-zinc-700/40 bg-zinc-800/30"
                } transition-colors duration-150`}
                onClick={() => mole && whackMole(mole.id, i)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  if (mole) whackMole(mole.id, i);
                }}
              >
                {/* Dirt/ground */}
                <div className="absolute bottom-0 left-0 right-0 h-6 rounded-b-xl bg-gradient-to-t from-amber-900/40 to-transparent" />

                {/* Mole */}
                {mole && (
                  <div
                    className={`relative z-10 mb-1 transition-transform duration-150 ${
                      mole.whacked ? "scale-75 opacity-50" : "animate-mole-pop"
                    }`}
                  >
                    <span className="text-5xl select-none sm:text-5xl">🐹</span>
                  </div>
                )}

                {/* Empty hole indicator */}
                {!mole && (
                  <div className="mb-2 h-4 w-12 rounded-full bg-zinc-700/50" />
                )}
              </div>

              {/* Hit effect */}
              {effect && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                  <span className="animate-hit-float font-mono text-lg font-bold text-amber-400">
                    +{effect.points}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Start / Restart */}
      {gameState !== "playing" && (
        <button
          onClick={startGame}
          className="mt-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-8 py-3 font-mono text-sm font-bold text-amber-400 transition-all hover:bg-amber-500/20 active:scale-95"
        >
          {gameState === "idle" ? "🔨 게임 시작" : "🔄 다시 하기"}
        </button>
      )}

      {gameState === "idle" && (
        <div className="mt-2 flex flex-col items-center gap-1 text-center">
          <p className="font-mono text-xs text-zinc-500">
            두더지가 올라오면 빠르게 클릭하세요!
          </p>
          <p className="font-mono text-[10px] text-zinc-600">
            연속으로 잡으면 콤보 보너스!
          </p>
        </div>
      )}

      <ScoreBoard
        gameId="whackmole"
        currentScore={finalScore}
        unit="점"
        show={showRanking}
        onClose={() => {
          setShowRanking(false);
          startGame();
        }}
      />
    </div>
  );
}
