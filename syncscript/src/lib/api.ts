/**
 * API Client for Phase 5 Frontend Dashboard
 * Provides fetch wrappers with error handling for Phase 2 backend APIs
 */

interface ApiError {
  message: string;
  statusCode: number;
  details?: any;
}

/**
 * Handle API response and throw errors if needed
 */
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    let errorMessage = 'API request failed';

    try {
      const error: ApiError = await response.json();
      errorMessage = error.message || errorMessage;
    } catch {
      // If JSON parsing fails, use status text
      errorMessage = response.statusText || errorMessage;
    }

    throw new Error(errorMessage);
  }

  return response.json();
}

/**
 * Vault interface
 */
export interface Vault {
  id: string;
  title: string;
  description: string;
  sourceCount: number;
  userRole: 'owner' | 'contributor' | 'viewer';
  createdAt: string;
  updatedAt: string;
}

/**
 * Source interface
 */
export interface Source {
  id: string;
  vaultId: string;
  title: string;
  fileUrl: string;
  fileSize: number;
  uploadedBy: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get all vaults accessible to authenticated user
 */
export async function getVaults(): Promise<Vault[]> {
  const response = await fetch('/api/vaults', {
    method: 'GET',
    credentials: 'include',
  });

  const data = await handleResponse<{ vaults: Vault[] }>(response);
  return data.vaults;
}

/**
 * Get single vault details
 */
export async function getVault(vaultId: string): Promise<Vault> {
  const response = await fetch(`/api/vaults/${vaultId}`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await handleResponse<{ vault: Vault }>(response);
  return data.vault;
}

/**
 * Get all sources within a vault
 */
export async function getSources(vaultId: string): Promise<Source[]> {
  const response = await fetch(`/api/vaults/${vaultId}/sources`, {
    method: 'GET',
    credentials: 'include',
  });

  const data = await handleResponse<{ sources: Source[] }>(response);
  return data.sources;
}

/**
 * Upload PDF source to vault
 */
export async function uploadSource(
  vaultId: string,
  file: File,
  title: string
): Promise<Source> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('title', title);

  const response = await fetch(`/api/vaults/${vaultId}/sources`, {
    method: 'POST',
    credentials: 'include',
    body: formData,
    // Note: Do NOT set Content-Type header, browser sets it with boundary
  });

  const data = await handleResponse<{ source: Source }>(response);
  return data.source;
}

/**
 * Delete source from vault
 */
export async function deleteSource(
  vaultId: string,
  sourceId: string
): Promise<void> {
  const response = await fetch(`/api/vaults/${vaultId}/sources/${sourceId}`, {
    method: 'DELETE',
    credentials: 'include',
  });

  await handleResponse<{ message: string }>(response);
}
