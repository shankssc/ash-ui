// ash-ui/src/utils/cn.ts
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Utility function to merge Tailwind CSS classes with proper conflict resolution
 * 
 * Combines clsx (for conditional classes) with tailwind-merge (for deduplication)
 * to ensure Tailwind classes are merged correctly without conflicts.
 * 
 * @param inputs - Class values (strings, objects, arrays, booleans, etc.)
 * @returns Merged className string with Tailwind conflicts resolved
 * 
 * @example
 * ```tsx
 * // Basic usage
 * cn('px-4 py-2', 'bg-blue-500', { 'text-white': isActive })
 * 
 * // With conditional classes
 * cn(
 *   'base-class',
 *   variant === 'primary' && 'bg-primary-500',
 *   variant === 'secondary' && 'bg-secondary-500',
 *   className
 * )
 * 
 * // Tailwind conflict resolution
 * cn('p-4', 'p-2') // Returns 'p-2' (last one wins)
 * cn('text-red-500', 'text-blue-500') // Returns 'text-blue-500'
 * ```
 * 
 * @see {@link https://github.com/lukeed/clsx} - clsx documentation
 * @see {@link https://github.com/dcastil/tailwind-merge} - tailwind-merge documentation
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}