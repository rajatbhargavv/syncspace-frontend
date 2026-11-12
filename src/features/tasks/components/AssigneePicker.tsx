import React, { useContext } from 'react';
import { toast } from 'sonner';
import { Button, Select } from '@/components/ui';
import { AuthContext } from '@/app/providers/AuthContext';
import { useSpaceMembers } from '@/features/members';
import { useMemberLookup } from '../hooks/useMemberLookup';
import {
  useAddAssignee,
  useRemoveAssignee,
  useUpdateMyAssigneeStatus,
} from '../hooks/useAssigneeMutations';
import type { AssigneeStatus, Task } from '../types/task.types';

export interface AssigneePickerProps {
  task: Task;
  readOnly?: boolean;
}

const ownStatusOptions = [
  { value: 'TODO', label: 'Not started' },
  { value: 'IN_PROGRESS', label: 'In progress' },
  { value: 'DONE', label: 'Done' },
];

export const AssigneePicker: React.FC<AssigneePickerProps> = ({ task, readOnly = false }) => {
  const auth = useContext(AuthContext);
  const user = auth?.user ?? null;
  const { members, getName } = useMemberLookup(task.spaceId);
  const spaceMembers = useSpaceMembers(task.spaceId);
  const add = useAddAssignee();
  const remove = useRemoveAssignee();
  const updateOwn = useUpdateMyAssigneeStatus();
  const activeMemberIds = new Set(
    (spaceMembers.data ?? [])
      .filter((member) => member.status === 'ACTIVE')
      .map((member) => member.userId._id),
  );
  const availableMembers = members.filter(
    (member) =>
      activeMemberIds.has(member._id) && !task.assignees.some((a) => a.userId === member._id),
  );
  const ownAssignment = task.assignees.find((assignment) => assignment.userId === user?._id);

  const showError = (error: Error) => toast.error(error.message || 'Unable to update assignees');

  return (
    <section aria-label="Assignees" className="space-y-3">
      <div>
        <h3 className="text-lg font-semibold text-text">Assignees</h3>
        <p className="text-xs text-text-muted">
          Task status and each person&apos;s progress are separate.
        </p>
      </div>
      <div className="space-y-2">
        {task.assignees.length === 0 && (
          <p className="text-sm text-text-muted">No assignees yet.</p>
        )}
        {task.assignees.map((assignment) => (
          <div
            key={assignment.userId}
            className="flex items-center justify-between gap-2 rounded-input border border-border p-2"
          >
            <span className="text-sm text-text">
              {getName(assignment.userId)}
              <span className="ml-2 text-xs text-text-muted">
                Their progress: {assignment.status}
              </span>
            </span>
            {!readOnly && (
              <Button
                size="sm"
                variant="ghost"
                aria-label={`Remove ${getName(assignment.userId)}`}
                onClick={() =>
                  remove.mutate(
                    { taskId: task._id, userId: assignment.userId, spaceId: task.spaceId },
                    { onError: showError },
                  )
                }
              >
                Remove
              </Button>
            )}
          </div>
        ))}
      </div>
      {!readOnly && availableMembers.length > 0 && (
        <Select
          label="Add assignee"
          options={[
            { value: '', label: 'Select a member' },
            ...availableMembers.map((member) => ({ value: member._id, label: member.name })),
          ]}
          value=""
          onChange={(event) => {
            if (!event.target.value) return;
            add.mutate(
              { taskId: task._id, userId: event.target.value, spaceId: task.spaceId },
              { onError: showError },
            );
          }}
        />
      )}
      {!readOnly && ownAssignment && (
        <Select
          label="Your progress"
          helperText="This changes your personal assignee status, not the task status."
          options={ownStatusOptions}
          value={ownAssignment.status}
          disabled={updateOwn.isPending}
          onChange={(event) =>
            updateOwn.mutate(
              {
                taskId: task._id,
                status: event.target.value as AssigneeStatus,
                spaceId: task.spaceId,
              },
              { onError: showError },
            )
          }
        />
      )}
    </section>
  );
};
