import {ToContentMessage} from './message-types'

const message = {
  send(tabId: number, msg: ToContentMessage) {
    browser.tabs.sendMessage(tabId, msg.toString())
  },
}

export {message}
export * from './message-types'
