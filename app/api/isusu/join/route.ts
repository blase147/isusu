import { auth } from "@/app/api/auth";
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();
  const userId = session.user.id;

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN"); // Start transaction

    // Check if group exists
    const groupQuery = `SELECT * FROM "Isusu" WHERE invite_code = $1`;
    const groupResult = await client.query(groupQuery, [inviteCode]);

    if (groupResult.rowCount === 0) {
      await client.query("ROLLBACK"); // Rollback in case of failure
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const group = groupResult.rows[0];

    // Prevent the owner from joining as a member
    if (group.owner_id === userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "owner" }, { status: 400 });
    }

    // Check if user is already a member
    const memberQuery = `SELECT * FROM "IsusuMembers" WHERE group_id = $1 AND user_id = $2`;
    const memberResult = await client.query(memberQuery, [group.id, userId]);

    if (memberResult.rowCount > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "already_member" }, { status: 400 });
    }

    // Add user to the group
    const addMemberQuery = `INSERT INTO "IsusuMembers" (group_id, user_id) VALUES ($1, $2)`;
    await client.query(addMemberQuery, [group.id, userId]);

    await client.query("COMMIT"); // Commit transaction
    return NextResponse.json({ message: "Successfully joined the group" }, { status: 200 });

  } catch (error) {
    if (client) await client.query("ROLLBACK"); // Ensure rollback on error
    console.error("Join Isusu Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  } finally {
    if (client) client.release();
  }
}
