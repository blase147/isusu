import { NextAuthConfig, Session } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  interface User {
    id?: string;
    accessToken?: string;
  }

  interface Session {
    user: User;
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.sub = user.id || token.sub; // ✅ Ensure ID is stored
        token.accessToken = account?.access_token || user.accessToken || undefined;
      }
      return token;
    },

    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.sub as string;
        session.user.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },

    async authorized({ auth }: { auth: Session | null }) {
      return !!auth?.user;
    },
  },
  providers: [], // ✅ Add providers here
};
