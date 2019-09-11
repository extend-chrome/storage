import assert from 'power-assert'
import { getBasket } from '../../src/get-basket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`
const keysName = `${prefix}_keys`

const pfx = (k) => `${prefix}--${k}`

const xfmKeys = (xfm) => (obj) =>
  Object.keys(obj).reduce(
    (r, k) => ({ ...r, [xfm(k)]: obj[k] }),
    {},
  )

const pfxObj = xfmKeys(pfx)

const addKeys = (obj) => ({
  ...obj,
  [keysName]: Object.keys(obj),
})

beforeEach(() => {
  chrome.reset()
  get.yields({})
  set.yields()
  remove.yields()
  clear.yields()
})

test('set empty storage with object', async () => {
  get.yields({})

  const expected = { z: '789' }

  const result = await basket.set(expected)

  expect(result).toEqual(expected)

  assert(get.calledOnce)
  assert(get.calledWith(keysName))

  const setter = pfxObj(addKeys(expected))
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})

test('set empty storage with function', async () => {
  get.yields({})

  const expected = { z: '789' }
  const spy = jest.fn(() => expected)

  const result = await basket.set(spy)

  expect(result).toEqual(expected)

  assert(get.calledOnce)
  assert(get.calledWith(keysName))

  const setter = pfxObj(addKeys(expected))
  assert(set.calledOnce)
  assert(set.calledWith(setter))

  assert(remove.notCalled)
  assert(clear.notCalled)
})
