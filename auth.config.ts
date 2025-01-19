import { NextAuthConfig } from "next-auth";

// import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig: NextAuthConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authorized({ auth, request: { nextUrl } }: { auth: any, request: { nextUrl: URL } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
      const isOnLandingPage = nextUrl.pathname === '/';

      if (isOnDashboard) {
        // Allow only logged-in users to access the dashboard
        return isLoggedIn;
      } else if (isOnLandingPage) {
        // Allow both logged-in and non-logged-in users to access the landing page
        return true;
      } else if (isLoggedIn) {
        // Redirect logged-in users to the dashboard for other restricted pages
        return Response.redirect(new URL('/dashboard', nextUrl));
      }

      // Allow non-logged-in users access to public pages
      return true;
    },
  },
  providers: [],
};
