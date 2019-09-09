import assert from 'power-assert'
import { getBasket } from '../../src'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`

const keys = `${prefix}_keys`
const x = `${prefix}--x`
const y = `${prefix}--y`
const z = `${prefix}--z`

const values = {
  [keys]: ['x', 'y'],
  [x]: '123',
  [y]: '456',
}

beforeEach(() => {
  chrome.reset()
  get.yields(values)
  set.yields()
  remove.yields()
  clear.yields()
})

test('get with string', async () => {
  const getter = 'x'
  const expected = { x: '123' }

  const got = { [x]: values[x] }
  get.yields(got)

  const result = await basket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(x))

  expect(result).toEqual(expected)
})

test('get with object', async () => {
  const getter = { x: 'abc', z: '789' }
  const rawGetter = { [x]: 'abc', [z]: '789' }
  const expected = { x: '123', z: '789' }

  const got = { [x]: values[x] }
  get.yields(got)

  const result = await basket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))

  expect(result).toEqual(expected)
})

test('get with array', async () => {
  const getter = ['x', 'z']
  const rawGetter = [x, z]
  const expected = { x: '123', y: '789' }

  const got = { [x]: values[x], [y]: values[y] }
  get.yields(got)

  const result = await basket.get(getter)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(rawGetter))

  expect(result).toEqual(expected)
})

test('get with function', async () => {
  const getter = ({ x }) => x + 4
  const spy = jest.fn(getter)

  const basketValues = {
    x: values[x],
    y: values[y],
  }

  const result = await basket.get(spy)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith(basketValues)

  expect(result).toEqual('1234')
})

test('get with undefined', async () => {
  const result = await basket.get()

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(result).toEqual(values)
})

test('get with null', async () => {
  const result = await basket.get(null)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledTwice)
  assert(get.calledWith(keys))
  assert(get.calledWith([x, y]))

  expect(result).toEqual(values)
})

test('throws with unexpected args', async () => {
  const withNum = () => basket.get(2)
  const withBool = () => basket.get(true)
  const withMixedArray = () => basket.get(['a', true])

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )

  expect(withMixedArray).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})

test.todo('composes synchronous string and array calls')
