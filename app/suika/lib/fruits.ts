export interface FruitDef {
  level: number;
  emoji: string;
  label: string;
  radius: number;
  color: string;       // fill color for the circle behind emoji
  borderColor: string;
  score: number;
}

// Level 0 = smallest, Level 10 = biggest (watermelon!)
export const FRUITS: FruitDef[] = [
  { level: 0,  emoji: "🍒", label: "체리",     radius: 16, color: "#881337", borderColor: "#9f1239", score: 1 },
  { level: 1,  emoji: "🍓", label: "딸기",     radius: 20, color: "#9f1239", borderColor: "#be123c", score: 3 },
  { level: 2,  emoji: "🍇", label: "포도",     radius: 25, color: "#3b0764", borderColor: "#581c87", score: 6 },
  { level: 3,  emoji: "🍊", label: "귤",       radius: 30, color: "#7c2d12", borderColor: "#9a3412", score: 10 },
  { level: 4,  emoji: "🍋", label: "레몬",     radius: 36, color: "#713f12", borderColor: "#854d0e", score: 15 },
  { level: 5,  emoji: "🍑", label: "복숭아",   radius: 42, color: "#831843", borderColor: "#9d174d", score: 21 },
  { level: 6,  emoji: "🍎", label: "사과",     radius: 48, color: "#7f1d1d", borderColor: "#991b1b", score: 28 },
  { level: 7,  emoji: "🍐", label: "배",       radius: 55, color: "#365314", borderColor: "#3f6212", score: 36 },
  { level: 8,  emoji: "🍍", label: "파인애플", radius: 62, color: "#713f12", borderColor: "#92400e", score: 45 },
  { level: 9,  emoji: "🥝", label: "키위",     radius: 70, color: "#14532d", borderColor: "#166534", score: 55 },
  { level: 10, emoji: "🍉", label: "수박",     radius: 78, color: "#14532d", borderColor: "#15803d", score: 66 },
];

// Only first 5 fruits can be dropped randomly
export const DROP_MAX_LEVEL = 4;

export function getNextDropLevel(): number {
  return Math.floor(Math.random() * (DROP_MAX_LEVEL + 1));
}

export function getMergeResult(level: number): FruitDef | null {
  if (level + 1 >= FRUITS.length) return null; // max level, no merge
  return FRUITS[level + 1];
}
