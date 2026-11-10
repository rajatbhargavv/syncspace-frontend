import { useEffect } from 'react';
import { getSocket, socketActions } from '@/lib/socket';

/**
 * Automatically joins the Socket.io room for the current space and leaves on unmount or ID change.
 * Also handles re-joining when the socket reconnects while viewing the space.
 */
export function useSpaceSocket(spaceId: string | undefined): void {
  useEffect(() => {
    if (!spaceId) return;

    socketActions.joinSpace(spaceId);

    const socket = getSocket();
    const handleConnect = () => {
      socketActions.joinSpace(spaceId);
    };

    socket.on('connect', handleConnect);

    return () => {
      socket.off('connect', handleConnect);
      socketActions.leaveSpace(spaceId);
    };
  }, [spaceId]);
}
