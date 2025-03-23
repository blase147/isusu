import { NextAuthConfig, Session, User } from "next-auth";

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
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string; // ✅ Ensure session includes user ID
        session.user.accessToken = token.accessToken as string; // ✅ Persist accessToken
      }
      return session;
    },

    async jwt({ token, user, account }) {
      if (account && user) {
        token.id = user.id;
        token.accessToken = account.access_token; // ✅ Store accessToken in token
      }
      return token;
    },

    async authorized({ auth, request }: { auth: Session | null; request: Request }) {
      const isLoggedIn = !!auth?.user?.id;
      const nextUrl = new URL(request.url);
      const isOnDashboard = nextUrl.pathname.startsWith("/dashboard");
      const isOnLandingPage = nextUrl.pathname === "/";

      if (isOnDashboard) {
        return isLoggedIn; // ✅ Allow only logged-in users
      } else if (isOnLandingPage) {
        return true; // ✅ Allow everyone
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/dashboard", nextUrl)); // ✅ Redirect logged-in users
      }

      return true; // ✅ Allow public pages
    },
  },

  providers: [], // Keep as is
};

