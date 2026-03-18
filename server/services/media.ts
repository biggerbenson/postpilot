import path from "path";
import { prisma } from "@/lib/db";
import { assertWorkspaceAccess } from "./workspace";
import { storeFile, deleteStoredFile, generateMediaPath } from "./storage";
import {
  ALLOWED_IMAGE_TYPES,
  ALLOWED_VIDEO_TYPES,
  MAX_FILE_SIZE_IMAGE,
  MAX_FILE_SIZE_VIDEO,
} from "@/lib/validations/media";
import { MediaType } from "@prisma/client";
import { ActivityAction } from "@prisma/client";

export function getMediaType(mimeType: string): MediaType {
  if (ALLOWED_IMAGE_TYPES.includes(mimeType)) return MediaType.IMAGE;
  if (ALLOWED_VIDEO_TYPES.includes(mimeType)) return MediaType.VIDEO;
  throw new Error("Unsupported file type");
}

export function validateFile(
  mimeType: string,
  size: number
): { mediaType: MediaType } {
  const mediaType = getMediaType(mimeType);
  const maxSize =
    mediaType === MediaType.VIDEO ? MAX_FILE_SIZE_VIDEO : MAX_FILE_SIZE_IMAGE;
  if (size > maxSize)
    throw new Error(
      `File too large. Max ${mediaType === MediaType.VIDEO ? "100MB" : "10MB"}`
    );
  return { mediaType };
}

export async function createMediaAsset(
  workspaceId: string,
  userId: string,
  file: { buffer: Buffer; mimetype: string; originalname: string; size: number }
) {
  await assertWorkspaceAccess(workspaceId, userId);
  const { mediaType } = validateFile(file.mimetype, file.size);
  const relativePath = generateMediaPath(workspaceId, file.originalname);
  const { path: storedRelativePath, url } = await storeFile(
    file.buffer,
    relativePath,
    file.mimetype
  );
  const fullPath = path.join(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? "./uploads", storedRelativePath);

  const asset = await prisma.mediaAsset.create({
    data: {
      workspaceId,
      uploadedById: userId,
      filePath: fullPath,
      fileUrl: url,
      fileName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      mediaType,
    },
  });

  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: ActivityAction.MEDIA_UPLOADED,
      entityType: "media",
      entityId: asset.id,
      metadata: { fileName: file.originalname },
    },
  });

  return asset;
}

export async function deleteMediaAsset(
  assetId: string,
  workspaceId: string,
  userId: string
) {
  await assertWorkspaceAccess(workspaceId, userId);
  const asset = await prisma.mediaAsset.findFirst({
    where: { id: assetId, workspaceId },
  });
  if (!asset) throw new Error("Media not found");

  const relativePath = path.isAbsolute(asset.filePath)
    ? path.relative(path.join(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? "./uploads"), asset.filePath)
    : asset.filePath;
  if (!relativePath.startsWith("..")) {
    await deleteStoredFile(relativePath).catch(() => {});
  }

  await prisma.mediaAsset.delete({ where: { id: assetId } });
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: ActivityAction.MEDIA_DELETED,
      entityType: "media",
      entityId: assetId,
    },
  });
}
