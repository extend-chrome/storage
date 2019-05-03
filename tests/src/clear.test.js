import assert from 'power-assert'
import { storage } from '../../src'

const { get, set, remove } = chrome.storage.local

beforeEach(() => {
  chrome.reset()
})

test('clear', async () => {
  get.yields({ storage: { x: '123', y: '456' } })
  set.yields()
  remove.yields()

  const result = await storage.local.clear()

  expect(result).toBeUndefined()

  assert(get.notCalled)
  assert(set.notCalled)

  assert(remove.calledOnce)
  assert(remove.withArgs('storage').calledOnce)
})
