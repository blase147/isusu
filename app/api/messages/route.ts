import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/auth";

const prisma = new PrismaClient();

// Handle GET requests to fetch messages between users
export async function GET() {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Retrieve user ID from the database
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const userId = user.id;
        console.log(`Fetching messages for userId: ${userId}`);

        // Fetch unread messages
        const unreadMessages = await prisma.message.findMany({
            where: { recipientId: userId, isRead: false },
            select: { id: true, senderId: true, text: true, createdAt: true },
            orderBy: { createdAt: "desc" },
        });

        // Fetch conversation messages
        const messages = await prisma.message.findMany({
            where: {
                OR: [{ senderId: userId }, { recipientId: userId }],
            },
            select: {
                id: true,
                text: true,
                createdAt: true,
                senderId: true,
                recipientId: true,
                sender: { select: { id: true, name: true, profilePicture: true } },
                recipient: { select: { id: true, name: true, profilePicture: true } },
            },
            orderBy: { createdAt: "desc" },
        });

        const formattedMessages = messages.map((msg) => ({
            id: msg.id,
            lastMessage: msg.text,
            user: msg.senderId === userId ? msg.recipient : msg.sender, // Show the other user
            type: "inbox", // Adjust if needed
        }));

        return NextResponse.json({ messages: formattedMessages }, { status: 200 });



        return NextResponse.json({ userId, unreadMessages, messages }, { status: 200 });
    } catch (error) {
        console.error("Error fetching messages:", error);
        return NextResponse.json(
            { error: "Failed to fetch messages", details: (error as Error).message },
            { status: 500 }
        );
    }
}

// Handle POST requests to send messages
export async function POST(req: NextRequest) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        // Retrieve sender ID
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            select: { id: true, name: true, email: true },
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const body = await req.json();
        console.log("Incoming request body:", body);

        const { recipientId, message } = body;
        const senderId = user.id;

        if (!recipientId || !message) {
            return NextResponse.json(
                { error: "Missing recipientId or message" },
                { status: 400 }
            );
        }

        const newMessage = await prisma.message.create({
            data: {
                senderId,
                recipientId,
                text: message,
            },
        });

        console.log("Message saved to database:", newMessage);
        return NextResponse.json(newMessage, { status: 201 });
    } catch (error) {
        console.error("Error creating message:", error);
        return NextResponse.json(
            { error: "Failed to send message", details: (error as Error).message },
            { status: 500 }
        );
    }
}
