import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { getEntitlements } from "@/lib/subscriptions/service";
import { getPlanConfig, PLAN_ORDER } from "@/lib/subscriptions/plans";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const entitlements = await getEntitlements(user.id);
  const plan = getPlanConfig(entitlements.subscription.plan);

  return NextResponse.json({
    entitlements,
    plan,
    allPlans: PLAN_ORDER.map((p) => getPlanConfig(p)),
  });
}

