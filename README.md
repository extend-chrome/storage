<p align="center">
  <a href="http://bit.ly/35jbrc5" rel="noopener">
 <img width=200px height=200px src="https://i.imgur.com/vDjh5SL.png" alt="@bumble/storage logo"></a>
</p>

<h3 align="center">@bumble/storage</h3>

<div align="center">

[![npm (scoped)](https://img.shields.io/npm/v/@bumble/storage.svg)](http://bit.ly/2KA6cNp)
[![GitHub last commit](https://img.shields.io/github/last-commit/bumble-org/storage.svg)](http://bit.ly/35jbrc5)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](/LICENSE)
[![TypeScript Declarations Included](https://img.shields.io/badge/types-TypeScript-informational)](#typescript)

[![Fiverr: We make Chrome extensions](https://img.shields.io/badge/Fiverr%20-We%20make%20Chrome%20extensions-brightgreen.svg)](http://bit.ly/37mZsfA)
[![ko-fi](https://img.shields.io/badge/ko--fi-Buy%20me%20a%20coffee-ff5d5b)](http://bit.ly/2qmaQYB)

</div>

---

Manage Chrome Extension storage easily with `@bumble/storage`.

This is a wrapper for the Chrome Extension Storage API that adds promises and functional set transactions similar to the React `this.setState` API. Functional set transactions make it easy to use the Chrome Storage API to share and manage state between different contexts in a Chrome Extension.

> This library is in beta mode. API changes may occur before version 1.0.

## Table of Contents

- [Getting Started](#getting_started)
- [Usage](#usage)
- [Features](#features)
- [API](#api)

## Getting started <a name = "getting_started"></a>

You will need to use a bundler like [Rollup](https://rollupjs.org/guide/en/), Parcel, or Webpack to include this library in the build of Chrome extension.

See [`rollup-plugin-chrome-extension`](http://bit.ly/35hLMR8) for an easy way use Rollup to build your Chrome extension!

### Installation

```sh
npm i @bumble/storage
```

## Usage <a name = "usage"></a>

```javascript
import { storage } from '@bumble/storage'

storage.set(({ friends = [] }) => {
  return { friends: [...friends, friend] }
})

storage.get(({ friends = [] }) => {
  console.log(`You have ${friends.length} friends.`)
})
```

## Features <a name = "features"></a>

## API <a name = "api"></a>

# Why is this great?

The Chrome Storage API is asynchronous. This means synchronous calls to `get` and `set` will not reflect pending changes. This makes calls to `set` that depend on values held in storage difficult.

While the Chrome Storage API is async, it uses callbacks. This brings a whole world of difficulty into the developer experience that have been solved with Promises.

`@bumble/storage` solves both of these problems. Every method returns a Promise and both `get` and `set` can take a transaction function that provides current storage values.

# Here's how it works

The `set` method for each area can be called with a function (setter) as well as the normal types (a string, array of strings, or an object).

This setter will receive the entire contents of that storage area as an argument. It must return an object which will be passed to the native storage area `set` method.

Synchronous calls to `set` will be composed into one call to the native `set`. The setters will be applied in order, but each call will resolve with the final value passed to the storage area.

An individual call to `set` will reject if the setter function throws an error or returns an invalid type, but will not affect other set operations.
