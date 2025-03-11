 import { NextResponse } from "next/server";

// Dummy transaction data (Replace with database query)
const transactions = [
  { id: "tx_001", amount: 100, type: "deposit", date: "2024-03-11" },
  { id: "tx_002", amount: 50, type: "withdrawal", date: "2024-03-10" },
  { id: "tx_003", amount: 200, type: "deposit", date: "2024-03-09" },
];

// GET request handler for fetching transaction timeline
export async function GET() {
  return NextResponse.json({ transactions }, { status: 200 });
}
