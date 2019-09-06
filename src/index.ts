import { storage as rxStorage } from '@bumble/chrome-rxjs'
import chromep from 'chrome-promise'
import { chromepApi } from 'chrome-promise/chrome-promise'
import { Observable } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import {
  invalidGetter,
  invalidSetter,
  invalidSetterReturn,
} from './validate'

/* -------------------------------------------- */
/*                     TYPES                    */
/* -------------------------------------------- */

interface StorageValues {
  [key: string]: any
}

interface GetterFn<T> {
  (values: T): any
}

type NativeGetter<T> = string | string[] | T
type Getter<T> = NativeGetter<T> | GetterFn<T>

interface SetterFn<T> {
  (prev: T): T
}
interface AsyncSetterFn<T> {
  (prev: T): Promise<T>
}

type Setter<T> = T | SetterFn<T>

type Changes<T> = {
  [K in keyof T]?: {
    oldValue: T[K]
    newValue: T[K]
  }
}

type Partial<T> = {
  [K in keyof T]?: T[K]
}

interface StorageArea<T extends StorageValues> {
  /**
   * Get a value or values in the storage area using a key name, a key name array, or a getter function.
   *
   * A getter function receives a StorageValues object and can return anything.
   */
  get: (getter?: Getter<T>) => Promise<T>
  /**
   * Set a value or values in the storage area using an object with keys and default values, or a setter function.
   *
   * A setter function receives a StorageValues object and must return a StorageValues object. A setter function cannot be an async function.
   *
   * Synchronous calls to set will be composed into a single setter function for performance and reliability.
   */
  set: (setter: Setter<T>) => Promise<T>
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
  update: (asyncSetterFn: AsyncSetterFn<T>) => Promise<T>
  /** Remove a key from the storage area */
  remove: (query: string) => Promise<void>
  /** Clear the storage area */
  clear: () => Promise<void>
  /** Emits an object with changed storage keys and StorageChange values  */
  readonly changeStream: Observable<Changes<T>>
  /** Emits the current storage values when changeStream emits */
  readonly valueStream: Observable<T>
}

/* -------------------------------------------- */
/*                     CODE                     */
/* -------------------------------------------- */

export const storage = {
  local: setupStorage('local'),
  sync: setupStorage('sync'),
  managed: setupStorage('managed'),
}

function setupStorage<T extends StorageValues>(
  area: string,
): StorageArea<Partial<T>> {
  type S = Partial<T>
  /* ------------- GET STORAGE AREA ------------- */

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

  let promise: Promise<S> | null = null

  /* -------------------------------------------- */
  /*                  STORAGE.GET                 */
  /* -------------------------------------------- */

  const coreGet = async (x?: NativeGetter<S>): Promise<S> => {
    // Flush pending set ops before
    if (promise) {
      return promise
    }

    return storage.get(x || null) as Promise<S>
  }

  const get = (getter?: Getter<S>): Promise<S> => {
    const errorMessage = invalidGetter(getter)

    if (errorMessage) {
      throw new TypeError(errorMessage)
    }

    if (getter === null || getter === undefined) {
      return coreGet() as Promise<S>
    } else if (Array.isArray(getter)) {
      return coreGet(getter) as Promise<S>
    }

    switch (typeof getter) {
      case 'function':
        return (coreGet() as Promise<S>).then(getter as GetterFn<
          S
        >)
      case 'object':
      case 'string':
        return coreGet(getter) as Promise<S>
      default:
        throw new TypeError(
          'Unexpected argument type: ' + typeof getter,
        )
    }
  }

  /* -------------------------------------------- */
  /*                  STORAGE.SET                 */
  /* -------------------------------------------- */

  let createNextValue = (x: S): S => x

  const set = (arg: Setter<S>): Promise<S> => {
    const errorMessage = invalidSetter(arg)

    if (errorMessage) {
      throw new TypeError(errorMessage)
    }

    // TODO: if !promise && setter !== fn, just set native

    return new Promise((resolve, reject) => {
      let setter: SetterFn<S>

      if (typeof arg === 'function') {
        setter = (prev) => {
          const result = (arg as SetterFn<S>)(prev)
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

    async update(updater) {
      const store = await get()
      const result = await updater(store)
      return set(result)
    },

    remove(arg) {
      const query = ([] as string[]).concat(arg)

      query.forEach((x) => {
        if (typeof x !== 'string') {
          throw new TypeError(
            `Unexpected argument type: ${typeof x}`,
          )
        }
      })

      return storage.remove(query)
    },

    clear() {
      return storage.clear()
    },

    get changeStream() {
      let stream: Observable<any>
      if (area === 'local') {
        stream = rxStorage.local.changeStream
      } else if (area === 'sync') {
        stream = rxStorage.sync.changeStream
      } else {
        stream = rxStorage.managed.changeStream
      }

      return stream as Observable<Changes<S>>
    },

    get valueStream() {
      let stream: Observable<any>
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
