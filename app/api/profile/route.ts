import { NextResponse } from "next/server";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { updateProfileSchema } from "@/lib/validations/profile";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      id: true,
      email: true,
      name: true,
      displayName: true,
      phone: true,
    },
  });

  return NextResponse.json(dbUser);
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        message:
          parsed.error.errors[0]?.message ?? "Validation failed",
      },
      { status: 400 }
    );
  }

  const data = parsed.data;

  try {
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: {
        email: data.email,
        name: data.name ?? undefined,
        displayName: data.displayName ?? undefined,
        phone: data.phone ?? undefined,
      },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        phone: true,
      },
    });

    return NextResponse.json(updated);
  } catch (e) {
    const msg =
      e instanceof Error && e.message.includes("Unique constraint")
        ? "Email is already in use"
        : "Failed to update profile";
    return NextResponse.json({ message: msg }, { status: 400 });
  }
}

