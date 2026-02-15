'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Navbar } from '@/components/navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export default function InvitePage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(false);
  const [inviteData, setInviteData] = useState<{
    vaultName: string;
    inviterName: string;
    valid: boolean;
  } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=/invite/${params.token}`);
      return;
    }

    if (status === 'authenticated') {
      validateInvite();
    }
  }, [status, params.token]);

  const validateInvite = async () => {
    try {
      const response = await fetch(`/api/invites/${params.token}`);

      if (!response.ok) {
        throw new Error('Invalid or expired invite link');
      }

      const data = await response.json();
      setInviteData(data);
    } catch (error) {
      toast.error('Invalid or expired invite link');
      setInviteData({ vaultName: '', inviterName: '', valid: false });
    } finally {
      setIsLoading(false);
    }
  };

  const acceptInvite = async () => {
    setIsAccepting(true);

    try {
      const response = await fetch(`/api/invites/${params.token}/accept`, {
        method: 'POST',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to accept invite');
      }

      const data = await response.json();
      toast.success('Successfully joined vault!');
      router.push(`/vaults/${data.vaultId}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to accept invite');
    } finally {
      setIsAccepting(false);
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16 text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-indigo-600" />
          <p className="mt-4 text-gray-600">Loading invite...</p>
        </div>
      </div>
    );
  }

  if (!inviteData || !inviteData.valid) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <XCircle className="h-8 w-8 text-red-500" />
                <CardTitle>Invalid Invite</CardTitle>
              </div>
              <CardDescription>
                This invite link is invalid or has expired.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/dashboard')}>
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-16">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <CardTitle>You've Been Invited!</CardTitle>
            </div>
            <CardDescription>
              {inviteData.inviterName} has invited you to join a vault
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Vault Name</p>
              <p className="text-xl font-semibold">{inviteData.vaultName}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                By accepting this invite, you'll join as a <strong>contributor</strong> and will be able to add and view sources in this vault.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={acceptInvite}
                disabled={isAccepting}
                className="flex-1"
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  'Accept Invite'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                disabled={isAccepting}
              >
                Decline
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
