import { prisma } from "@/lib/db";
import type { SettingGroup } from "@prisma/client";
import { decryptSecret, encryptSecret } from "@/lib/admin/crypto";
import { requireAdmin, requireSuperAdmin } from "@/server/admin/auth";

export type PublicAdminSetting = {
  group: SettingGroup;
  key: string;
  valueJson: unknown | null;
  isSecret: boolean;
  hasSecretValue: boolean;
};

export async function listGroupSettings(group: SettingGroup): Promise<PublicAdminSetting[]> {
  await requireAdmin();
  const rows = await prisma.adminSetting.findMany({
    where: { group },
    orderBy: { key: "asc" },
  });
  return rows.map((r) => ({
    group: r.group,
    key: r.key,
    valueJson: r.valueJson ?? null,
    isSecret: r.isSecret,
    hasSecretValue: Boolean(r.encryptedValue),
  }));
}

export async function getSecretSetting(group: SettingGroup, key: string) {
  await requireSuperAdmin();
  const row = await prisma.adminSetting.findUnique({
    where: { group_key: { group, key } },
  });
  if (!row?.isSecret || !row.encryptedValue) return null;
  return decryptSecret(row.encryptedValue);
}

export async function upsertSetting(params: {
  group: SettingGroup;
  key: string;
  valueJson?: unknown;
  secretValue?: string;
  isSecret?: boolean;
}) {
  await requireSuperAdmin();
  const { group, key, valueJson, secretValue, isSecret } = params;

  const data: any = {};
  if (valueJson !== undefined) data.valueJson = valueJson as any;
  if (typeof isSecret === "boolean") data.isSecret = isSecret;
  if (typeof secretValue === "string") {
    data.isSecret = true;
    data.encryptedValue = encryptSecret(secretValue);
  }

  return prisma.adminSetting.upsert({
    where: { group_key: { group, key } },
    create: {
      group,
      key,
      valueJson: valueJson === undefined ? null : (valueJson as any),
      isSecret: Boolean(isSecret) || typeof secretValue === "string",
      encryptedValue: typeof secretValue === "string" ? encryptSecret(secretValue) : null,
    },
    update: data,
  });
}

