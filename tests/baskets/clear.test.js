import assert from 'power-assert'
import { getBasket } from '../../src'

const { get, set, remove, clear } = chrome.storage.local

const prefix = 'bumble/storage__basket1'

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
  const basket = getBasket('local', 'basket1')

  await basket.clear()

  assert(set.notCalled)
  assert(clear.notCalled)

  assert(get.calledOnce)
  assert(get.calledWith(keys))

  assert(remove.calledThrice)
  assert(remove.calledWith(keys))
  assert(remove.calledWith(x))
  assert(remove.calledWith(y))
})
