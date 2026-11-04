import React, { useEffect } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { useAuth } from './useAuth';
import { SocketContext } from './SocketContext';

export interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const socket = connectSocket();
      return () => {
        if (socket.connected) {
          disconnectSocket();
        }
      };
    } else {
      disconnectSocket();
    }
  }, [isAuthenticated]);

  const socket = isAuthenticated ? getSocket() : null;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: socket?.connected ?? false,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
