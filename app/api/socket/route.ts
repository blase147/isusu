// import { WebSocketServer } from "ws";

// const wss = new WebSocketServer({ noServer: true });

// export function GET() {
//     return new Response("WebSocket server is running!", { status: 200 });
// }

// // Handle WebSocket connections
// export const config = {
//     api: {
//         bodyParser: false,
//     },
// };

// export default function handler(req: any, res: any) {
//     if (!res.socket.server.wss) {
//         res.socket.server.wss = wss;

//         wss.on("connection", (ws) => {
//             ws.on("message", (data) => {
//                 const message = data.toString();
//                 console.log("Received:", message);

//                 // Broadcast to all clients
//                 wss.clients.forEach((client) => {
//                     if (client.readyState === 1) {
//                         client.send(message);
//                     }
//                 });
//             });
//         });
//     }

//     res.end();
// }
