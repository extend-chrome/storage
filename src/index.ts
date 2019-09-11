import { getBasket } from './get-basket'
import { AnyObject } from './types'

export const storage = {
  local: getBasket<AnyObject>('local', 'local'),
  sync: getBasket<AnyObject>('sync', 'sync'),
  managed: getBasket<AnyObject>('managed', 'managed'),
}

export { getBasket }
