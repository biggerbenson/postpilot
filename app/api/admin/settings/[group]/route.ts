import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin, requireSuperAdmin } from "@/server/admin/auth";
import { listGroupSettings, upsertSetting } from "@/server/admin/settings";
import type { SettingGroup } from "@prisma/client";

const groupSchema = z.enum([
  "GENERAL",
  "APPEARANCE",
  "AI",
  "EMAIL",
  "PAYMENTS",
  "PLATFORM",
  "FOOTER",
  "SECURITY",
]);

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  await requireAdmin();
  const { group } = await params;
  const parsed = groupSchema.safeParse(group);
  if (!parsed.success) return NextResponse.json({ message: "Invalid group" }, { status: 400 });
  const settings = await listGroupSettings(parsed.data as SettingGroup);
  return NextResponse.json({ settings });
}

const patchSchema = z.object({
  key: z.string().min(1),
  valueJson: z.any().optional(),
  secretValue: z.string().optional(),
  isSecret: z.boolean().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ group: string }> }
) {
  await requireSuperAdmin();
  const { group } = await params;
  const parsedGroup = groupSchema.safeParse(group);
  if (!parsedGroup.success) return NextResponse.json({ message: "Invalid group" }, { status: 400 });

  const body = await req.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { message: parsed.error.errors[0]?.message ?? "Validation failed" },
      { status: 400 }
    );
  }

  await upsertSetting({
    group: parsedGroup.data as SettingGroup,
    key: parsed.data.key,
    valueJson: parsed.data.valueJson,
    secretValue: parsed.data.secretValue,
    isSecret: parsed.data.isSecret,
  });

  return NextResponse.json({ ok: true });
}

