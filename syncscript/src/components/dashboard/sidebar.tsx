'use client';

import { useSession, signOut } from 'next-auth/react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useSocket } from '@/components/providers/socket-provider';

/**
 * Sidebar component with navigation links and role badge
 * Displays user information and connection status
 */
export function Sidebar() {
  const { data: session } = useSession();
  const { isConnected } = useSocket();

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/login' });
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default';
      case 'contributor':
        return 'secondary';
      case 'viewer':
        return 'outline';
      default:
        return 'outline';
    }
  };

  if (!session) return null;

  return (
    <div className="w-64 bg-sidebar border-r border-sidebar-border h-screen flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-sidebar-border">
        <h1 className="text-xl font-bold text-sidebar-foreground">SyncScript</h1>
        <p className="text-sm text-sidebar-foreground/60 mt-1">Vault Dashboard</p>
      </div>

      {/* User Info */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-sidebar-foreground truncate">
            {session.user.email}
          </p>
          <Badge variant={getRoleBadgeVariant(session.user.role)}>
            {session.user.role}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <div
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-sidebar-foreground/60">
            {isConnected ? 'Connected' : 'Disconnected'}
          </span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className="block px-4 py-2 text-sm text-sidebar-foreground hover:bg-sidebar-accent rounded-md transition-colors"
            >
              Vaults
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full"
          size="sm"
        >
          Sign Out
        </Button>
      </div>
    </div>
  );
}
