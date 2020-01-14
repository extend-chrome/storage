import cases from 'jest-in-case'
import { useBucket } from '../../src/bucket'
import { Bucket, bucketName } from './setup'

beforeEach(jest.clearAllMocks)

cases<{ getter: any }>(
  'throws with wrong getter types',
  ({ getter }) => {
    const bucket = useBucket<Bucket>('local', bucketName)

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
