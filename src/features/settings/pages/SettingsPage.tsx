import React, { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { Badge, Button, Dialog, Input, PlanBadge, Tabs } from '@/components/ui';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/config/routes';
import { PageHeader } from '@/components/layout/PageHeader';
import { SettingsNotificationSection } from '@/features/push';
import { useAuth } from '@/app/providers/useAuth';
import { useTheme } from '@/app/providers/useTheme';
import { useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '@/lib/queryKeys';
import { ApiError } from '@/types';
import { disconnectSocket } from '@/lib/socket';
import { ThemeScope } from '@/features/spaces';
import { checkPasswordCriteria } from '@/features/auth/schemas/auth.schema';
import { updatePlan, updateUser, deactivateUser } from '../api/settings.api';
import {
  passwordChangeSchema,
  profileSchema,
  type PasswordForm,
  type ProfileForm,
} from '../schemas/settings.schema';

type Tab = 'profile' | 'security' | 'appearance' | 'account';

export const SettingsPage: React.FC = () => {
  const [tab, setTab] = useState<Tab>('profile');
  useEffect(() => {
    document.title = 'Settings | SyncSpace';
  }, []);
  const tabs = [
    { id: 'profile', label: 'Profile' },
    { id: 'security', label: 'Security' },
    { id: 'appearance', label: 'Appearance' },
    { id: 'account', label: 'Account' },
  ];
  return (
    <div className="space-y-6">
      <PageHeader
        title="Settings"
        description="Manage your account, security, appearance, and notifications."
      />
      <Tabs
        tabs={tabs}
        activeTab={tab}
        onChange={(value) => setTab(value as Tab)}
        variant="pills"
        className="flex-wrap"
      />
      {tab === 'profile' && <ProfileTab />}
      {tab === 'security' && <SecurityTab />}
      {tab === 'appearance' && <AppearanceTab />}
      {tab === 'account' && <AccountTab />}
    </div>
  );
};

function useUnsavedWarning(isDirty: boolean) {
  useEffect(() => {
    if (!isDirty) return;
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [isDirty]);
}

function ProfileTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name ?? '', email: user?.email ?? '' },
  });
  useUnsavedWarning(form.formState.isDirty && !form.formState.isSubmitSuccessful);
  const submit = form.handleSubmit(async (values) => {
    if (!user) return;
    const data: Partial<ProfileForm> = {};
    if (values.name !== user.name) data.name = values.name;
    if (values.email !== user.email) data.email = values.email;
    try {
      const updated = await updateUser(data);
      queryClient.setQueryData(queryKeys.auth.me(), updated);
      form.reset({ name: updated.name, email: updated.email });
      toast.success('Profile updated');
    } catch (error) {
      if (error instanceof ApiError && error.status === 409)
        form.setError('email', { message: 'Email already in use' });
      else toast.error(error instanceof Error ? error.message : 'Unable to update profile');
    }
  });
  return (
    <section className="max-w-2xl space-y-5 rounded-card border border-border bg-surface p-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-text">Profile</h2>
        <p className="text-sm text-text-muted">Update your public identity and email.</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label="Name"
          error={form.formState.errors.name?.message}
          {...form.register('name')}
        />
        <Input
          label="Email"
          type="email"
          error={form.formState.errors.email?.message}
          {...form.register('email')}
        />
        <div className="flex items-center justify-between">
          <Badge variant="outline">{user?.plan ?? 'FREE'}</Badge>
          <Button type="submit" isLoading={form.formState.isSubmitting}>
            Save changes
          </Button>
        </div>
      </form>
      <SettingsNotificationSection />
    </section>
  );
}

function SecurityTab() {
  const form = useForm<PasswordForm>({
    resolver: zodResolver(passwordChangeSchema),
    mode: 'onChange',
    defaultValues: { password: '', confirmPassword: '' },
  });
  useUnsavedWarning(form.formState.isDirty && !form.formState.isSubmitSuccessful);
  const submit = form.handleSubmit(async (values) => {
    try {
      await updateUser({ password: values.password });
      toast.success('Password changed');
      form.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to change password');
    }
  });
  const password = form.watch('password');
  const criteria = checkPasswordCriteria(password);
  const rules: Array<[string, boolean]> = [
    ['7+ characters', criteria.minLength],
    ['Uppercase', criteria.hasUpper],
    ['Lowercase', criteria.hasLower],
    ['Number', criteria.hasNumber],
    ['Special character', criteria.hasSpecial],
  ];
  return (
    <section className="max-w-2xl space-y-5 rounded-card border border-border bg-surface p-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-text">Security</h2>
        <p className="text-sm text-text-muted">Change your password.</p>
      </div>
      <form className="space-y-4" onSubmit={submit}>
        <Input
          label="New password"
          type="password"
          error={form.formState.errors.password?.message}
          {...form.register('password')}
        />
        <ul className="grid gap-1 text-xs text-text-muted sm:grid-cols-2">
          {rules.map(([label, valid]) => (
            <li key={label}>
              {valid ? '✓' : '○'} {label}
            </li>
          ))}
        </ul>
        <Input
          label="Confirm password"
          type="password"
          error={form.formState.errors.confirmPassword?.message}
          {...form.register('confirmPassword')}
        />
        <Button type="submit" isLoading={form.formState.isSubmitting}>
          Change password
        </Button>
      </form>
    </section>
  );
}

function AppearanceTab() {
  const theme = useTheme();
  return (
    <section className="max-w-2xl space-y-5 rounded-card border border-border bg-surface p-5">
      <div>
        <h2 className="font-heading text-xl font-bold text-text">Appearance</h2>
        <p className="text-sm text-text-muted">
          Spaces use their own theme when you are inside them.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm text-text">
          Preset
          <select
            value={theme.preset}
            onChange={(event) => theme.setPreset(event.target.value as typeof theme.preset)}
            className="mt-2 w-full rounded-input border border-border bg-surface px-3 py-2"
          >
            {['ORBIT', 'HEARTH', 'NEON_GRID', 'IVORY_INK'].map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-text">
          Mode
          <select
            value={theme.mode}
            onChange={(event) => theme.setMode(event.target.value as typeof theme.mode)}
            className="mt-2 w-full rounded-input border border-border bg-surface px-3 py-2"
          >
            <option value="system">System</option>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </label>
      </div>
      <ThemeScope
        theme={theme.preset}
        mode={theme.effectiveMode}
        className="rounded-card border border-border p-5"
      >
        <p className="font-semibold text-text">Live preview</p>
        <p className="mt-2 text-sm text-text-muted">Your default theme is saved locally.</p>
        <div className="mt-4 rounded-card bg-surface-hover p-4 text-sm text-text">
          Spaces retain their own theme.
        </div>
      </ThemeScope>
      <div className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-sm text-text-muted">Upgrade to unlock more features</span>
        <Button variant="outline" disabled>
          Coming in Phase 5
        </Button>
      </div>
    </section>
  );
}

function AccountTab() {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const deactivate = async () => {
    if (!user || email !== user.email) return;
    setPending(true);
    try {
      await deactivateUser();
      disconnectSocket();
      queryClient.clear();
      await logout();
      window.location.href = '/login';
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Unable to deactivate account');
      setPending(false);
    }
  };
  return (
    <div className="max-w-2xl space-y-5">
      <section className="space-y-4 rounded-card border border-border bg-surface p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="font-heading text-xl font-bold text-text">Plan</h2>
            <p className="text-sm text-text-muted">
              Your current SyncSpace plan and included features.
            </p>
          </div>
          <PlanBadge plan={user?.plan ?? 'FREE'} size="md" />
        </div>
        <p className="text-sm text-text-muted">
          Free includes unlimited spaces, tasks, comments, notifications, and a public profile. Pro
          adds Activity analytics, performance reports, CSV export, and priority support.
        </p>
        {user?.plan === 'FREE' && (
          <Link to={ROUTES.upgrade}>
            <Button variant="outline">Explore Pro</Button>
          </Link>
        )}
      </section>
      <section className="border-error/30 space-y-5 rounded-card border bg-surface p-5">
        <div>
          <h2 className="font-heading text-xl font-bold text-text">Account</h2>
          <p className="text-sm text-text-muted">
            Deactivation is permanent. Personal spaces are deleted; shared spaces are transferred to
            another active member or deleted if empty. You will be logged out and this cannot be
            undone from the app.
          </p>
        </div>
        <Button variant="danger" onClick={() => setDialogOpen(true)}>
          Deactivate account
        </Button>
        {import.meta.env.DEV && <DevPlanCard />}
        <Dialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Deactivate account"
          description="Type your email to confirm this permanent action."
        >
          <div className="space-y-4">
            <Input
              label="Your email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
            <Button
              variant="danger"
              disabled={email !== user?.email}
              isLoading={pending}
              onClick={() => void deactivate()}
            >
              Confirm deactivation
            </Button>
          </div>
        </Dialog>
      </section>
    </div>
  );
}

function DevPlanCard() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  return (
    <div className="border-t border-border pt-5">
      <p className="text-sm font-semibold text-text">Developer</p>
      <div className="mt-2 flex gap-2">
        {(['FREE', 'PRO'] as const).map((plan) => (
          <Button
            key={plan}
            size="sm"
            variant={user?.plan === plan ? 'primary' : 'outline'}
            onClick={() =>
              void updatePlan(plan)
                .then((updated) => {
                  queryClient.setQueryData(queryKeys.auth.me(), updated);
                  toast.success(`Plan set to ${plan}`);
                })
                .catch((error: unknown) =>
                  toast.error(error instanceof Error ? error.message : 'Unable to update plan'),
                )
            }
          >
            {plan}
          </Button>
        ))}
      </div>
    </div>
  );
}
