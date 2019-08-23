import { storage as rxStorage } from '@bumble/chrome-rxjs'
import chromep from 'chrome-promise'
import { Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { chromepApi } from './chrome-promise'
import {
  invalidGetter,
  invalidSetter,
  invalidSetterReturn,
} from './validate'

type StorageValues = {
  [prop: string]: any
}

type GetterFn = (values: StorageValues) => any

type Getter = string | StorageValues | GetterFn

type SetterFn = (prev: StorageValues) => StorageValues
type AsyncSetterFn = (
  prev: StorageValues,
) => Promise<StorageValues>

type Setter = StorageValues | SetterFn

interface StorageArea {
  /**
   * Get a value or values in the storage area using a key name, a key name array, or a getter function.
   *
   * A getter function receives a StorageValues object and can return anything.
   */
  get: (getter?: Getter) => Promise<any>
  /**
   * Set a value or values in the storage area using an object with keys and default values, or a setter function.
   *
   * A setter function receives a StorageValues object and must return a StorageValues object. A setter function cannot be an async function.
   *
   * Synchronous calls to set will be composed into a single setter function for performance and reliability.
   */
  set: (setter: Setter) => Promise<StorageValues>
  /**
   * Set a value or values in the storage area using an async setter function.
   *
   * An async setter function should return a Promise that contains a StorageValues object.
   *
   * `StorageArea.update` should be used if an async setter function is required. Syncronous calls to set will be more performant than to update.
   *
   * ```javascript
   * storage.local.update(async ({ text }) => {
   *   const result = await asyncApiRequest(text)
   *
   *   return { text: result }
   * })
   * ```
   */
  update: (
    asyncSetterFn: AsyncSetterFn,
  ) => Promise<StorageValues>
  /** Remove a key from the storage area */
  remove: (query: string) => Promise<StorageValues>
  /** Clear the storage area */
  clear: () => Promise<void>
  /** Emits an object with changed storage keys and StorageChange values  */
  readonly changeStream: Observable<{
    [key: string]: chrome.storage.StorageChange
  }>
  /** Emits the current storage values when changeStream emits */
  readonly valueStream: Observable<StorageValues>
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

  // TODO: add tests for update
  const update = async (updater: AsyncSetterFn) => {
    const store = await get()
    const result = await updater(store)
    return set(result)
  }

  return {
    set,
    get,
    update,

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

    get valueStream() {
      let stream: Observable<StorageValues>
      if (area === 'local') {
        stream = rxStorage.local.changeStream
      } else if (area === 'sync') {
        stream = rxStorage.sync.changeStream
      } else {
        stream = rxStorage.managed.changeStream
      }

      return stream.pipe(mergeMap(() => get()))
    },
  }
}
