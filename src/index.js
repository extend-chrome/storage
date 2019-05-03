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

  /* ---------------- storage.set --------------- */
  let shouldUpdateStorage = true
  let composedSetter = (x) => x
  let resolves = []

  const set = (arg) =>
    new Promise((resolve, reject) => {
      let setter

      if (typeof arg === 'function') {
        setter = (prev) => {
          const result = arg(prev)

          // only undefined and objects are valid here
          if (
            result !== undefined &&
            (typeof result !== 'object' || Array.isArray(result))
          ) {
            reject(
              new TypeError(
                'Setter must return an object or undefined.',
              ),
            )
          }

          return {
            ...prev,
            ...result,
          }
        }
      } else if (typeof arg !== 'object' || Array.isArray(arg)) {
        throw new TypeError(
          'Setter must be an object or a function.',
        )
      } else {
        setter = (prev) => ({
          ...prev,
          ...arg,
        })
      }

      const composeFn = composedSetter
      composedSetter = (next) => setter(composeFn(next))

      resolves.push(() => resolve())

      if (shouldUpdateStorage) {
        // Update storage starting with current values
        storage
          .get(query)
          .then(({ storage: prev }) => {
            // Compose new values
            const next = composedSetter(prev)

            // Clean up
            shouldUpdateStorage = true
            composedSetter = (s) => s

            // Execute set
            return storage.set({ storage: next })
          })
          .catch((error) => {
            reject(error)
          })
          .then(() => {
            resolves.forEach((r) => r())
            resolves = []
          })

        shouldUpdateStorage = false
      }
    })

  return {
    set,

    async get(getter) {
      const coreGet = () =>
        storage.get(query).then(({ storage }) => storage)

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
    },

    get change$() {
      // TODO: map to only 'storage' changes
      return rxStorage[area].change$
    },
  }
}
