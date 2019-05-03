import chromep from 'chrome-promise'
import { storage as rxStorage } from '@bumble/chrome-rxjs'

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
  const query = { storage: {} }

  /* ---------------- storage.get --------------- */
  const coreGet = () =>
    storage.get(query).then(({ storage }) => storage)

  const get = async (getter) => {
    if (getter === null || getter === undefined) {
      return coreGet()
    } else if (Array.isArray(getter)) {
      const values = await coreGet()

      return getter.reduce((r, key) => {
        const value = values[key]

        if (value) {
          return { ...r, [key]: value }
        } else {
          return r
        }
      }, {})
    }

    switch (typeof getter) {
      case 'function': {
        return getter(await coreGet())
      }
      case 'string': {
        const values = await coreGet()

        return values[getter]
      }
      case 'object': {
        const values = await coreGet()

        return Object.keys(getter).reduce((r, key) => {
          return { ...r, [key]: values[key] || getter[key] }
        }, {})
      }
      default:
        throw new TypeError(
          'Unexpected argument type: ' + typeof getter,
        )
    }
  }

  /* ---------------- storage.set --------------- */
  let shouldUpdateStorage = true
  let composedSetter = (x) => x
  let resolves = []
  let rejects = []

  const set = (arg) =>
    new Promise((resolve, reject) => {
      let setter

      if (typeof arg === 'function') {
        setter = (prev) => {
          const result = arg(prev)

          if (
            (result === undefined ||
              typeof result === 'object') &&
            !Array.isArray(result)
          ) {
            return {
              ...prev,
              ...result,
            }
          } else {
            // TODO: Improve error message, include type
            throw new TypeError(
              'Setter must return an object or undefined.',
            )
          }
        }
      } else if (
        typeof arg === 'object' &&
        !Array.isArray(arg)
      ) {
        setter = (prev) => ({
          ...prev,
          ...arg,
        })
      } else {
        // TODO: Make error message more specific
        throw new TypeError(
          'Setter must be an object or a function.',
        )
      }

      const composeFn = composedSetter
      composedSetter = (next) => setter(composeFn(next))

      resolves.push(resolve)
      rejects.push(reject)

      if (shouldUpdateStorage) {
        // Update storage starting with current values
        coreGet()
          .then((prev) => {
            // Compose new values
            const next = composedSetter(prev)

            // Execute set
            return storage.set({ storage: next })
          })
          .then(() => {
            resolves.forEach((r) => r())
          })
          .catch((error) => {
            rejects.forEach((r) => r(error))
          })
          .finally(() => {
            // Clean up after a set operation
            shouldUpdateStorage = true
            composedSetter = (s) => s

            resolves = []
            rejects = []
          })

        shouldUpdateStorage = false
      }
    })

  return {
    set,
    get,

    async remove(arg) {
      const keys = [].concat(arg)
      const values = await coreGet()

      keys.forEach((key) => {
        if (typeof key !== 'string')
          throw new TypeError(
            'Unexpected argument type: ' + typeof key,
          )

        delete values[key]
      })

      return set(values)
    },

    clear() {
      return storage.remove('storage')
    },

    get change$() {
      // TODO: map to only 'storage' changes
      return rxStorage[area].change$
    },
  }
}
