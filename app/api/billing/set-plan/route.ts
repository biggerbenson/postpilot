import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { z } from "zod";
import type { PlanName } from "@prisma/client";
import { setPlanSimulated } from "@/lib/subscriptions/service";

const bodySchema = z.object({
  plan: z.enum(["FREE", "STARTER", "PRO", "BUSINESS", "AGENCY"]),
});

/**
 * DEV/Placeholder endpoint.
 * In production this would be replaced by a checkout flow + webhook that sets the plan.
 */
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const plan = parsed.data.plan as PlanName;
  const updated = await setPlanSimulated(user.id, plan);
  return NextResponse.json({ ok: true, subscription: updated });
}

