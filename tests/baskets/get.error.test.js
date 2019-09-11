import { getBasket } from '../../src/get-basket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'basket1'
const basket = getBasket('local', name)
const prefix = `bumble/storage__${name}`

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

test('throws with number arg', async () => {
  const withBool = () => basket.get(true)

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})

test('throws with boolean arg', async () => {
  const withNum = () => basket.get(2)

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )
})
