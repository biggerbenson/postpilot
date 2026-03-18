import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: { signIn: "/login" },
  callbacks: {
    authorized: ({ token, req }) => {
      if (!token) return false;
      const pathname = req.nextUrl.pathname;
      if (pathname.startsWith("/admin") || pathname.startsWith("/api/admin")) {
        return token.role === "ADMIN" || token.role === "SUPER_ADMIN";
      }
      return true;
    },
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/workspaces/:path*",
    "/media/:path*",
    "/generate/:path*",
    "/posts/:path*",
    "/accounts/:path*",
    "/settings/:path*",
    "/admin/:path*",
    "/api/admin/:path*",
  ],
};
