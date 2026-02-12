export const GRID_SIZE = 4;

export interface TileData {
  id: number;
  value: number;
  row: number;
  col: number;
  mergedFrom?: boolean; // was this tile just created from a merge?
  isNew?: boolean;      // was this tile just spawned?
}

export interface GameState {
  tiles: TileData[];
  score: number;
  bestScore: number;
  gameOver: boolean;
  won: boolean;
}

let tileIdCounter = 0;

function nextId() {
  return ++tileIdCounter;
}

export function resetIdCounter() {
  tileIdCounter = 0;
}

// Create empty grid (null = empty cell)
function createGrid(): (TileData | null)[][] {
  return Array.from({ length: GRID_SIZE }, () =>
    Array.from({ length: GRID_SIZE }, () => null)
  );
}

// Place tiles into a grid for easy manipulation
function tilesToGrid(tiles: TileData[]): (TileData | null)[][] {
  const grid = createGrid();
  for (const tile of tiles) {
    grid[tile.row][tile.col] = tile;
  }
  return grid;
}

// Flatten grid back to tile array
function gridToTiles(grid: (TileData | null)[][]): TileData[] {
  const tiles: TileData[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (grid[r][c]) tiles.push(grid[r][c]!);
    }
  }
  return tiles;
}

// Get empty cell positions
function getEmptyCells(grid: (TileData | null)[][]): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      if (!grid[r][c]) cells.push({ row: r, col: c });
    }
  }
  return cells;
}

// Spawn a new tile (90% chance = 2, 10% chance = 4)
export function spawnTile(tiles: TileData[]): TileData[] {
  const grid = tilesToGrid(tiles);
  const empty = getEmptyCells(grid);
  if (empty.length === 0) return tiles;

  const { row, col } = empty[Math.floor(Math.random() * empty.length)];
  const value = Math.random() < 0.9 ? 2 : 4;

  return [
    ...tiles.map((t) => ({ ...t, mergedFrom: false, isNew: false })),
    { id: nextId(), value, row, col, isNew: true, mergedFrom: false },
  ];
}

// Initialize a new game
export function initGame(): TileData[] {
  resetIdCounter();
  let tiles: TileData[] = [];
  tiles = spawnTile(tiles);
  tiles = spawnTile(tiles);
  return tiles;
}

// Slide a single row to the left (core merge logic)
function slideRow(row: (TileData | null)[]): { newRow: (TileData | null)[]; scoreGained: number } {
  // Remove nulls
  const filtered = row.filter((t) => t !== null) as TileData[];
  const newRow: (TileData | null)[] = [];
  let scoreGained = 0;

  let i = 0;
  while (i < filtered.length) {
    if (i + 1 < filtered.length && filtered[i].value === filtered[i + 1].value) {
      // Merge
      const mergedValue = filtered[i].value * 2;
      scoreGained += mergedValue;
      newRow.push({
        id: nextId(),
        value: mergedValue,
        row: 0, // will be set later
        col: 0,
        mergedFrom: true,
        isNew: false,
      });
      i += 2;
    } else {
      newRow.push({ ...filtered[i], mergedFrom: false, isNew: false });
      i += 1;
    }
  }

  // Fill rest with nulls
  while (newRow.length < GRID_SIZE) {
    newRow.push(null);
  }

  return { newRow, scoreGained };
}

export type Direction = "up" | "down" | "left" | "right";

// Move all tiles in a direction
export function move(
  tiles: TileData[],
  direction: Direction
): { tiles: TileData[]; scoreGained: number; moved: boolean } {
  const grid = tilesToGrid(tiles);
  let totalScore = 0;
  const newGrid = createGrid();

  if (direction === "left") {
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = grid[r];
      const { newRow, scoreGained } = slideRow(row);
      totalScore += scoreGained;
      for (let c = 0; c < GRID_SIZE; c++) {
        if (newRow[c]) {
          newRow[c]!.row = r;
          newRow[c]!.col = c;
        }
        newGrid[r][c] = newRow[c];
      }
    }
  } else if (direction === "right") {
    for (let r = 0; r < GRID_SIZE; r++) {
      const row = [...grid[r]].reverse();
      const { newRow, scoreGained } = slideRow(row);
      totalScore += scoreGained;
      const reversed = [...newRow].reverse();
      for (let c = 0; c < GRID_SIZE; c++) {
        if (reversed[c]) {
          reversed[c]!.row = r;
          reversed[c]!.col = c;
        }
        newGrid[r][c] = reversed[c];
      }
    }
  } else if (direction === "up") {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = Array.from({ length: GRID_SIZE }, (_, r) => grid[r][c]);
      const { newRow, scoreGained } = slideRow(col);
      totalScore += scoreGained;
      for (let r = 0; r < GRID_SIZE; r++) {
        if (newRow[r]) {
          newRow[r]!.row = r;
          newRow[r]!.col = c;
        }
        newGrid[r][c] = newRow[r];
      }
    }
  } else if (direction === "down") {
    for (let c = 0; c < GRID_SIZE; c++) {
      const col = Array.from({ length: GRID_SIZE }, (_, r) => grid[r][c]).reverse();
      const { newRow, scoreGained } = slideRow(col);
      totalScore += scoreGained;
      const reversed = [...newRow].reverse();
      for (let r = 0; r < GRID_SIZE; r++) {
        if (reversed[r]) {
          reversed[r]!.row = r;
          reversed[r]!.col = c;
        }
        newGrid[r][c] = reversed[r];
      }
    }
  }

  const newTiles = gridToTiles(newGrid);

  // Check if anything actually moved
  const moved = hasMoved(tiles, newTiles);

  return { tiles: newTiles, scoreGained: totalScore, moved };
}

function hasMoved(oldTiles: TileData[], newTiles: TileData[]): boolean {
  if (oldTiles.length !== newTiles.length) return true;

  const oldPositions = new Set(
    oldTiles.map((t) => `${t.row},${t.col},${t.value}`)
  );
  for (const t of newTiles) {
    if (!oldPositions.has(`${t.row},${t.col},${t.value}`)) return true;
  }
  return false;
}

// Check if game is over (no moves possible)
export function isGameOver(tiles: TileData[]): boolean {
  const grid = tilesToGrid(tiles);

  // Any empty cell = not over
  if (getEmptyCells(grid).length > 0) return false;

  // Any adjacent same values = not over
  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE; c++) {
      const val = grid[r][c]?.value;
      if (r + 1 < GRID_SIZE && grid[r + 1][c]?.value === val) return false;
      if (c + 1 < GRID_SIZE && grid[r][c + 1]?.value === val) return false;
    }
  }

  return true;
}

// Check if 2048 tile exists
export function hasWon(tiles: TileData[]): boolean {
  return tiles.some((t) => t.value >= 2048);
}
