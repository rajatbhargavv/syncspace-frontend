import { useEffect, useRef } from 'react';
import { getSocket, type ServerToClientEvents } from '@/lib/socket';

type GenericListener = (...args: unknown[]) => void;

export function useSocketEvent<K extends keyof ServerToClientEvents>(
  event: K,
  handler: ServerToClientEvents[K],
): void {
  const handlerRef = useRef(handler);
  handlerRef.current = handler;

  useEffect(() => {
    const socket = getSocket();

    const listener = (...args: Parameters<ServerToClientEvents[K]>) => {
      // Invoke current handler ref to avoid stale closures
      const fn = handlerRef.current as (...innerArgs: Parameters<ServerToClientEvents[K]>) => void;
      fn(...args);
    };

    const registerOn = socket.on as (evt: string, fn: GenericListener) => void;
    const registerOff = socket.off as (evt: string, fn: GenericListener) => void;

    registerOn(event, listener as GenericListener);

    return () => {
      registerOff(event, listener as GenericListener);
    };
  }, [event]);
}
