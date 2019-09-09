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

test('clear', async () => {
  await storage.local.clear()

  assert(set.notCalled)
  assert(remove.notCalled)

  assert(clear.calledOnce)
})
