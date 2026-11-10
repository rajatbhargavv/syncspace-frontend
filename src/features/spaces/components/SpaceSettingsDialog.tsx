import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button, Dialog } from '@/components/ui';
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
  }, [form, space]);

  const onSubmit = form.handleSubmit(async (values) => {
    const data = {
      ...(values.name !== space.name ? { name: values.name } : {}),
      ...(values.description !== space.description ? { description: values.description } : {}),
      ...(values.visibility !== space.visibility ? { visibility: values.visibility } : {}),
      ...(values.joinPolicy !== space.joinPolicy ? { joinPolicy: values.joinPolicy } : {}),
      ...(values.theme.mode !== space.theme.mode ? { theme: values.theme } : {}),
    };

    if (Object.keys(data).length === 0) {
      onClose();
      return;
    }

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
        <div className="flex justify-end gap-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" isLoading={update.isPending} disabled={!form.formState.isDirty}>
            Save changes
          </Button>
        </div>
      </form>
    </Dialog>
  );
};
