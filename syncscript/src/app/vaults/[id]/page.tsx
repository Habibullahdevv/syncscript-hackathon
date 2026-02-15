'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Plus, Users, History, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface Source {
  id: string;
  title: string;
  url?: string;
  content?: string;
  tags: string[];
  createdAt: string;
  createdBy: {
    name: string;
    email: string;
  };
}

interface VaultUser {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

interface AuditLog {
  id: string;
  action: string;
  details: string;
  createdAt: string;
}

interface VaultData {
  id: string;
  name: string;
  description?: string;
  userRole: 'owner' | 'contributor' | 'viewer';
  sources: Source[];
  vaultUsers: VaultUser[];
}

export default function VaultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const [vault, setVault] = useState<VaultData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'sources' | 'members' | 'audit'>('sources');
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isLoadingAudit, setIsLoadingAudit] = useState(false);

  useEffect(() => {
    fetchVaultData();
  }, [params.id]);

  useEffect(() => {
    if (activeTab === 'audit' && isOwner && auditLogs.length === 0) {
      fetchAuditLogs();
    }
  }, [activeTab, isOwner]);

  const fetchVaultData = async () => {
    try {
      const response = await fetch(`/api/vaults/${params.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch vault');
      }
      const data = await response.json();
      setVault(data.vault);
    } catch (error) {
      toast.error('Failed to load vault');
      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAuditLogs = async () => {
    setIsLoadingAudit(true);
    try {
      const response = await fetch(`/api/vaults/${params.id}/audit`);
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs');
      }
      const data = await response.json();
      setAuditLogs(data.auditLogs);
    } catch (error) {
      toast.error('Failed to load audit logs');
    } finally {
      setIsLoadingAudit(false);
    }
  };

  const changeUserRole = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/vaults/${params.id}/members/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to change role');
      }

      toast.success('Role updated successfully');
      fetchVaultData(); // Refresh vault data
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to change role');
    }
  };

  const generateInviteLink = async () => {
    try {
      const response = await fetch(`/api/vaults/${params.id}/invite`, {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to generate invite link');
      }

      const data = await response.json();
      const inviteUrl = `${window.location.origin}/invite/${data.inviteToken}`;

      await navigator.clipboard.writeText(inviteUrl);
      toast.success('Invite link copied to clipboard!');
    } catch (error) {
      toast.error('Failed to generate invite link');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!vault) {
    return null;
  }

  const isOwner = vault.userRole === 'owner';
  const canAddSources = vault.userRole === 'owner' || vault.userRole === 'contributor';

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold">{vault.name}</h1>
                <Badge variant={vault.userRole === 'owner' ? 'default' : 'secondary'}>
                  {vault.userRole}
                </Badge>
              </div>
              {vault.description && (
                <p className="text-gray-600">{vault.description}</p>
              )}
            </div>

            <div className="flex gap-2">
              {isOwner && (
                <Button onClick={generateInviteLink} variant="outline">
                  <LinkIcon className="h-4 w-4 mr-2" />
                  Generate Invite Link
                </Button>
              )}
              {canAddSources && (
                <Button onClick={() => router.push(`/vaults/${vault.id}/add-source`)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Source
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex gap-8">
            <button
              onClick={() => setActiveTab('sources')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'sources'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Sources ({vault.sources.length})
            </button>
            <button
              onClick={() => setActiveTab('members')}
              className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'members'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              Members ({vault.vaultUsers.length})
            </button>
            {isOwner && (
              <button
                onClick={() => setActiveTab('audit')}
                className={`pb-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'audit'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                <History className="h-4 w-4 inline mr-2" />
                Audit Log
              </button>
            )}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'sources' && (
          <div className="grid gap-4">
            {vault.sources.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500 mb-4">No sources yet</p>
                  {canAddSources && (
                    <Button onClick={() => router.push(`/vaults/${vault.id}/add-source`)}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Your First Source
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              vault.sources.map((source) => (
                <Card key={source.id}>
                  <CardHeader>
                    <CardTitle>{source.title}</CardTitle>
                    <CardDescription>
                      Added by {source.createdBy.name} on{' '}
                      {new Date(source.createdAt).toLocaleDateString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {source.url && (
                      <a
                        href={source.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-indigo-600 hover:underline mb-2 block"
                      >
                        {source.url}
                      </a>
                    )}
                    {source.content && (
                      <p className="text-gray-700 mb-3">{source.content}</p>
                    )}
                    {source.tags.length > 0 && (
                      <div className="flex gap-2 flex-wrap">
                        {source.tags.map((tag, idx) => (
                          <Badge key={idx} variant="outline">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'members' && (
          <div className="grid gap-4">
            {vault.vaultUsers.map((vaultUser) => (
              <Card key={vaultUser.id}>
                <CardContent className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">{vaultUser.user.name}</p>
                    <p className="text-sm text-gray-500">{vaultUser.user.email}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {isOwner && vaultUser.user.id !== session?.user?.id ? (
                      <select
                        value={vaultUser.role}
                        onChange={(e) => changeUserRole(vaultUser.user.id, e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="owner">Owner</option>
                        <option value="contributor">Contributor</option>
                        <option value="viewer">Viewer</option>
                      </select>
                    ) : (
                      <Badge>{vaultUser.role}</Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {activeTab === 'audit' && isOwner && (
          <div className="space-y-4">
            {isLoadingAudit ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">Loading audit logs...</p>
                </CardContent>
              </Card>
            ) : auditLogs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-gray-500">No audit logs yet</p>
                </CardContent>
              </Card>
            ) : (
              auditLogs.map((log) => (
                <Card key={log.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm">{log.action.replace(/_/g, ' ')}</p>
                        <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(log.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
