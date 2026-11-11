import { API_ENDPOINTS } from '@/config/constants';
import { http } from '@/lib/http/client';
import type { UserPlan } from '@/features/auth/types/auth.types';
import type { BillingPeriod, CheckoutResult } from '../types/billing.types';

export async function startCheckout(
  plan: UserPlan,
  _period: BillingPeriod,
): Promise<CheckoutResult> {
  if (!import.meta.env.DEV) {
    return { status: 'unavailable', reason: 'Payments are not enabled yet' };
  }
  await http.patch<{ user: unknown }>(API_ENDPOINTS.USERS.UPDATE_PLAN, { plan });
  return { status: 'success' };
}

/*
 * TODO(backend): replace this development adapter with a real billing integration.
 * The server needs a create-order endpoint, Razorpay/Stripe checkout handling,
 * a signed webhook that updates user.plan, and subscription status/cancellation APIs.
 */
