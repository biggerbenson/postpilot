import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { updatePasswordSchema } from "@/lib/validations/profile";
import bcrypt from "bcryptjs";

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updatePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.errors[0]?.message ?? "Validation failed",
      },
      { status: 400 }
    );
  }

  const { currentPassword, newPassword } = parsed.data;

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (!dbUser || !dbUser.passwordHash) {
    return NextResponse.json(
      { message: "Password cannot be changed for this account" },
      { status: 400 }
    );
  }

  const valid = await bcrypt.compare(
    currentPassword,
    dbUser.passwordHash
  );
  if (!valid) {
    return NextResponse.json(
      { message: "Current password is incorrect" },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  return NextResponse.json({ ok: true });
}

