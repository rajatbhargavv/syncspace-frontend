import React from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Avatar, Button, ErrorState, Skeleton } from '@/components/ui';
import { ApiError } from '@/lib/http/ApiError';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useInvitePreview } from '../hooks/useInvitePreview';
import { useJoinSpaceByInvite } from '../hooks/useJoinSpaceByInvite';

export const InvitePage: React.FC = () => {
  const { token = '' } = useParams<{ token: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const preview = useInvitePreview(token);
  const join = useJoinSpaceByInvite();

  if (preview.isLoading) return <Skeleton className="mx-auto mt-10 h-72 max-w-xl" />;
  if (preview.isError || !preview.data) {
    return (
      <ErrorState
        title="Invite unavailable"
        message={
          preview.error instanceof ApiError
            ? preview.error.message
            : 'This invite link is invalid or expired.'
        }
      />
    );
  }

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(ROUTES.LOGIN, { state: { from: location } });
      return;
    }
    try {
      const space = await join.mutateAsync(token);
      toast.success(`You joined ${space.name}`);
      navigate(ROUTES.SPACE(space._id), { replace: true });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to join this space');
    }
  };

  return (
    <main className="mx-auto max-w-xl px-4 py-16">
      <section className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
        <Avatar name={preview.data.ownerName} size="lg" className="mx-auto" />
        <p className="mt-4 text-sm text-text-muted">{preview.data.ownerName} invited you to</p>
        <h1 className="mt-2 font-heading text-3xl font-bold text-text">{preview.data.name}</h1>
        <Button className="mt-8" onClick={() => void handleJoin()} isLoading={join.isPending}>
          Join space
        </Button>
      </section>
    </main>
  );
};
