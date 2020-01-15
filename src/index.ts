import { getBucket } from './bucket'
import { Bucket } from './types'

/**
 * Buckets for each storage area.
 */
export const storage = {
  local: getBucket<Record<string, any>>('local', 'local'),
  sync: getBucket<Record<string, any>>('sync', 'sync'),
  managed: getBucket<Record<string, any>>('managed', 'managed'),
}

export { getBucket, Bucket }

/**
 * Deprecated. Use `getBucket`.
 */
export const useBucket = (
  areaName: 'local' | 'sync' | 'managed',
  bucketName: string,
) => {
  console.warn(
    '@bumble/storage: useBucket is deprecated. Use getBucket instead.',
  )

  return getBucket(bucketName, areaName)
}
