import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
<<<<<<< HEAD
}
=======
}
>>>>>>> 7a42eac4da9d7d72067212ae06555f7d94377449
