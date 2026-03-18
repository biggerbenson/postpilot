import "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  }

  interface Session {
    user: {
      id: string;
      email?: string | null;
      name?: string | null;
      image?: string | null;
      role?: "USER" | "ADMIN" | "SUPER_ADMIN";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    email?: string | null;
    role?: "USER" | "ADMIN" | "SUPER_ADMIN";
  }
}
