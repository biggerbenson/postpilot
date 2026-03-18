import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { requireAdmin, requireSuperAdmin } from "@/server/admin/auth";
import type { PlanName, UserRole } from "@prisma/client";
import { setPlanSimulated } from "@/lib/subscriptions/service";

const patchSchema = z.object({
  role: z.enum(["USER", "ADMIN", "SUPER_ADMIN"]).optional(),
  suspended: z.boolean().optional(),
  plan: z.enum(["FREE", "STARTER", "PRO", "BUSINESS", "AGENCY"]).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const actor = await requireAdmin();
  const { id } = await params;
  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Role changes: only SUPER_ADMIN can assign ADMIN/SUPER_ADMIN
  if (parsed.data.role && parsed.data.role !== target.role) {
    if (parsed.data.role !== "USER") await requireSuperAdmin();
    if (target.role === "SUPER_ADMIN" && parsed.data.role !== "SUPER_ADMIN") {
      // prevent removing last super admin
      const superAdmins = await prisma.user.count({ where: { role: "SUPER_ADMIN" } });
      if (superAdmins <= 1) {
        return NextResponse.json(
          { message: "Cannot remove the last SUPER_ADMIN" },
          { status: 400 }
        );
      }
    }
  }

  if (parsed.data.role) {
    await prisma.user.update({
      where: { id },
      data: { role: parsed.data.role as UserRole },
    });
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        action: "USER_ROLE_CHANGED",
        targetType: "user",
        targetId: id,
        summary: `Changed role to ${parsed.data.role}`,
        metadata: { role: parsed.data.role },
      },
    });
  }

  if (typeof parsed.data.suspended === "boolean") {
    await prisma.user.update({
      where: { id },
      data: { suspendedAt: parsed.data.suspended ? new Date() : null },
    });
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        action: parsed.data.suspended ? "USER_SUSPENDED" : "USER_UNSUSPENDED",
        targetType: "user",
        targetId: id,
        summary: parsed.data.suspended ? "Suspended user" : "Unsuspended user",
      },
    });
  }

  if (parsed.data.plan) {
    await setPlanSimulated(id, parsed.data.plan as PlanName);
    await prisma.adminAuditLog.create({
      data: {
        actorUserId: actor.id,
        action: "SUBSCRIPTION_PLAN_SET",
        targetType: "user",
        targetId: id,
        summary: `Set plan to ${parsed.data.plan}`,
        metadata: { plan: parsed.data.plan },
      },
    });
  }

  return NextResponse.json({ ok: true });
}

