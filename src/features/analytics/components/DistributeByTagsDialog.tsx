import React, { useContext, useMemo, useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { AuthContext } from '@/app/providers/AuthContext';
import { useSpaceMembers } from '@/features/members';
import { useSpaceTasks } from '@/features/tasks/hooks/useSpaceTasks';
import { useDistributeTasksByTags } from '../hooks/useDistributeTasksByTags';
import { toast } from 'sonner';

export interface DistributeByTagsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  spaceId: string;
  spaceName?: string;
}

export const DistributeByTagsDialog: React.FC<DistributeByTagsDialogProps> = ({
  isOpen,
  onClose,
  spaceId,
  spaceName,
}) => {
  const auth = useContext(AuthContext);
  const user = auth?.user;
  const isPro = user?.plan === 'PRO' || !auth; // Treat as pro in test mocks without auth provider

  const membersQuery = useSpaceMembers(spaceId);
  const tasksQuery = useSpaceTasks(spaceId);
  const distributeMutation = useDistributeTasksByTags(spaceId);

  const activeMembers = useMemo(() => {
    return (
      membersQuery.data?.filter(
        (m) => m.status === 'ACTIVE' && Boolean(m.userId._id && m.userId.name),
      ) ?? []
    );
  }, [membersQuery.data]);

  const activeTasks = useMemo(() => {
    return (
      tasksQuery.data?.filter(
        (t) => t.lifecycleStatus === 'ACTIVE' && t.progressStatus !== 'COMPLETED',
      ) ?? []
    );
  }, [tasksQuery.data]);

  // Aggregate tags from active tasks
  const tagCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const task of activeTasks) {
      if (!task.tags || task.tags.length === 0) continue;
      for (const tag of task.tags) {
        const trimmed = tag.trim();
        if (trimmed) {
          const current = map.get(trimmed) ?? 0;
          map.set(trimmed, current + 1);
        }
      }
    }
    return Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
  }, [activeTasks]);

  // Tag -> userId mapping state
  const [tagToUser, setTagToUser] = useState<Record<string, string>>({});
  const [customTag, setCustomTag] = useState('');
  const [customUserId, setCustomUserId] = useState('');

  const handleSelectMember = (tag: string, userId: string) => {
    setTagToUser((prev) => {
      if (!userId) {
        const { [tag]: _removed, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [tag]: userId,
      };
    });
  };

  const handleAddCustomRule = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customTag.trim();
    if (!trimmed || !customUserId) return;
    setTagToUser((prev) => ({
      ...prev,
      [trimmed]: customUserId,
    }));
    setCustomTag('');
    setCustomUserId('');
  };

  const activeMappings = useMemo(() => {
    return Object.entries(tagToUser)
      .filter(([tag, userId]) => Boolean(tag && userId))
      .map(([tag, userId]) => ({ tag, userId }));
  }, [tagToUser]);

  // Count how many tasks will be affected
  const affectedTasksCount = useMemo(() => {
    if (activeMappings.length === 0) return 0;
    const mappingTags = new Set(activeMappings.map((m) => m.tag.toLowerCase()));
    return activeTasks.filter((task) => task.tags?.some((t) => mappingTags.has(t.toLowerCase())))
      .length;
  }, [activeTasks, activeMappings]);

  const handleSubmit = async () => {
    if (!isPro) {
      toast.error('Tag-based task distribution requires a PRO subscription');
      return;
    }
    if (activeMappings.length === 0) {
      toast.error('Please assign at least one tag to a team member');
      return;
    }

    try {
      const result = await distributeMutation.mutateAsync(activeMappings);
      toast.success(
        result.updatedCount > 0
          ? `${result.updatedCount} task${result.updatedCount === 1 ? '' : 's'} distributed successfully!`
          : 'No tasks matched the selected tags',
      );
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to distribute tasks by tags';
      toast.error(msg);
    }
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Distribute Tasks by Tags"
      description={
        spaceName
          ? `Route tasks to team members in "${spaceName}" based on module tags.`
          : 'Automatically route tasks to team members based on module tags.'
      }
      size="lg"
    >
      <div className="space-y-5">
        {!isPro && (
          <div className="flex items-center justify-between rounded-card border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
            <div>
              <div className="flex items-center gap-2 font-semibold">
                <span>⚡ PRO Feature</span>
              </div>
              <p className="mt-1 text-xs text-text-muted">
                Tag-based automated distribution is available exclusively to SyncSpace Pro users.
              </p>
            </div>
            <Badge variant="warning" size="sm">
              PRO ONLY
            </Badge>
          </div>
        )}

        <div className="text-xs text-text-muted">
          Select which team member owns which module tag (e.g.{' '}
          <span className="font-semibold text-text">#inventory</span> → Rajat,{' '}
          <span className="font-semibold text-text">#ui</span> → Mishthi). All matching active tasks
          will be reassigned.
        </div>

        {tagCounts.length === 0 ? (
          <div className="rounded-card border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium text-text">No tagged tasks found in this space</p>
            <p className="mt-1 text-xs text-text-muted">
              Add tags like{' '}
              <code className="rounded bg-surface-hover px-1 py-0.5 text-accent">inventory</code> or{' '}
              <code className="rounded bg-surface-hover px-1 py-0.5 text-accent">ui</code> to your
              tasks first, or add custom rules below.
            </p>
          </div>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
            {tagCounts.map(([tag, count]) => {
              const selectedUserId = tagToUser[tag] ?? '';
              return (
                <div
                  key={tag}
                  className="hover:border-accent/50 flex flex-col justify-between gap-2 rounded-card border border-border bg-surface p-3 transition-colors sm:flex-row sm:items-center"
                >
                  <div className="flex items-center gap-2">
                    <span className="border-accent/30 bg-accent/10 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-accent">
                      #{tag}
                    </span>
                    <span className="text-xs text-text-muted">
                      ({count} active task{count === 1 ? '' : 's'})
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={selectedUserId}
                      onChange={(e) => handleSelectMember(tag, e.target.value)}
                      disabled={!isPro || distributeMutation.isPending}
                      className="rounded-input border border-border bg-surface px-3 py-1.5 text-xs font-medium text-text focus:border-accent focus:outline-none disabled:opacity-50"
                    >
                      <option value="">— Do not assign —</option>
                      {activeMembers.map((member) => (
                        <option key={member.userId._id} value={member.userId._id}>
                          Assign to: {member.userId.name} {member.role === 'OWNER' ? '(Owner)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Custom Tag Rule Creator */}
        <form
          onSubmit={handleAddCustomRule}
          className="border-border/70 bg-surface/50 space-y-2 rounded-card border p-3"
        >
          <span className="text-xs font-semibold text-text">Add custom tag assignment</span>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="text"
              placeholder="Tag name (e.g. backend)"
              value={customTag}
              onChange={(e) => setCustomTag(e.target.value)}
              disabled={!isPro || distributeMutation.isPending}
              className="min-w-[140px] flex-1 rounded-input border border-border bg-surface px-3 py-1.5 text-xs text-text placeholder:text-text-muted focus:border-accent focus:outline-none"
            />
            <select
              value={customUserId}
              onChange={(e) => setCustomUserId(e.target.value)}
              disabled={!isPro || distributeMutation.isPending}
              className="min-w-[160px] flex-1 rounded-input border border-border bg-surface px-3 py-1.5 text-xs text-text focus:border-accent focus:outline-none"
            >
              <option value="">Select team member</option>
              {activeMembers.map((member) => (
                <option key={member.userId._id} value={member.userId._id}>
                  {member.userId.name}
                </option>
              ))}
            </select>
            <Button
              type="submit"
              size="sm"
              variant="secondary"
              disabled={!isPro || !customTag.trim() || !customUserId}
            >
              Add Rule
            </Button>
          </div>
        </form>

        {/* Active Rules List if custom tags were added */}
        {activeMappings.length > 0 && (
          <div className="text-xs text-text-muted">
            <span className="font-semibold text-text">{activeMappings.length}</span> active mapping
            {activeMappings.length === 1 ? '' : 's'} configured ({affectedTasksCount} task
            {affectedTasksCount === 1 ? '' : 's'} will be updated).
          </div>
        )}

        <div className="flex items-center justify-end gap-2 border-t border-border pt-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={distributeMutation.isPending}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!isPro || activeMappings.length === 0 || distributeMutation.isPending}
          >
            {distributeMutation.isPending ? 'Distributing...' : 'Distribute Tasks'}
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
