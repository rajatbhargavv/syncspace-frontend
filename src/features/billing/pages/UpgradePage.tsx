import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button, PlanBadge } from '@/components/ui';
import { PageHeader } from '@/components/layout/PageHeader';
import { BILLING_CONTACT, PLANS, type BillingPeriod } from '@/config/plans';
import { ROUTES } from '@/config/routes';
import { useAuth } from '@/app/providers/useAuth';
import { useCheckout } from '../hooks/useCheckout';

export const UpgradePage: React.FC = () => {
  const { user } = useAuth();
  const [period, setPeriod] = useState<BillingPeriod>('monthly');
  const checkout = useCheckout();
  return (
    <div className="space-y-6">
      <PageHeader
        title="Upgrade to Pro"
        description="Unlock the performance insights your team deserves."
        badge={<PlanBadge plan={user?.plan ?? 'FREE'} />}
      />
      <div className="flex justify-center">
        <div
          className="inline-flex rounded-full border border-border p-1"
          role="group"
          aria-label="Billing period"
        >
          {(['monthly', 'yearly'] as const).map((item) => (
            <button
              key={item}
              type="button"
              aria-pressed={period === item}
              onClick={() => setPeriod(item)}
              className={`rounded-full px-4 py-2 text-sm ${period === item ? 'bg-accent text-text-inverse' : 'text-text-muted'}`}
            >
              {item === 'monthly' ? 'Monthly' : 'Yearly'}
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {PLANS.map((plan) => (
          <section
            key={plan.id}
            className={`rounded-card border p-5 ${plan.id === 'PRO' ? 'border-accent shadow-elevated' : 'border-border'} bg-surface`}
          >
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-bold text-text">{plan.name}</h2>
              <PlanBadge plan={plan.id} />
            </div>
            <p className="mt-2 text-sm text-text-muted">{plan.description}</p>
            <p className="mt-5 text-3xl font-bold text-text">
              ₹{plan.prices[period].toLocaleString('en-IN')}
              <span className="text-sm font-normal text-text-muted">
                /{period === 'monthly' ? 'month' : 'year'}
              </span>
            </p>
            <ul className="mt-5 space-y-3 text-sm text-text-muted">
              {plan.features.map((feature) => (
                <li key={feature}>✓ {feature}</li>
              ))}
            </ul>
            {plan.id === 'PRO' && (
              <Button
                className="mt-6 w-full"
                isLoading={checkout.isPending}
                disabled={user?.plan === 'PRO'}
                onClick={() => checkout.mutate(period)}
              >
                {user?.plan === 'PRO' ? 'Current plan' : 'Upgrade to Pro'}
              </Button>
            )}
          </section>
        ))}
      </div>
      {checkout.data?.status === 'unavailable' && (
        <p role="status" className="text-center text-sm text-text-muted">
          Payments are coming soon.{' '}
          <a className="text-accent underline" href={BILLING_CONTACT}>
            Contact us
          </a>
          .
        </p>
      )}
      <section className="mx-auto max-w-2xl rounded-card border border-border bg-surface p-5">
        <h2 className="font-heading text-xl font-bold text-text">FAQ</h2>
        <details className="mt-4 border-b border-border pb-3">
          <summary className="cursor-pointer font-medium text-text">Can I cancel anytime?</summary>
          <p className="mt-2 text-sm text-text-muted">
            Billing is not enabled yet. When payments launch, cancellation terms will be shown here.
          </p>
        </details>
        <Link to={ROUTES.home} className="mt-5 inline-block text-sm text-accent hover:underline">
          Back to overview
        </Link>
      </section>
    </div>
  );
};
