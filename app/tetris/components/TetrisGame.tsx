"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const COLS = 10;
const ROWS = 20;
const PREVIEW_SIZE = 4;

const COLORS: Record<string, string> = {
  I: "#00f0f0",
  O: "#f0f000",
  T: "#a000f0",
  S: "#00f000",
  Z: "#f00000",
  J: "#0000f0",
  L: "#f0a000",
};

const GLOW: Record<string, string> = {
  I: "rgba(0,240,240,0.5)",
  O: "rgba(240,240,0,0.5)",
  T: "rgba(160,0,240,0.5)",
  S: "rgba(0,240,0,0.5)",
  Z: "rgba(240,0,0,0.5)",
  J: "rgba(0,0,240,0.5)",
  L: "rgba(240,160,0,0.5)",
};

type Piece = { type: string; shape: number[][]; x: number; y: number };

const SHAPES: Record<string, number[][][]> = {
  I: [
    [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
    [[0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0], [0, 0, 1, 0]],
    [[0, 0, 0, 0], [0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0]],
    [[0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0], [0, 1, 0, 0]],
  ],
  O: [
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
    [[1, 1], [1, 1]],
  ],
  T: [
    [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 1, 0]],
    [[0, 1, 0], [1, 1, 0], [0, 1, 0]],
  ],
  S: [
    [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 1], [0, 0, 1]],
    [[0, 0, 0], [0, 1, 1], [1, 1, 0]],
    [[1, 0, 0], [1, 1, 0], [0, 1, 0]],
  ],
  Z: [
    [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
    [[0, 0, 1], [0, 1, 1], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 0], [0, 1, 1]],
    [[0, 1, 0], [1, 1, 0], [1, 0, 0]],
  ],
  J: [
    [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 1], [0, 1, 0], [0, 1, 0]],
    [[0, 0, 0], [1, 1, 1], [0, 0, 1]],
    [[0, 1, 0], [0, 1, 0], [1, 1, 0]],
  ],
  L: [
    [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
    [[0, 1, 0], [0, 1, 0], [0, 1, 1]],
    [[0, 0, 0], [1, 1, 1], [1, 0, 0]],
    [[1, 1, 0], [0, 1, 0], [0, 1, 0]],
  ],
};

const WALL_KICKS_NORMAL: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-1, 0], [-1, 1], [0, -2], [-1, -2]],
  "1>2": [[0, 0], [1, 0], [1, -1], [0, 2], [1, 2]],
  "2>3": [[0, 0], [1, 0], [1, 1], [0, -2], [1, -2]],
  "3>0": [[0, 0], [-1, 0], [-1, -1], [0, 2], [-1, 2]],
};

const WALL_KICKS_I: Record<string, [number, number][]> = {
  "0>1": [[0, 0], [-2, 0], [1, 0], [-2, -1], [1, 2]],
  "1>2": [[0, 0], [-1, 0], [2, 0], [-1, 2], [2, -1]],
  "2>3": [[0, 0], [2, 0], [-1, 0], [2, 1], [-1, -2]],
  "3>0": [[0, 0], [1, 0], [-2, 0], [1, -2], [-2, 1]],
};

const SCORE_TABLE = [0, 100, 300, 500, 800];
const BEST_KEY = "tetris-best";
const PIECE_TYPES = ["I", "O", "T", "S", "Z", "J", "L"];

function createEmptyBoard(): (string | null)[][] {
  return Array.from({ length: ROWS }, () => Array(COLS).fill(null));
}

function randomType(): string {
  return PIECE_TYPES[Math.floor(Math.random() * PIECE_TYPES.length)];
}

function spawnPiece(type: string): Piece {
  const shape = SHAPES[type][0];
  return { type, shape, x: Math.floor((COLS - shape[0].length) / 2), y: 0 };
}

function getRotationIndex(shape: number[][], type: string): number {
  const rotations = SHAPES[type];
  for (let i = 0; i < rotations.length; i++) {
    if (JSON.stringify(rotations[i]) === JSON.stringify(shape)) return i;
  }
  return 0;
}

function collides(board: (string | null)[][], piece: Piece): boolean {
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const nx = piece.x + c;
      const ny = piece.y + r;
      if (nx < 0 || nx >= COLS || ny >= ROWS) return true;
      if (ny >= 0 && board[ny][nx]) return true;
    }
  }
  return false;
}

function lockPiece(board: (string | null)[][], piece: Piece): (string | null)[][] {
  const newBoard = board.map((row) => [...row]);
  for (let r = 0; r < piece.shape.length; r++) {
    for (let c = 0; c < piece.shape[r].length; c++) {
      if (!piece.shape[r][c]) continue;
      const ny = piece.y + r;
      const nx = piece.x + c;
      if (ny >= 0 && ny < ROWS && nx >= 0 && nx < COLS) {
        newBoard[ny][nx] = piece.type;
      }
    }
  }
  return newBoard;
}

function clearLines(board: (string | null)[][]): { board: (string | null)[][]; cleared: number } {
  const kept = board.filter((row) => row.some((cell) => !cell));
  const cleared = ROWS - kept.length;
  const empty: (string | null)[][] = Array.from({ length: cleared }, () => Array(COLS).fill(null));
  return { board: [...empty, ...kept], cleared };
}

function getGhostY(board: (string | null)[][], piece: Piece): number {
  let gy = piece.y;
  while (!collides(board, { ...piece, y: gy + 1 })) gy++;
  return gy;
}

export default function TetrisGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  const boardRef = useRef<(string | null)[][]>(createEmptyBoard());
  const pieceRef = useRef<Piece | null>(null);
  const nextTypeRef = useRef<string>(randomType());
  const scoreRef = useRef(0);
  const linesRef = useRef(0);
  const levelRef = useRef(1);
  const gameStateRef = useRef<"idle" | "playing" | "dead">("idle");
  const dropTimerRef = useRef(0);
  const lastTimeRef = useRef(0);
  const animFrameRef = useRef(0);
  const clearingRowsRef = useRef<number[]>([]);
  const clearAnimTimerRef = useRef(0);

  const [score, setScore] = useState(0);
  const [lines, setLines] = useState(0);
  const [level, setLevel] = useState(1);
  const [best, setBest] = useState(0);
  const [gameState, setGameState] = useState<"idle" | "playing" | "dead">("idle");
  const [finalScore, setFinalScore] = useState(0);
  const [showRanking, setShowRanking] = useState(false);
  const [cellSize, setCellSize] = useState(28);

  useEffect(() => {
    const stored = localStorage.getItem(BEST_KEY);
    if (stored) setBest(parseInt(stored, 10));

    function handleResize() {
      const maxW = Math.min(window.innerWidth - 48, 400);
      const maxH = window.innerHeight - 320;
      const cs = Math.floor(Math.min(maxW / COLS, maxH / ROWS));
      setCellSize(Math.max(16, Math.min(cs, 32)));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const dropInterval = useCallback(() => {
    return Math.max(50, 800 - (levelRef.current - 1) * 70);
  }, []);

  const syncUI = useCallback(() => {
    setScore(scoreRef.current);
    setLines(linesRef.current);
    setLevel(levelRef.current);
  }, []);

  const die = useCallback(() => {
    gameStateRef.current = "dead";
    setGameState("dead");
    setFinalScore(scoreRef.current);
    if (scoreRef.current > (parseInt(localStorage.getItem(BEST_KEY) ?? "0", 10))) {
      localStorage.setItem(BEST_KEY, String(scoreRef.current));
      setBest(scoreRef.current);
    }
    setShowRanking(true);
  }, []);

  const spawnNext = useCallback((): boolean => {
    const type = nextTypeRef.current;
    nextTypeRef.current = randomType();
    const piece = spawnPiece(type);
    if (collides(boardRef.current, piece)) return false;
    pieceRef.current = piece;
    return true;
  }, []);

  const hardDrop = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece) return;
    const gy = getGhostY(boardRef.current, piece);
    scoreRef.current += (gy - piece.y) * 2;
    piece.y = gy;
    boardRef.current = lockPiece(boardRef.current, piece);
    pieceRef.current = null;

    const fullRows: number[] = [];
    for (let r = 0; r < ROWS; r++) {
      if (boardRef.current[r].every((c) => c !== null)) fullRows.push(r);
    }

    if (fullRows.length > 0) {
      clearingRowsRef.current = fullRows;
      clearAnimTimerRef.current = 300;
    } else {
      if (!spawnNext()) { die(); return; }
    }
    syncUI();
  }, [spawnNext, die, syncUI]);

  const movePiece = useCallback((dx: number, dy: number): boolean => {
    const piece = pieceRef.current;
    if (!piece) return false;
    const moved = { ...piece, x: piece.x + dx, y: piece.y + dy };
    if (!collides(boardRef.current, moved)) {
      pieceRef.current = moved;
      return true;
    }
    return false;
  }, []);

  const rotatePiece = useCallback(() => {
    const piece = pieceRef.current;
    if (!piece || piece.type === "O") return;
    const rotIdx = getRotationIndex(piece.shape, piece.type);
    const newIdx = (rotIdx + 1) % 4;
    const newShape = SHAPES[piece.type][newIdx];
    const kicks = piece.type === "I" ? WALL_KICKS_I : WALL_KICKS_NORMAL;
    const key = `${rotIdx}>${newIdx}`;
    const tests = kicks[key] ?? [[0, 0]];

    for (const [kx, ky] of tests) {
      const candidate: Piece = { ...piece, shape: newShape, x: piece.x + kx, y: piece.y - ky };
      if (!collides(boardRef.current, candidate)) {
        pieceRef.current = candidate;
        return;
      }
    }
  }, []);

  const drawBlock = useCallback(
    (ctx: CanvasRenderingContext2D, x: number, y: number, color: string, glow: string, alpha = 1) => {
      const cs = cellSize;
      const px = x * cs;
      const py = y * cs;
      ctx.globalAlpha = alpha;
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 6;
      ctx.fillRect(px + 1, py + 1, cs - 2, cs - 2);
      ctx.shadowBlur = 0;
      ctx.globalAlpha = alpha * 0.3;
      ctx.fillStyle = "#fff";
      ctx.fillRect(px + 2, py + 2, cs - 6, 2);
      ctx.fillRect(px + 2, py + 2, 2, cs - 6);
      ctx.globalAlpha = 1;
    },
    [cellSize],
  );

  const render = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const cs = cellSize;
    const w = COLS * cs;
    const h = ROWS * cs;
    canvas.width = w;
    canvas.height = h;

    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "rgba(8,8,20,0.95)";
    ctx.fillRect(0, 0, w, h);

    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.lineWidth = 0.5;
    for (let r = 0; r <= ROWS; r++) {
      ctx.beginPath();
      ctx.moveTo(0, r * cs);
      ctx.lineTo(w, r * cs);
      ctx.stroke();
    }
    for (let c = 0; c <= COLS; c++) {
      ctx.beginPath();
      ctx.moveTo(c * cs, 0);
      ctx.lineTo(c * cs, h);
      ctx.stroke();
    }

    const board = boardRef.current;
    const clearingRows = clearingRowsRef.current;

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = board[r][c];
        if (!cell) continue;
        const isClearingRow = clearingRows.includes(r);
        const alpha = isClearingRow ? Math.max(0, clearAnimTimerRef.current / 300) : 1;
        drawBlock(ctx, c, r, COLORS[cell], GLOW[cell], alpha);
      }
    }

    const piece = pieceRef.current;
    if (piece && clearingRows.length === 0) {
      const gy = getGhostY(board, piece);
      if (gy !== piece.y) {
        for (let r = 0; r < piece.shape.length; r++) {
          for (let c = 0; c < piece.shape[r].length; c++) {
            if (!piece.shape[r][c]) continue;
            const px = piece.x + c;
            const py = gy + r;
            if (py >= 0) {
              ctx.strokeStyle = COLORS[piece.type];
              ctx.globalAlpha = 0.25;
              ctx.lineWidth = 1;
              ctx.strokeRect(px * cs + 1, py * cs + 1, cs - 2, cs - 2);
              ctx.globalAlpha = 1;
            }
          }
        }
      }

      for (let r = 0; r < piece.shape.length; r++) {
        for (let c = 0; c < piece.shape[r].length; c++) {
          if (!piece.shape[r][c]) continue;
          const px = piece.x + c;
          const py = piece.y + r;
          if (py >= 0) {
            drawBlock(ctx, px, py, COLORS[piece.type], GLOW[piece.type]);
          }
        }
      }
    }

    const previewCanvas = previewCanvasRef.current;
    if (previewCanvas) {
      const pCtx = previewCanvas.getContext("2d");
      if (pCtx) {
        const ps = Math.floor(cs * 0.7);
        previewCanvas.width = PREVIEW_SIZE * ps;
        previewCanvas.height = PREVIEW_SIZE * ps;
        pCtx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        pCtx.fillStyle = "rgba(8,8,20,0.6)";
        pCtx.fillRect(0, 0, previewCanvas.width, previewCanvas.height);

        const nextShape = SHAPES[nextTypeRef.current][0];
        const shH = nextShape.length;
        const shW = nextShape[0].length;
        const offX = (PREVIEW_SIZE - shW) / 2;
        const offY = (PREVIEW_SIZE - shH) / 2;

        for (let r = 0; r < shH; r++) {
          for (let c = 0; c < shW; c++) {
            if (!nextShape[r][c]) continue;
            const bx = (offX + c) * ps;
            const by = (offY + r) * ps;
            pCtx.fillStyle = COLORS[nextTypeRef.current];
            pCtx.shadowColor = GLOW[nextTypeRef.current];
            pCtx.shadowBlur = 4;
            pCtx.fillRect(bx + 1, by + 1, ps - 2, ps - 2);
            pCtx.shadowBlur = 0;
          }
        }
      }
    }
  }, [cellSize, drawBlock]);

  const gameLoop = useCallback(
    (time: number) => {
      if (gameStateRef.current !== "playing") return;

      const dt = time - lastTimeRef.current;
      lastTimeRef.current = time;

      if (clearingRowsRef.current.length > 0) {
        clearAnimTimerRef.current -= dt;
        if (clearAnimTimerRef.current <= 0) {
          const result = clearLines(boardRef.current);
          boardRef.current = result.board;
          const cleared = result.cleared;
          scoreRef.current += SCORE_TABLE[cleared] * levelRef.current;
          linesRef.current += cleared;
          levelRef.current = Math.floor(linesRef.current / 10) + 1;
          clearingRowsRef.current = [];
          syncUI();
          if (!spawnNext()) {
            die();
            render();
            return;
          }
        }
        render();
        animFrameRef.current = requestAnimationFrame(gameLoop);
        return;
      }

      dropTimerRef.current += dt;
      if (dropTimerRef.current >= dropInterval()) {
        dropTimerRef.current = 0;
        if (!movePiece(0, 1)) {
          const piece = pieceRef.current;
          if (piece) {
            boardRef.current = lockPiece(boardRef.current, piece);
            pieceRef.current = null;

            const fullRows: number[] = [];
            for (let r = 0; r < ROWS; r++) {
              if (boardRef.current[r].every((c) => c !== null)) fullRows.push(r);
            }

            if (fullRows.length > 0) {
              clearingRowsRef.current = fullRows;
              clearAnimTimerRef.current = 300;
            } else {
              if (!spawnNext()) {
                die();
                render();
                return;
              }
            }
          }
          syncUI();
        }
      }

      render();
      animFrameRef.current = requestAnimationFrame(gameLoop);
    },
    [dropInterval, movePiece, spawnNext, die, render, syncUI],
  );

  const startGame = useCallback(() => {
    boardRef.current = createEmptyBoard();
    pieceRef.current = null;
    nextTypeRef.current = randomType();
    scoreRef.current = 0;
    linesRef.current = 0;
    levelRef.current = 1;
    dropTimerRef.current = 0;
    clearingRowsRef.current = [];
    clearAnimTimerRef.current = 0;

    gameStateRef.current = "playing";
    setGameState("playing");
    setScore(0);
    setLines(0);
    setLevel(1);

    spawnNext();
    lastTimeRef.current = performance.now();
    cancelAnimationFrame(animFrameRef.current);
    animFrameRef.current = requestAnimationFrame(gameLoop);
  }, [spawnNext, gameLoop]);

  const resetGame = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    gameStateRef.current = "idle";
    setGameState("idle");
    boardRef.current = createEmptyBoard();
    pieceRef.current = null;
    setScore(0);
    setLines(0);
    setLevel(1);
    render();
  }, [render]);

  useEffect(() => {
    render();
  }, [render]);

  useEffect(() => {
    if (gameState !== "playing") return;

    function handleKey(e: KeyboardEvent) {
      if (gameStateRef.current !== "playing" || clearingRowsRef.current.length > 0) return;

      switch (e.key) {
        case "ArrowLeft":
          e.preventDefault();
          movePiece(-1, 0);
          render();
          break;
        case "ArrowRight":
          e.preventDefault();
          movePiece(1, 0);
          render();
          break;
        case "ArrowDown":
          e.preventDefault();
          if (movePiece(0, 1)) {
            scoreRef.current += 1;
            dropTimerRef.current = 0;
            syncUI();
          }
          render();
          break;
        case "ArrowUp":
          e.preventDefault();
          rotatePiece();
          render();
          break;
        case " ":
          e.preventDefault();
          hardDrop();
          render();
          break;
      }
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [gameState, movePiece, rotatePiece, hardDrop, render, syncUI]);

  useEffect(() => {
    return () => cancelAnimationFrame(animFrameRef.current);
  }, []);

  const handleTouch = useCallback(
    (action: string) => {
      if (gameStateRef.current !== "playing" || clearingRowsRef.current.length > 0) return;
      switch (action) {
        case "left":
          movePiece(-1, 0);
          break;
        case "right":
          movePiece(1, 0);
          break;
        case "rotate":
          rotatePiece();
          break;
        case "down":
          if (movePiece(0, 1)) {
            scoreRef.current += 1;
            dropTimerRef.current = 0;
            syncUI();
          }
          break;
        case "drop":
          hardDrop();
          break;
      }
      render();
    },
    [movePiece, rotatePiece, hardDrop, render, syncUI],
  );

  const gridW = COLS * cellSize;
  const gridH = ROWS * cellSize;

  return (
    <div
      className="flex flex-col items-center gap-4"
      style={{ touchAction: "none", overscrollBehavior: "none" }}
    >
      <div className="flex items-start gap-4">
        {/* Info panel */}
        <div className="flex flex-col gap-3">
          <div className="rounded-xl border border-card-border bg-[#0c0c18]/90 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">점수</p>
            <p className="font-mono text-lg font-bold text-cyan-400">{score.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-card-border bg-[#0c0c18]/90 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">레벨</p>
            <p className="font-mono text-lg font-bold text-teal-400">{level}</p>
          </div>
          <div className="rounded-xl border border-card-border bg-[#0c0c18]/90 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">줄</p>
            <p className="font-mono text-lg font-bold text-blue-400">{lines}</p>
          </div>
          <div className="rounded-xl border border-card-border bg-[#0c0c18]/90 p-3 backdrop-blur-sm">
            <p className="font-mono text-[9px] uppercase tracking-wider text-zinc-600">최고</p>
            <p className="font-mono text-sm font-bold text-amber-400">{best.toLocaleString()}</p>
          </div>
          <div className="rounded-xl border border-card-border bg-[#0c0c18]/90 p-3 backdrop-blur-sm">
            <p className="mb-1 font-mono text-[9px] uppercase tracking-wider text-zinc-600">다음</p>
            <canvas
              ref={previewCanvasRef}
              className="rounded"
              style={{
                width: PREVIEW_SIZE * Math.floor(cellSize * 0.7),
                height: PREVIEW_SIZE * Math.floor(cellSize * 0.7),
              }}
            />
          </div>
        </div>

        {/* Game board */}
        <div className="relative">
          <div
            className="rounded-xl border border-cyan-500/20 shadow-[0_0_30px_-5px_rgba(0,240,240,0.15)]"
            style={{ width: gridW, height: gridH }}
          >
            <canvas
              ref={canvasRef}
              className="block rounded-xl"
              style={{ width: gridW, height: gridH }}
            />
          </div>

          {gameState === "idle" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/70 backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-cyan-400">테트리스</p>
              <button
                onClick={startGame}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-8 py-3 font-mono text-sm text-cyan-300 transition-all hover:bg-cyan-500/20"
              >
                시작하기
              </button>
              <div className="mt-2 font-mono text-[10px] text-zinc-600">
                <p>← → 이동 · ↑ 회전 · ↓ 소프트드롭</p>
                <p className="text-center">스페이스 하드드롭</p>
              </div>
            </div>
          )}

          {gameState === "dead" && !showRanking && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-xl bg-black/70 backdrop-blur-sm">
              <p className="font-mono text-lg font-bold text-red-400">게임 오버</p>
              <p className="font-mono text-2xl font-bold text-white">{finalScore.toLocaleString()}점</p>
              <button
                onClick={startGame}
                className="rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-6 py-2 font-mono text-sm text-cyan-300 transition-all hover:bg-cyan-500/20"
              >
                다시하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile controls */}
      <div className="flex items-center gap-2 sm:hidden">
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouch("left"); }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-[#0c0c18]/90 text-lg text-zinc-400 active:bg-white/10"
        >
          ◀
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouch("rotate"); }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-lg text-cyan-400 active:bg-cyan-500/20"
        >
          ↻
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouch("down"); }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-[#0c0c18]/90 text-lg text-zinc-400 active:bg-white/10"
        >
          ▼
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouch("drop"); }}
          className="flex h-12 w-16 items-center justify-center rounded-xl border border-teal-500/30 bg-teal-500/10 font-mono text-xs text-teal-400 active:bg-teal-500/20"
        >
          DROP
        </button>
        <button
          onTouchStart={(e) => { e.preventDefault(); handleTouch("right"); }}
          className="flex h-12 w-12 items-center justify-center rounded-xl border border-card-border bg-[#0c0c18]/90 text-lg text-zinc-400 active:bg-white/10"
        >
          ▶
        </button>
      </div>

      <ScoreBoard
        gameId="tetris"
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
