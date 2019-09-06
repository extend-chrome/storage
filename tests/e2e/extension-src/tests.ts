import {
  messages,
  onMessage,
  sendMessage,
} from '../../../src/index'

/* -------------------------------------------- */
/*                test simple api               */
/* -------------------------------------------- */

/* ----------- send one-way message ----------- */

export const testOn = () => {
  return new Promise((resolve) => {
    messages.on((message) => {
      resolve(message)
    })
  })
}

export const testSend = (message: any) => messages.send(message)

/* ------------ send async message ------------ */

export const testAsyncOn = (response: any) => {
  return new Promise((resolve) => {
    messages.asyncOn((message, sender, respond) => {
      respond(response)
      resolve(message)
    })
  })
}

export const testAsyncSend = (message: any) =>
  messages.asyncSend(message)

/* -------------------------------------------- */
/*                test chrome api               */
/* -------------------------------------------- */

/* ------- send one-way targeted message ------ */

export const testOnMessage = (options: any) => {
  return new Promise((resolve) => {
    onMessage.addListener((message) => {
      resolve(message)
    }, options)
  })
}

export const testSendMessage = (message: any, options: any) =>
  sendMessage(message, options)

/* -------- send async targeted message ------- */

export const testAsyncOnMessage = (
  response: any,
  options: any,
) => {
  return new Promise((resolve) => {
    onMessage.addListener((message, sender, respond) => {
      // respond will be defined b/c async == true
      respond && respond(response)
      resolve(message)
    }, options)
  })
}

export const testAsyncSendMessage = (
  message: any,
  options: any,
) => sendMessage(message, options)

/* -------------------------------------------- */
/*            test in content scripts           */
/* -------------------------------------------- */

export const contentUrl =
  'http://www.brainjar.com/java/host/test.html'

/* ------------- test send to tab ------------- */

// Will be in background page
export const testSendToTab = (message: any) => {
  const id = (window as any).newTab.id
  console.time('sending message')

  return messages
    .send(message, id)
    .then(() => {
      console.timeEnd('sending message')
      console.log(chrome.runtime.lastError)
    })
    .catch(({ message }) => {
      console.error(message)
      throw `${message} id: ${id}`
    })
}

// Will be in content script
export const testOnInTab = () => {
  messages.on((message, sender) => {
    console.log(message.greeting)
  })
}

/* ---------- test async sent to tab ---------- */

export const contentResponse = {
  greeting: 'contentResponse',
}

// Will be in background page
export const testAsyncSendToTab = (message: any) => {
  const id = (window as any).newTab.id

  return messages.asyncSend(message, id).catch(({ message }) => {
    throw `${message} Tab id: ${id}`
  })
}

// Will be in content script
export const testAsyncOnInTab = () => {
  messages.asyncOn((message, sender, respond) => {
    document.body.append(message.greeting)
    console.log(message.greeting)
    console.log(contentResponse)
    respond(contentResponse)
  })
}
