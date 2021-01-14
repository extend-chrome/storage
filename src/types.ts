import { Observable } from 'rxjs'

export type AreaName = 'local' | 'sync' | 'managed'

export type AtLeastOne<
  T,
  U = { [K in keyof T]: Pick<T, K> }
> = Partial<T> & U[keyof U]

export type Getter<T> =
  | keyof T
  | (keyof T)[]
  | ((values: T) => any)
  | AtLeastOne<T>

export type Changes<T> = {
  [K in keyof T]?: {
    oldValue: T[K]
    newValue: T[K]
  }
}

export interface Bucket<T extends object> {
  /**
   * Get a value or values in the storage area using a key name, a key name array, or a getter function.
   *
   * A getter function receives a StorageValues object and can return anything.
   */
  get(getter?: undefined): Promise<T>
  get(getter: null): Promise<T>
  get(getter: keyof T): Promise<Partial<T>>
  get(getter: string[]): Promise<Partial<T>>
  get<K>(getter: (values: T) => K): Promise<K>
  get<K extends AtLeastOne<T>>(getter: K): Promise<K>
  /**
   * Set a value or values in the storage area using an object with keys and default values, or a setter function.
   *
   * A setter function receives a StorageValues object and must return a StorageValues object. A setter function cannot be an async function.
   *
   * Synchronous calls to set will be composed into a single setter function for performance and reliability.
   */
  set(setter: AtLeastOne<T>): Promise<T>
  set<K>(setter: (prev: T) => AtLeastOne<T>): Promise<T>
  /**
   * Set a value or values in the storage area using an async setter function.
   *
   * An async setter function should return a Promise that contains a StorageValues object.
   *
   * `StorageArea#update` should be used if an async setter function is required. Syncronous calls to `set` will be more performant than calls to `update`.
   *
   * ```javascript
   * storage.local.update(async ({ text }) => {
   *   const result = await asyncApiRequest(text)
   *
   *   return { text: result }
   * })
   * ```
   */
  update: (asyncSetter: (values: T) => Promise<T>) => Promise<T>
  /** Remove a key from the storage area */
  remove: (query: string | string[]) => Promise<void>
  /** Clear the storage area */
  clear: () => Promise<void>
  /** Emits an object with changed storage keys and StorageChange values  */
  readonly changeStream: Observable<Changes<T>>
  /** Emits the current storage values immediately and when changeStream emits */
  readonly valueStream: Observable<T>
}