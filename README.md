# @bumble/storage

Manage Chrome Extension storage easily with `@bumble/storage`.

This is a wrapper for the Chrome Extension Storage API that adds promises and functional set transactions similar to the React `this.setState` API. Functional set transactions make it easy to use the Chrome Storage API to share and manage state between different contexts in a Chrome Extension.

> This library is in beta mode. API changes may occur before version 1.0.

# Install

```sh
npm i @bumble/storage
```

# Usage

```javascript
import { storage } from '@bumble/storage'

storage.set(({ friends = [] }) => {
  return { friends: [...friends, friend] }
})

storage.get(({ friends = [] }) => {
  console.log(`You have ${friends.length} friends.`)
})
```

# Why is this great?

The Chrome Storage API is asynchronous. This means synchronous calls to `get` and `set` will not reflect pending changes. This makes calls to `set` that depend on values held in storage difficult.

While the Chrome Storage API is async, it uses callbacks. This brings a whole world of difficulty into the developer experience that have been solved with Promises.

`@bumble/storage` solves both of these problems. Every method returns a Promise and both `get` and `set` can take a transaction function that provides current storage values.

# Here's how it works

The `set` method for each area can be called with a function (setter) as well as the normal types (a string, array of strings, or an object).

This setter will receive the entire contents of that storage area as an argument. It must return an object which will be passed to the native storage area `set` method.

Synchronous calls to `set` will be composed into one call to the native `set`. The setters will be applied in order, but each call will resolve with the final value passed to the storage area.

An individual call to `set` will reject if the setter function throws an error or returns an invalid type, but will not affect other set operations.
