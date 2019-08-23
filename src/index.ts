import chromep from 'chrome-promise'
import { storage as rxStorage } from '@bumble/chrome-rxjs'
import {
  invalidGetter,
  invalidSetter,
  invalidSetterReturn,
} from './validate'
import { Observable } from 'rxjs'
import { chromepApi } from './chrome-promise'

type StorageValues = {
  [prop: string]: any
}

type GetterFn = (values: StorageValues) => any

type Getter = string | StorageValues | GetterFn

type SetterFn = (prev: StorageValues) => StorageValues

type Setter = StorageValues | SetterFn

interface StorageArea {
  get: (getter: Getter) => Promise<any>
  set: (setter: Setter) => Promise<any>
  remove: (query: string) => Promise<any>
  clear: () => Promise<any>
  changeStream: Observable<{
    [key: string]: chrome.storage.StorageChange
  }>
}

export const storage = {
  local: setupStorage('local'),
  sync: setupStorage('sync'),
  managed: setupStorage('managed'),
}

function setupStorage(area: string): StorageArea {
  let storage: chromepApi.storage.StorageArea
  switch (area) {
    case 'local':
      storage = chromep.storage.local
      break
    case 'sync':
      storage = chromep.storage.sync
      break
    case 'managed':
      storage = chromep.storage.managed
      break

    default:
      throw new TypeError(`area must be local, sync, managed`)
  }

  /* --------- storage operation promise -------- */

  let promise: Promise<any> | null = null

  /* ---------------- storage.get --------------- */
  const coreGet = async (x?: any): Promise<any> => {
    if (promise) {
      await promise
    }

    return storage.get(x || null)
  }

  const get = (getter?: Getter): Promise<any> => {
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
        // @ts-ignore
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
  let createNextValue = (x: any) => x

  // TODO: handle async setter functions
  const set = (arg: Setter): Promise<StorageValues> => {
    const errorMessage = invalidSetter(arg)

    if (errorMessage) {
      throw new TypeError(errorMessage)
    }

    return new Promise((resolve, reject) => {
      let setter: SetterFn

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

    remove(arg: string) {
      const query = ([] as string[]).concat(arg)

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

    get changeStream() {
      if (area === 'local') {
        return rxStorage.local.changeStream
      } else if (area === 'sync') {
        return rxStorage.sync.changeStream
      } else {
        return rxStorage.managed.changeStream
      }
    },
  }
}
