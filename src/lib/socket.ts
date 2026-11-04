import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';

let socketInstance: Socket | null = null;

export function getSocket(): Socket {
  if (!socketInstance) {
    const origin =
      env.apiBaseUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

    socketInstance = io(origin, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
}

export function connectSocket(): Socket {
  const socket = getSocket();
  if (!socket.connected) {
    socket.connect();
  }
  return socket;
}

export function disconnectSocket(): void {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
}

export function joinSpace(spaceId: string): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('space:join', spaceId);
  }
}

export function leaveSpace(spaceId: string): void {
  const socket = getSocket();
  if (socket.connected) {
    socket.emit('space:leave', spaceId);
  }
<<<<<<< HEAD
}
=======
}
>>>>>>> 7a42eac4da9d7d72067212ae06555f7d94377449
