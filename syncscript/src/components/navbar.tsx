'use client';

import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <span className="text-2xl font-bold text-indigo-600">SyncScript</span>
          </Link>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            {status === 'loading' ? (
              <div className="text-sm text-gray-500">Loading...</div>
            ) : session ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-700">{session.user?.email}</span>
                  <Link href="/api/auth/signout">
                    <Button variant="outline" size="sm">
                      Sign Out
                    </Button>
                  </Link>
                </div>
              </>
            ) : (
              <>
                <Link href="/">
                  <Button variant="ghost">Home</Button>
                </Link>
                <Link href="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="default">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
