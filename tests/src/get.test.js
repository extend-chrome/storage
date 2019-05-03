import assert from 'power-assert'
import { storage } from '../../src'

const { get, set } = chrome.storage.local

beforeEach(() => {
  chrome.reset()
})

test('get with string', async () => {
  get.yields({ storage: { x: '123', y: '456' } })

  const result = await storage.local.get('x')

  expect(result).toEqual('123')

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('get with object', async () => {
  get.yields({ storage: { x: '123', y: '456' } })

  const result = await storage.local.get({ x: 'abc', z: '789' })

  expect(result).toEqual({ x: '123', z: '789' })

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('get with array', async () => {
  get.yields({ storage: { x: '123', y: '456' } })

  const result = await storage.local.get(['x', 'z'])

  expect(result).toEqual({ x: '123' })

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('get with function', async () => {
  const values = { x: '123', y: '456' }

  get.yields({ storage: values })

  const spy = jest.fn(({ x }) => {
    const newX = x + '4'
    return { x: newX }
  })

  const result = await storage.local.get(spy)

  expect(result).toEqual({ x: '1234' })

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith(values)

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('get with undefined', async () => {
  const values = { x: '123', y: '456' }

  get.yields({ storage: values })

  const result = await storage.local.get()

  expect(result).toEqual(values)

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('get with null', async () => {
  const values = { x: '123', y: '456' }

  get.yields({ storage: values })

  const result = await storage.local.get(null)

  expect(result).toEqual(values)

  assert(get.calledOnce)
  assert(get.withArgs({ storage: {} }).calledOnce)

  assert(set.notCalled)
})

test('throws with unexpected args', async () => {
  const values = { x: '123', y: '456' }

  get.yields({ storage: values })

  await expect(storage.local.get(2)).rejects.toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  await expect(storage.local.get(true)).rejects.toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})
