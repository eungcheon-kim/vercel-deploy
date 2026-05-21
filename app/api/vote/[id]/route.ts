import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/app/lib/redis";

export const dynamic = "force-dynamic";

// GET /api/vote/[id] — get poll details + results
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const redis = getRedis();
    const data = await redis.hgetall(`poll:${id}`) as Record<string, string> | null;

    if (!data || !data.title) {
      return NextResponse.json({ error: "투표를 찾을 수 없습니다" }, { status: 404 });
    }

    const rawOptions = data.options;
    const options: string[] = Array.isArray(rawOptions)
      ? rawOptions
      : JSON.parse((rawOptions as string) || "[]");
    const uuid = req.nextUrl.searchParams.get("uuid");

    // Get all voters to compute results
    const voters = await redis.hgetall(`poll:${id}:voters`) as Record<string, unknown> | null;

    // Compute vote counts per option
    const counts: number[] = new Array(options.length).fill(0);
    let myVote: number[] | null = null;

    if (voters) {
      for (const [voterUuid, selection] of Object.entries(voters)) {
        const selected: number[] = Array.isArray(selection)
          ? selection
          : JSON.parse(selection as string);
        for (const idx of selected) {
          if (idx >= 0 && idx < options.length) {
            counts[idx]++;
          }
        }
        if (uuid && voterUuid === uuid) {
          myVote = selected;
        }
      }
    }

    return NextResponse.json({
      id,
      title: data.title,
      description: data.description || "",
      options,
      multipleChoice: data.multipleChoice === "true",
      totalVotes: parseInt(data.totalVotes || "0", 10),
      createdAt: data.createdAt,
      counts,
      myVote,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/vote/[id] — submit a vote
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await req.json();
    const { uuid, selected } = body;

    if (!uuid || typeof uuid !== "string") {
      return NextResponse.json({ error: "UUID 필요" }, { status: 400 });
    }
    if (!Array.isArray(selected) || selected.length === 0) {
      return NextResponse.json({ error: "선택지를 골라주세요" }, { status: 400 });
    }

    const redis = getRedis();

    // Check poll exists
    const data = await redis.hgetall(`poll:${id}`) as Record<string, string> | null;
    if (!data || !data.title) {
      return NextResponse.json({ error: "투표를 찾을 수 없습니다" }, { status: 404 });
    }

    const rawOpts = data.options;
    const options: string[] = Array.isArray(rawOpts)
      ? rawOpts
      : JSON.parse((rawOpts as string) || "[]");
    const multipleChoice = data.multipleChoice === "true";

    // Validate selection
    if (!multipleChoice && selected.length > 1) {
      return NextResponse.json({ error: "단건 투표입니다" }, { status: 400 });
    }
    for (const idx of selected) {
      if (typeof idx !== "number" || idx < 0 || idx >= options.length) {
        return NextResponse.json({ error: "잘못된 선택지" }, { status: 400 });
      }
    }

    // Check duplicate vote
    const existing = await redis.hexists(`poll:${id}:voters`, uuid);
    if (existing) {
      return NextResponse.json({ error: "이미 투표했습니다" }, { status: 409 });
    }

    // Record vote
    await redis.hset(`poll:${id}:voters`, { [uuid]: JSON.stringify(selected) });
    await redis.hincrby(`poll:${id}`, "totalVotes", 1);

    return NextResponse.json({ success: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
