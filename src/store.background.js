import { timeout } from '@bumble/stream'
import { isBackgroundPage } from './store.context'

let storeReady = false
const state = {}
let listeners = []

/**
 * Returns copy of state object or value returned from mapping fn
 *
 * @memberof BumbleStore
 * @function getState
 * @param {string|StateSelector} keyOrFn - key name or fn :: {state} -> any
 * @returns {Promise} Resolves with the state object or the value of the state property.
 *
 * @example
 * getState('apples').then((apples) => {
 *   console.log(apples)
 * })
 */
export const getState = (keyOrFn) => {
  if (!storeReady) {
    notConnectedError('store.getState')
  }

  if (typeof keyOrFn === 'string' && keyOrFn.length) {
    // Get only one property of state
    let value = state[keyOrFn]

    if (value === undefined) {
      new Error(`getState: state.${keyOrFn} is undefined.`)
    }

    if (value && value instanceof Array) {
      // Return copy of value if array
      return [...value]
    } else if (value && value instanceof Object) {
      // Return copy of value if object
      return { ...value }
    } else {
      // Primitive value, no need to copy
      return value
    }
  } else if (typeof keyOrFn === 'function') {
    return keyOrFn({ ...state })
  } else {
    // Return copy of whole state
    return { ...state }
  }
}
/**
 * Derive a value from the current state.
 *
 * @callback StateSelector
 * @param {Object} state - The current state.
 * @returns {any} Any derived value.
 */

let shouldUpdateState = true
let composeNextState = (s) => s

/**
 * Sets state asynchronously using a state object or a function that returns an object.
 *
 * @memberof BumbleStore
 * @function setState
 * @param {string|StateAction} newStateOrFn - key name or fn :: {state} -> {state}
 * @returns {Promise<Object>} Resolves to a copy of the new state object.
 *
 * @example
 * setState({ apples: 2 })
 *   .then((state) => {
 *     console.log('Number of apples:', state.apples)
 *   })
 */
export const setState = (newStateOrFn) => {
  if (!storeReady) {
    notConnectedError('store.setState')
  }

  return new Promise((resolve, reject) => {
    try {
      const setter = composeNextState
      let fn

      if (typeof newStateOrFn === 'function') {
        fn = (prevState) => ({
          ...prevState,
          ...newStateOrFn(prevState),
        })
      } else {
        fn = (prevState) => ({
          ...prevState,
          ...newStateOrFn,
        })
      }

      composeNextState = (nextState) => fn(setter(nextState))

      if (shouldUpdateState) {
        // Force async update of state
        // to avoid unexpected side effects
        // for multiple event listeners
        timeout(0)
          .then(() => {
            // Compose new state and assign
            const nextState = composeNextState(getState())
            Object.assign(state, nextState)
            // Clean up
            shouldUpdateState = true
            composeNextState = (s) => s
            // Pseudo fire OnStateChange
            listeners.forEach((fn) => fn(getState()))
          })
          .then(resolve)

        shouldUpdateState = false
      }

      timeout(0).then(resolve)
    } catch (error) {
      reject(error)
    }
  }).then(getState)
}
/**
 * Map the state object at the time setState() fires.
 *
 * @callback StateAction
 * @param {Object} state A copy of current state object.
 * @returns {Object} The new state object.
 */

/**
 * Adds a listener function to onStateChange.
 *
 * @memberof onStateChange
 * @function addListener
 * @param {Function} listener - A state property name or fn :: {state} -> any
 * @returns {undefined} Returns undefined.
 *
 * @example
 * store.onStateChange.addListener(fn)
 */
const addListener = (listener) => {
  if (storeReady) {
    listeners = [...listeners, listener]
  } else {
    notConnectedError('store.onStateChange.addListener')
  }
}

/**
 * Removes a listener from onStateChange.
 *
 * @memberof onStateChange
 * @function removeListener
 * @param {Function} listener - The listener function to remove.
 * @returns {undefined} Returns undefined.
 *
 * @example
 * store.onStateChange.removeListener(fn)
 */
const removeListener = (listener) => {
  if (storeReady) {
    listeners = listeners.filter((l) => l !== listener)
  } else {
    notConnectedError('store.onStateChange.removeListener')
  }
}

/**
 * Returns true if onStateChange has the listener.
 *
 * @memberof onStateChange
 * @function haslistener
 * @param {Function} listener - Function to match.
 * @returns {boolean} Returns true if onStateChange has the listener.
 *
 * @example
 * store.onStateChange.hasListener(fn)
 */
const hasListener = (listener) => {
  if (storeReady) {
    listeners.some((l) => l === listener)
  } else {
    notConnectedError('store.onStateChange.hasListener')
  }
}

/**
 * Returns true if function has any listeners.
 *
 * @memberof onStateChange
 * @function haslisteners
 * @returns {boolean} Returns true onStateChange has any listeners.
 *
 * @example
 * store.onStateChange.hasListeners()
 */
const hasListeners = () => !!listeners.length

/**
 * Calls all the onStateChange listeners.
 *
 * @memberof onStateChange
 * @function fireListeners
 * @returns {undefined} Returns undefined.
 *
 * @example
 * store.onStateChange.fireListeners()
 */
const fireListeners = () =>
  listeners.forEach((fn) => fn(getState()))

/** @namespace */
const onStateChange = {
  addListener,
  removeListener,
  hasListener,
  hasListeners,
  fireListeners,
}

const notConnectedError = (name) => {
  throw new Error(
    `${name} is not initialized. Call this function after initStore() has completed.`,
  )
}

/** @namespace BumbleStore */
export const store = {
  getState,
  setState,
  onStateChange,
}

const createStore = () => {
  const invertedStorePromise = {}

  const storePromise = new Promise((resolve, reject) => {
    Object.assign(invertedStorePromise, { resolve, reject })
  })

  const initStore = (initialState) => {
    if (storeReady) {
      // Store has already been initialized
      throw new Error('Cannot initialize the store twice.')
    } else if (!isBackgroundPage()) {
      // Not background page
      throw new Error(
        'Must initialize the store in the background page.',
      )
    } else {
      // Assign initial state values to store state
      Object.assign(state, initialState)

      invertedStorePromise.resolve(store)
      storeReady = true

      return store
    }
  }

  window.bumbleStore = storePromise

  return { initStore, storePromise }
}

/**
 * Sets up state and immediately calls the callback.
 * Sets window.store as a Promise that resolves with the store after the callback completes.
 *
 * @function initStore
 * @param {Object} initialState - The initial state values.
 * @returns {BumbleStore} The initialized store.
 *
 * @example
 * const {} = store.initStore({ apples: 2 })
 *
 * @example
 * const defaultState = { apples: 2 }
 * storageLocal.get('state')
 *   .then(({state = defaultState}) => state)
 *   .then(store.initStore)
 *   .then(({ setState, getState, onStateChange }) => {
 *     console.log('Store has been initialized.')
 *   })
 */
const { initStore, storePromise } = createStore()

export { initStore, storePromise }
