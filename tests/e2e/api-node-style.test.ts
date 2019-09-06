import * as path from 'path'
import delay from 'delay'

import { Browser, Target, Page, launch } from 'puppeteer'

import * as tests from './extension-src/tests'

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

afterAll(async () => {
  await browser.close()
})

test('send one-way message', async () => {
  const message = { greeting: 'message' }

  const [bgResult, opResult] = await Promise.all([
    backgroundPage.evaluate(() => tests.testOn()),
    optionsPage.evaluate((m) => tests.testSend(m), message),
  ])

  expect(bgResult).toEqual(message)
  expect(opResult).toBeUndefined()
})

test('send async message', async () => {
  const message = { greeting: 'message' }
  const response = { greeting: 'response' }

  const [bgResult, opResult] = await Promise.all([
    backgroundPage.evaluate(
      (r) => tests.testAsyncOn(r),
      response,
    ),
    optionsPage.evaluate((m) => tests.testAsyncSend(m), message),
  ])

  expect(bgResult).toEqual(message)
  expect(opResult).toEqual(response)
})
