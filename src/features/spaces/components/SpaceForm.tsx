import React, { useEffect } from 'react';
import type { FieldErrors, UseFormRegister, UseFormSetValue, UseFormWatch } from 'react-hook-form';
import { Input, Select, Textarea } from '@/components/ui';
import { JOIN_POLICY, VISIBILITY } from '@/config/constants';
import type { CreateSpaceFormValues } from '../schemas/space.schema';
import { ModeToggle } from './ModeToggle';

export interface SpaceFormProps {
  register: UseFormRegister<CreateSpaceFormValues>;
  errors: FieldErrors<CreateSpaceFormValues>;
  watch: UseFormWatch<CreateSpaceFormValues>;
  setValue: UseFormSetValue<CreateSpaceFormValues>;
  includeMode?: boolean;
}

export const SpaceForm: React.FC<SpaceFormProps> = ({
  register,
  errors,
  watch,
  setValue,
  includeMode = true,
}) => {
  const visibility = watch('visibility');
  const mode = watch('theme.mode');
  const isPrivate = visibility === VISIBILITY.PRIVATE;

  useEffect(() => {
    if (isPrivate && watch('joinPolicy') !== JOIN_POLICY.INVITE_ONLY) {
      setValue('joinPolicy', JOIN_POLICY.INVITE_ONLY, { shouldDirty: true });
    }
  }, [isPrivate, setValue, watch]);

  return (
    <div className="space-y-5">
      <Input
        label="Space name"
        placeholder="e.g. Weekend projects"
        {...register('name')}
        error={errors.name?.message}
      />
      <Textarea
        label="Description"
        placeholder="What will you use this space for?"
        rows={4}
        maxChars={500}
        charCount={watch('description').length}
        {...register('description')}
        error={errors.description?.message}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <Select
          label="Visibility"
          helperText={
            visibility === VISIBILITY.PUBLIC
              ? 'Anyone can discover and view this space.'
              : visibility === VISIBILITY.UNLISTED
                ? 'Only people with the link can find it.'
                : 'Only invited members can find it.'
          }
          options={[
            { label: 'Private', value: VISIBILITY.PRIVATE },
            { label: 'Unlisted', value: VISIBILITY.UNLISTED },
            { label: 'Public', value: VISIBILITY.PUBLIC },
          ]}
          {...register('visibility')}
        />
        <Select
          label="Join policy"
          helperText={
            isPrivate
              ? 'Private spaces only allow invitations.'
              : 'Choose how new people can become members.'
          }
          options={[
            { label: 'Invite only', value: JOIN_POLICY.INVITE_ONLY },
            { label: 'Request to join', value: JOIN_POLICY.REQUEST, disabled: isPrivate },
            { label: 'Open to everyone', value: JOIN_POLICY.OPEN, disabled: isPrivate },
          ]}
          {...register('joinPolicy')}
        />
      </div>
      {includeMode && (
        <ModeToggle
          mode={mode}
          onChange={(nextMode) => setValue('theme.mode', nextMode, { shouldDirty: true })}
        />
      )}
    </div>
  );
};
