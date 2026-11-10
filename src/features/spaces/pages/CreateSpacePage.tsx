import React, { useMemo, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, useReducedMotion } from 'framer-motion';
import { FormProvider, useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { ROUTES } from '@/config/routes';
import { SPACE_KIND, THEME_PRESET } from '@/config/constants';
import { SPACE_KIND_CONFIG, useCreateSpace } from '@/features/spaces';
import { ThemePreview } from '../components/ThemePreview';
import { CreateSpaceWizard } from '../components/CreateSpaceWizard';
import { ModeToggle } from '../components/ModeToggle';
import { SpaceKindCard } from '../components/SpaceKindCard';
import type { SpaceKind, ThemePreset } from '../types/space.types';
import { createSpaceSchema, type CreateSpaceFormValues } from '../schemas/space.schema';

const STEPS = ['Choose a kind', 'Make it yours', 'Add details'];
const PRESETS: Array<{ value: ThemePreset; label: string; color: string }> = [
  { value: THEME_PRESET.HEARTH, label: 'Hearth', color: 'bg-orange-400' },
  { value: THEME_PRESET.NEON_GRID, label: 'Neon Grid', color: 'bg-cyan-400' },
  { value: THEME_PRESET.IVORY_INK, label: 'Ivory & Ink', color: 'bg-stone-300' },
  { value: THEME_PRESET.ORBIT, label: 'Orbit', color: 'bg-violet-400' },
];

export const CreateSpacePage: React.FC = () => {
  const navigate = useNavigate();
  const createSpace = useCreateSpace();
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(1);
  const methods = useForm<CreateSpaceFormValues>({
    resolver: zodResolver(createSpaceSchema),
    defaultValues: {
      name: '',
      description: '',
      kind: SPACE_KIND.OUR_HOME,
      theme: SPACE_KIND_CONFIG[SPACE_KIND.OUR_HOME].defaultTheme,
      visibility: 'PRIVATE',
      joinPolicy: 'INVITE_ONLY',
    },
    mode: 'onTouched',
  });
  const { watch, setValue, trigger } = methods;
  const kind = watch('kind');
  const theme = watch('theme');
  const kindConfig = SPACE_KIND_CONFIG[kind];
  const isCustom = kind === SPACE_KIND.CUSTOM;

  const chooseKind = (nextKind: SpaceKind) => {
    setValue('kind', nextKind, { shouldDirty: true });
    if (nextKind !== SPACE_KIND.CUSTOM) {
      setValue('theme', SPACE_KIND_CONFIG[nextKind].defaultTheme, { shouldDirty: true });
    }
  };

  const next = async () => {
    const valid =
      step === 1
        ? await trigger(['kind'])
        : step === 2
          ? await trigger(['theme'])
          : await trigger(['name', 'description', 'visibility', 'joinPolicy']);
    if (valid) setStep((current) => Math.min(current + 1, 3));
  };

  const submit = methods.handleSubmit(async (values) => {
    try {
      const space = await createSpace.mutateAsync(values);
      toast.success('Your new space is ready');
      navigate(ROUTES.space(space._id));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to create space');
    }
  });
  const presetOptions = useMemo(() => PRESETS, []);

  return (
    <FormProvider {...methods}>
      <motion.div
        className="space-y-8"
        initial={reduceMotion ? false : { opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <PageHeader
          title="Create a space"
          description="Choose a starting point, make it yours, and invite your people."
        />
        <nav aria-label="Create space progress" className="flex items-center gap-2">
          {STEPS.map((label, index) => {
            const number = index + 1;
            return (
              <React.Fragment key={label}>
                <button
                  type="button"
                  onClick={() => number < step && setStep(number)}
                  aria-current={number === step ? 'step' : undefined}
                  className={`flex items-center gap-2 text-sm ${
                    number === step ? 'font-semibold text-text' : 'text-text-muted'
                  }`}
                >
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${
                      number <= step ? 'bg-accent text-text-inverse' : 'bg-surface-hover'
                    }`}
                  >
                    {number}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {number < STEPS.length && <span className="h-px flex-1 bg-border" />}
              </React.Fragment>
            );
          })}
        </nav>

        <form
          onSubmit={submit}
          className="rounded-card border border-border bg-surface p-5 shadow-card sm:p-8"
        >
          {step === 1 && (
            <section aria-labelledby="kind-heading">
              <h2 id="kind-heading" className="font-heading text-xl font-semibold text-text">
                What kind of space?
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Start with a setup that fits the way you work.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {(Object.keys(SPACE_KIND_CONFIG) as SpaceKind[]).map((spaceKind) => (
                  <SpaceKindCard
                    key={spaceKind}
                    config={SPACE_KIND_CONFIG[spaceKind]}
                    selected={kind === spaceKind}
                    onSelect={chooseKind}
                  />
                ))}
              </div>
            </section>
          )}

          {step === 2 && (
            <section aria-labelledby="theme-heading">
              <div className="grid gap-8 lg:grid-cols-[1fr_1.1fr]">
                <div>
                  <h2 id="theme-heading" className="font-heading text-xl font-semibold text-text">
                    Make it yours
                  </h2>
                  <p className="mt-1 text-sm text-text-muted">
                    {kindConfig.label} starts with a thoughtful theme. Tune it to your taste.
                  </p>
                  <div className="mt-6 space-y-6">
                    <ModeToggle
                      mode={theme.mode}
                      onChange={(mode) => setValue('theme.mode', mode, { shouldDirty: true })}
                    />
                    {isCustom && (
                      <div>
                        <p className="mb-3 text-sm font-medium text-text">Theme preset</p>
                        <div className="grid grid-cols-2 gap-3">
                          {presetOptions.map((preset) => (
                            <button
                              key={preset.value}
                              type="button"
                              aria-pressed={theme.preset === preset.value}
                              onClick={() =>
                                setValue('theme.preset', preset.value, { shouldDirty: true })
                              }
                              className={`flex items-center gap-2 rounded-input border p-3 text-left text-sm ${
                                theme.preset === preset.value
                                  ? 'ring-accent/30 border-accent ring-2'
                                  : 'border-border'
                              }`}
                            >
                              <span
                                className={`h-4 w-4 rounded-full ${preset.color}`}
                                aria-hidden="true"
                              />
                              {preset.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <ThemePreview theme={theme.preset} mode={theme.mode} />
              </div>
            </section>
          )}

          {step === 3 && (
            <section aria-labelledby="details-heading">
              <h2 id="details-heading" className="font-heading text-xl font-semibold text-text">
                Add the details
              </h2>
              <p className="mb-6 mt-1 text-sm text-text-muted">
                Give your space a name and decide who can join.
              </p>
              <CreateSpaceWizard step={step} />
            </section>
          )}

          <div className="mt-8 flex justify-between border-t border-border pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={() => (step === 1 ? navigate(-1) : setStep(step - 1))}
            >
              Back
            </Button>
            {step < 3 ? (
              <Button type="button" onClick={next}>
                Continue
              </Button>
            ) : (
              <Button type="submit" isLoading={createSpace.isPending}>
                Create space
              </Button>
            )}
          </div>
        </form>
      </motion.div>
    </FormProvider>
  );
};
