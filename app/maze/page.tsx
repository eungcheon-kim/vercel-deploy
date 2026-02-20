"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import ScoreBoard from "../components/ScoreBoard";

type Difficulty = "easy" | "medium" | "hard";
type Phase = "idle" | "playing" | "done";

interface Cell {
  top: boolean;
  right: boolean;
  bottom: boolean;
  left: boolean;
  visited: boolean;
}

const DIFFICULTY_CONFIG: Record<Difficulty, { label: string; cols: number; rows: number }> = {
  easy: { label: "쉬움", cols: 10, rows: 10 },
  medium: { label: "보통", cols: 15, rows: 15 },
  hard: { label: "어려움", cols: 20, rows: 20 },
};

function generateMaze(cols: number, rows: number): Cell[][] {
  const grid: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => ({
      top: true,
      right: true,
      bottom: true,
      left: true,
      visited: false,
    }))
  );

  const stack: [number, number][] = [];
  const start: [number, number] = [0, 0];
  grid[start[1]][start[0]].visited = true;
  stack.push(start);

  while (stack.length > 0) {
    const [cx, cy] = stack[stack.length - 1];
    const neighbors: [number, number, "top" | "right" | "bottom" | "left"][] = [];

    if (cy > 0 && !grid[cy - 1][cx].visited) neighbors.push([cx, cy - 1, "top"]);
    if (cx < cols - 1 && !grid[cy][cx + 1].visited) neighbors.push([cx + 1, cy, "right"]);
    if (cy < rows - 1 && !grid[cy + 1][cx].visited) neighbors.push([cx, cy + 1, "bottom"]);
    if (cx > 0 && !grid[cy][cx - 1].visited) neighbors.push([cx - 1, cy, "left"]);

    if (neighbors.length === 0) {
      stack.pop();
    } else {
      const [nx, ny, dir] = neighbors[Math.floor(Math.random() * neighbors.length)];
      const opposite = { top: "bottom", bottom: "top", left: "right", right: "left" } as const;
      grid[cy][cx][dir] = false;
      grid[ny][nx][opposite[dir]] = false;
      grid[ny][nx].visited = true;
      stack.push([nx, ny]);
    }
  }

  return grid;
}

export default function MazePage() {
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");
  const [phase, setPhase] = useState<Phase>("idle");
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [elapsed, setElapsed] = useState(0);
  const [finalTime, setFinalTime] = useState(0);
  const [bestTime, setBestTime] = useState(0);
  const [showRanking, setShowRanking] = useState(false);

  const startTimeRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const playerRef = useRef({ x: 0, y: 0 });
  const mazeRef = useRef<Cell[][]>([]);
  const phaseRef = useRef<Phase>("idle");
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const config = DIFFICULTY_CONFIG[difficulty];

  useEffect(() => {
    const saved = localStorage.getItem("maze-best");
    if (saved) setBestTime(Number(saved));
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const finishGame = useCallback(() => {
    const time = Math.round((performance.now() - startTimeRef.current) / 100) / 10;
    setFinalTime(time);
    setPhase("done");
    phaseRef.current = "done";
    stopTimer();

    if (time > 0 && (bestTime === 0 || time < bestTime)) {
      setBestTime(time);
      localStorage.setItem("maze-best", String(time));
    }

    setShowRanking(true);
  }, [bestTime, stopTimer]);

  const movePlayer = useCallback(
    (dx: number, dy: number) => {
      if (phaseRef.current !== "playing") return;
      const { x, y } = playerRef.current;
      const m = mazeRef.current;
      const rows = m.length;
      const cols = m[0]?.length ?? 0;

      const nx = x + dx;
      const ny = y + dy;

      if (nx < 0 || nx >= cols || ny < 0 || ny >= rows) return;

      if (dx === 1 && m[y][x].right) return;
      if (dx === -1 && m[y][x].left) return;
      if (dy === 1 && m[y][x].bottom) return;
      if (dy === -1 && m[y][x].top) return;

      playerRef.current = { x: nx, y: ny };
      setPlayerPos({ x: nx, y: ny });

      if (nx === cols - 1 && ny === rows - 1) {
        finishGame();
      }
    },
    [finishGame]
  );

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (phaseRef.current !== "playing") return;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          movePlayer(0, -1);
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          movePlayer(0, 1);
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          movePlayer(-1, 0);
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          movePlayer(1, 0);
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [movePlayer]);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY };
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStartRef.current.x;
      const dy = t.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const minSwipe = 20;
      if (Math.abs(dx) < minSwipe && Math.abs(dy) < minSwipe) return;

      if (Math.abs(dx) > Math.abs(dy)) {
        movePlayer(dx > 0 ? 1 : -1, 0);
      } else {
        movePlayer(0, dy > 0 ? 1 : -1);
      }
    },
    [movePlayer]
  );

  const startGame = useCallback(() => {
    const { cols, rows } = DIFFICULTY_CONFIG[difficulty];
    const m = generateMaze(cols, rows);
    setMaze(m);
    mazeRef.current = m;
    setPlayerPos({ x: 0, y: 0 });
    playerRef.current = { x: 0, y: 0 };
    setElapsed(0);
    setPhase("playing");
    phaseRef.current = "playing";
    startTimeRef.current = performance.now();

    stopTimer();
    timerRef.current = setInterval(() => {
      setElapsed(Math.round((performance.now() - startTimeRef.current) / 100) / 10);
    }, 100);
  }, [difficulty, stopTimer]);

  useEffect(() => {
    return () => stopTimer();
  }, [stopTimer]);

  const cellSize = Math.min(Math.floor(360 / config.cols), Math.floor(400 / config.rows));
  const mazeWidth = cellSize * config.cols;
  const mazeHeight = cellSize * config.rows;

  return (
    <div className="noise grid-bg relative min-h-screen">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      <main className="relative z-10 flex min-h-screen flex-col items-center px-6 pt-16 pb-24">
        <div className="mb-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            <span className="bg-linear-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              미로 탈출
            </span>
            <span className="ml-2">🏁</span>
          </h2>
          <p className="mt-2 font-mono text-xs text-zinc-500">
            방향키/WASD/스와이프로 미로를 탈출하세요!
          </p>
        </div>

        {/* Stats */}
        <div className="mb-6 flex flex-wrap justify-center gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Best</span>
            <span className="font-mono text-lg font-bold text-gold">{bestTime ? `${bestTime}초` : "-"}</span>
          </div>
          {phase === "playing" && (
            <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
              <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">시간</span>
              <span className="font-mono text-lg font-bold text-white">{elapsed.toFixed(1)}초</span>
            </div>
          )}
        </div>

        {/* Difficulty selector */}
        {phase !== "playing" && (
          <div className="mb-6 flex gap-2">
            {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
              <button
                key={d}
                onClick={() => setDifficulty(d)}
                className={`rounded-xl border px-4 py-2 font-mono text-xs transition-all ${
                  difficulty === d
                    ? "border-purple-500/40 bg-purple-500/15 text-purple-400"
                    : "border-card-border bg-card-bg text-zinc-500 hover:border-zinc-600 hover:text-zinc-300"
                }`}
              >
                {DIFFICULTY_CONFIG[d].label}
                <span className="ml-1 text-[10px] text-zinc-600">
                  {DIFFICULTY_CONFIG[d].cols}×{DIFFICULTY_CONFIG[d].rows}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Idle */}
        {phase === "idle" && (
          <div className="flex w-full max-w-xl flex-col items-center">
            <div className="flex h-[400px] w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-card-border bg-card-bg/50">
              <span className="mb-4 text-6xl">🏁</span>
              <p className="mb-2 font-mono text-sm text-zinc-300">랜덤 미로를 탈출하세요</p>
              <p className="mb-6 font-mono text-xs text-zinc-500">왼쪽 위에서 오른쪽 아래 ⭐ 까지 이동!</p>
              <button
                onClick={startGame}
                className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-8 py-3 font-mono text-sm font-bold text-purple-400 transition-all hover:bg-purple-500/20"
              >
                시작하기
              </button>
            </div>
          </div>
        )}

        {/* Playing */}
        {phase === "playing" && (
          <div
            className="flex flex-col items-center"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            onTouchMove={(e) => e.preventDefault()}
            style={{ touchAction: "none" }}
          >
            <div
              className="relative overflow-hidden rounded-2xl border-2 border-purple-500/20 bg-[#0a0a1a]"
              style={{ width: mazeWidth + 4, height: mazeHeight + 4, padding: 2 }}
            >
              <div style={{ position: "relative", width: mazeWidth, height: mazeHeight }}>
                {maze.map((row, ry) =>
                  row.map((cell, cx) => (
                    <div
                      key={`${cx}-${ry}`}
                      className="absolute box-border"
                      style={{
                        left: cx * cellSize,
                        top: ry * cellSize,
                        width: cellSize,
                        height: cellSize,
                        borderTop: cell.top ? "1px solid rgba(139,92,246,0.35)" : "none",
                        borderRight: cell.right ? "1px solid rgba(139,92,246,0.35)" : "none",
                        borderBottom: cell.bottom ? "1px solid rgba(139,92,246,0.35)" : "none",
                        borderLeft: cell.left ? "1px solid rgba(139,92,246,0.35)" : "none",
                      }}
                    />
                  ))
                )}

                {/* Goal */}
                <div
                  className="absolute flex items-center justify-center"
                  style={{
                    left: (config.cols - 1) * cellSize,
                    top: (config.rows - 1) * cellSize,
                    width: cellSize,
                    height: cellSize,
                  }}
                >
                  <span style={{ fontSize: cellSize * 0.6 }}>⭐</span>
                </div>

                {/* Player */}
                <div
                  className="absolute rounded-full bg-linear-to-r from-purple-500 to-pink-500 shadow-[0_0_10px_rgba(168,85,247,0.6)] transition-all duration-100"
                  style={{
                    left: playerPos.x * cellSize + cellSize * 0.15,
                    top: playerPos.y * cellSize + cellSize * 0.15,
                    width: cellSize * 0.7,
                    height: cellSize * 0.7,
                  }}
                />
              </div>
            </div>

            {/* Mobile hint */}
            <p className="mt-4 font-mono text-[10px] text-zinc-600 sm:hidden">
              스와이프하여 이동
            </p>
            <p className="mt-4 hidden font-mono text-[10px] text-zinc-600 sm:block">
              방향키 또는 WASD로 이동
            </p>
          </div>
        )}

        {/* Done */}
        {phase === "done" && (
          <div className="flex w-full max-w-xl flex-col items-center">
            <div className="flex w-full flex-col items-center gap-4 rounded-2xl border border-card-border bg-card-bg/80 p-8">
              <span className="text-5xl">🎉</span>
              <div className="text-center">
                <p className="font-mono text-3xl font-black text-white">{finalTime.toFixed(1)}초</p>
                <p className="mt-1 font-mono text-sm text-zinc-400">클리어 시간</p>
              </div>

              <p className="font-mono text-sm text-zinc-400">
                {finalTime < 10
                  ? "미로 마스터! 🔥"
                  : finalTime < 30
                    ? "꽤 빠르네요! ⚡"
                    : finalTime < 60
                      ? "잘 했어요! 👍"
                      : "끈기 있게 완주! 💪"}
              </p>

              <div className="flex gap-3">
                <button
                  onClick={startGame}
                  className="rounded-xl border border-purple-500/30 bg-purple-500/10 px-8 py-3 font-mono text-sm font-bold text-purple-400 transition-all hover:bg-purple-500/20"
                >
                  새 미로
                </button>
              </div>
            </div>
          </div>
        )}

        <ScoreBoard
          gameId="maze"
          currentScore={finalTime}
          unit="초"
          show={showRanking}
          onClose={() => {
            setShowRanking(false);
          }}
        />
      </main>
    </div>
  );
}
