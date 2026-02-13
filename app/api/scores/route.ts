import { NextRequest, NextResponse } from "next/server";
import { getRedis, GAME_CONFIG } from "@/app/lib/redis";

export const dynamic = "force-dynamic";

const MAX_ENTRIES = 10;

// GET /api/scores?game=2048
export async function GET(req: NextRequest) {
  const game = req.nextUrl.searchParams.get("game");

  if (!game || !GAME_CONFIG[game]) {
    return NextResponse.json({ error: "Invalid game" }, { status: 400 });
  }

  const config = GAME_CONFIG[game];
  const key = `scores:${game}`;

  try {
    const redis = getRedis();
    const raw = await redis.zrange(key, 0, MAX_ENTRIES - 1, { rev: true, withScores: true });

    // raw = [uuid1, score1, uuid2, score2, ...]
    const uuids: string[] = [];
    const scoreMap: Record<string, number> = {};
    for (let i = 0; i < raw.length; i += 2) {
      const uuid = raw[i] as string;
      const storedScore = raw[i + 1] as number;
      const score = config.direction === "asc" ? -storedScore : storedScore;
      uuids.push(uuid);
      scoreMap[uuid] = score;
    }

    // Batch fetch nicknames
    let nickMap: Record<string, string> = {};
    if (uuids.length > 0) {
      const pipeline = redis.pipeline();
      for (const uuid of uuids) {
        pipeline.hget("users", uuid);
      }
      const results = await pipeline.exec();
      for (let i = 0; i < uuids.length; i++) {
        nickMap[uuids[i]] = (results[i] as string) || "익명";
      }
    }

    const entries = uuids.map((uuid) => ({
      nickname: nickMap[uuid],
      score: scoreMap[uuid],
      uuid,
    }));

    return NextResponse.json({ game, entries });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PATCH /api/scores  { uuid, nickname } — update nickname only
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { uuid, nickname } = body;

    if (!uuid || typeof uuid !== "string") {
      return NextResponse.json({ error: "UUID required" }, { status: 400 });
    }
    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return NextResponse.json({ error: "Nickname required" }, { status: 400 });
    }

    const redis = getRedis();
    const trimmedNickname = nickname.trim().substring(0, 20);
    await redis.hset("users", { [uuid]: trimmedNickname });

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/scores  { game, uuid, nickname, score }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { game, uuid, nickname, score } = body;

    if (!game || !GAME_CONFIG[game]) {
      return NextResponse.json({ error: "Invalid game" }, { status: 400 });
    }
    if (!uuid || typeof uuid !== "string") {
      return NextResponse.json({ error: "UUID required" }, { status: 400 });
    }
    if (!nickname || typeof nickname !== "string" || nickname.trim().length === 0) {
      return NextResponse.json({ error: "Nickname required" }, { status: 400 });
    }
    if (typeof score !== "number" || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const config = GAME_CONFIG[game];
    const redis = getRedis();
    const key = `scores:${game}`;
    const trimmedNickname = nickname.trim().substring(0, 20);

    // Save/update nickname for this UUID
    await redis.hset("users", { [uuid]: trimmedNickname });

    // For asc games (lower is better), store as negative
    const storedScore = config.direction === "asc" ? -score : score;

    // Check existing score for this user
    const existing = await redis.zscore(key, uuid);

    // Only update if new score is better
    let shouldUpdate = true;
    if (existing !== null) {
      if (config.direction === "desc" && storedScore <= existing) {
        shouldUpdate = false; // existing is higher or equal
      }
      if (config.direction === "asc" && storedScore <= existing) {
        // for asc, stored as negative, so higher stored = worse original
        // storedScore <= existing means new negative is more negative = better
        shouldUpdate = true;
      }
      if (config.direction === "desc" && storedScore > existing) {
        shouldUpdate = true;
      }
    }

    if (shouldUpdate) {
      await redis.zadd(key, { score: storedScore, member: uuid });
    }

    // Trim old entries
    const total = await redis.zcard(key);
    if (total > MAX_ENTRIES * 3) {
      await redis.zremrangebyrank(key, 0, total - MAX_ENTRIES * 3 - 1);
    }

    return NextResponse.json({ success: true, updated: shouldUpdate });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
