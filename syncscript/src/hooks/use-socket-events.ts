'use client';

import { useEffect } from 'react';
import { useSocket } from '@/components/providers/socket-provider';

/**
 * Custom hook to subscribe to Socket.io events
 * Automatically handles cleanup on unmount
 *
 * @param event - Socket.io event name
 * @param callback - Event handler function
 */
export function useSocketEvents(event: string, callback: (...args: any[]) => void) {
  const { socket } = useSocket();

  useEffect(() => {
    if (!socket) return;

    // Subscribe to event
    socket.on(event, callback);

    // Cleanup: unsubscribe on unmount or when dependencies change
    return () => {
      socket.off(event, callback);
    };
  }, [socket, event, callback]);
}
