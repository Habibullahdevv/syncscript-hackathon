'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vault } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface VaultCardProps {
  vault: Vault;
}

/**
 * VaultCard component displays vault information with role badge
 * Clickable card navigates to vault detail page
 */
export function VaultCard({ vault }: VaultCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/vaults/${vault.id}`);
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'owner':
        return 'default'; // Blue
      case 'contributor':
        return 'secondary'; // Green
      case 'viewer':
        return 'outline'; // Gray
      default:
        return 'outline';
    }
  };

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]"
      onClick={handleClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl">{vault.title}</CardTitle>
          <Badge variant={getRoleBadgeVariant(vault.userRole)}>
            {vault.userRole}
          </Badge>
        </div>
        <CardDescription>{vault.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {vault.sourceCount} {vault.sourceCount === 1 ? 'source' : 'sources'}
        </p>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Last updated: {new Date(vault.updatedAt).toLocaleDateString()}
      </CardFooter>
    </Card>
  );
}
