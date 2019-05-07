import assert from 'power-assert'
import { storage } from '../../src'

const { get, set, remove, clear } = chrome.storage.local
const values = { x: '123', y: '456' }

beforeEach(() => {
  chrome.reset()
  get.yields(values)
  set.yields()
  remove.yields()
  clear.yields()
})

test('get with string', async () => {
  const result = await storage.local.get('x')

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(result).toEqual('123')
})

test('get with object', async () => {
  const result = await storage.local.get({ x: 'abc', z: '789' })

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(result).toEqual({ x: '123', z: '789' })
})

test('get with array', async () => {
  const result = await storage.local.get(['x', 'z'])

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(result).toEqual({ x: '123' })
})

test('get with function', async () => {
  const spy = jest.fn(({ x }) => {
    const newX = x + '4'
    return { x: newX }
  })

  const result = await storage.local.get(spy)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith(values)

  expect(result).toEqual({ x: '1234' })
})

test('get with undefined', async () => {
  const result = await storage.local.get()

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(result).toEqual(values)
})

test('get with null', async () => {
  const result = await storage.local.get(null)

  assert(set.notCalled)
  assert(remove.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.withArgs(null).calledOnce)

  expect(result).toEqual(values)
})

test('throws with unexpected args', async () => {
  const withNum = () => storage.local.get(2)
  const withBool = () => storage.local.get(true)
  const withMixedArray = () => storage.local.get(['a', true])

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
