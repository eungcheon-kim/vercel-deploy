"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  initGame,
  move,
  spawnTile,
  isGameOver,
  hasWon,
  GRID_SIZE,
  type TileData,
  type Direction,
} from "../lib/gameLogic";
import Tile from "./Tile";
import ScoreBoard from "../../components/ScoreBoard";

const CELL_SIZE = 80;
const GAP = 10;
const BOARD_PADDING = GAP;
const BOARD_SIZE = GRID_SIZE * CELL_SIZE + (GRID_SIZE + 1) * GAP;
const SWIPE_THRESHOLD = 30;

function useBoardScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const maxW = window.innerWidth - 32; // 16px padding each side
      setScale(maxW < BOARD_SIZE ? maxW / BOARD_SIZE : 1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return scale;
}

export default function Board() {
  const [tiles, setTiles] = useState<TileData[]>([]);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const [keepPlaying, setKeepPlaying] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [ready, setReady] = useState(false);
  const movingRef = useRef(false);

  // Touch tracking
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  // Init on mount
  useEffect(() => {
    const saved = localStorage.getItem("2048-best");
    if (saved) setBestScore(Number(saved));
    startNewGame();
    // Small delay so the initial tiles get pop animation properly
    requestAnimationFrame(() => setReady(true));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startNewGame = useCallback(() => {
    const newTiles = initGame();
    setTiles(newTiles);
    setScore(0);
    setGameOver(false);
    setWon(false);
    setKeepPlaying(false);
  }, []);

  // Handle move
  const handleMove = useCallback(
    (direction: Direction) => {
      if (movingRef.current || gameOver) return;
      if (won && !keepPlaying) return;

      movingRef.current = true;

      const result = move(tiles, direction);
      if (!result.moved) {
        movingRef.current = false;
        return;
      }

      const newScore = score + result.scoreGained;
      setScore(newScore);

      if (newScore > bestScore) {
        setBestScore(newScore);
        localStorage.setItem("2048-best", String(newScore));
      }

      // First render moved tiles, then spawn new one
      setTiles(result.tiles);

      // Spawn new tile after slide animation completes
      setTimeout(() => {
        setTiles((prev) => {
          const withNew = spawnTile(prev);

          // Check win / game over after spawn
          if (!won && !keepPlaying && hasWon(withNew)) {
            setWon(true);
          }
          if (isGameOver(withNew)) {
            setGameOver(true);
            setShowRanking(true);
          }

          return withNew;
        });
        movingRef.current = false;
      }, 150);
    },
    [tiles, score, bestScore, gameOver, won, keepPlaying]
  );

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const keyMap: Record<string, Direction> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        s: "down",
        a: "left",
        d: "right",
      };
      const dir = keyMap[e.key];
      if (dir) {
        e.preventDefault();
        handleMove(dir);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleMove]);

  // Touch / swipe controls
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    // Prevent scroll & pull-to-refresh while swiping on the board
    if (touchStartRef.current) {
      e.preventDefault();
    }
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (!touchStartRef.current) return;
      const touch = e.changedTouches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      touchStartRef.current = null;

      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      if (Math.max(absDx, absDy) < SWIPE_THRESHOLD) return;

      if (absDx > absDy) {
        handleMove(dx > 0 ? "right" : "left");
      } else {
        handleMove(dy > 0 ? "down" : "up");
      }
    },
    [handleMove]
  );

  const boardScale = useBoardScale();

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Score Bar */}
      <div className="flex w-full max-w-[370px] items-center justify-between" style={boardScale < 1 ? { maxWidth: `${BOARD_SIZE * boardScale}px` } : undefined}>
        <div className="flex gap-3">
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-5 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Score
            </span>
            <span className="font-mono text-xl font-bold text-white">{score}</span>
          </div>
          <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-5 py-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">
              Best
            </span>
            <span className="font-mono text-xl font-bold text-gold">{bestScore}</span>
          </div>
        </div>

        <button
          onClick={startNewGame}
          className="rounded-xl border border-card-border bg-card-bg px-4 py-2 font-mono text-sm text-zinc-400 transition-all hover:border-accent/30 hover:text-white"
        >
          New Game
        </button>
      </div>

      {/* Board */}
      <div style={{ width: `${BOARD_SIZE * boardScale}px`, height: `${BOARD_SIZE * boardScale}px` }}>
      <div
        className="relative origin-top-left overflow-hidden rounded-2xl border border-card-border bg-card-bg/80 backdrop-blur-sm"
        style={{
          width: `${BOARD_SIZE}px`,
          height: `${BOARD_SIZE}px`,
          touchAction: "none",
          transform: `scale(${boardScale})`,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Grid background cells */}
        {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, i) => {
          const row = Math.floor(i / GRID_SIZE);
          const col = i % GRID_SIZE;
          return (
            <div
              key={`cell-${row}-${col}`}
              className="absolute rounded-xl bg-white/[0.03]"
              style={{
                width: `${CELL_SIZE}px`,
                height: `${CELL_SIZE}px`,
                left: `${BOARD_PADDING + col * (CELL_SIZE + GAP)}px`,
                top: `${BOARD_PADDING + row * (CELL_SIZE + GAP)}px`,
              }}
            />
          );
        })}

        {/* Tiles - positioned absolutely within the board */}
        {ready &&
          tiles.map((tile) => (
            <Tile
              key={tile.id}
              tile={tile}
              cellSize={CELL_SIZE}
              gap={GAP}
              offsetX={BOARD_PADDING}
              offsetY={BOARD_PADDING}
            />
          ))}

        {/* Game Over Overlay */}
        {gameOver && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-sm">
            <p className="font-mono text-2xl font-bold text-white">Game Over!</p>
            <p className="font-mono text-lg text-gold">{score} points</p>
            <button
              onClick={startNewGame}
              className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-6 py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105 hover:shadow-[0_0_30px_-5px_rgba(139,92,246,0.5)]"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Win Overlay */}
        {won && !keepPlaying && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-4 rounded-2xl bg-black/70 backdrop-blur-sm">
            <p className="font-mono text-3xl font-bold text-gold">🎉 2048!</p>
            <p className="font-mono text-sm text-zinc-400">You did it!</p>
            <div className="flex gap-3">
              <button
                onClick={() => setKeepPlaying(true)}
                className="rounded-xl border border-gold/30 bg-gold/10 px-5 py-2.5 font-mono text-sm text-gold transition-all hover:bg-gold/20"
              >
                Keep Going
              </button>
              <button
                onClick={startNewGame}
                className="rounded-xl bg-gradient-to-r from-accent to-accent-2 px-5 py-2.5 font-mono text-sm font-bold text-white transition-all hover:scale-105"
              >
                New Game
              </button>
            </div>
          </div>
        )}
      </div>
      </div>

      {/* Controls hint */}
      <div className="flex items-center gap-4 font-mono text-xs text-zinc-600">
        <div className="flex items-center gap-1">
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">↑</kbd>
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">↓</kbd>
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">←</kbd>
          <kbd className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-zinc-400">→</kbd>
        </div>
        <span>or swipe to move</span>
      </div>

      {/* Scoreboard */}
      <ScoreBoard gameId="2048" currentScore={score} unit="점" show={showRanking} onClose={() => { setShowRanking(false); startNewGame(); }} />
    </div>
  );
}
