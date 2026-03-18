import { prisma } from "@/lib/db";
import type { CreateWorkspaceInput, UpdateWorkspaceInput, BrandProfileInput } from "@/lib/validations/workspace";
import { ActivityAction } from "@prisma/client";

export async function assertWorkspaceAccess(workspaceId: string, userId: string) {
  const w = await prisma.workspace.findFirst({
    where: { id: workspaceId, ownerId: userId, deletedAt: null },
  });
  if (!w) throw new Error("Workspace not found or access denied");
  return w;
}

export async function createWorkspace(
  ownerId: string,
  data: CreateWorkspaceInput,
  brand?: BrandProfileInput
) {
  const workspace = await prisma.workspace.create({
    data: {
      ownerId,
      name: data.name,
      slug: data.slug ?? undefined,
    },
  });

  if (brand && Object.keys(brand).some((k) => (brand as Record<string, unknown>)[k] != null)) {
    await prisma.brandProfile.upsert({
      where: { workspaceId: workspace.id },
      create: {
        workspaceId: workspace.id,
        ...brand,
      },
      update: brand,
    });
  }

  await prisma.activityLog.create({
    data: {
      workspaceId: workspace.id,
      userId: ownerId,
      action: ActivityAction.WORKSPACE_CREATED,
      entityType: "workspace",
      entityId: workspace.id,
    },
  });

  return workspace;
}

export async function updateWorkspace(
  workspaceId: string,
  userId: string,
  data: UpdateWorkspaceInput,
  brand?: Partial<BrandProfileInput>
) {
  await assertWorkspaceAccess(workspaceId, userId);

  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: {
      ...(data.name != null && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug ?? null }),
    },
  });

  if (brand) {
    await prisma.brandProfile.upsert({
      where: { workspaceId },
      create: { workspaceId, ...brand },
      update: brand,
    });
  }

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: ActivityAction.WORKSPACE_UPDATED,
      entityType: "workspace",
      entityId: workspaceId,
    },
  });

  return workspace;
}

export async function deleteWorkspace(workspaceId: string, userId: string) {
  await assertWorkspaceAccess(workspaceId, userId);
  await prisma.workspace.update({
    where: { id: workspaceId },
    data: { deletedAt: new Date() },
  });
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: ActivityAction.WORKSPACE_DELETED,
      entityType: "workspace",
      entityId: workspaceId,
    },
  });
}
