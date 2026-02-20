"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  generatePuzzle,
  createEmptyNotes,
  hasConflict,
  isBoardComplete,
  type Board,
  type Notes,
  type Difficulty,
} from "../lib/sudoku";
import ScoreBoard from "../../components/ScoreBoard";

const DIFF_LABELS: Record<Difficulty, string> = {
  easy: "쉬움",
  medium: "보통",
  hard: "어려움",
};

const CELL_SIZE = 44;
const THIN = 1;
const THICK = 3;
const BOARD_SIZE = 9 * CELL_SIZE + 6 * THIN + 2 * THICK + 2 * THICK;

function useBoardScale() {
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const calc = () => {
      const maxW = window.innerWidth - 32;
      setScale(maxW < BOARD_SIZE ? maxW / BOARD_SIZE : 1);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);
  return scale;
}

function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

export default function SudokuGame() {
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [puzzle, setPuzzle] = useState<Board | null>(null);
  const [solution, setSolution] = useState<Board | null>(null);
  const [board, setBoard] = useState<Board | null>(null);
  const [given, setGiven] = useState<boolean[][] | null>(null);
  const [notes, setNotes] = useState<Notes | null>(null);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [timer, setTimer] = useState(0);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [bestTime, setBestTime] = useState<number | null>(null);
  const [finalScore, setFinalScore] = useState(0);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const boardScale = useBoardScale();

  useEffect(() => {
    const saved = localStorage.getItem("sudoku-best");
    if (saved) setBestTime(parseInt(saved, 10));
  }, []);

  const startNewGame = useCallback(
    (diff: Difficulty) => {
      const { puzzle: p, solution: s } = generatePuzzle(diff);
      setPuzzle(p);
      setSolution(s);
      setBoard(p.map((row) => [...row]));
      setGiven(p.map((row) => row.map((v) => v !== null)));
      setNotes(createEmptyNotes());
      setSelected(null);
      setNoteMode(false);
      setTimer(0);
      setRunning(true);
      setCompleted(false);
      setShowRanking(false);
    },
    []
  );

  useEffect(() => {
    startNewGame(difficulty);
  }, []);

  useEffect(() => {
    if (running) {
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [running]);

  const handleComplete = useCallback(
    (currentBoard: Board) => {
      if (!solution || !isBoardComplete(currentBoard, solution)) return;
      setRunning(false);
      setCompleted(true);
      setTimer((prev) => {
        const t = prev;
        setFinalScore(t);
        const saved = localStorage.getItem("sudoku-best");
        const best = saved ? parseInt(saved, 10) : Infinity;
        if (t < best) {
          localStorage.setItem("sudoku-best", String(t));
          setBestTime(t);
        }
        setTimeout(() => setShowRanking(true), 600);
        return prev;
      });
    },
    [solution]
  );

  const placeNumber = useCallback(
    (num: number) => {
      if (!selected || !board || !given || !notes || completed) return;
      const [r, c] = selected;
      if (given[r][c]) return;

      if (noteMode) {
        setNotes((prev) => {
          if (!prev) return prev;
          const next = prev.map((row) => row.map((s) => new Set(s)));
          if (next[r][c].has(num)) {
            next[r][c].delete(num);
          } else {
            next[r][c].add(num);
          }
          return next;
        });
      } else {
        setBoard((prev) => {
          if (!prev) return prev;
          const next = prev.map((row) => [...row]);
          next[r][c] = num;
          setNotes((prevN) => {
            if (!prevN) return prevN;
            const nn = prevN.map((row) => row.map((s) => new Set(s)));
            nn[r][c] = new Set();
            return nn;
          });
          setTimeout(() => handleComplete(next), 0);
          return next;
        });
      }
    },
    [selected, board, given, notes, completed, noteMode, handleComplete]
  );

  const eraseCell = useCallback(() => {
    if (!selected || !board || !given || !notes || completed) return;
    const [r, c] = selected;
    if (given[r][c]) return;

    setBoard((prev) => {
      if (!prev) return prev;
      const next = prev.map((row) => [...row]);
      next[r][c] = null;
      return next;
    });
    setNotes((prev) => {
      if (!prev) return prev;
      const next = prev.map((row) => row.map((s) => new Set(s)));
      next[r][c] = new Set();
      return next;
    });
  }, [selected, board, given, notes, completed]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!selected || !board || !given || completed) return;
      const num = parseInt(e.key, 10);
      if (num >= 1 && num <= 9) {
        placeNumber(num);
      } else if (e.key === "Backspace" || e.key === "Delete") {
        eraseCell();
      } else if (e.key === "n" || e.key === "N") {
        setNoteMode((p) => !p);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, board, given, completed, placeNumber, eraseCell]);

  if (!board || !given || !notes || !solution || !puzzle) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
      </div>
    );
  }

  const selectedVal =
    selected && board[selected[0]][selected[1]] !== null
      ? board[selected[0]][selected[1]]
      : null;

  function inSameGroup(r: number, c: number): boolean {
    if (!selected) return false;
    const [sr, sc] = selected;
    if (r === sr && c === sc) return false;
    if (r === sr) return true;
    if (c === sc) return true;
    if (
      Math.floor(r / 3) === Math.floor(sr / 3) &&
      Math.floor(c / 3) === Math.floor(sc / 3)
    )
      return true;
    return false;
  }

  function getCellClasses(r: number, c: number): string {
    const isSelected = selected?.[0] === r && selected?.[1] === c;
    const val = board![r][c];
    const isGiven = given![r][c];
    const conflict = val !== null && hasConflict(board!, r, c, val);
    const sameNumber = selectedVal !== null && val === selectedVal && !isSelected;
    const inGroup = inSameGroup(r, c);

    let bg = "bg-white/2";
    if (isSelected) bg = "bg-indigo-500/25";
    else if (sameNumber) bg = "bg-indigo-500/10";
    else if (inGroup) bg = "bg-white/5";

    let text = "text-zinc-100 font-bold";
    if (!isGiven) text = "text-indigo-400 font-semibold";
    if (conflict) text = "text-red-400 font-semibold";

    return `${bg} ${text}`;
  }

  return (
    <div className="flex w-full flex-col items-center gap-4">
      {/* Difficulty & Timer row */}
      <div className="flex w-full max-w-md items-center justify-between gap-2">
        <div className="flex gap-1">
          {(["easy", "medium", "hard"] as Difficulty[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDifficulty(d);
                startNewGame(d);
              }}
              className={`rounded-lg border px-3 py-1.5 font-mono text-[11px] transition-all ${
                difficulty === d
                  ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
                  : "border-card-border bg-card-bg/60 text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {DIFF_LABELS[d]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {bestTime !== null && (
            <span className="font-mono text-[10px] text-zinc-600">
              최고 {formatTime(bestTime)}
            </span>
          )}
          <div
            className={`rounded-lg border px-3 py-1.5 font-mono text-sm tabular-nums ${
              completed
                ? "border-green-500/30 bg-green-500/10 text-green-400"
                : "border-card-border bg-card-bg/60 text-zinc-300"
            }`}
          >
            {formatTime(timer)}
          </div>
        </div>
      </div>

      {/* Board */}
      <div
        style={{
          width: `${BOARD_SIZE * boardScale}px`,
          height: `${BOARD_SIZE * boardScale}px`,
        }}
      >
        <div
          style={{
            width: `${BOARD_SIZE}px`,
            height: `${BOARD_SIZE}px`,
            transform: `scale(${boardScale})`,
            transformOrigin: "top left",
          }}
          className="relative select-none"
        >
          <div
            className="grid rounded-xl border-[3px] border-indigo-500/40 overflow-hidden"
            style={{
              gridTemplateColumns: `repeat(9, ${CELL_SIZE}px)`,
              gridTemplateRows: `repeat(9, ${CELL_SIZE}px)`,
            }}
          >
            {board.map((row, r) =>
              row.map((val, c) => {
                const borderR =
                  c < 8
                    ? (c + 1) % 3 === 0
                      ? `${THICK}px solid rgba(129,140,248,0.3)`
                      : `${THIN}px solid rgba(255,255,255,0.06)`
                    : "none";
                const borderB =
                  r < 8
                    ? (r + 1) % 3 === 0
                      ? `${THICK}px solid rgba(129,140,248,0.3)`
                      : `${THIN}px solid rgba(255,255,255,0.06)`
                    : "none";

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => setSelected([r, c])}
                    className={`relative flex items-center justify-center text-lg transition-colors duration-100 ${getCellClasses(r, c)}`}
                    style={{
                      width: CELL_SIZE,
                      height: CELL_SIZE,
                      borderRight: borderR,
                      borderBottom: borderB,
                    }}
                  >
                    {val !== null ? (
                      val
                    ) : notes[r][c].size > 0 ? (
                      <div className="grid grid-cols-3 grid-rows-3 gap-0" style={{ width: 36, height: 36 }}>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                          <span
                            key={n}
                            className={`flex items-center justify-center text-[9px] ${
                              notes[r][c].has(n)
                                ? "text-indigo-400/70"
                                : "text-transparent"
                            }`}
                          >
                            {n}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Controls row: note toggle + erase + new game */}
      <div
        className="flex items-center gap-2"
        style={boardScale < 1 ? { maxWidth: `${BOARD_SIZE * boardScale}px` } : undefined}
      >
        <button
          onClick={() => setNoteMode((p) => !p)}
          className={`rounded-lg border px-3 py-2 font-mono text-xs transition-all ${
            noteMode
              ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-300"
              : "border-card-border bg-card-bg/60 text-zinc-500 hover:text-zinc-300"
          }`}
        >
          ✏️ 메모 {noteMode ? "ON" : "OFF"}
        </button>
        <button
          onClick={eraseCell}
          className="rounded-lg border border-card-border bg-card-bg/60 px-3 py-2 font-mono text-xs text-zinc-500 transition-all hover:text-zinc-300"
        >
          🗑 지우기
        </button>
        <button
          onClick={() => startNewGame(difficulty)}
          className="rounded-lg border border-card-border bg-card-bg/60 px-3 py-2 font-mono text-xs text-zinc-500 transition-all hover:text-zinc-300"
        >
          🔄 새 게임
        </button>
      </div>

      {/* Number pad */}
      <div
        className="grid grid-cols-9 gap-1.5"
        style={
          boardScale < 1
            ? { width: `${BOARD_SIZE * boardScale}px` }
            : { width: `${BOARD_SIZE}px` }
        }
      >
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => {
          const count = board.flat().filter((v) => v === n).length;
          const filled = count >= 9;
          return (
            <button
              key={n}
              onClick={() => placeNumber(n)}
              disabled={filled}
              className={`flex flex-col items-center justify-center rounded-xl border py-2.5 font-mono transition-all ${
                filled
                  ? "border-card-border/50 bg-card-bg/30 text-zinc-700 cursor-not-allowed"
                  : "border-card-border bg-card-bg/60 text-zinc-200 hover:border-indigo-500/40 hover:bg-indigo-500/10 hover:text-indigo-300 active:scale-95"
              }`}
            >
              <span className="text-lg font-bold">{n}</span>
              <span className="text-[8px] text-zinc-600">{9 - count}</span>
            </button>
          );
        })}
      </div>

      {/* Completion message */}
      {completed && (
        <div className="mt-2 flex flex-col items-center gap-1 rounded-xl border border-green-500/20 bg-green-500/5 px-6 py-3">
          <p className="font-mono text-sm font-bold text-green-400">
            🎉 클리어!
          </p>
          <p className="font-mono text-xs text-zinc-400">
            {formatTime(timer)}에 완료했습니다
          </p>
        </div>
      )}

      <ScoreBoard
        gameId="sudoku"
        currentScore={finalScore}
        unit="초"
        show={showRanking}
        onClose={() => {
          setShowRanking(false);
          startNewGame(difficulty);
        }}
      />
    </div>
  );
}
