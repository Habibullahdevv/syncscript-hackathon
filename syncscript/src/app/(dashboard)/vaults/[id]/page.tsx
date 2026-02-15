'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { SourceTable } from '@/components/dashboard/source-table';
import { UploadForm } from '@/components/dashboard/upload-form';
import { useSources } from '@/hooks/use-sources';
import { useSocketEvents } from '@/hooks/use-socket-events';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface VaultDetailPageProps {
  params: {
    id: string;
  };
}

/**
 * Vault detail page - displays all sources within a specific vault
 * Implements User Story 2: Vault Detail with Source List
 */
export default function VaultDetailPage({ params }: VaultDetailPageProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { sources, isLoading, error, refetch } = useSources(params.id);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  // Real-time event handlers (T053-T058)
  useSocketEvents('source:created', (data: any) => {
    // Only show notification if the event is for this vault
    if (data.vaultId === params.id) {
      toast.success(`${data.actor?.name || 'Someone'} added "${data.source?.title}"`);
      refetch();
    }
  });

  useSocketEvents('source:deleted', (data: any) => {
    // Only show notification if the event is for this vault
    if (data.vaultId === params.id) {
      toast.info(`${data.actor?.name || 'Someone'} deleted a source`);
      refetch();
    }
  });

  // Loading state
  if (status === 'loading' || isLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-6"
            >
              ← Back to Vaults
            </Button>
            <h1 className="text-3xl font-bold mb-8">Vault Sources</h1>
            {/* Skeleton loading table */}
            <div className="space-y-4">
              <div className="h-10 bg-muted animate-pulse rounded" />
              <div className="h-64 bg-muted animate-pulse rounded" />
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
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-6"
            >
              ← Back to Vaults
            </Button>
            <h1 className="text-3xl font-bold mb-8">Vault Sources</h1>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 text-center">
              <p className="text-destructive font-medium mb-4">{error}</p>
              <Button onClick={refetch} variant="outline">
                Try Again
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (sources.length === 0) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/dashboard')}
              className="mb-6"
            >
              ← Back to Vaults
            </Button>
            <h1 className="text-3xl font-bold mb-8">Vault Sources</h1>
            <div className="bg-muted rounded-lg p-12 text-center">
              <h2 className="text-xl font-semibold mb-2">No sources found</h2>
              <p className="text-muted-foreground mb-4">
                This vault doesn't have any sources yet.
              </p>
              {(session.user.role === 'owner' ||
                session.user.role === 'contributor') && (
                <p className="text-sm text-muted-foreground">
                  Click "Add Source" to upload your first PDF.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Success state - display sources
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="max-w-7xl mx-auto">
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/dashboard')}
            className="mb-6"
          >
            ← Back to Vaults
          </Button>

          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Vault Sources</h1>
              <p className="text-muted-foreground mt-2">
                {sources.length} {sources.length === 1 ? 'source' : 'sources'} in
                this vault
              </p>
            </div>
            {/* Add Source button - only for owner/contributor */}
            {(session.user.role === 'owner' ||
              session.user.role === 'contributor') && (
              <Button onClick={() => setIsUploadDialogOpen(true)}>
                Add Source
              </Button>
            )}
          </div>

          {/* Source Table with sorting, filtering, pagination */}
          <SourceTable
            sources={sources}
            userRole={session.user.role}
            onDelete={
              session.user.role === 'owner'
                ? async (sourceId) => {
                    try {
                      const { deleteSource } = await import('@/lib/api');
                      await deleteSource(params.id, sourceId);
                      toast.success('Source deleted successfully');
                      await refetch();
                    } catch (error) {
                      toast.error(
                        `Delete failed: ${
                          error instanceof Error ? error.message : 'Unknown error'
                        }`
                      );
                    }
                  }
                : undefined
            }
          />

          {/* Upload Form Dialog */}
          <UploadForm
            vaultId={params.id}
            isOpen={isUploadDialogOpen}
            onClose={() => setIsUploadDialogOpen(false)}
            onSuccess={() => {
              toast.success('Source uploaded successfully');
              refetch();
            }}
            onError={(error) => {
              toast.error(`Upload failed: ${error}`);
            }}
          />
        </div>
      </div>
    </div>
  );
}
