import { getIO } from '../../server';

/**
 * Get the Socket.io server instance for use in API routes
 * @throws Error if Socket.io server is not initialized
 */
export function getSocketIO() {
  return getIO();
}
