"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const W = 360;
const H = 520;
const BIRD_SIZE = 20;
const GRAVITY = 0.35;
const JUMP = -6.5;
const PIPE_WIDTH = 50;
const PIPE_GAP = 140;
const PIPE_SPEED = 2.2;
const PIPE_INTERVAL = 110; // frames

interface Pipe {
  x: number;
  topH: number;
  scored: boolean;
}

export default function FlappyGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");

  const stateRef = useRef({
    birdY: H / 2,
    birdVel: 0,
    pipes: [] as Pipe[],
    frame: 0,
    score: 0,
    playing: false,
    dead: false,
  });

  useEffect(() => {
    const saved = localStorage.getItem("flappy-best");
    if (saved) setBestScore(Number(saved));
  }, []);

  const jump = useCallback(() => {
    const s = stateRef.current;
    if (s.dead) {
      // Reset
      s.birdY = H / 2;
      s.birdVel = 0;
      s.pipes = [];
      s.frame = 0;
      s.score = 0;
      s.dead = false;
      s.playing = true;
      setScore(0);
      setGameState("playing");
      return;
    }
    if (!s.playing) {
      s.playing = true;
      setGameState("playing");
    }
    s.birdVel = JUMP;
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;

    const handleKey = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.key === "ArrowUp") {
        e.preventDefault();
        jump();
      }
    };
    window.addEventListener("keydown", handleKey);

    let animId: number;
    const loop = () => {
      const s = stateRef.current;

      if (s.playing && !s.dead) {
        // Physics
        s.birdVel += GRAVITY;
        s.birdY += s.birdVel;
        s.frame++;

        // Spawn pipes
        if (s.frame % PIPE_INTERVAL === 0) {
          const topH = 60 + Math.random() * (H - PIPE_GAP - 120);
          s.pipes.push({ x: W, topH, scored: false });
        }

        // Move pipes + collision + score
        for (let i = s.pipes.length - 1; i >= 0; i--) {
          const p = s.pipes[i];
          p.x -= PIPE_SPEED;

          // Score
          if (!p.scored && p.x + PIPE_WIDTH < W / 4) {
            p.scored = true;
            s.score++;
            setScore(s.score);
          }

          // Remove off-screen
          if (p.x + PIPE_WIDTH < 0) {
            s.pipes.splice(i, 1);
          }

          // Collision
          const birdL = W / 4 - BIRD_SIZE / 2;
          const birdR = W / 4 + BIRD_SIZE / 2;
          const birdT = s.birdY - BIRD_SIZE / 2;
          const birdB = s.birdY + BIRD_SIZE / 2;

          if (birdR > p.x && birdL < p.x + PIPE_WIDTH) {
            if (birdT < p.topH || birdB > p.topH + PIPE_GAP) {
              s.dead = true;
              setGameState("dead");
              if (s.score > bestScore) {
                setBestScore(s.score);
                localStorage.setItem("flappy-best", String(s.score));
              }
            }
          }
        }

        // Floor / ceiling
        if (s.birdY + BIRD_SIZE / 2 > H || s.birdY - BIRD_SIZE / 2 < 0) {
          s.dead = true;
          setGameState("dead");
          if (s.score > bestScore) {
            setBestScore(s.score);
            localStorage.setItem("flappy-best", String(s.score));
          }
        }
      }

      // Render
      ctx.fillStyle = "#0a0a14";
      ctx.fillRect(0, 0, W, H);

      // Pipes
      for (const p of s.pipes) {
        // Top pipe
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(p.x, 0, PIPE_WIDTH, p.topH);
        ctx.strokeStyle = "#2d2d4e";
        ctx.lineWidth = 2;
        ctx.strokeRect(p.x, 0, PIPE_WIDTH, p.topH);

        // Bottom pipe
        const botY = p.topH + PIPE_GAP;
        ctx.fillStyle = "#1a1a2e";
        ctx.fillRect(p.x, botY, PIPE_WIDTH, H - botY);
        ctx.strokeStyle = "#2d2d4e";
        ctx.strokeRect(p.x, botY, PIPE_WIDTH, H - botY);
      }

      // Bird
      const bAngle = Math.min(Math.max(s.birdVel * 3, -30), 60) * (Math.PI / 180);
      ctx.save();
      ctx.translate(W / 4, s.birdY);
      ctx.rotate(bAngle);
      ctx.font = `${BIRD_SIZE * 1.5}px serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🐤", 0, 0);
      ctx.restore();

      // Score
      ctx.font = "bold 36px var(--font-geist-mono), monospace";
      ctx.fillStyle = "rgba(255,255,255,0.15)";
      ctx.textAlign = "center";
      ctx.fillText(String(s.score), W / 2, 60);

      // Idle
      if (!s.playing && !s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.3)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 22px var(--font-geist-mono), monospace";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("클릭 / Space로 시작", W / 2, H / 2);
        ctx.font = "12px var(--font-geist-mono), monospace";
        ctx.fillStyle = "#71717a";
        ctx.fillText("클릭 or Space = 점프", W / 2, H / 2 + 30);
      }

      // Dead
      if (s.dead) {
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fillRect(0, 0, W, H);
        ctx.font = "bold 28px var(--font-geist-mono), monospace";
        ctx.fillStyle = "#fff";
        ctx.textAlign = "center";
        ctx.fillText("Game Over", W / 2, H / 2 - 20);
        ctx.font = "18px var(--font-geist-mono), monospace";
        ctx.fillStyle = "#fbbf24";
        ctx.fillText(`Score: ${s.score}`, W / 2, H / 2 + 15);
        ctx.font = "12px var(--font-geist-mono), monospace";
        ctx.fillStyle = "#71717a";
        ctx.fillText("클릭해서 재시작", W / 2, H / 2 + 45);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("keydown", handleKey);
    };
  }, [jump, bestScore]);

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
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full max-w-[360px] cursor-pointer rounded-2xl border border-card-border"
        onClick={jump}
      />
      <div className="flex items-center gap-2 font-mono text-[10px] text-zinc-600">
        <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">Space</kbd>
        <span>점프</span>
        <span>·</span>
        <span>클릭/터치 가능</span>
      </div>
    </div>
  );
}
