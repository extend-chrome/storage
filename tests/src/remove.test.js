import assert from 'power-assert'
import { storage } from '../../src'

const { get, set } = chrome.storage.local

beforeEach(() => {
  chrome.reset()
})

test('remove with string', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()

  const result = await storage.local.remove('x')

  expect(result).toBeUndefined()

  assert(get.calledTwice)
  assert(get.withArgs({ storage: {} }).calledTwice)

  assert(set.calledOnce)
  assert(set.withArgs({ storage: { y: '456' } }))
})

test('remove with array', async () => {
  get.yields({ storage: { x: '123', y: '456', z: '789' } })
  set.yields()

  const result = await storage.local.remove(['x', 'z'])

  expect(result).toBeUndefined()

  assert(get.calledTwice)
  assert(get.withArgs({ storage: {} }).calledTwice)

  assert(set.calledOnce)
  assert(set.withArgs({ storage: { y: '456' } }).calledOnce)
})

test('throws with unexpected args', async () => {
  get.yields({ storage: { x: '123', y: '456', z: '789' } })
  set.yields()

  await expect(storage.local.remove(2)).rejects.toThrow(
    new TypeError('Unexpected argument type: number'),
  )

  await expect(storage.local.remove(true)).rejects.toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )

  await expect(
    storage.local.remove(['a', true]),
  ).rejects.toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})
