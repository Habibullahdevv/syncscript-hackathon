'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface Source {
  id: string;
  title: string;
  fileUrl: string;
  vaultId: string;
  createdAt: string;
}

interface SourceEvent {
  source: Source;
  actor: {
    userId: string;
    userName: string;
    role: string;
  };
  timestamp: string;
}

export default function RealtimeTestPage() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'reconnecting'>('disconnected');
  const [vaultId, setVaultId] = useState('');
  const [joinedVault, setJoinedVault] = useState<string | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [sources, setSources] = useState<Source[]>([]);
  const [events, setEvents] = useState<string[]>([]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socketInstance = io('http://localhost:3000', {
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      withCredentials: true,
    });

    setSocket(socketInstance);
    setConnectionStatus('connecting');

    // Connection event handlers
    socketInstance.on('connect', () => {
      setConnectionStatus('connected');
      addEvent('✅ Connected to Socket.io server');
    });

    socketInstance.on('disconnect', (reason) => {
      setConnectionStatus('disconnected');
      addEvent(`❌ Disconnected: ${reason}`);
      setJoinedVault(null);
      setUserRole(null);
    });

    socketInstance.on('reconnect', (attemptNumber) => {
      setConnectionStatus('connected');
      addEvent(`🔄 Reconnected after ${attemptNumber} attempts`);
    });

    socketInstance.on('reconnect_attempt', (attemptNumber) => {
      setConnectionStatus('reconnecting');
      addEvent(`🔄 Reconnection attempt ${attemptNumber}`);
    });

    // Vault room event handlers
    socketInstance.on('vault:joined', ({ vaultId, role }) => {
      setJoinedVault(vaultId);
      setUserRole(role);
      addEvent(`✅ Joined vault ${vaultId} as ${role}`);
    });

    // Source event handlers
    socketInstance.on('source:created', (data: SourceEvent) => {
      addEvent(`📄 ${data.actor.userName} added "${data.source.title}"`);
      setSources((prev) => [data.source, ...prev]);
    });

    socketInstance.on('source:updated', (data: SourceEvent) => {
      addEvent(`✏️ ${data.actor.userName} updated "${data.source.title}"`);
      setSources((prev) =>
        prev.map((s) => (s.id === data.source.id ? data.source : s))
      );
    });

    socketInstance.on('source:deleted', ({ sourceId, actor }) => {
      addEvent(`🗑️ ${actor.userName} deleted a source`);
      setSources((prev) => prev.filter((s) => s.id !== sourceId));
    });

    // Error handler
    socketInstance.on('error', (error: { message: string }) => {
      addEvent(`⚠️ Error: ${error.message}`);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const addEvent = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setEvents((prev) => [`[${timestamp}] ${message}`, ...prev].slice(0, 20));
  };

  const handleJoinVault = () => {
    if (socket && vaultId) {
      socket.emit('vault:join', vaultId);
      addEvent(`📤 Requesting to join vault ${vaultId}`);
    }
  };

  const handleLeaveVault = () => {
    if (socket && joinedVault) {
      socket.emit('vault:leave', joinedVault);
      setJoinedVault(null);
      setUserRole(null);
      setSources([]);
      addEvent(`📤 Left vault ${joinedVault}`);
    }
  };

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'connected':
        return 'bg-green-500';
      case 'connecting':
      case 'reconnecting':
        return 'bg-yellow-500';
      case 'disconnected':
        return 'bg-red-500';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Socket.io Real-Time Test</h1>
        <p className="text-gray-600 mb-8">Phase 4 - Real-Time Integration Testing</p>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${getStatusColor()}`}></div>
            <span className="font-semibold">Status:</span>
            <span className="capitalize">{connectionStatus}</span>
          </div>
        </div>

        {/* Vault Controls */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Vault Room</h2>

          {!joinedVault ? (
            <div className="flex gap-3">
              <input
                type="text"
                value={vaultId}
                onChange={(e) => setVaultId(e.target.value)}
                placeholder="Enter Vault ID"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleJoinVault}
                disabled={!vaultId || connectionStatus !== 'connected'}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Join Vault
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Current Vault</p>
                <p className="font-mono text-lg">{joinedVault}</p>
                <p className="text-sm text-gray-600 mt-1">Role: <span className="font-semibold">{userRole}</span></p>
              </div>
              <button
                onClick={handleLeaveVault}
                className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
              >
                Leave Vault
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Sources List */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Sources ({sources.length})</h2>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sources.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sources yet. Join a vault to see real-time updates.</p>
              ) : (
                sources.map((source) => (
                  <div key={source.id} className="border border-gray-200 rounded-lg p-4">
                    <h3 className="font-semibold text-lg mb-1">{source.title}</h3>
                    <p className="text-sm text-gray-600 font-mono mb-2">{source.id}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(source.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Event Log */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Event Log</h2>
            <div className="space-y-2 max-h-96 overflow-y-auto font-mono text-sm">
              {events.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No events yet</p>
              ) : (
                events.map((event, index) => (
                  <div key={index} className="text-gray-700 border-b border-gray-100 pb-2">
                    {event}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
