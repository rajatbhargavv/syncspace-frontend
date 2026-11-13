import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { ROUTES } from '@/config/routes';
import { useCreateSpaceInvite } from '../hooks/useCreateSpaceInvite';

export interface SpaceInvitePanelProps {
  spaceId: string;
  canInvite: boolean;
}

export const SpaceInvitePanel: React.FC<SpaceInvitePanelProps> = ({ spaceId, canInvite }) => {
  const createInvite = useCreateSpaceInvite();
  const [inviteUrl, setInviteUrl] = useState('');

  if (!canInvite) return null;

  const handleCreateInvite = async () => {
    try {
      const result = await createInvite.mutateAsync({ spaceId });
      const url = `${window.location.origin}${ROUTES.INVITE_PREVIEW(result.token)}`;
      setInviteUrl(url);
      await navigator.clipboard.writeText(url);
      toast.success('Invite link created and copied');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create invite link');
    }
  };

  return (
    <section className="space-y-3 rounded-card border border-border bg-surface p-4">
      <div>
        <h2 className="font-heading text-xl font-semibold text-text">Invite members</h2>
        <p className="mt-1 text-sm text-text-muted">
          Create a link that people can use to join this space.
        </p>
      </div>
      <Button onClick={() => void handleCreateInvite()} isLoading={createInvite.isPending}>
        Create invite link
      </Button>
      {inviteUrl && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            readOnly
            aria-label="Invite link"
            value={inviteUrl}
            className="min-w-0 flex-1 rounded-input border border-border bg-surface-hover px-3 py-2 text-xs text-text"
            onFocus={(event) => event.currentTarget.select()}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              void navigator.clipboard.writeText(inviteUrl);
              toast.success('Invite link copied');
            }}
          >
            Copy
          </Button>
        </div>
      )}
    </section>
  );
};
