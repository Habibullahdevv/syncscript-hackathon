'use client';

import { useState, useEffect } from 'react';
import { getSources, Source } from '@/lib/api';

interface UseSourcesReturn {
  sources: Source[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage source list for a specific vault
 * Provides loading, error states, and refetch functionality
 */
export function useSources(vaultId: string): UseSourcesReturn {
  const [sources, setSources] = useState<Source[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSources = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getSources(vaultId);
      setSources(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load sources');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (vaultId) {
      fetchSources();
    }
  }, [vaultId]);

  return {
    sources,
    isLoading,
    error,
    refetch: fetchSources,
  };
}
