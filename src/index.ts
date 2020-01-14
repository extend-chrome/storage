import { useBucket } from './bucket'
import { StorageArea } from './types'

export const storage = {
  local: useBucket<Record<string, any>>('local', 'local'),
  sync: useBucket<Record<string, any>>('sync', 'sync'),
  managed: useBucket<Record<string, any>>('managed', 'managed'),
}

export { useBucket, StorageArea }

// Rename export to avoid confusion with React Hooks
export const getBucket = useBucket
