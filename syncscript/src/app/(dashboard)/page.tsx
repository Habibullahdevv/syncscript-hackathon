'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Navbar } from '@/components/navbar';
import { Sidebar } from '@/components/dashboard/sidebar';
import { VaultCard } from '@/components/dashboard/vault-card';
import { CreateVaultButton } from '@/components/dashboard/create-vault-button';
import { useVaults } from '@/hooks/use-vaults';
import { Button } from '@/components/ui/button';

/**
 * Dashboard page - displays all vaults accessible to authenticated user
 * Implements User Story 1: Vault List Dashboard
 */
export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { vaults, isLoading, error, refetch } = useVaults();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">My Vaults</h1>
              {/* Skeleton loading cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-48 bg-gray-200 animate-pulse rounded-lg"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!session) {
    return null;
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">My Vaults</h1>
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-800 font-medium mb-4">{error}</p>
                <Button onClick={refetch} variant="outline">
                  Try Again
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (vaults.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="max-w-7xl mx-auto">
              <h1 className="text-3xl font-bold mb-8">My Vaults</h1>
              <div className="bg-white rounded-lg p-12 text-center border border-gray-200">
                <h2 className="text-xl font-semibold mb-2">No vaults found</h2>
                <p className="text-gray-600 mb-4">
                  You don't have access to any vaults yet.
                </p>
                <p className="text-sm text-gray-500">
                  Contact an administrator to get access to vaults.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - display vaults
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <div className="flex-1 p-8 overflow-auto">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">My Vaults</h1>
                <p className="text-gray-600 mt-2">
                  {vaults.length} {vaults.length === 1 ? 'vault' : 'vaults'} accessible
                </p>
              </div>
              <CreateVaultButton />
            </div>

            {/* Responsive grid layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {vaults.map((vault) => (
                <VaultCard key={vault.id} vault={vault} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
