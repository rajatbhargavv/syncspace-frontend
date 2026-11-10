import { useEffect, useRef } from 'react';
import { getSocket, type ServerToClientEvents } from '@/lib/socket';

type GenericListener = (...args: unknown[]) => void;

interface EventTargetSocket {
  on: (evt: string, fn: GenericListener) => void;
  off: (evt: string, fn: GenericListener) => void;
}

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();

    const listener: GenericListener = (...args: unknown[]) => {
      const fn = handlerRef.current as (...innerArgs: unknown[]) => void;
      fn(...args);
    };

    const target = socket as unknown as EventTargetSocket;

    target.on(event, listener);

    return () => {
      target.off(event, listener);
    };
  }, [event]);
}
