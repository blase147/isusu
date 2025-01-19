import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server'; // Correct import for Next.js responses
import { VercelPoolClient } from '@vercel/postgres';

async function getClient() {
  const client = await db.connect();
  return client;
}

interface Invoice {
  amount: number;
  name: string;
}

async function listInvoices(client: VercelPoolClient): Promise<Invoice[]> {
  const data = await client.query(`
    SELECT invoices.amount, customers.name
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE invoices.amount = 666;
  `);
  return data.rows as Invoice[];
}

export async function GET() {
  const client = await getClient(); // Initialize the database connection
  try {
    const invoices = await listInvoices(client); // Fetch data
    return NextResponse.json(invoices); // Respond with the data
  } catch (error) {
    console.error('Error fetching invoices:', error); // Log the error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 }); // Return error response
  } finally {
    client.release(); // Ensure the database connection is released
  }
}
