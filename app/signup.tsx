'use server';

import bcrypt from 'bcrypt';
import pool from '@/app/lib/db';

export async function signupAction({ name, email, password }: { name: string; email: string; password: string }) {
  if (!name || !email || !password) {
    throw new Error('All fields are required.');
  }

  const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (rows.length > 0) {
    throw new Error('User already exists.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await pool.query(
    'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
    [name, email, hashedPassword]
  );

  return result.rows[0];
}
