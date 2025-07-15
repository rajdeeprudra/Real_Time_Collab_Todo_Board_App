
import { io } from "socket.io-client";


const socket = io("http://localhost:5000", {
  transports: ["websocket"], // enforce WebSocket
  autoConnect: true,
});

export default socket;
