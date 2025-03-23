import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid"; // Import UUID generator

export async function POST(req: Request) {
  const session = await auth();

  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { inviteCode } = await req.json();

  if (!inviteCode) {
    return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
  }

  let client;
  try {
    client = await pool.connect();
    await client.query("BEGIN"); // Start transaction

    // Get user ID from database using session email
    const userQuery = `SELECT id FROM "User" WHERE email = $1`;
    const userResult = await client.query(userQuery, [session.user.email]);

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const userId = userResult.rows[0].id;

    // Check if the Isusu group exists
    const groupQuery = `SELECT id, "createdById" FROM "Isusu" WHERE invite_code = $1`;
    const groupResult = await client.query(groupQuery, [inviteCode]);

    if (groupResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const group = groupResult.rows[0];

    // Log the retrieved group ID for debugging
    console.log("Joining group with ID:", group.id);

    if (!group.id) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Group ID is missing" }, { status: 500 });
    }

    // Prevent the creator from joining as a member
    if (group.createdById === userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "owner" }, { status: 400 });
    }

    // Check if user is already a member
    const memberQuery = `SELECT 1 FROM "IsusuMembers" WHERE "isusuId" = $1 AND "userId" = $2`;
    const memberResult = await client.query(memberQuery, [group.id, userId]);

    if ((memberResult.rowCount ?? 0) > 0) {  // Ensure rowCount is always a number
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "already_member" }, { status: 400 });
    }

    // Generate UUID for new membership
    const newMemberId = uuidv4();

    // Add user to the group with an explicit UUID
    const addMemberQuery = `INSERT INTO "IsusuMembers" (id, "isusuId", "userId") VALUES ($1, $2, $3)`;
    await client.query(addMemberQuery, [newMemberId, group.id, userId]);

    await client.query("COMMIT"); // Commit transaction

    return NextResponse.json(
      { message: "Successfully joined the group", groupId: group.id },
      { status: 200 }
    );

  } catch (error) {
    if (client) await client.query("ROLLBACK"); // Ensure rollback on error
    console.error("Join Isusu Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });

  } finally {
    if (client) client.release();
  }
}
