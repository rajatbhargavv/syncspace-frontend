import type { BillingPeriod } from '@/config/plans';

export type CheckoutResult =
  | { status: 'success' }
  | { status: 'redirect'; url: string }
  | { status: 'unavailable'; reason: string };

export type { BillingPeriod };
