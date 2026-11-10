import React, { useEffect, useState } from 'react';
import { connectSocket, disconnectSocket, getSocket } from '@/lib/socket';
import { refreshAccessToken, triggerAuthFailure } from '@/lib/http/refresh';
import { useAuth } from './useAuth';
import { SocketContext, type SocketConnectionStatus } from './SocketContext';

export interface SocketProviderProps {
  children: React.ReactNode;
}

export const SocketProvider: React.FC<SocketProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [status, setStatus] = useState<SocketConnectionStatus>(() =>
    isAuthenticated && getSocket().connected ? 'connected' : 'disconnected',
  );

  useEffect(() => {
    if (!isAuthenticated) {
      disconnectSocket();
      setStatus('disconnected');
      return;
    }

    const socket = connectSocket();
    setStatus(socket.connected ? 'connected' : 'connecting');

    const emitPresence = (visible?: boolean) => {
      if (socket.connected) {
        const isVisible =
          typeof visible === 'boolean'
            ? visible
            : document.visibilityState === 'visible' && document.hasFocus();
        socket.emit('presence:update', { visible: isVisible });
      }
    };

    const handleConnect = () => {
      setStatus('connected');
      emitPresence();
    };
    const handleDisconnect = () => setStatus('disconnected');
    const handleConnecting = () => setStatus('connecting');

    const handleVisibilityChange = () => {
      emitPresence();
    };

    const handleFocus = () => {
      emitPresence(true);
    };

    const handleBlur = () => {
      emitPresence(false);
    };

    const handlePageHide = () => {
      emitPresence(false);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);
    window.addEventListener('pagehide', handlePageHide);

    const handleConnectError = async (err: Error) => {
      setStatus('disconnected');
      const isAuthError =
        err.message.includes('Authentication') ||
        err.message.includes('token') ||
        err.message.includes('401');

      if (isAuthError) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          socket.connect();
        } else {
          disconnectSocket();
          triggerAuthFailure();
        }
      }
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleConnectError);
    socket.io.on('reconnect_attempt', handleConnecting);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('pagehide', handlePageHide);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleConnectError);
      socket.io.off('reconnect_attempt', handleConnecting);
    };
  }, [isAuthenticated]);

  const socket = isAuthenticated ? getSocket() : null;

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected: status === 'connected',
        status,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};
