/**
 * Storage abstraction for media assets.
 * MVP: local filesystem; later: S3 / Cloudflare R2.
 */

import { writeFile, mkdir, readFile, unlink } from "fs/promises";
import path from "path";

const STORAGE_TYPE = process.env.STORAGE_TYPE ?? "local";
const LOCAL_PATH = process.env.STORAGE_LOCAL_PATH ?? "./uploads";

export interface StoreResult {
  path: string;
  url: string;
}

export async function storeFile(
  buffer: Buffer,
  relativePath: string,
  _mimeType: string
): Promise<StoreResult> {
  if (STORAGE_TYPE === "local") {
    const fullPath = path.join(process.cwd(), LOCAL_PATH, relativePath);
    await mkdir(path.dirname(fullPath), { recursive: true });
    await writeFile(fullPath, buffer);
    return { path: relativePath, url: `/api/media/serve?path=${encodeURIComponent(relativePath)}` };
  }
  throw new Error("Only local storage is implemented in MVP");
}

export async function getFileBytes(relativePath: string): Promise<Buffer> {
  if (STORAGE_TYPE === "local") {
    const fullPath = path.join(process.cwd(), LOCAL_PATH, relativePath);
    return readFile(fullPath);
  }
  throw new Error("Only local storage is implemented in MVP");
}

export async function deleteStoredFile(relativePath: string): Promise<void> {
  if (STORAGE_TYPE === "local") {
    const fullPath = path.join(process.cwd(), LOCAL_PATH, relativePath);
    await unlink(fullPath).catch(() => {});
    return;
  }
  throw new Error("Only local storage is implemented in MVP");
}

export function generateMediaPath(workspaceId: string, fileName: string): string {
  const ext = path.extname(fileName) || "";
  const base = path.basename(fileName, ext) || "file";
  const safe = base.replace(/[^a-zA-Z0-9-_]/g, "_").slice(0, 50);
  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  return path.join(workspaceId, `${safe}-${id}${ext}`);
}
