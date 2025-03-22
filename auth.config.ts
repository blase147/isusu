import { NextAuthConfig, Session } from "next-auth";

declare module "next-auth" {
  interface User {
    id?: string; // ✅ Ensure User includes an ID
    accessToken?: string;
  }

  interface Session {
    user: User; // ✅ Ensure Session includes User
  }
}

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string; // ✅ Ensure ID is stored
        session.user.accessToken = token.accessToken as string | undefined;
      }
      return session;
    },

    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id; // ✅ Store ID in JWT
        token.accessToken = user.accessToken || undefined;
      }
      return token;
    },

    async authorized({ auth }: { auth: Session | null }) {
      return !!auth?.user; // ✅ Only allow authenticated users
    },
  },
  providers: [],
};
