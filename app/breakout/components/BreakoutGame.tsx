"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const CANVAS_W = 400;
const CANVAS_H = 500;

const PADDLE_W = 80;
const PADDLE_H = 12;
const PADDLE_Y = CANVAS_H - 30;
const PADDLE_SPEED = 7;

const BALL_R = 6;
const BALL_BASE_SPEED = 4;

const BRICK_ROWS = 5;
const BRICK_COLS = 8;
const BRICK_W = 44;
const BRICK_H = 16;
const BRICK_PAD = 4;
const BRICK_OFFSET_TOP = 50;
const BRICK_OFFSET_LEFT =
  (CANVAS_W - (BRICK_COLS * BRICK_W + (BRICK_COLS - 1) * BRICK_PAD)) / 2;

const ROW_COLORS = [
  "#ff3366",
  "#ff6633",
  "#ffcc33",
  "#33ff99",
  "#33ccff",
];

const LIVES_MAX = 3;
const SCORE_PER_BRICK = 10;
const LS_BEST = "breakout-best";

type GameState = "idle" | "playing" | "dead";

interface Brick {
  x: number;
  y: number;
  w: number;
  h: number;
  color: string;
  alive: boolean;
}

function createBricks(): Brick[] {
  const bricks: Brick[] = [];
  for (let r = 0; r < BRICK_ROWS; r++) {
    for (let c = 0; c < BRICK_COLS; c++) {
      bricks.push({
        x: BRICK_OFFSET_LEFT + c * (BRICK_W + BRICK_PAD),
        y: BRICK_OFFSET_TOP + r * (BRICK_H + BRICK_PAD),
        w: BRICK_W,
        h: BRICK_H,
        color: ROW_COLORS[r],
        alive: true,
      });
    }
  }
  return bricks;
}

export default function BreakoutGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);

  const paddleX = useRef(CANVAS_W / 2 - PADDLE_W / 2);
  const ballX = useRef(CANVAS_W / 2);
  const ballY = useRef(PADDLE_Y - BALL_R - 1);
  const ballDX = useRef(BALL_BASE_SPEED * 0.7);
  const ballDY = useRef(-BALL_BASE_SPEED);
  const ballSpeed = useRef(BALL_BASE_SPEED);
  const bricks = useRef<Brick[]>(createBricks());
  const keysDown = useRef<Set<string>>(new Set());
  const scoreRef = useRef(0);
  const livesRef = useRef(LIVES_MAX);
  const levelRef = useRef(1);
  const stateRef = useRef<GameState>("idle");

  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(LIVES_MAX);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [gameState, setGameState] = useState<GameState>("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);

  const scaleRef = useRef(1);

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

  const resetBall = useCallback(() => {
    ballX.current = paddleX.current + PADDLE_W / 2;
    ballY.current = PADDLE_Y - BALL_R - 1;
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * 0.6;
    ballDX.current = Math.cos(angle) * ballSpeed.current;
    ballDY.current = Math.sin(angle) * ballSpeed.current;
  }, []);

  const resetGame = useCallback(() => {
    scoreRef.current = 0;
    livesRef.current = LIVES_MAX;
    levelRef.current = 1;
    ballSpeed.current = BALL_BASE_SPEED;
    paddleX.current = CANVAS_W / 2 - PADDLE_W / 2;
    bricks.current = createBricks();
    resetBall();
    stateRef.current = "idle";
    setScore(0);
    setLives(LIVES_MAX);
    setLevel(1);
    setGameState("idle");
  }, [resetBall]);

  const nextLevel = useCallback(() => {
    levelRef.current += 1;
    ballSpeed.current = BALL_BASE_SPEED + (levelRef.current - 1) * 0.6;
    bricks.current = createBricks();
    paddleX.current = CANVAS_W / 2 - PADDLE_W / 2;
    resetBall();
    setLevel(levelRef.current);
  }, [resetBall]);

  const die = useCallback(() => {
    stateRef.current = "dead";
    setGameState("dead");
    const s = scoreRef.current;
    setFinalScore(s);
    saveBest(s);
    setShowRanking(true);
  }, [saveBest]);

  const startGame = useCallback(() => {
    if (stateRef.current === "idle") {
      stateRef.current = "playing";
      setGameState("playing");
      resetBall();
    }
  }, [resetBall]);

  // --- Drawing ---
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_W, CANVAS_H);

    // Background
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, CANVAS_W, CANVAS_H);

    // Border
    ctx.strokeStyle = "rgba(255,255,255,0.06)";
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, CANVAS_W - 1, CANVAS_H - 1);

    // Bricks
    for (const b of bricks.current) {
      if (!b.alive) continue;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 3);
      ctx.fill();

      ctx.fillStyle = "rgba(255,255,255,0.25)";
      ctx.fillRect(b.x + 2, b.y + 1, b.w - 4, 2);
    }

    // Paddle
    const gradient = ctx.createLinearGradient(
      paddleX.current,
      PADDLE_Y,
      paddleX.current + PADDLE_W,
      PADDLE_Y,
    );
    gradient.addColorStop(0, "#667eea");
    gradient.addColorStop(1, "#764ba2");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(paddleX.current, PADDLE_Y, PADDLE_W, PADDLE_H, 6);
    ctx.fill();

    // Ball
    ctx.beginPath();
    ctx.arc(ballX.current, ballY.current, BALL_R, 0, Math.PI * 2);
    ctx.fillStyle = "#fff";
    ctx.fill();
    ctx.shadowColor = "#fff";
    ctx.shadowBlur = 8;
    ctx.fill();
    ctx.shadowBlur = 0;
  }, []);

  // --- Game loop ---
  const update = useCallback(() => {
    if (stateRef.current !== "playing") return;

    // Paddle movement via keyboard
    if (keysDown.current.has("ArrowLeft") || keysDown.current.has("a")) {
      paddleX.current = Math.max(0, paddleX.current - PADDLE_SPEED);
    }
    if (keysDown.current.has("ArrowRight") || keysDown.current.has("d")) {
      paddleX.current = Math.min(
        CANVAS_W - PADDLE_W,
        paddleX.current + PADDLE_SPEED,
      );
    }

    // Ball position
    ballX.current += ballDX.current;
    ballY.current += ballDY.current;

    // Wall collisions
    if (ballX.current - BALL_R <= 0) {
      ballX.current = BALL_R;
      ballDX.current = Math.abs(ballDX.current);
    }
    if (ballX.current + BALL_R >= CANVAS_W) {
      ballX.current = CANVAS_W - BALL_R;
      ballDX.current = -Math.abs(ballDX.current);
    }
    if (ballY.current - BALL_R <= 0) {
      ballY.current = BALL_R;
      ballDY.current = Math.abs(ballDY.current);
    }

    // Paddle collision
    if (
      ballDY.current > 0 &&
      ballY.current + BALL_R >= PADDLE_Y &&
      ballY.current + BALL_R <= PADDLE_Y + PADDLE_H + 4 &&
      ballX.current >= paddleX.current - BALL_R &&
      ballX.current <= paddleX.current + PADDLE_W + BALL_R
    ) {
      ballY.current = PADDLE_Y - BALL_R;
      const hitPos =
        (ballX.current - paddleX.current) / PADDLE_W;
      const angle = -Math.PI / 2 + (hitPos - 0.5) * (Math.PI * 0.7);
      const speed = ballSpeed.current;
      ballDX.current = Math.cos(angle) * speed;
      ballDY.current = Math.sin(angle) * speed;
      if (ballDY.current > -1.5) ballDY.current = -1.5;
    }

    // Ball fell below
    if (ballY.current - BALL_R > CANVAS_H) {
      livesRef.current -= 1;
      setLives(livesRef.current);
      if (livesRef.current <= 0) {
        die();
        return;
      }
      resetBall();
    }

    // Brick collisions
    let bricksAlive = 0;
    for (const b of bricks.current) {
      if (!b.alive) continue;
      bricksAlive++;

      const closestX = Math.max(b.x, Math.min(ballX.current, b.x + b.w));
      const closestY = Math.max(b.y, Math.min(ballY.current, b.y + b.h));
      const dx = ballX.current - closestX;
      const dy = ballY.current - closestY;

      if (dx * dx + dy * dy < BALL_R * BALL_R) {
        b.alive = false;
        bricksAlive--;
        scoreRef.current += SCORE_PER_BRICK;
        setScore(scoreRef.current);

        const overlapLeft = ballX.current + BALL_R - b.x;
        const overlapRight = b.x + b.w - (ballX.current - BALL_R);
        const overlapTop = ballY.current + BALL_R - b.y;
        const overlapBottom = b.y + b.h - (ballY.current - BALL_R);
        const minOverlapX = Math.min(overlapLeft, overlapRight);
        const minOverlapY = Math.min(overlapTop, overlapBottom);

        if (minOverlapX < minOverlapY) {
          ballDX.current = -ballDX.current;
        } else {
          ballDY.current = -ballDY.current;
        }
      }
    }

    if (bricksAlive === 0) {
      nextLevel();
    }
  }, [die, nextLevel, resetBall]);

  const loop = useCallback(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    update();
    draw(ctx);
    rafRef.current = requestAnimationFrame(loop);
  }, [update, draw]);

  // --- Start loop ---
  useEffect(() => {
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [loop]);

  // --- Keyboard ---
  useEffect(() => {
    const onDown = (e: KeyboardEvent) => {
      keysDown.current.add(e.key);
      if (
        ["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", " "].includes(
          e.key,
        )
      ) {
        e.preventDefault();
      }
      if (e.key === " " || e.key === "Enter") {
        if (stateRef.current === "idle") startGame();
      }
    };
    const onUp = (e: KeyboardEvent) => {
      keysDown.current.delete(e.key);
    };
    window.addEventListener("keydown", onDown);
    window.addEventListener("keyup", onUp);
    return () => {
      window.removeEventListener("keydown", onDown);
      window.removeEventListener("keyup", onUp);
    };
  }, [startGame]);

  // --- Mouse / Touch ---
  const getCanvasX = useCallback((clientX: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return CANVAS_W / 2;
    const rect = canvas.getBoundingClientRect();
    return (clientX - rect.left) / scaleRef.current;
  }, []);

  const handlePointerMove = useCallback(
    (clientX: number) => {
      if (stateRef.current === "idle") startGame();
      const x = getCanvasX(clientX);
      paddleX.current = Math.max(
        0,
        Math.min(CANVAS_W - PADDLE_W, x - PADDLE_W / 2),
      );
    },
    [getCanvasX, startGame],
  );

  // --- Resize ---
  useEffect(() => {
    const resize = () => {
      const wrapper = wrapperRef.current;
      const canvas = canvasRef.current;
      if (!wrapper || !canvas) return;
      const maxW = Math.min(wrapper.clientWidth, CANVAS_W);
      const s = maxW / CANVAS_W;
      scaleRef.current = s;
      canvas.style.width = `${CANVAS_W * s}px`;
      canvas.style.height = `${CANVAS_H * s}px`;
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  return (
    <div className="flex flex-col items-center gap-4">
      {/* HUD */}
      <div className="flex w-full max-w-[400px] items-center justify-between rounded-xl border border-card-border bg-card-bg/70 px-4 py-2 font-mono text-xs backdrop-blur-sm">
        <div className="flex items-center gap-3">
          <span className="text-zinc-400">
            점수{" "}
            <span className="font-bold text-white">{score}</span>
          </span>
          <span className="text-zinc-600">|</span>
          <span className="text-zinc-400">
            레벨{" "}
            <span className="font-bold text-cyan-400">{level}</span>
          </span>
        </div>
        <div className="flex items-center gap-1">
          {Array.from({ length: LIVES_MAX }).map((_, i) => (
            <span
              key={i}
              className={i < lives ? "text-red-400" : "text-zinc-700"}
            >
              ♥
            </span>
          ))}
        </div>
      </div>

      {/* Canvas wrapper */}
      <div
        ref={wrapperRef}
        className="relative w-full max-w-[400px]"
        style={{ touchAction: "none" }}
      >
        <canvas
          ref={canvasRef}
          width={CANVAS_W}
          height={CANVAS_H}
          className="rounded-2xl border border-card-border"
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onTouchMove={(e) => {
            e.preventDefault();
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            if (stateRef.current === "idle") startGame();
            if (e.touches[0]) handlePointerMove(e.touches[0].clientX);
          }}
          onClick={() => {
            if (stateRef.current === "idle") startGame();
          }}
        />

        {/* Overlays */}
        {gameState === "idle" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-2xl bg-black/50 backdrop-blur-sm">
            <p className="font-mono text-sm font-bold text-white">
              🧱 벽돌깨기
            </p>
            <p className="font-mono text-xs text-zinc-400">
              클릭 / 터치 / Space로 시작
            </p>
            <p className="font-mono text-[10px] text-zinc-600">
              ← → 방향키 또는 마우스/터치로 패들 이동
            </p>
          </div>
        )}
      </div>

      {/* Best score */}
      {best > 0 && (
        <p className="font-mono text-[10px] text-zinc-600">
          최고 기록: {best}점
        </p>
      )}

      <ScoreBoard
        gameId="breakout"
        currentScore={finalScore}
        unit="점"
        show={showRanking}
        onClose={() => {
          setShowRanking(false);
          resetGame();
        }}
      />
    </div>
  );
}
