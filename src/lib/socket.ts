import { io, type Socket } from 'socket.io-client';
import { env } from '@/config/env';
import type { NotificationItem } from '@/features/notifications';
import type { Task } from '@/features/tasks';
import type { CommentItem } from '@/features/comments';

export interface ServerToClientEvents {
  notification: (notification: NotificationItem) => void;
  'task:updated': (task: Task) => void;
  'comment:created': (comment: CommentItem) => void;
}

export interface ClientToServerEvents {
  'space:join': (spaceId: string) => void;
  'space:leave': (spaceId: string) => void;
}

export type TypedSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socketInstance: TypedSocket | null = null;

export function getSocket(): TypedSocket {
  if (!socketInstance) {
    const origin =
      env.apiBaseUrl ||
      (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173');

    socketInstance = io(origin, {
      withCredentials: true,
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      transports: ['websocket', 'polling'],
    });
  }
  return socketInstance;
}

export function connectSocket(): TypedSocket {
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

export const socketActions = {
  joinSpace(spaceId: string): void {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('space:join', spaceId);
    }
  },
  leaveSpace(spaceId: string): void {
    const socket = getSocket();
    if (socket.connected) {
      socket.emit('space:leave', spaceId);
    }
  },
};

export const joinSpace = (spaceId: string): void => {
  socketActions.joinSpace(spaceId);
};
export const leaveSpace = (spaceId: string): void => {
  socketActions.leaveSpace(spaceId);
};
