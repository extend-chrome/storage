import * as context from '../../src/store.context'
import { initStore, store, storePromise } from '../../src/store.background'

context.isBackgroundPage = jest.fn(() => true)

storePromise.isPending = true

storePromise
  .then(() => {
    storePromise.isPending = false
  })
  .catch(error => {
    console.error(error)
  })

describe('store setup on background page', () => {
  test('uninitialized store', () => {
    expect(store.getState).toThrow()
    expect(store.setState).toThrow()
    expect(store.onStateChange.addListener).toThrow()
    expect(store.onStateChange.removeListener).toThrow()

    // Expect promise to be pending
    expect(storePromise.isPending).toBe(true)
  })

  test('initStore on background page', () => {
    const result = initStore({ apples: 2 })

    expect(store).toBe(result)
    expect(context.isBackgroundPage).toBeCalled()

    // Expect promise not to be resolved yet
    expect(storePromise.isPending).toBe(true)

    return storePromise.then(() => {
      expect(storePromise.isPending).toBe(false)
    })
  })

  test('initialized store', () => {
    expect(() => initStore({ apples: 2 })).toThrow()

    expect(store.getState).not.toThrow()
    expect(store.setState).not.toThrow()
    expect(store.onStateChange.addListener).not.toThrow()
    expect(store.onStateChange.removeListener).not.toThrow()

    // Expect promise to be resolved
    expect(storePromise.isPending).toBe(false)

    return window.bumbleStore.then(result => {
      expect(result).toBe(store)
    })
  })
})
