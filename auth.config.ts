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
    async session({ session, user }) {
      if (session.user && user) {
        session.user.id = user.id; // ✅ Ensure session includes user ID

        // 🛠️ Add accessToken if it exists on the user object
        if ("accessToken" in user) {
          session.user.accessToken = (user as User).accessToken;
        }
      }
      return session;
    },

    async authorized({ auth, request }: { auth: Session | null; request: Request }) {
      const isLoggedIn = !!auth?.user;
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
  providers: [],
};
