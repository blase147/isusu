import { Server as SocketIOServer } from "socket.io";
import { Server as HttpServer } from "http";

let io: SocketIOServer | null = null;

export function initializeSocket(server: HttpServer) {
    if (io) {
        console.log("Socket.io server already initialized.");
        return io;
    }

    console.log("Initializing Socket.io server...");

    io = new SocketIOServer(server, {
        path: "/api/socket",
        cors: {
            origin: "*",
            methods: ["GET", "POST"],
        },
        transports: ["websocket"],
    });

    io.on("connection", (socket) => {
        console.log("User connected:", socket.id);

        socket.on("sendMessage", ({ senderId, recipientId, message }) => {
            console.log(`Message from ${senderId} to ${recipientId}:`, message);
            io?.emit(`chat-${recipientId}`, { senderId, message });
        });

        socket.on("disconnect", () => {
            console.log("User disconnected:", socket.id);
        });
    });

    return io;
}
