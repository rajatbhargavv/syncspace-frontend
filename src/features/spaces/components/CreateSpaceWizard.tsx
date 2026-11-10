import React from 'react';
import { useFormContext } from 'react-hook-form';
import type { CreateSpaceFormValues } from '../schemas/space.schema';
import { SpaceForm } from './SpaceForm';

export interface CreateSpaceWizardProps {
  step: number;
}

export const CreateSpaceWizard: React.FC<CreateSpaceWizardProps> = ({ step }) => {
  const {
    register,
    formState: { errors },
    watch,
    setValue,
  } = useFormContext<CreateSpaceFormValues>();

  if (step === 3) {
    return <SpaceForm register={register} errors={errors} watch={watch} setValue={setValue} />;
  }

  return null;
};
