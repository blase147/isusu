import CredentialsProvider from "next-auth/providers/credentials";

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }: any) {
      const isLoggedIn = !!user;
      const isOnDashboard = credentials?.nextUrl?.startsWith('/dashboard');

      if (isOnDashboard) {
        return isLoggedIn;
      } else if (isLoggedIn) {
        return '/dashboard'; // Redirect to dashboard
      }

      return true;
    },
  },
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // Implement your authentication logic here
        const user = { id: 1, name: "Test User", email: "test@example.com" }; // Dummy data
        if (user) {
          return user;
        }
        return null;
      },
    }),
  ],
};
