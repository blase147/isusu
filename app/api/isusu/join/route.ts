import { auth } from "@/auth";
import { pool } from "@/app/lib/db";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  const session = await auth();

  // ✅ Check if user is authenticated
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { inviteCode } = await req.json();

    // ✅ Validate request body
    if (!inviteCode) {
      return NextResponse.json({ error: "Invite code is required" }, { status: 400 });
    }

    const client = await pool.connect();
    await client.query("BEGIN"); // Start transaction

    // ✅ Get user ID and name from database
    const userQuery = `SELECT id, name FROM "User" WHERE email = $1`;
    const userResult = await client.query(userQuery, [session.user.email]);

    if (userResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { id: userId, name: userName } = userResult.rows[0];

    // ✅ Check if the Isusu group exists
    const groupQuery = `SELECT id, "createdById" FROM "Isusu" WHERE invite_code = $1`;
    const groupResult = await client.query(groupQuery, [inviteCode]);

    if (groupResult.rowCount === 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "Group not found" }, { status: 404 });
    }

    const { id: groupId, createdById } = groupResult.rows[0];

    // ✅ Prevent the group owner from joining as a member
    if (createdById === userId) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "owner" }, { status: 400 });
    }

    // ✅ Check if user is already a member
    const memberQuery = `SELECT 1 FROM "IsusuMembers" WHERE "isusuId" = $1 AND "userId" = $2`;
    const memberResult = await client.query(memberQuery, [groupId, userId]);

    if (memberResult.rowCount !== null && memberResult.rowCount > 0) {
      await client.query("ROLLBACK");
      return NextResponse.json({ error: "already_member" }, { status: 400 });
    }

    // ✅ Generate UUID for new membership
    const newMemberId = uuidv4();

    // ✅ Add user to the group
    const addMemberQuery = `
      INSERT INTO "IsusuMembers" (id, "isusuId", "userId")
      VALUES ($1, $2, $3)
    `;
    await client.query(addMemberQuery, [newMemberId, groupId, userId]);

    // ✅ Create a notification for the group owner
    const notificationId = uuidv4();
    const notificationMessage = `${userName} has joined your Isusu group!`;
    const createdAt = new Date().toISOString(); // Timestamp for notification

    const addNotificationQuery = `
      INSERT INTO "Notification" (id, "userId", "message", "isRead", "createdAt")
      VALUES ($1, $2, $3, false, $4)
    `;
    await client.query(addNotificationQuery, [notificationId, createdById, notificationMessage, createdAt]);

    await client.query("COMMIT"); // Commit transaction

    return NextResponse.json(
      { message: "Successfully joined the group and notified the owner" },
      { status: 200 }
    );

  } catch (error) {
    console.error("Join Isusu Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
