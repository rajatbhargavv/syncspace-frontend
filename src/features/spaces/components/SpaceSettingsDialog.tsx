import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Dialog, Select } from '@/components/ui';
import { SPACE_PERMISSION } from '@/config/constants';
import { useUpdateSpace } from '../hooks/useUpdateSpace';
import { updateSpaceSchema, type CreateSpaceFormValues } from '../schemas/space.schema';
import type { Space } from '../types/space.types';
import { SpaceForm } from './SpaceForm';

export interface SpaceSettingsDialogProps {
  space: Space;
  isOpen: boolean;
  onClose: () => void;
}

export const SpaceSettingsDialog: React.FC<SpaceSettingsDialogProps> = ({
  space,
  isOpen,
  onClose,
}) => {
  const update = useUpdateSpace();
  const [assigneePermission, setAssigneePermission] = React.useState(
    space.assigneePermission ?? SPACE_PERMISSION.OWNER_AND_CREATOR,
  );
  const [invitePermission, setInvitePermission] = React.useState(
    space.invitePermission ?? SPACE_PERMISSION.OWNER_ONLY,
  );
  const permissionsDirty =
    assigneePermission !== (space.assigneePermission ?? SPACE_PERMISSION.OWNER_AND_CREATOR) ||
    invitePermission !== (space.invitePermission ?? SPACE_PERMISSION.OWNER_ONLY);
  const form = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(updateSpaceSchema),
    defaultValues: {
      name: space.name,
      description: space.description,
      kind: space.kind,
      theme: space.theme,
      visibility: space.visibility,
      joinPolicy: space.joinPolicy,
    },
  });

  useEffect(() => {
    form.reset({
      name: space.name,
      description: space.description,
      kind: space.kind,
      theme: space.theme,
      visibility: space.visibility,
      joinPolicy: space.joinPolicy,
    });
    setAssigneePermission(space.assigneePermission ?? SPACE_PERMISSION.OWNER_AND_CREATOR);
    setInvitePermission(space.invitePermission ?? SPACE_PERMISSION.OWNER_ONLY);
  }, [form, space]);

  const onSubmit = form.handleSubmit(async (values) => {
    const data = {
      name: values.name,
      description: values.description,
      visibility: values.visibility,
      joinPolicy: values.joinPolicy,
      theme: values.theme,
      assigneePermission,
      invitePermission,
    };

    try {
      await update.mutateAsync({ id: space._id, data });
      toast.success('Space settings saved');
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to save space settings');
    }
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Space settings"
      description="Keep your space feeling like yours."
    >
      <form onSubmit={onSubmit} className="space-y-6">
        <SpaceForm
          register={form.register}
          errors={form.formState.errors}
          watch={form.watch}
          setValue={form.setValue}
        />
        <section className="space-y-4 border-t border-border pt-5">
          <div>
            <h3 className="font-semibold text-text">Permissions</h3>
            <p className="text-xs text-text-muted">
              Choose who can manage assignments and create invite links.
            </p>
          </div>
          <Select
            label="Who can change assignees?"
            options={[
              {
                label: 'Owner and task creator',
                value: SPACE_PERMISSION.OWNER_AND_CREATOR,
              },
              { label: 'All active members', value: SPACE_PERMISSION.ALL_MEMBERS },
            ]}
            value={assigneePermission}
            onChange={(event) =>
              setAssigneePermission(event.target.value as typeof assigneePermission)
            }
          />
          <Select
            label="Who can invite members?"
            options={[
              { label: 'Only me (space owner)', value: SPACE_PERMISSION.OWNER_ONLY },
              { label: 'All active members', value: SPACE_PERMISSION.ALL_MEMBERS },
            ]}
            value={invitePermission}
            onChange={(event) => setInvitePermission(event.target.value as typeof invitePermission)}
          />
        </section>
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            isLoading={update.isPending}
            disabled={!form.formState.isDirty && !permissionsDirty}
          >
            Save changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
