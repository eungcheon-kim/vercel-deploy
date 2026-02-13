"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const COLS = 20;
const ROWS = 20;
const CELL = 18;
const GAP = 1;
const TICK_MS = 100;

type Dir = "UP" | "DOWN" | "LEFT" | "RIGHT";
type Pos = { x: number; y: number };

export default function SnakeGame() {
  const [snake, setSnake] = useState<Pos[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Pos>({ x: 15, y: 10 });
  const [dir, setDir] = useState<Dir>("RIGHT");
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);

  const dirRef = useRef<Dir>("RIGHT");
  const snakeRef = useRef(snake);
  const foodRef = useRef(food);
  const gameStateRef = useRef(gameState);

  snakeRef.current = snake;
  foodRef.current = food;
  gameStateRef.current = gameState;

  useEffect(() => {
    const saved = localStorage.getItem("snake-best");
    if (saved) setBestScore(Number(saved));
  }, []);

  const spawnFood = useCallback((snk: Pos[]): Pos => {
    const set = new Set(snk.map((p) => `${p.x},${p.y}`));
    let pos: Pos;
    do {
      pos = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    } while (set.has(`${pos.x},${pos.y}`));
    return pos;
  }, []);

  const restart = useCallback(() => {
    const initial = [{ x: 10, y: 10 }];
    setSnake(initial);
    setDir("RIGHT");
    dirRef.current = "RIGHT";
    setScore(0);
    const f = spawnFood(initial);
    setFood(f);
    setGameState("playing");
  }, [spawnFood]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStateRef.current === "idle" || gameStateRef.current === "dead") {
        if (e.code === "Space" || e.key.startsWith("Arrow")) {
          e.preventDefault();
          restart();
          return;
        }
      }
      const cur = dirRef.current;
      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          e.preventDefault();
          if (cur !== "DOWN") { dirRef.current = "UP"; setDir("UP"); }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          e.preventDefault();
          if (cur !== "UP") { dirRef.current = "DOWN"; setDir("DOWN"); }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          e.preventDefault();
          if (cur !== "RIGHT") { dirRef.current = "LEFT"; setDir("LEFT"); }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          e.preventDefault();
          if (cur !== "LEFT") { dirRef.current = "RIGHT"; setDir("RIGHT"); }
          break;
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [restart]);

  useEffect(() => {
    if (gameState !== "playing") return;

    const interval = setInterval(() => {
      const snk = [...snakeRef.current];
      const head = { ...snk[0] };
      const d = dirRef.current;

      if (d === "UP") head.y -= 1;
      if (d === "DOWN") head.y += 1;
      if (d === "LEFT") head.x -= 1;
      if (d === "RIGHT") head.x += 1;

      // Wall collision
      if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) {
        setGameState("dead");
        setShowRanking(true);
        const sc = snk.length - 1;
        if (sc > bestScore) {
          setBestScore(sc);
          localStorage.setItem("snake-best", String(sc));
        }
        return;
      }

      // Self collision
      if (snk.some((p) => p.x === head.x && p.y === head.y)) {
        setGameState("dead");
        setShowRanking(true);
        const sc = snk.length - 1;
        if (sc > bestScore) {
          setBestScore(sc);
          localStorage.setItem("snake-best", String(sc));
        }
        return;
      }

      snk.unshift(head);

      // Eat food
      const f = foodRef.current;
      if (head.x === f.x && head.y === f.y) {
        const newScore = snk.length - 1;
        setScore(newScore);
        const nf = spawnFood(snk);
        setFood(nf);
      } else {
        snk.pop();
      }

      setSnake(snk);
    }, TICK_MS);

    return () => clearInterval(interval);
  }, [gameState, bestScore, spawnFood]);

  // Touch controls
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;

    if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      if (gameStateRef.current !== "playing") restart();
      return;
    }

    const cur = dirRef.current;
    if (Math.abs(dx) > Math.abs(dy)) {
      if (dx > 0 && cur !== "LEFT") { dirRef.current = "RIGHT"; setDir("RIGHT"); }
      else if (dx < 0 && cur !== "RIGHT") { dirRef.current = "LEFT"; setDir("LEFT"); }
    } else {
      if (dy > 0 && cur !== "UP") { dirRef.current = "DOWN"; setDir("DOWN"); }
      else if (dy < 0 && cur !== "DOWN") { dirRef.current = "UP"; setDir("UP"); }
    }
  };

  const boardW = COLS * (CELL + GAP) + GAP;
  const boardH = ROWS * (CELL + GAP) + GAP;
  const snakeSet = new Set(snake.map((p) => `${p.x},${p.y}`));

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Score</span>
          <span className="font-mono text-lg font-bold text-white">{score}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Best</span>
          <span className="font-mono text-lg font-bold text-gold">{bestScore}</span>
        </div>
      </div>

      <div
        className="relative rounded-2xl border border-card-border bg-[#0a0a14]"
        style={{ width: boardW, height: boardH }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid */}
        {Array.from({ length: ROWS }).map((_, y) =>
          Array.from({ length: COLS }).map((_, x) => {
            const isSnake = snakeSet.has(`${x},${y}`);
            const isHead = snake[0]?.x === x && snake[0]?.y === y;
            const isFood = food.x === x && food.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className="absolute rounded-sm transition-colors duration-75"
                style={{
                  width: CELL,
                  height: CELL,
                  left: GAP + x * (CELL + GAP),
                  top: GAP + y * (CELL + GAP),
                  backgroundColor: isHead
                    ? "#a78bfa"
                    : isSnake
                    ? "#7c3aed"
                    : isFood
                    ? "#34d399"
                    : "#111118",
                  boxShadow: isHead
                    ? "0 0 8px rgba(167,139,250,0.5)"
                    : isFood
                    ? "0 0 8px rgba(52,211,153,0.5)"
                    : "none",
                }}
              />
            );
          })
        )}

        {/* Overlays */}
        {gameState === "idle" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/40">
            <span className="text-4xl mb-2">🐍</span>
            <p className="font-mono text-sm font-bold text-white">스네이크</p>
            <p className="mt-1 font-mono text-[10px] text-zinc-400">방향키 / WASD / 스와이프</p>
          </div>
        )}
        {gameState === "dead" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-black/50">
            <p className="font-mono text-xl font-bold text-white">Game Over</p>
            <p className="mt-1 font-mono text-sm text-yellow-400">Score: {score}</p>
            <p className="mt-2 font-mono text-[10px] text-zinc-400">아무 키를 눌러서 재시작</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
        <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">←↑↓→</kbd>
        <span>이동</span>
        <span>·</span>
        <span>WASD / 스와이프 가능</span>
      </div>

      <ScoreBoard gameId="snake" currentScore={score} unit="점" show={showRanking} onClose={() => { setShowRanking(false); restart(); }} />
    </div>
  );
}
