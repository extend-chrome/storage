import * as context from '../../src/store.context'
import { initStore } from '../../src/main'

describe('store setup on options or popup page', () => {
  test('initStore should throw', () => {
    context.isBackgroundPage = jest.fn(() => false)

    expect(() => initStore({ apples: 2 })).toThrow()

    expect(context.isBackgroundPage).toBeCalled()
  })
})
