// auth.config.ts
import { NextAuthConfig, User } from "next-auth";

declare module "next-auth" {
  interface User {
    accessToken?: string;
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id;
        if ("accessToken" in user) {
          session.user.accessToken = (user as User).accessToken;
        }
      }
      return session;
    },

    async authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const nextUrl = new URL(request.url);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLandingPage = nextUrl.pathname === "/";

      if (isOnDashboard) return isLoggedIn;
      if (isOnLandingPage) return true;
      return isLoggedIn ? Response.redirect(new URL("/dashboard", nextUrl)) : true;
    },
  },
  providers: [],
};
