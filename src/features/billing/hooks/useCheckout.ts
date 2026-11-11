import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { queryKeys } from '@/lib/queryKeys';
import { startCheckout } from '../api/billing.api';
import type { BillingPeriod } from '../types/billing.types';

function safeFrom(value: string | null): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.includes('://'))
    return '/';
  return value;
}

export function useCheckout() {
  const client = useQueryClient();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  return useMutation({
    mutationFn: (period: BillingPeriod) => startCheckout('PRO', period),
    onSuccess: (result) => {
      if (result.status === 'success') {
        void client.invalidateQueries({ queryKey: queryKeys.auth.me() });
        void client.invalidateQueries({ queryKey: queryKeys.analytics.all });
        toast.success("You're on Pro");
        navigate(safeFrom(params.get('from')));
      } else if (result.status === 'redirect') {
        window.location.assign(result.url);
      } else {
        toast.info('Payments are coming soon');
      }
    },
  });
}
