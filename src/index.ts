import { useBucket } from './bucket'
import { AnyObject } from './types'

export const storage = {
  local: useBucket<AnyObject>('local', 'local'),
  sync: useBucket<AnyObject>('sync', 'sync'),
  managed: useBucket<AnyObject>('managed', 'managed'),
}

export { useBucket }
