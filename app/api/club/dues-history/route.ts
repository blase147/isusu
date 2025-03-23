import { NextRequest, NextResponse } from "next/server";

const duesHistory = [
  { date: "2024-03-01", amount: 5000, status: "Paid" },
  { date: "2024-02-01", amount: 5000, status: "Pending" },
  { date: "2024-01-01", amount: 5000, status: "Paid" },
  { date: "2023-12-01", amount: 5000, status: "Paid" },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let filteredDues = duesHistory;

  if (startDate && endDate) {
    filteredDues = duesHistory.filter((due) => {
      const dueDate = new Date(due.date);
      return dueDate >= new Date(startDate) && dueDate <= new Date(endDate);
    });
  }

  return NextResponse.json(filteredDues);
}
