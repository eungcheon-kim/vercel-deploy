import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/app/lib/redis";

function generateId(): string {
  return globalThis.crypto.randomUUID().replace(/-/g, "").slice(0, 10);
}

export const dynamic = "force-dynamic";

// GET /api/vote — list polls (newest first)
export async function GET() {
  const limit = 20;

  try {
    const redis = getRedis();

    const raw = await redis.zrange("polls:timeline", 0, limit - 1, {
      rev: true,
    });

    const ids = (raw || []) as string[];

    if (ids.length === 0) {
      return NextResponse.json({ polls: [], nextCursor: null });
    }

    const pipeline = redis.pipeline();
    for (const id of ids) {
      pipeline.hgetall(`poll:${id}`);
    }
    const results = await pipeline.exec();

    const polls = ids
      .map((id, i) => {
        const data = results[i] as Record<string, unknown> | null;
        if (!data || !data.title) return null;
        const rawOptions = data.options;
        const opts = Array.isArray(rawOptions)
          ? rawOptions
          : JSON.parse((rawOptions as string) || "[]");
        return {
          id,
          title: data.title as string,
          description: (data.description as string) || "",
          optionCount: opts.length,
          multipleChoice: data.multipleChoice === "true",
          totalVotes: parseInt((data.totalVotes as string) || "0", 10),
          createdAt: data.createdAt as string,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ polls, nextCursor: null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/vote — create a new poll
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, description, options, multipleChoice, uuid } = body;

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json({ error: "제목을 입력하세요" }, { status: 400 });
    }
    if (title.trim().length > 100) {
      return NextResponse.json({ error: "제목은 100자 이내로" }, { status: 400 });
    }
    if (description && description.length > 500) {
      return NextResponse.json({ error: "설명은 500자 이내로" }, { status: 400 });
    }
    if (!Array.isArray(options) || options.length < 2 || options.length > 10) {
      return NextResponse.json({ error: "선택지는 2~10개" }, { status: 400 });
    }
    const cleanOptions = options
      .map((o: unknown) => (typeof o === "string" ? o.trim() : ""))
      .filter((o: string) => o.length > 0);
    if (cleanOptions.length < 2) {
      return NextResponse.json(
        { error: "유효한 선택지 2개 이상 필요" },
        { status: 400 }
      );
    }
    if (!uuid || typeof uuid !== "string") {
      return NextResponse.json({ error: "UUID 필요" }, { status: 400 });
    }

    const id = generateId();
    const now = Date.now();

    const redis = getRedis();
    await redis.hset(`poll:${id}`, {
      title: title.trim(),
      description: (description || "").trim(),
      options: JSON.stringify(cleanOptions),
      multipleChoice: multipleChoice ? "true" : "false",
      createdBy: uuid,
      createdAt: now.toString(),
      totalVotes: "0",
    });

    await redis.zadd("polls:timeline", { score: now, member: id });

    return NextResponse.json({ success: true, id });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
