import { getBucket } from './bucket'

/**
 * Buckets for each storage area.
 */
export const storage = {
  local: getBucket<Record<string, any>>('local', 'local'),
  sync: getBucket<Record<string, any>>('sync', 'sync'),
  managed: getBucket<Record<string, any>>('managed', 'managed'),
}

// Workaround for @rollup/plugin-typescript
export * from './types'
export { getBucket }

/**
 * Deprecated. Use `getBucket`.
 */
export const useBucket = <T extends object>(
  areaName: 'local' | 'sync' | 'managed',
  bucketName: string,
) => getBucket<T>(bucketName, areaName)
