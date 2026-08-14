import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: "/login",
  },
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/analyzer/:path*",
    "/coach/:path*",
    "/paper-trading/:path*",
    "/handpicked-bets/:path*",
    "/wallet-tracker/:path*",
    "/copy-trading/:path*",
    "/settings/:path*",
  ],
};
