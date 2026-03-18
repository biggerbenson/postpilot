import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { assertWorkspaceAccess } from "@/server/services/workspace";
import { prisma } from "@/lib/db";
import { readFile } from "fs/promises";
import path from "path";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const pathParam = searchParams.get("path");

  if (id) {
    const asset = await prisma.mediaAsset.findUnique({ where: { id } });
    if (!asset) return NextResponse.json({ message: "Not found" }, { status: 404 });
    try {
      await assertWorkspaceAccess(asset.workspaceId, user.id);
    } catch {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    try {
      const filePath = asset.filePath;
      const buffer = await readFile(filePath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": asset.mimeType,
          "Content-Decurity-Policy": "default-src 'none'",
        },
      });
    } catch {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }
  }

  if (pathParam) {
    const decoded = decodeURIComponent(pathParam);
    const workspaceId = decoded.split(path.sep)[0];
    if (!workspaceId) return NextResponse.json({ message: "Bad request" }, { status: 400 });
    try {
      await assertWorkspaceAccess(workspaceId, user.id);
    } catch {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }
    const base = path.join(process.cwd(), process.env.STORAGE_LOCAL_PATH ?? "./uploads");
    const fullPath = path.join(base, decoded);
    if (!fullPath.startsWith(base)) return NextResponse.json({ message: "Bad request" }, { status: 400 });
    try {
      const buffer = await readFile(fullPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/octet-stream",
          "Content-Decurity-Policy": "default-src 'none'",
        },
      });
    } catch {
      return NextResponse.json({ message: "File not found" }, { status: 404 });
    }
  }

  return NextResponse.json({ message: "Missing id or path" }, { status: 400 });
}
