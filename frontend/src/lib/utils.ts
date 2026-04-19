import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const STATUS_CONFIG = {
  applied:   { label: 'Applied',   color: 'bg-blue-100 text-blue-800',   dot: 'bg-blue-500' },
  oa:        { label: 'OA',        color: 'bg-yellow-100 text-yellow-800', dot: 'bg-yellow-500' },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-800', dot: 'bg-purple-500' },
  offer:     { label: 'Offer',     color: 'bg-green-100 text-green-800',  dot: 'bg-green-500' },
  rejected:  { label: 'Rejected',  color: 'bg-red-100 text-red-800',     dot: 'bg-red-500' },
  withdrawn: { label: 'Withdrawn', color: 'bg-gray-100 text-gray-800',   dot: 'bg-gray-500' },
} as const;

export const PRIORITY_CONFIG = {
  low:    { label: 'Low',    color: 'text-gray-500' },
  medium: { label: 'Medium', color: 'text-yellow-500' },
  high:   { label: 'High',   color: 'text-red-500' },
} as const;

export type ApplicationStatus = keyof typeof STATUS_CONFIG;
export type Priority = keyof typeof PRIORITY_CONFIG;
