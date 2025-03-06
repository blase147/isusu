import NextAuth, { type NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function getUser(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.log('No user found for email:', email);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}

const authOptions: NextAuthConfig = {
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'text' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        // Validate input
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          console.log('Invalid input format:', parsedCredentials.error);
          return null;
        }

        const { email, password } = parsedCredentials.data;
        console.log('Attempting login for:', email);

        // Fetch user from database
        const user = await getUser(email);
        if (!user) return null;

        if (!user.password) {
          console.log('User found, but password is missing:', email);
          return null;
        }

        // Verify password
        const passwordsMatch = await bcrypt.compare(password, user.password);
        if (!passwordsMatch) {
          console.log('Invalid password for user:', email);
          return null;
        }

        console.log('User authenticated:', email);
        return user;
      },
    }),
  ],
};

export const { auth, signIn, signOut } = NextAuth(authOptions);
export default NextAuth(authOptions);
