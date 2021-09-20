import type {
  MessageListener,
  FilteredListener,
  ToContentMessage,
  ToBackgroundMessage,
} from './messageTypes'

const listeners: Partial<Record<ToContentMessage, FilteredListener[]>> = {}

const message = {
  on(msg: ToContentMessage, listener: MessageListener) {
    const registered: FilteredListener = {
      listener,
      filtered: message => message === msg.toString() && listener(),
    }
    browser.runtime.onMessage.addListener(registered.filtered)

    if (!listeners[msg]) {
      listeners[msg] = []
    }
    listeners[msg].push(registered)
  },

  off(msg: ToContentMessage, listener: MessageListener | null = null) {
    if (!listener) {
      // Clear all listeners for `msg`
      for (const flt of listeners[msg]) {
        browser.runtime.onMessage.removeListener(flt.filtered)
      }
      listeners[msg] = []
      return true
    }
    if (!listeners[msg] || !listeners[msg].length) {
      return true
    }
    const idx = listeners[msg].findIndex(f => f.listener === listener)
    if (idx === -1) {
      return false
    }
    browser.runtime.onMessage.removeListener(listeners[msg][idx].filtered)
    listeners[msg].splice(idx, 1)
    return true
  },

  send(msg: ToBackgroundMessage) {
    browser.runtime.sendMessage(msg.toString())
  },
}

export {message}
export * from './messageTypes'
