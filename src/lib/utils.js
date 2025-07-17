import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

