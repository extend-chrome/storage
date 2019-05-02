import {
  isBackgroundPage,
  isContentScript,
  getBackgroundPage,
} from './store.context'

const notConnectedError = (name) => {
  throw new Error(
    `${name} is not initialized. Call this function inside connectToStore().then()`,
  )
}

// TODO: Wire up better errors when bgStore is not ready
export const backgroundStore = {
  getState: () => notConnectedError('backgroundStore.getState'),
  setState: () => notConnectedError('backgroundStore.setState'),
  onStateChange: {
    addListener: () =>
      notConnectedError(
        'backgroundStore.onStateChange.addListener',
      ),
    removeListener: () =>
      notConnectedError(
        'backgroundStore.onStateChange.removeListener',
      ),
  },
}

// TODO: Test that isBackgroundPage and isContentScript works
export const connectToStore = () => {
  if (isBackgroundPage()) {
    new Error(
      'Context error: connectToStore cannot run on a background page.',
    )
  } else if (isContentScript()) {
    new Error(
      'Context error: connectToStore cannot run inside a content script.',
    )
  } else {
    return (
      getBackgroundPage()
        // Store is a promise
        .then(({ bumbleStore }) => bumbleStore)
        // Store is unwrapped after bg page initializes
        .then((store) => {
          // console.log('store', store)
          // console.log('backgroundStore', backgroundStore)
          Object.assign(backgroundStore, store)
          return store
        })
    )
  }
}
