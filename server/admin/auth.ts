import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/server/auth";

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user?.id) throw new Error("Unauthorized");

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { id: true, role: true, suspendedAt: true, email: true, name: true },
  });
  if (!dbUser) throw new Error("Unauthorized");
  if (dbUser.suspendedAt) throw new Error("Account suspended");
  if (dbUser.role !== "ADMIN" && dbUser.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden");
  }
  return dbUser;
}

export async function requireSuperAdmin() {
  const admin = await requireAdmin();
  if (admin.role !== "SUPER_ADMIN") throw new Error("Forbidden");
  return admin;
}

export function isAdminRole(role?: string | null) {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdminRole(role?: string | null) {
  return role === "SUPER_ADMIN";
}

