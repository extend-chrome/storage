import cases from 'jest-in-case'

import { useBucket } from '../../src/bucket'
import {
  clear,
  get,
  keysName,
  remove,
  set,
  unpfxObj,
  values,
  x,
  y,
  bucketName,
  Bucket,
} from './setup'

beforeEach(jest.clearAllMocks)

cases<{
  returnValue: any
}>(
  'rejects for function return types',
  async ({ returnValue }) => {
    expect.assertions(1)

    const bucket = useBucket<Bucket>('local', bucketName)

    return bucket
      .set(() => returnValue)
      .catch((error: any) => {
        expect(error.message).toBe(
          `Unexpected setter return value: ${typeof returnValue}`,
        )
      })
  },
  {
    boolean: {
      returnValue: true,
    },
    function: {
      returnValue: () => {},
    },
    string: {
      returnValue: 'abc',
    },
    number: {
      returnValue: 123,
    },
  },
)

test('one reject does not disrupt other set ops', async () => {
  const bucket = useBucket<Bucket>('local', bucketName)

  const setFn = ({ x }: Bucket) => ({ x: x + '4' })
  const raw = { [x]: '1234', [y]: values[y] }
  const expected = unpfxObj(raw)

  const spy = jest.fn(setFn)
  const number = jest.fn(() => 2)

  const expectError = (error: any) => {
    expect(error.message).toBe(
      'Unexpected setter return value: number',
    )
  }

  const expectResult = (result: any) => {
    expect(result).toEqual(expected)
  }

  await Promise.all([
    bucket.set(spy).then(expectResult),
    // eslint-disable-next-line
    // @ts-ignore
    bucket.set(number).catch(expectError),
  ])

  expect(get).toBeCalledTimes(2)
  expect(get).toBeCalledWith(keysName, expect.any(Function))
  expect(get).toBeCalledWith([x, y], expect.any(Function))

  const setter = {
    ...raw,
    [keysName]: Object.keys(expected),
  }
  expect(set).toBeCalledTimes(1)
  expect(set).toBeCalledWith(setter, expect.any(Function))

  expect(spy).toBeCalled()
  expect(spy).toBeCalledTimes(1)
  expect(spy).toBeCalledWith({
    x: values[x],
    y: values[y],
  })

  expect(clear).not.toBeCalled()
  expect(remove).not.toBeCalled()
})
