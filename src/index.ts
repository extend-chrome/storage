import { Bucket, getBucket } from './bucket'

type Storage = {
  local: Bucket<Record<string, any>>,
  sync: Bucket<Record<string, any>>,
  managed: Bucket<Record<string, any>>,
}

class StorageImpl implements Storage {
  get local(): Bucket<Record<string, any>> { return getBucket<Record<string, any>>('local', 'local') }
  get sync(): Bucket<Record<string, any>> { return getBucket<Record<string, any>>('sync', 'sync') }
  get managed(): Bucket<Record<string, any>> { return getBucket<Record<string, any>>('managed', 'managed') }
}

/**
 * Buckets for each storage area.
 */
export const storage: Storage = new StorageImpl()

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
