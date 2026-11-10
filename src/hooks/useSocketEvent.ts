import { useEffect, useRef } from 'react';
import { getSocket, type ServerToClientEvents } from '@/lib/socket';

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();

    const listener = ((...args: Parameters<ServerToClientEvents[K]>) => {
      // Invoke current handler ref to avoid stale closures
      const fn = handlerRef.current as (...innerArgs: Parameters<ServerToClientEvents[K]>) => void;
      fn(...args);
    }) as ServerToClientEvents[K];

    socket.on(event, listener);

    return () => {
      socket.off(event, listener);
    };
  }, [event]);
}
