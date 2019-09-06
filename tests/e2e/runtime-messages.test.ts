import * as path from 'path'
import delay from 'delay'

import { Browser, Target, Page, launch } from 'puppeteer'

import { buildExtension } from './extension-setup'
const { options } = require('./extension-src/rollup.config')

let browser: Browser
let backgroundTarget: Target
let optionsTarget: Target
let backgroundPage: Page
let optionsPage: Page

const pathToExtension = path.join(__dirname, 'extension-build')
options.output.dir = pathToExtension

beforeAll(async () => {
  await buildExtension(options)
})

beforeEach(async () => {
  await buildExtension(options)

  await delay(500)

  browser = await launch({
    headless: false,
    args: [
      '--disable-component-extensions-with-background-pages',
      `--disable-extensions-except=${pathToExtension}`,
      `--load-extension=${pathToExtension}`,
    ],
  })

  backgroundTarget = await browser.waitForTarget(
    (t: Target) => t.type() === 'background_page',
  )
  optionsTarget = await browser.waitForTarget((t: Target) =>
    t.url().endsWith('options.html'),
  )

  await delay(500)

  backgroundPage = await backgroundTarget.page()
  optionsPage = await optionsTarget.page()
})

afterEach(async () => {
  await browser.close()
})

describe('chrome.runtime', () => {
  test('basic messaging', async () => {
    const message = { greeting: 'message' }
    const response = { greeting: 'response' }

    const results = await Promise.all([
      backgroundPage.evaluate(onMessage, response),
      optionsPage.evaluate(sendMessage, message),
    ])

    expect(results[0]).toEqual(message)
    expect(results[1]).toEqual(response)
  })

  test.todo('multiple listeners, one response')
  test.todo('multiple listeners, no response')
  test.todo('multiple listeners, two responses')
})

describe('chrome.tabs', () => {
  test.todo('basic messaging')

  test.todo('multiple listeners, one response')
  test.todo('multiple listeners, no response')
  test.todo('multiple listeners, two responses')
})

// TODO: factor out into tests.ts
function onMessage(response: any) {
  return new Promise((resolve) => {
    chrome.runtime.onMessage.addListener(
      (message, sender, sendResponse) => {
        sendResponse(response)
        resolve(message)
        return true
      },
    )
  })
}

// TODO: factor out into tests.ts
function sendMessage(message: any) {
  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      resolve(response)
    })
  })
}
