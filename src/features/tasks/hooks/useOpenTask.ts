import { useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useOpenTask() {
  const [searchParams, setSearchParams] = useSearchParams();
  const taskId = searchParams.get('task');

  const open = useCallback(
    (id: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('task', id);
          return next;
        },
        { replace: false },
      );
    },
    [setSearchParams],
  );

  const close = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev);
        next.delete('task');
        return next;
      },
      { replace: true },
    );
  }, [setSearchParams]);

  return { taskId, open, close };
}
