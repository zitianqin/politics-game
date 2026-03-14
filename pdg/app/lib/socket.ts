import { io, Socket } from "socket.io-client";

let socket: Socket | null = null;

function getSocketUrl(): string {
  if (process.env.NEXT_PUBLIC_BACKEND_URL) {
    return process.env.NEXT_PUBLIC_BACKEND_URL;
  }
  throw new Error("NEXT_PUBLIC_BACKEND_URL is not set");
}

export function getSocket(): Socket {
  if (!socket) {
    socket = io(getSocketUrl(), {
      transports: ["websocket"],
      autoConnect: false,
    });
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
