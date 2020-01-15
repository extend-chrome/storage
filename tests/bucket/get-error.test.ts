import cases from 'jest-in-case'
import { getBucket } from '../../src/bucket'
import { Bucket, bucketName } from './setup'

beforeEach(jest.clearAllMocks)

cases<{ getter: any }>(
  'throws with wrong getter types',
  ({ getter }) => {
    const bucket = getBucket<Bucket>(bucketName)

    const shouldThrow = () => bucket.get(getter)

    expect(shouldThrow).toThrow(
      new TypeError(
        `Unexpected argument type: ${typeof getter}`,
      ),
    )
  },
  {
    boolean: {
      getter: true,
    },
    number: {
      getter: 123,
    },
  },
)
