export type Board = (number | null)[][];
export type Notes = Set<number>[][];
export type Difficulty = "easy" | "medium" | "hard";

const REMOVE_COUNT: Record<Difficulty, number> = {
  easy: 30,
  medium: 45,
  hard: 55,
};

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board: Board, row: number, col: number, num: number): boolean {
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

function solveBoardInPlace(board: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] === null) {
        const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
        for (const num of nums) {
          if (isValid(board, r, c, num)) {
            board[r][c] = num;
            if (solveBoardInPlace(board)) return true;
            board[r][c] = null;
          }
        }
        return false;
      }
    }
  }
  return true;
}

function generateSolvedBoard(): Board {
  const board: Board = Array.from({ length: 9 }, () => Array(9).fill(null));
  solveBoardInPlace(board);
  return board;
}

export function generatePuzzle(difficulty: Difficulty): {
  puzzle: Board;
  solution: Board;
} {
  const solution = generateSolvedBoard();
  const puzzle: Board = solution.map((row) => [...row]);

  const positions = shuffle(
    Array.from({ length: 81 }, (_, i) => [Math.floor(i / 9), i % 9] as [number, number])
  );

  let removed = 0;
  const target = REMOVE_COUNT[difficulty];

  for (const [r, c] of positions) {
    if (removed >= target) break;
    puzzle[r][c] = null;
    removed++;
  }

  return { puzzle, solution };
}

export function createEmptyNotes(): Notes {
  return Array.from({ length: 9 }, () =>
    Array.from({ length: 9 }, () => new Set<number>())
  );
}

export function hasConflict(
  board: Board,
  row: number,
  col: number,
  num: number
): boolean {
  for (let c = 0; c < 9; c++) {
    if (c !== col && board[row][c] === num) return true;
  }
  for (let r = 0; r < 9; r++) {
    if (r !== row && board[r][col] === num) return true;
  }
  const boxR = Math.floor(row / 3) * 3;
  const boxC = Math.floor(col / 3) * 3;
  for (let r = boxR; r < boxR + 3; r++) {
    for (let c = boxC; c < boxC + 3; c++) {
      if (r !== row || c !== col) {
        if (board[r][c] === num) return true;
      }
    }
  }
  return false;
}

export function isBoardComplete(board: Board, solution: Board): boolean {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== solution[r][c]) return false;
    }
  }
  return true;
}
