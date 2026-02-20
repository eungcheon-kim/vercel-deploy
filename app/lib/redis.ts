import { Redis } from "@upstash/redis";

// Lazy-initialize Redis client so builds don't fail without env vars
let _redis: Redis | null = null;

export function getRedis(): Redis {
  if (!_redis) {
    const url = process.env.UPSTASH_REDIS_REST_URL;
    const token = process.env.UPSTASH_REDIS_REST_TOKEN;

    if (!url || !token || !url.startsWith("https")) {
      throw new Error(
        "Missing or invalid UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN. " +
        "Please set them in .env.local or Vercel environment variables."
      );
    }

    _redis = new Redis({ url, token });
  }
  return _redis;
}

// Game IDs and their score direction
// "desc" = higher is better, "asc" = lower is better
export const GAME_CONFIG: Record<
  string,
  { label: string; unit: string; direction: "desc" | "asc" }
> = {
  "2048": { label: "2048", unit: "점", direction: "desc" },
  flappy: { label: "플래피 버드", unit: "점", direction: "desc" },
  snake: { label: "스네이크", unit: "점", direction: "desc" },
  suika: { label: "수박게임", unit: "점", direction: "desc" },
  reaction: { label: "반응속도", unit: "ms", direction: "asc" },
  mine: { label: "지뢰찾기", unit: "초", direction: "asc" },
  memory: { label: "메모리 카드", unit: "초", direction: "asc" },
  colormatch: { label: "컬러 매치", unit: "점", direction: "desc" },
  aim: { label: "에임 트레이너", unit: "ms", direction: "asc" },
  maze: { label: "미로 탈출", unit: "초", direction: "asc" },
  sudoku: { label: "스도쿠", unit: "초", direction: "asc" },
  typing: { label: "타이핑 레이서", unit: "WPM", direction: "desc" },
  wordle: { label: "워들", unit: "회", direction: "asc" },
};
