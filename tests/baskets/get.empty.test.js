import assert from 'power-assert'
import { getBasket } from '../../src/get-basket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`

const keys = `${prefix}_keys`
const x = `${prefix}--x`
const z = `${prefix}--z`

beforeEach(() => {
  chrome.reset()
  get.yields({})
  set.yields()
  remove.yields()
  clear.yields()
})

test('get from empty storage with string', async () => {
  const getter = 'x'

  const result = await basket.get(getter)

  const expected = {}
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(x))
})

test('get from empty storage with object', async () => {
  const getter = { x: 'abc', z: '789' }
  const rawGetter = { [x]: getter.x, [z]: getter.z }

  get.yields(rawGetter)

  const result = await basket.get(getter)

  const expected = getter
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))
})

test('get from empty storage with array', async () => {
  const getter = ['x', 'z']
  const rawGetter = [x, z]

  const result = await basket.get(getter)

  const expected = {}
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))
})

test('get from empty storage with function', async () => {
  const getter = ({ x = '123' }) => x + 4
  const spy = jest.fn(getter)

  const result = await basket.get(spy)

  const expected = '1234'
  expect(result).toEqual(expected)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({})
})

test('get from empty storage with undefined', async () => {
  const result = await basket.get()
  const expected = {}

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(result).toEqual(expected)
})

test('get from empty storage with null', async () => {
  const result = await basket.get(null)
  const expected = {}

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  expect(result).toEqual(expected)
})
