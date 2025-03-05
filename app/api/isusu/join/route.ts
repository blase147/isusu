import { auth } from "@/app/api/auth";
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth(); // ✅ Use auth() instead of getServerSession

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  const userId = session.user.id; // ✅ Extract user ID safely

  let client;
  try {
    client = await pool.connect(); // Connect to PostgreSQL

    // Check if the group exists
    const groupQuery = "SELECT * FROM isusu_groups WHERE invite_code = $1";
    const groupResult = await client.query(groupQuery, [inviteCode]);

    if (groupResult.rowCount === 0) {
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const group = groupResult.rows[0];

    // If user is the owner of the group
    if (group.owner_id === userId) {
      return NextResponse.json({ error: "owner" }, { status: 400 });
    }

    // Check if user is already a member
    const memberQuery =
      "SELECT * FROM isusu_group_members WHERE group_id = $1 AND user_id = $2";
    const memberResult = await client.query(memberQuery, [group.id, userId]);

    if (memberResult.rowCount !== null && memberResult.rowCount > 0) {
      return NextResponse.json({ error: "already_member" }, { status: 400 });
    }

    // Add user to the group
    const addMemberQuery =
      "INSERT INTO isusu_group_members (group_id, user_id) VALUES ($1, $2)";
    await client.query(addMemberQuery, [group.id, userId]);

    return NextResponse.json(
      { message: "Successfully joined the group" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Join Isusu Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  } finally {
    if (client) client.release(); // Release PostgreSQL client
  }
}
