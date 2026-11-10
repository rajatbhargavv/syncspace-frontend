import { describe, expect, it, vi, beforeEach } from 'vitest';
import { getSocket, socketActions } from '@/lib/socket';

describe('realtime socket client', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getSocket returns a configured socket instance', () => {
    const socket = getSocket();
    expect(socket).toBeDefined();
    expect(typeof socket.emit).toBe('function');
    expect(typeof socket.on).toBe('function');
  });

  it('socketActions.joinSpace emits space:join when connected', () => {
    const socket = getSocket();
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => socket);
    socket.connected = true;

    socketActions.joinSpace('space_test_123');
    expect(emitSpy).toHaveBeenCalledWith('space:join', 'space_test_123');
  });

  it('socketActions.leaveSpace emits space:leave when connected', () => {
    const socket = getSocket();
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => socket);
    socket.connected = true;

    socketActions.leaveSpace('space_test_123');
    expect(emitSpy).toHaveBeenCalledWith('space:leave', 'space_test_123');
  });

  it('socketActions does not emit when socket is disconnected', () => {
    const socket = getSocket();
    const emitSpy = vi.spyOn(socket, 'emit').mockImplementation(() => socket);
    socket.connected = false;

    socketActions.joinSpace('space_test_456');
    socketActions.leaveSpace('space_test_456');
    expect(emitSpy).not.toHaveBeenCalled();
  });
});
