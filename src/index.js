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

  /* ---------------- storage.get --------------- */
  const coreGet = () => storage.get(null)
  const validGetter = (g) => {
    switch (typeof g) {
      case 'undefined':
      case 'string':
      case 'function':
      case 'object':
        return true
      default:
        throw new TypeError(
          `Unexpected argument type: ${typeof g}`,
        )
    }
  }

  const get = (getter) => {
    validGetter(getter)

    if (getter === null || getter === undefined) {
      return coreGet()
    } else if (Array.isArray(getter)) {
      getter.forEach(validGetter)

      return coreGet().then((values) => {
        return getter.reduce((r, key) => {
          const value = values[key]

          if (value) {
            return { ...r, [key]: value }
          } else {
            return r
          }
        }, {})
      })
    }

    switch (typeof getter) {
      case 'function': {
        return coreGet().then(getter)
      }
      case 'string': {
        return coreGet().then((values) => values[getter])
      }
      case 'object': {
        return coreGet().then((values) => {
          return Object.keys(getter).reduce((r, key) => {
            return { ...r, [key]: values[key] || getter[key] }
          }, {})
        })
      }
      default:
        throw new TypeError(
          'Unexpected argument type: ' + typeof getter,
        )
    }
  }

  /* ---------------- storage.set --------------- */
  let getNextValue = (x) => x
  let promise = null

  const invalidSetter = (s) => {
    if (Array.isArray(s)) {
      return 'Unexpected argument type: Array'
    } else if (s) {
      switch (typeof s) {
        case 'function':
        case 'object':
          return false
        default:
          return `Unexpected argument type: ${typeof s}`
      }
    }
  }

  const invalidSetterReturn = (r) => {
    if (Array.isArray(r)) {
      return 'Unexpected setter result value: Array'
    } else {
      switch (typeof r) {
        case 'object':
        case 'undefined':
          return false
        default:
          return `Unexpected setter return value: ${typeof r}`
      }
    }
  }

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

      const composeFn = getNextValue
      getNextValue = (prev) => setter(composeFn(prev))

      // TODO: reject or resolve individually
      if (!promise) {
        // Update storage starting with current values
        promise = coreGet().then((prev) => {
          // Compose new values
          const next = getNextValue(prev)
          // Execute set
          return storage.set(next).then(() => next)
        })

        promise
          .then(resolve)
          .catch(reject)
          .finally(() => {
            // Clean up after a set operation
            getNextValue = (s) => s
            promise = null
          })
      } else {
        promise.then(resolve).catch(reject)
      }
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
      // TODO: map to only 'storage' changes
      return rxStorage[area].change$
    },
  }
}
