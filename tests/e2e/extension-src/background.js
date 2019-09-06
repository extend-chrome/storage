import * as tests from './tests.js'
import chromep from 'chrome-promise'

window.tests = tests

chromep.runtime.openOptionsPage()
chromep.tabs.create({ url: tests.contentUrl }).then((tab) => {
  window.newTab = tab
})
