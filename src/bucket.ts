import chromep from 'chrome-promise'
import { chromepApi } from 'chrome-promise/chrome-promise'
import { concat, from, fromEventPattern, Observable } from 'rxjs'
import { filter, map, mergeMap } from 'rxjs/operators'
import { isKeyof, isNonNull } from './guards'
import {
  AreaName,
  AtLeastOne,
  Bucket,
  Changes,
  Getter,
} from './types'
import { invalidSetterReturn } from './validate'

export const getStorageArea = (
  area: AreaName,
): chromepApi.storage.StorageArea => {
  switch (area) {
    case 'local':
      return chromep.storage.local
    case 'sync':
      return chromep.storage.sync
    case 'managed':
      return chromep.storage.managed

    default:
      throw new TypeError(
        `area must be "local" | "sync" | "managed"`,
      )
  }
}

/**
 * Create a bucket (synthetic storage area).
 *
 * @param {string} bucketName Must be a id for each bucket.
 * @param {string} [areaName = 'local'] The name of the storage area to use.
 * @returns {Bucket} Returns a bucket.
 */
export function getBucket<
  T extends {
    [prop: string]: any
  }
>(bucketName: string, areaName?: AreaName): Bucket<T> {
  /* ------------- GET STORAGE AREA ------------- */
  if (!areaName) areaName = 'local' as const
  const _areaName: AreaName = areaName
  const storage = getStorageArea(_areaName)

  /* --------------- SETUP BUCKET --------------- */
  const prefix = `bumble/storage__${bucketName}`
  const keys = `${prefix}_keys`
  const pfx = (k: keyof T) => {
    return `${prefix}--${k}`
  }
  const unpfx = (pk: string) => {
    return pk.replace(`${prefix}--`, '')
  }

  const xfmKeys = (xfm: (x: string) => string) => (obj: {
    [key: string]: any
  }): {
    [key: string]: any
  } => {
    return Object.keys(obj).reduce(
      (r, k) => ({
        ...r,
        [xfm(k)]: obj[k],
      }),
      {},
    )
  }

  const pfxAry = (ary: (keyof T)[]) => {
    return ary.map(pfx)
  }
  const pfxObj = xfmKeys(pfx)
  const unpfxObj = xfmKeys(unpfx)

  const getKeys = async () => {
    const result = await storage.get(keys)

    return result[keys] || []
  }

  const setKeys = (_keys: string[]) => {
    return storage.set({ [keys]: _keys })
  }

  /* --------- STORAGE OPERATION PROMISE -------- */

  let promise: Promise<T> | null = null

  /* -------------------------------------------- */
  /*                  STORAGE.GET                 */
  /* -------------------------------------------- */

  type PartialStore = AtLeastOne<T>
  const coreGet = async (x?: Getter<PartialStore>) => {
    // Flush pending storage.set ops before
    if (promise) {
      return promise
    }

    if (typeof x === 'undefined' || x === null) {
      // get all
      const keys = await getKeys()
      const getter = pfxAry(keys)

      if (!getter.length) {
        return {} as T
      } else {
        const result = await storage.get(getter)

        return unpfxObj(result) as T
      }
    } else if (isKeyof<T>(x)) {
      // string getter, get one
      const getter = pfx(x)
      const result = await storage.get(getter)

      return unpfxObj(result) as PartialStore
    } else if (Array.isArray(x)) {
      // string array getter, get each
      const getter = pfxAry(x)
      const result = await storage.get(getter)

      return unpfxObj(result) as PartialStore
    } else {
      // object getter, get each key
      const getter = pfxObj(x)
      const result = await storage.get(getter)

      return unpfxObj(result) as PartialStore
    }
  }

  function get(getter?: Getter<PartialStore> | null) {
    if (getter === null || getter === undefined) {
      return coreGet() as Promise<T>
    }

    switch (typeof getter) {
      case 'string':
      case 'object':
        return coreGet(getter) as Promise<PartialStore>
      case 'function':
        return coreGet().then(getter) as Promise<
          ReturnType<typeof getter>
        >
      default:
        throw new TypeError(
          `Unexpected argument type: ${typeof getter}`,
        )
    }
  }

  /* -------------------------------------------- */
  /*                  STORAGE.SET                 */
  /* -------------------------------------------- */

  const _createNextValue = (x: PartialStore): PartialStore => x
  let createNextValue = _createNextValue

  type SetterFn = (
    prev: PartialStore,
  ) => AtLeastOne<PartialStore>
  const set = (arg: SetterFn | T): Promise<PartialStore> =>
    new Promise((resolve, reject) => {
      let setter: SetterFn
      if (typeof arg === 'function') {
        setter = (prev) => {
          const result = (arg as SetterFn)(prev)
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

      if (promise === null) {
        // Update storage starting with current values
        promise = coreGet().then((prev) => {
          try {
            // Compose new values
            const next = createNextValue(prev)
            const pfxNext = pfxObj(next)

            pfxNext[keys] = Object.keys(next)

            // Execute set
            return storage.set(pfxNext).then(() => next)
          } finally {
            // Clean up after a set operation
            createNextValue = _createNextValue
            promise = null
          }
        })
      }

      // All calls to set should call resolve or reject
      promise.then(resolve).catch(reject)
    })

  const remove = (arg: string | string[]) => {
    const query = ([] as string[]).concat(arg)

    query.forEach((x) => {
      if (typeof x !== 'string') {
        throw new TypeError(
          `Unexpected argument type: ${typeof x}`,
        )
      }
    })

    const _setKeys = (_keys: string[]) =>
      setKeys(_keys.filter((k) => !query.includes(k)))

    return storage
      .remove(pfxAry(query))
      .then(getKeys)
      .then(_setKeys)
  }

  const nativeChange$ = fromEventPattern<
    [{ [key: string]: chrome.storage.StorageChange }, string]
  >(
    (handler) => {
      chrome.storage.onChanged.addListener(handler)
    },
    (handler) => {
      chrome.storage.onChanged.removeListener(handler)
    },
  )

  const changeStream = nativeChange$.pipe(
    filter(([changes, area]) => {
      return (
        area === areaName &&
        Object.keys(changes).some((k) => k.startsWith(prefix))
      )
    }),
    map(([changes]) => {
      const bucketChanges = Object.keys(changes).filter(
        (k) => k.startsWith(prefix) && k !== keys,
      )

      return bucketChanges.length
        ? bucketChanges.reduce(
            (r, k) => ({ ...r, [unpfx(k)]: changes[k] }),
            {} as typeof changes,
          )
        : undefined
    }),
    filter(isNonNull),
  ) as Observable<Changes<PartialStore>>

  return {
    set,
    get,
    remove,

    async clear() {
      const _keys = await getKeys()
      const query = [keys, ...pfxAry(_keys)]

      return storage.remove(query)
    },

    async update(updater) {
      const store = await get()
      const result = await updater(store)
      return set(result)
    },

    get changeStream() {
      return changeStream
    },

    get valueStream() {
      return concat(
        from(get()),
        changeStream.pipe(mergeMap(() => get())),
      )
    },
  }
}
