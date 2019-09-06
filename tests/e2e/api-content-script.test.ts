import * as path from 'path'
import delay from 'delay'

import { Browser, Target, Page, launch } from 'puppeteer'

import * as tests from './extension-src/tests'

import { buildExtension } from './extension-setup'
const { options } = require('./extension-src/rollup.config')

let browser: Browser
let backgroundTarget: Target
let backgroundPage: Page
let contentTarget: Target
let contentPage: Page

const pathToExtension = path.join(__dirname, 'extension-build')
options.output.dir = pathToExtension

beforeAll(async () => {
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
  contentTarget = await browser.waitForTarget(
    (t: Target) => t.url() === tests.contentUrl,
  )

  await delay(500)

  backgroundPage = await backgroundTarget.page()
  contentPage = await contentTarget.page()
})

afterAll(async () => {
  await browser.close()
})

describe('content scripts', () => {
  test('send to tab', async () => {
    expect(contentPage).toBeDefined()

    const message = { greeting: 'message' }

    let ctResults: string[] = []
    contentPage.on('console', (consoleMessage) => {
      ctResults.push(consoleMessage.text())
    })

    const bgResult = await backgroundPage.evaluate(
      (m) => tests.testSendToTab(m),
      message,
    )

    expect(bgResult).toBeUndefined()
    expect(ctResults).toContain(message.greeting)
  })

  test('async send to tab', async () => {
    expect(contentPage).toBeDefined()

    const message = { greeting: 'message' }

    let ctResults: string[] = []
    contentPage.on('console', (consoleMessage) => {
      ctResults.push(consoleMessage.text())
    })

    const bgResult = await backgroundPage.evaluate(
      (m) => tests.testAsyncSendToTab(m),
      message,
    )

    expect(bgResult).toEqual(tests.contentResponse)
    expect(ctResults).toContain(message.greeting)
  })
})
