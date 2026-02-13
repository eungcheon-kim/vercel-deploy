"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Matter from "matter-js";
import { FRUITS, getNextDropLevel, type FruitDef } from "../lib/fruits";

const GAME_WIDTH = 360;
const GAME_HEIGHT = 560;
const WALL_THICKNESS = 20;
const DROP_Y = 60;
const DEAD_LINE_Y = 100; // game over line
const DEAD_CHECK_DELAY = 2000; // ms after drop before checking game over

// Collision category for fruits
const FRUIT_CATEGORY = 0x0002;

interface FruitBody {
  body: Matter.Body;
  level: number;
}

export default function SuikaGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const fruitBodiesRef = useRef<FruitBody[]>([]);
  const nextLevelRef = useRef<number>(getNextDropLevel());
  const canDropRef = useRef(true);
  const gameOverRef = useRef(false);
  const scoreRef = useRef(0);
  const dropXRef = useRef(GAME_WIDTH / 2);
  const lastDropTimeRef = useRef(0);

  const [score, setScore] = useState(0);
  const [nextLevel, setNextLevel] = useState(nextLevelRef.current);
  const [gameOver, setGameOver] = useState(false);
  const [bestScore, setBestScore] = useState(0);

  // Initialize engine
  useEffect(() => {
    const saved = localStorage.getItem("suika-best");
    if (saved) setBestScore(Number(saved));

    const engine = Matter.Engine.create({
      gravity: { x: 0, y: 1.5, scale: 0.001 },
    });
    engineRef.current = engine;

    // Walls
    const floor = Matter.Bodies.rectangle(
      GAME_WIDTH / 2, GAME_HEIGHT + WALL_THICKNESS / 2,
      GAME_WIDTH + WALL_THICKNESS * 2, WALL_THICKNESS,
      { isStatic: true, friction: 0.3, restitution: 0.2, label: "floor" }
    );
    const leftWall = Matter.Bodies.rectangle(
      -WALL_THICKNESS / 2, GAME_HEIGHT / 2,
      WALL_THICKNESS, GAME_HEIGHT * 2,
      { isStatic: true, friction: 0.3, restitution: 0.2, label: "wall" }
    );
    const rightWall = Matter.Bodies.rectangle(
      GAME_WIDTH + WALL_THICKNESS / 2, GAME_HEIGHT / 2,
      WALL_THICKNESS, GAME_HEIGHT * 2,
      { isStatic: true, friction: 0.3, restitution: 0.2, label: "wall" }
    );

    Matter.Composite.add(engine.world, [floor, leftWall, rightWall]);

    // Collision handler for merging
    Matter.Events.on(engine, "collisionStart", (event) => {
      if (gameOverRef.current) return;

      for (const pair of event.pairs) {
        const bodyA = pair.bodyA;
        const bodyB = pair.bodyB;

        const fruitA = fruitBodiesRef.current.find((f) => f.body.id === bodyA.id);
        const fruitB = fruitBodiesRef.current.find((f) => f.body.id === bodyB.id);

        if (!fruitA || !fruitB) continue;
        if (fruitA.level !== fruitB.level) continue;

        // Same level = merge!
        const level = fruitA.level;
        if (level >= FRUITS.length - 1) continue; // max level

        const newLevel = level + 1;
        const newFruit = FRUITS[newLevel];

        // Position = midpoint
        const midX = (bodyA.position.x + bodyB.position.x) / 2;
        const midY = (bodyA.position.y + bodyB.position.y) / 2;

        // Remove old bodies
        Matter.Composite.remove(engine.world, bodyA);
        Matter.Composite.remove(engine.world, bodyB);
        fruitBodiesRef.current = fruitBodiesRef.current.filter(
          (f) => f.body.id !== bodyA.id && f.body.id !== bodyB.id
        );

        // Create merged fruit
        const merged = createFruitBody(newLevel, midX, midY);
        Matter.Composite.add(engine.world, merged.body);
        fruitBodiesRef.current.push(merged);

        // Score
        scoreRef.current += newFruit.score;
        setScore(scoreRef.current);

        break; // only process one merge per frame to avoid issues
      }
    });

    // Game loop
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const delta = Math.min(time - lastTime, 32); // cap at ~30fps min
      lastTime = time;

      Matter.Engine.update(engine, delta);

      // Check game over: any fruit above dead line for too long
      if (!gameOverRef.current && Date.now() - lastDropTimeRef.current > DEAD_CHECK_DELAY) {
        for (const f of fruitBodiesRef.current) {
          if (f.body.position.y - FRUITS[f.level].radius < DEAD_LINE_Y && f.body.speed < 1) {
            gameOverRef.current = true;
            setGameOver(true);
            // Save best
            if (scoreRef.current > bestScore) {
              setBestScore(scoreRef.current);
              localStorage.setItem("suika-best", String(scoreRef.current));
            }
            break;
          }
        }
      }

      // Render
      render(ctx);

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
      Matter.Engine.clear(engine);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function createFruitBody(level: number, x: number, y: number): FruitBody {
    const fruit = FRUITS[level];
    const body = Matter.Bodies.circle(x, y, fruit.radius, {
      restitution: 0.2,
      friction: 0.5,
      density: 0.001 + level * 0.0003,
      collisionFilter: { category: FRUIT_CATEGORY, mask: FRUIT_CATEGORY | 0x0001 },
      label: `fruit-${level}`,
    });
    return { body, level };
  }

  function render(ctx: CanvasRenderingContext2D) {
    // Clear
    ctx.fillStyle = "#0a0a14";
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    // Dead line
    ctx.strokeStyle = "rgba(239, 68, 68, 0.3)";
    ctx.lineWidth = 1;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(0, DEAD_LINE_Y);
    ctx.lineTo(GAME_WIDTH, DEAD_LINE_Y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Walls
    ctx.fillStyle = "#1a1a2e";
    ctx.fillRect(0, 0, 2, GAME_HEIGHT); // left
    ctx.fillRect(GAME_WIDTH - 2, 0, 2, GAME_HEIGHT); // right
    ctx.fillRect(0, GAME_HEIGHT - 2, GAME_WIDTH, 2); // floor

    // Drop guide line
    if (canDropRef.current && !gameOverRef.current) {
      ctx.strokeStyle = "rgba(139, 92, 246, 0.2)";
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(dropXRef.current, DROP_Y);
      ctx.lineTo(dropXRef.current, GAME_HEIGHT);
      ctx.stroke();
      ctx.setLineDash([]);

      // Preview fruit
      const preview = FRUITS[nextLevelRef.current];
      ctx.globalAlpha = 0.5;
      drawFruit(ctx, dropXRef.current, DROP_Y, preview);
      ctx.globalAlpha = 1;
    }

    // Draw fruits
    for (const f of fruitBodiesRef.current) {
      const fruit = FRUITS[f.level];
      drawFruit(ctx, f.body.position.x, f.body.position.y, fruit, f.body.angle);
    }

    // Game over overlay
    if (gameOverRef.current) {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      ctx.font = "bold 28px var(--font-geist-mono), monospace";
      ctx.fillStyle = "#fff";
      ctx.textAlign = "center";
      ctx.fillText("Game Over!", GAME_WIDTH / 2, GAME_HEIGHT / 2 - 20);

      ctx.font = "16px var(--font-geist-mono), monospace";
      ctx.fillStyle = "#fbbf24";
      ctx.fillText(`Score: ${scoreRef.current}`, GAME_WIDTH / 2, GAME_HEIGHT / 2 + 15);

      ctx.font = "12px var(--font-geist-mono), monospace";
      ctx.fillStyle = "#71717a";
      ctx.fillText("Click to restart", GAME_WIDTH / 2, GAME_HEIGHT / 2 + 45);
    }
  }

  function drawFruit(
    ctx: CanvasRenderingContext2D,
    x: number, y: number,
    fruit: FruitDef,
    angle: number = 0
  ) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);

    // Circle background
    ctx.beginPath();
    ctx.arc(0, 0, fruit.radius, 0, Math.PI * 2);
    ctx.fillStyle = fruit.color;
    ctx.fill();
    ctx.strokeStyle = fruit.borderColor;
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emoji
    const fontSize = Math.max(fruit.radius * 0.9, 14);
    ctx.font = `${fontSize}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fruit.emoji, 0, 1);

    ctx.restore();
  }

  // Drop fruit
  const dropFruit = useCallback((x: number) => {
    if (!canDropRef.current || gameOverRef.current || !engineRef.current) return;

    const clampedX = Math.max(FRUITS[nextLevelRef.current].radius + 4, Math.min(GAME_WIDTH - FRUITS[nextLevelRef.current].radius - 4, x));

    const fruit = createFruitBody(nextLevelRef.current, clampedX, DROP_Y);
    Matter.Composite.add(engineRef.current.world, fruit.body);
    fruitBodiesRef.current.push(fruit);

    lastDropTimeRef.current = Date.now();

    // Cooldown
    canDropRef.current = false;
    setTimeout(() => {
      canDropRef.current = true;
    }, 500);

    // Next fruit
    nextLevelRef.current = getNextDropLevel();
    setNextLevel(nextLevelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restartGame = useCallback(() => {
    if (!engineRef.current) return;

    // Remove all fruit bodies
    for (const f of fruitBodiesRef.current) {
      Matter.Composite.remove(engineRef.current.world, f.body);
    }
    fruitBodiesRef.current = [];
    scoreRef.current = 0;
    setScore(0);
    gameOverRef.current = false;
    setGameOver(false);
    canDropRef.current = true;
    nextLevelRef.current = getNextDropLevel();
    setNextLevel(nextLevelRef.current);
    lastDropTimeRef.current = Date.now();
  }, []);

  // Keyboard controls: Space to drop, Arrow keys to move
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === " " || e.code === "Space") {
        e.preventDefault();
        if (gameOverRef.current) {
          restartGame();
          return;
        }
        dropFruit(dropXRef.current);
      } else if (e.key === "ArrowLeft" || e.key === "a") {
        e.preventDefault();
        dropXRef.current = Math.max(20, dropXRef.current - 12);
      } else if (e.key === "ArrowRight" || e.key === "d") {
        e.preventDefault();
        dropXRef.current = Math.min(GAME_WIDTH - 20, dropXRef.current + 12);
      } else if (e.key === "r") {
        restartGame();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropFruit, restartGame]);

  // Mouse / touch handlers
  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    dropXRef.current = (e.clientX - rect.left) * scaleX;
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const x = (e.clientX - rect.left) * scaleX;

    if (gameOverRef.current) {
      restartGame();
      return;
    }

    dropXRef.current = x;
    dropFruit(x);
  }, [dropFruit, restartGame]);

  const nextFruit = FRUITS[nextLevel];

  return (
    <div className="flex h-full flex-col items-center gap-2">
      {/* Score + Next — compact */}
      <div className="flex w-full max-w-[360px] items-center justify-between">
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase text-zinc-500">Score</span>
            <span className="font-mono text-sm font-bold text-white">{score}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 py-1.5">
            <span className="font-mono text-[9px] uppercase text-zinc-500">Best</span>
            <span className="font-mono text-sm font-bold text-gold">{bestScore}</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5">
            <span className="font-mono text-[9px] uppercase text-zinc-500">Next</span>
            <span className="text-base">{nextFruit.emoji}</span>
          </div>
          <button
            onClick={restartGame}
            className="rounded-lg border border-card-border bg-card-bg px-2.5 py-1.5 font-mono text-xs text-zinc-400 transition-all hover:border-accent/30 hover:text-white"
          >
            ↺
          </button>
        </div>
      </div>

      {/* Canvas — fills remaining height */}
      <div className="relative min-h-0 w-full max-w-[360px] flex-1">
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="h-full w-full cursor-crosshair rounded-2xl border border-card-border object-contain"
          onPointerMove={handlePointerMove}
          onPointerDown={handlePointerDown}
          style={{ touchAction: "none" }}
        />
      </div>

      {/* Fruit legend — compact scrollable row */}
      <div className="flex w-full max-w-[360px] items-center gap-1 overflow-x-auto scrollbar-none">
        {FRUITS.map((f) => (
          <div
            key={f.level}
            className="flex shrink-0 items-center gap-0.5 rounded-md border border-card-border bg-card-bg px-1.5 py-0.5"
          >
            <span className="text-[10px]">{f.emoji}</span>
            <span className="font-mono text-[8px] text-zinc-600">{f.label}</span>
          </div>
        ))}
      </div>

      {/* Controls hint */}
      <div className="flex items-center gap-2 font-mono text-[9px] text-zinc-600">
        <div className="flex items-center gap-1">
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-zinc-400">←→</kbd>
          <span>이동</span>
        </div>
        <div className="flex items-center gap-1">
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1 py-0.5 text-zinc-400">Space</kbd>
          <span>드롭</span>
        </div>
        <span>·</span>
        <span>클릭/터치 가능</span>
      </div>
    </div>
  );
}
