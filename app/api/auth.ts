import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { authConfig } from './auth.config';
import { z } from 'zod';
import { sql } from '@vercel/postgres';
import type { Users } from '@/app/lib/definitions';
import bcrypt from 'bcrypt';

async function getUser(email: string): Promise<Users | undefined> {
  try {
    const user = await sql<Users>`SELECT * FROM users WHERE email=${email}`;
    return user.rows[0];
  } catch (error) {
    console.error('Failed to fetch user:', error);
    throw new Error('Failed to fetch user.');
  }
}

export const { auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
Credentials({
  credentials: {
    email: { label: "Email", type: "text" },
    password: { label: "Password", type: "password" }
  },
  async authorize(credentials) {
    const parsedCredentials = z
      .object({ email: z.string().email(), password: z.string().min(6) })
      .safeParse(credentials);

    if (!parsedCredentials.success) {
      console.log('Invalid input format:', parsedCredentials.error);
      return null;
    }

    const { email, password } = parsedCredentials.data;
    console.log('Parsed credentials:', { email, password });

    const user = await getUser(email);
    if (!user) {
      console.log('No user found for email:', email);
      return null;
    }

    console.log('User found:', user);

    const passwordsMatch = await bcrypt.compare(password, user.password);
    console.log('Passwords match:', passwordsMatch);

    if (passwordsMatch) return user;

    console.log('Password did not match for user:', email);
    return null;
  }
}),
  ],
});
