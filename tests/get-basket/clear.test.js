import assert from 'power-assert'
import { useBucket } from '../../src/get-bucket'

const { get, set, remove, clear } = chrome.storage.local

const prefix = 'bumble/storage__bucket1'

const keys = `${prefix}_keys`
const x = `${prefix}--x`
const y = `${prefix}--y`

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

test('clear', async () => {
  const bucket = useBucket('local', 'bucket1')

  await bucket.clear()

  assert(set.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  assert(remove.calledOnce)
  assert(remove.calledWith([keys, x, y]))
})
