import chromep from 'chrome-promise'
import { storage as rxStorage } from '@extend-chrome/events-rxjs'
import {
  invalidGetter,
  invalidSetter,
  invalidSetterReturn,
} from './validate'

const AREAS = ['sync', 'local', 'managed']

export const storage = {
  local: setupStorage('local'),
  sync: setupStorage('sync'),
  managed: setupStorage('managed'),
}

function setupStorage(area) {
  if (!AREAS.includes(area)) {
    throw new TypeError(
      `area must be one of ${AREAS.join(', ')}`,
    )
  }

  const storage = chromep.storage[area]

  /* --------- storage operation promise -------- */

  let promise = null

  /* ---------------- storage.get --------------- */
  const coreGet = async (x) => {
    if (promise) {
      await promise
    }

    return storage.get(x || null)
  }
  // TODO: handle async calls to get while set is running
  const get = (getter) => {
    const errorMessage = invalidGetter(getter)

    if (errorMessage) {
      throw new TypeError(errorMessage)
    }

    if (getter === null || getter === undefined) {
      return coreGet()
    } else if (Array.isArray(getter)) {
      return coreGet(getter)
    }

    switch (typeof getter) {
      case 'function':
        return coreGet().then(getter)
      case 'object':
      case 'string':
        return coreGet(getter)
      default:
        throw new TypeError(
          'Unexpected argument type: ' + typeof getter,
        )
    }
  }

  /* ---------------- storage.set --------------- */
  let createNextValue = (x) => x

  const set = (arg) => {
    const errorMessage = invalidSetter(arg)

    if (errorMessage) {
      throw new TypeError(errorMessage)
    }

    return new Promise((resolve, reject) => {
      let setter

      if (typeof arg === 'function') {
        setter = (prev) => {
          const result = arg(prev)
          const errorMessage = invalidSetterReturn(result)

          if (errorMessage) {
            reject(new TypeError(errorMessage))

            return prev
          } else {
            return {
              ...prev,
              ...result,
            }
          }
        }
      } else {
        setter = (prev) => ({
          ...prev,
          ...arg,
        })
      }

      const composeFn = createNextValue
      createNextValue = (prev) => setter(composeFn(prev))

      if (!promise) {
        // Update storage starting with current values
        promise = coreGet().then((prev) => {
          try {
            // Compose new values
            const next = createNextValue(prev)

            // Execute set
            return storage.set(next).then(() => next)
          } catch (error) {
            throw error
          } finally {
            // Clean up after a set operation
            createNextValue = (s) => s
            promise = null
          }
        })
      }

      // All calls to set should call resolve or reject
      promise.then(resolve).catch(reject)
    })
  }

  return {
    set,
    get,

    remove(arg) {
      const query = [].concat(arg)

      query.forEach((x) => {
        if (typeof x !== 'string') {
          throw new TypeError(
            `Unexpected argument type: ${typeof x}`,
          )
        }
      })

      return storage.remove(query).then(coreGet)
    },

    clear() {
      return storage.clear().then(coreGet)
    },

    get change$() {
      return rxStorage[area].change$
    },
  }
}
