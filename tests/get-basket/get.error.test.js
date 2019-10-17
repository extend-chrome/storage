import { useBucket } from '../../src/get-bucket'

const { get, set, remove, clear } = chrome.storage.local

const name = 'bucket1'
const bucket = useBucket('local', name)
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
  const withBool = () => bucket.get(true)

  expect(withBool).toThrow(
    new TypeError('Unexpected argument type: boolean'),
  )
})

test('throws with boolean arg', async () => {
  const withNum = () => bucket.get(2)

  expect(withNum).toThrow(
    new TypeError('Unexpected argument type: number'),
  )
})
