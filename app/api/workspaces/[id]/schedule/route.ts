import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { createSchedulePlan } from "@/server/services/schedule";
import { schedulePlanSchema } from "@/lib/validations/post";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { id: workspaceId } = await params;
  const body = await req.json();
  const parsed = schedulePlanSchema.safeParse({ ...body, workspaceId });
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  try {
    const result = await createSchedulePlan(user.id, parsed.data);
    return NextResponse.json(result);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Failed to create schedule";
    return NextResponse.json({ message }, { status: 400 });
  }
}
