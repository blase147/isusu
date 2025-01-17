import { db } from '@vercel/postgres';
import { NextResponse } from 'next/server';
import { PoolClient } from 'pg'; // Install @types/pg if not already installed

async function getClient(): Promise<PoolClient> {
  const client = await db.connect();
  return client as unknown as PoolClient; // Adjust typing if necessary
}

async function listInvoices(client: PoolClient) {
  try {
    const data = await client.query(`
      SELECT invoices.amount, customers.name
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE invoices.amount = 666;
    `);
    return data.rows;
  } catch (error) {
    console.error('Error in listInvoices:', error);
    throw new Error('Failed to fetch invoices');
  }
}

export const GET = async () => {
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
};

