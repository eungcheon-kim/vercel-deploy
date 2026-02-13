"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import ScoreBoard from "../../components/ScoreBoard";

const ROWS = 10;
const COLS = 10;
const MINES = 15;
const CELL = 32;

type CellState = {
  mine: boolean;
  revealed: boolean;
  flagged: boolean;
  adjacent: number;
};

function createBoard(safeR: number, safeC: number): CellState[][] {
  const board: CellState[][] = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  // Place mines (avoid safe cell and neighbors)
  const safeSet = new Set<string>();
  for (let dr = -1; dr <= 1; dr++) {
    for (let dc = -1; dc <= 1; dc++) {
      safeSet.add(`${safeR + dr},${safeC + dc}`);
    }
  }

  let placed = 0;
  while (placed < MINES) {
    const r = Math.floor(Math.random() * ROWS);
    const c = Math.floor(Math.random() * COLS);
    if (!board[r][c].mine && !safeSet.has(`${r},${c}`)) {
      board[r][c].mine = true;
      placed++;
    }
  }

  // Calculate adjacency
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c].mine) continue;
      let count = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && board[nr][nc].mine) {
            count++;
          }
        }
      }
      board[r][c].adjacent = count;
    }
  }

  return board;
}

function revealCell(board: CellState[][], r: number, c: number) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return;
  const cell = board[r][c];
  if (cell.revealed || cell.flagged) return;
  cell.revealed = true;
  if (cell.adjacent === 0 && !cell.mine) {
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        revealCell(board, r + dr, c + dc);
      }
    }
  }
}

const ADJ_COLORS: Record<number, string> = {
  1: "#3b82f6",
  2: "#22c55e",
  3: "#ef4444",
  4: "#8b5cf6",
  5: "#f97316",
  6: "#06b6d4",
  7: "#1e1e1e",
  8: "#71717a",
};

export default function MineGame() {
  const [board, setBoard] = useState<CellState[][] | null>(null);
  const [gameState, setGameState] = useState<"idle" | "playing" | "won" | "lost">("idle");
  const [time, setTime] = useState(0);
  const [timerRef, setTimerRef] = useState<ReturnType<typeof setInterval> | null>(null);
  const [showRanking, setShowRanking] = useState(false);

  // Track which buttons are currently pressed for chording
  const pressedButtonsRef = useRef(new Set<number>());
  // Long-press for mobile flag
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggeredRef = useRef(false);

  const startTimer = useCallback(() => {
    const t = setInterval(() => setTime((p) => p + 1), 1000);
    setTimerRef(t);
    return t;
  }, []);

  const stopTimer = useCallback(() => {
    if (timerRef) clearInterval(timerRef);
  }, [timerRef]);

  const restart = useCallback(() => {
    stopTimer();
    setBoard(null);
    setGameState("idle");
    setTime(0);
  }, [stopTimer]);

  const checkWin = useCallback((b: CellState[][]) => {
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        if (!b[r][c].mine && !b[r][c].revealed) return false;
      }
    }
    return true;
  }, []);

  // Lose helper
  const doLose = useCallback(
    (b: CellState[][]) => {
      for (let rr = 0; rr < ROWS; rr++) {
        for (let cc = 0; cc < COLS; cc++) {
          if (b[rr][cc].mine) b[rr][cc].revealed = true;
        }
      }
      setBoard(b);
      setGameState("lost");
      stopTimer();
    },
    [stopTimer]
  );

  // Chording: if a revealed number cell is clicked and adjacent flags == its number,
  // reveal all non-flagged neighbors
  const handleChord = useCallback(
    (r: number, c: number) => {
      if (gameState !== "playing" || !board) return;
      const b = board.map((row) => row.map((cell) => ({ ...cell })));
      const cell = b[r][c];
      if (!cell.revealed || cell.adjacent === 0) return;

      // Count adjacent flags
      let flagCount = 0;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && b[nr][nc].flagged) {
            flagCount++;
          }
        }
      }

      if (flagCount !== cell.adjacent) return; // flags don't match number

      // Reveal all non-flagged unrevealed neighbors
      let hitMine = false;
      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) {
            const neighbor = b[nr][nc];
            if (!neighbor.revealed && !neighbor.flagged) {
              if (neighbor.mine) {
                hitMine = true;
              } else {
                revealCell(b, nr, nc);
              }
            }
          }
        }
      }

      if (hitMine) {
        doLose(b);
        return;
      }

      if (checkWin(b)) {
        setGameState("won");
        setShowRanking(true);
        stopTimer();
      }
      setBoard(b);
    },
    [board, gameState, checkWin, stopTimer, doLose]
  );

  const handleClick = useCallback(
    (r: number, c: number) => {
      if (gameState === "won" || gameState === "lost") return;

      let b: CellState[][];
      if (!board) {
        // First click - generate board
        b = createBoard(r, c);
        startTimer();
        setGameState("playing");
      } else {
        b = board.map((row) => row.map((cell) => ({ ...cell })));
      }

      const cell = b[r][c];

      // If already revealed + has number → treat as chord attempt
      if (cell.revealed && cell.adjacent > 0 && board) {
        handleChord(r, c);
        return;
      }

      if (cell.flagged || cell.revealed) {
        setBoard(b);
        return;
      }

      if (cell.mine) {
        doLose(b);
        return;
      }

      revealCell(b, r, c);

      if (checkWin(b)) {
        setGameState("won");
        setShowRanking(true);
        stopTimer();
      }

      setBoard(b);
    },
    [board, gameState, startTimer, stopTimer, checkWin, handleChord, doLose]
  );

  const handleRightClick = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      e.preventDefault();
      if (gameState !== "playing" || !board) return;
      const b = board.map((row) => row.map((cell) => ({ ...cell })));
      const cell = b[r][c];
      if (cell.revealed) return;
      cell.flagged = !cell.flagged;
      setBoard(b);
    },
    [board, gameState]
  );

  // Mouse down/up tracking for both-button chording
  const handleMouseDown = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      pressedButtonsRef.current.add(e.button);

      // Both buttons pressed (left=0 + right=2)
      if (pressedButtonsRef.current.has(0) && pressedButtonsRef.current.has(2)) {
        e.preventDefault();
        handleChord(r, c);
      }
    },
    [handleChord]
  );

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    pressedButtonsRef.current.delete(e.button);
  }, []);

  // Middle-click chording
  const handleMiddleClick = useCallback(
    (e: React.MouseEvent, r: number, c: number) => {
      if (e.button === 1) {
        e.preventDefault();
        handleChord(r, c);
      }
    },
    [handleChord]
  );

  // Long-press for mobile → flag
  const handleTouchStart = useCallback(
    (r: number, c: number) => {
      longPressTriggeredRef.current = false;
      longPressTimerRef.current = setTimeout(() => {
        longPressTriggeredRef.current = true;
        if (gameState !== "playing" || !board) return;
        const b = board.map((row) => row.map((cell) => ({ ...cell })));
        const cell = b[r][c];
        if (cell.revealed) {
          // Long-press on revealed number = chord
          handleChord(r, c);
        } else {
          // Long-press on unrevealed = toggle flag
          cell.flagged = !cell.flagged;
          setBoard(b);
        }
      }, 400);
    },
    [board, gameState, handleChord]
  );

  const handleTouchEnd = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleCellClick = useCallback(
    (r: number, c: number) => {
      // Skip if long-press already fired
      if (longPressTriggeredRef.current) return;
      handleClick(r, c);
    },
    [handleClick]
  );

  const flagCount = useMemo(() => {
    if (!board) return 0;
    return board.flat().filter((c) => c.flagged).length;
  }, [board]);

  const displayBoard = board ?? Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="flex gap-3">
        <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Mines</span>
          <span className="font-mono text-lg font-bold text-red-400">{MINES - flagCount}</span>
        </div>
        <div className="flex flex-col items-center rounded-xl border border-card-border bg-card-bg px-4 py-2">
          <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-500">Time</span>
          <span className="font-mono text-lg font-bold text-white">{time}s</span>
        </div>
        <button
          onClick={restart}
          className="flex flex-col items-center justify-center rounded-xl border border-card-border bg-card-bg px-4 py-2 transition-all hover:border-accent/30 hover:bg-accent/5"
        >
          <span className="text-lg">{gameState === "won" ? "😎" : gameState === "lost" ? "💀" : "🙂"}</span>
        </button>
      </div>

      <div
        className="rounded-2xl border border-card-border bg-[#0a0a14] p-1"
        style={{ width: COLS * (CELL + 2) + 6 }}
        onMouseLeave={() => pressedButtonsRef.current.clear()}
      >
        {displayBoard.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <button
                key={c}
                className="m-[1px] flex items-center justify-center rounded-sm font-mono text-xs font-bold transition-all"
                style={{
                  width: CELL,
                  height: CELL,
                  backgroundColor: cell.revealed
                    ? cell.mine
                      ? "#7f1d1d"
                      : "#1a1a2e"
                    : "#252540",
                  cursor: gameState === "won" || gameState === "lost" ? "default" : "pointer",
                }}
                onClick={() => handleCellClick(r, c)}
                onContextMenu={(e) => handleRightClick(e, r, c)}
                onMouseDown={(e) => handleMouseDown(e, r, c)}
                onMouseUp={handleMouseUp}
                onAuxClick={(e) => handleMiddleClick(e, r, c)}
                onTouchStart={() => handleTouchStart(r, c)}
                onTouchEnd={handleTouchEnd}
              >
                {cell.revealed ? (
                  cell.mine ? (
                    <span className="text-sm">💣</span>
                  ) : cell.adjacent > 0 ? (
                    <span style={{ color: ADJ_COLORS[cell.adjacent] ?? "#fff" }}>
                      {cell.adjacent}
                    </span>
                  ) : null
                ) : cell.flagged ? (
                  <span className="text-sm">🚩</span>
                ) : null}
              </button>
            ))}
          </div>
        ))}
      </div>

      {gameState === "won" && (
        <>
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 px-6 py-3 text-center">
            <p className="font-mono text-sm font-bold text-green-400">클리어! 🎉</p>
            <p className="font-mono text-xs text-zinc-400">{time}초 만에 해결!</p>
          </div>
          <button
            onClick={restart}
            className="rounded-xl border border-card-border bg-card-bg px-5 py-2 font-mono text-xs text-zinc-400 transition-all hover:border-accent/30 hover:text-white"
          >
            다시 하기
          </button>
          <ScoreBoard gameId="mine" currentScore={time} unit="초" show={showRanking} onClose={() => { setShowRanking(false); restart(); }} />
        </>
      )}
      {gameState === "lost" && (
        <>
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-6 py-3 text-center">
            <p className="font-mono text-sm font-bold text-red-400">💥 지뢰를 밟았습니다!</p>
            <p className="font-mono text-xs text-zinc-400">아래 버튼으로 재시작</p>
          </div>
          <button
            onClick={restart}
            className="rounded-xl border border-card-border bg-card-bg px-5 py-2 font-mono text-xs text-zinc-400 transition-all hover:border-accent/30 hover:text-white"
          >
            다시 하기
          </button>
        </>
      )}

      <div className="flex flex-col items-center gap-1 font-mono text-[10px] text-zinc-600">
        <div className="flex items-center gap-2">
          <span>좌클릭 = 열기</span>
          <span>·</span>
          <span>우클릭 = 깃발 🚩</span>
          <span>·</span>
          <span>첫 클릭은 안전!</span>
        </div>
        <div className="flex items-center gap-2">
          <span>양클릭/미들클릭 = 코딩(자동 열기)</span>
          <span>·</span>
          <span>모바일: 길게 누르기 = 깃발/코딩</span>
        </div>
      </div>
    </div>
  );
}
