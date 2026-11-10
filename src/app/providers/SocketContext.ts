import { createContext } from 'react';
import type { TypedSocket } from '@/lib/socket';

export type SocketConnectionStatus = 'connected' | 'connecting' | 'disconnected';

export interface SocketContextValue {
  socket: TypedSocket | null;
  isConnected: boolean;
  status: SocketConnectionStatus;
}

export const SocketContext = createContext<SocketContextValue | undefined>(undefined);
