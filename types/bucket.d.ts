import { chromepApi } from 'chrome-promise/chrome-promise'
import { Observable } from 'rxjs'
import { AsyncSetterFn, Changes, Getter, Setter } from './types'
export declare const getStorageArea: (
  area: string,
) => chromepApi.storage.StorageArea
export declare function useBucket<
  T extends {
    [key: string]: any
  }
>(
  area: string,
  name: string,
): StorageArea<
  {
    [K in keyof T]?: T[K]
  }
>
export interface StorageArea<
  T extends {
    [key: string]: any
  }
> {
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
  /** Emits the current storage values immediately and when changeStream emits */
  readonly valueStream: Observable<T>
}
