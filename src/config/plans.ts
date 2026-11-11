export type BillingPeriod = 'monthly' | 'yearly';

export interface PlanDefinition {
  id: 'FREE' | 'PRO';
  name: string;
  description: string;
  prices: Record<BillingPeriod, number>;
  features: string[];
}

export const PLANS: PlanDefinition[] = [
  {
    id: 'FREE',
    name: 'Free',
    description: 'Everything you need to organize work with your team.',
    prices: { monthly: 0, yearly: 0 },
    features: ['Unlimited spaces and tasks', 'Comments', 'Notifications', 'Public profile'],
  },
  {
    id: 'PRO',
    name: 'Pro',
    description: 'Performance insights for teams that want to improve.',
    prices: { monthly: 499, yearly: 4990 },
    features: [
      'Everything in Free',
      'Activity analytics',
      'Performance reports',
      'CSV export',
      'Priority support placeholder',
    ],
  },
];

export const BILLING_CONTACT = 'mailto:support@syncspace.local';
