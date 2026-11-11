import { useSearchParams } from 'react-router-dom';
import { z } from 'zod';
import type { AnalyticsRange } from '../types/analytics.types';

const rangeSchema = z.enum(['7d', '30d', '90d']);

export function useAnalyticsRange(): {
  range: AnalyticsRange;
  setRange: (range: AnalyticsRange) => void;
} {
  const [params, setParams] = useSearchParams();
  const parsed = rangeSchema.safeParse(params.get('range'));
  const range = parsed.success ? parsed.data : '30d';

  return {
    range,
    setRange: (nextRange) => {
      setParams(
        (previous) => {
          const next = new URLSearchParams(previous);
          next.set('range', nextRange);
          return next;
        },
        { replace: true },
      );
    },
  };
}
