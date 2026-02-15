'use client';

import { SessionProvider } from '@/components/providers/session-provider';
import { SocketProvider } from '@/components/providers/socket-provider';
import { ReactNode } from 'react';

interface DashboardLayoutProps {
  children: ReactNode;
}

/**
 * Dashboard layout with SessionProvider and SocketProvider
 * Wraps all dashboard pages with authentication and real-time context
 */
export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SessionProvider>
      <SocketProvider>
        {children}
      </SocketProvider>
    </SessionProvider>
  );
}
