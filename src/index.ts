import { getBasket } from './get-basket'

export const storage = {
  local: getBasket('local', 'local'),
  sync: getBasket('sync', 'sync'),
  managed: getBasket('managed', 'managed'),
}

export { getBasket }
