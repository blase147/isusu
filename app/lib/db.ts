import { Pool } from 'pg';
import 'dotenv/config';


const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false, // This allows insecure SSL connections
  },
});

export { pool };
