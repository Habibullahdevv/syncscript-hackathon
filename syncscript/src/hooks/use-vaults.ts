'use client';

import { useState, useEffect } from 'react';
import { getVaults, Vault } from '@/lib/api';

interface UseVaultsReturn {
  vaults: Vault[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage vault list
 * Provides loading, error states, and refetch functionality
 */
export function useVaults(): UseVaultsReturn {
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVaults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await getVaults();
      setVaults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vaults');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVaults();
  }, []);

  return {
    vaults,
    isLoading,
    error,
    refetch: fetchVaults,
  };
}
