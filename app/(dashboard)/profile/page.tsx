import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth";
import { prisma } from "@/lib/db";
import { ProfileForm } from "@/features/profile/profile-form";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user?.id) redirect("/login");

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

  if (!dbUser) redirect("/login");

  const initial = {
    email: dbUser.email ?? "",
    name: dbUser.name ?? null,
    displayName: dbUser.displayName ?? null,
    phone: dbUser.phone ?? null,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold">Profile</h1>
        <p className="text-muted-foreground">
          Update your email, display name, phone, and password.
        </p>
      </div>
      <ProfileForm key={dbUser.id} initial={initial} />
    </div>
  );
}

