import { useContext } from 'react';
import { SocketContext, type SocketConnectionStatus } from './SocketContext';

export function useSocketStatus(): SocketConnectionStatus {
  const context = useContext(SocketContext);
  return context?.status ?? 'connected';
}
