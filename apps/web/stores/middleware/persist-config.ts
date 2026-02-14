/**
 * Persistence middleware configuration for Zustand stores
 * Uses localStorage to persist user preferences
 */

import type { PersistOptions } from "zustand/middleware"

/**
 * Creates a persist middleware with common configuration
 */
export function createPersistConfig<T>(
  name: string,
  options?: Partial<PersistOptions<T>>
): PersistOptions<T> {
  return {
    name: `mindpocket-${name}`,
    version: 1,
    ...options,
  }
}
