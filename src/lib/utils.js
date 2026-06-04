import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * shadcn 표준 cn 유틸. clsx + tailwind-merge로 클래스 병합.
 * @param  {...any} inputs
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
