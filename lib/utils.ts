import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string in format YYYY-MM-DD into a local Date object
 * without applying timezone offsets that happen when calling new Date('YYYY-MM-DD')
 */
export function parseYMDToDate(dateStr: string): Date {
  if (!dateStr) return new Date('')
  const parts = dateStr.split('-')
  if (parts.length !== 3) return new Date(dateStr)
  const year = Number(parts[0])
  const month = Number(parts[1]) - 1
  const day = Number(parts[2])
  return new Date(year, month, day)
}
