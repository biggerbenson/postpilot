import { NextResponse } from "next/server";
import { enqueueDuePosts } from "@/server/services/scheduler";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const enqueued = await enqueueDuePosts();
    return NextResponse.json({ enqueued });
  } catch (e) {
    console.error("[cron] enqueue failed", e);
    return NextResponse.json(
      { message: e instanceof Error ? e.message : "Enqueue failed" },
      { status: 500 }
    );
  }
}
