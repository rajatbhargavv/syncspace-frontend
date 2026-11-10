import { useSocket } from './useSocket';
import type { SocketConnectionStatus } from './SocketContext';

export function useSocketStatus(): SocketConnectionStatus {
  const { status } = useSocket();
  return status;
}
