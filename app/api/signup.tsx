import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { pool } from '../lib/db'; // Database connection pool

// Type for incoming data
interface SignupData {
  name: string;
  email: string;
  password: string;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, email, password }: SignupData = req.body;

    // Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required.' });
    }

    try {
      // Check if user already exists
      const { rows } = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
      if (rows.length > 0) {
        return res.status(400).json({ error: 'User already exists.' });
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert user into database
      const result = await pool.query(
        'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
        [name, email, hashedPassword]
      );

      const newUser = result.rows[0];

      return res.status(201).json({ user: newUser });
    } catch (error) {
      console.error('Error during signup:', error);
      return res.status(500).json({ error: 'An error occurred during signup.' });
    }
  } else {
    // Method not allowed
    return res.status(405).json({ error: 'Method Not Allowed' });
  }
}
