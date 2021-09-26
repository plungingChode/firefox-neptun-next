import type {ToContentMessage} from 'lib/backgroundMessenger'

import {isNeptunDomain, isPageGroup, isPage, NeptunPage, NeptunPageGroup} from 'lib/navigation'
import {message} from 'lib/backgroundMessenger'
import css from '../scss/index.scss'

const debug = console.log

// prettier-ignore
type Action = 
  | 'paginationChange' 
  | 'generic'

const webRequestActions: Record<Action, RegExp> = {
  paginationChange: /handlerequest\.ashx|main\.aspx\?ismenclick=true&ctrl=.*/i,
  generic: /main\.aspx/i,
}
function isAction(action: Action, url: string) {
  return webRequestActions[action].test(url)
}

// prettier-ignore
type PreparableRequest = 
  | 'filterChange'
  | 'ignored'
  | 'modalOpen'
  | 'tabChange'

let nextRequest: PreparableRequest | null = null
let ignoreUrl: string | null = null

// TODO what about concurrent requests?
message.on('prepareFilterChange', () => (nextRequest = 'filterChange'))
message.on('prepareKeepAlive', () => (nextRequest = 'ignored'))
message.on('prepareModalOpen', () => (nextRequest = 'modalOpen'))
message.on('prepareAjaxTabChange', () => (nextRequest = 'tabChange'))

// Intercept web requests from all domains, filter for Neptun later (since they
// have a strange subdomain naming scheme)
const filter = {urls: ['https://*/*']}
browser.webRequest.onCompleted.addListener(({method, url, tabId}) => {
  // Discard non-Neptun.NET requests
  if (!isNeptunDomain(url)) {
    return
  }

  if (url === ignoreUrl) {
    return
  }
  if (isAction('paginationChange', url)) {
    message.send(tabId, 'paginationChanged')
  }
  if (isAction('generic', url)) {
    let reply: ToContentMessage | null = null

    switch (nextRequest) {
      case 'filterChange':
        reply = 'filterChanged'
        break
      case 'modalOpen':
        reply = 'modalOpened'
        break
      case 'tabChange':
        reply = 'ajaxTabChanged'
        break
    }

    if (reply) {
      message.send(tabId, reply)
      nextRequest = null
      return
    }
  }

  nextRequest = null
}, filter)

browser.webRequest.onBeforeRequest.addListener(({url, tabId}) => {
  if (!isNeptunDomain(url)) {
    return
  }
  if (nextRequest === 'ignored') {
    ignoreUrl = url
    nextRequest = null
    return
  }

  if (isAction('paginationChange', url)) {
    message.send(tabId, 'beforePaginationChange')
  }
}, filter)

browser.tabs.onUpdated.addListener((tabId, info) => {
  // Inject custom CSS into Neptun pages
  if (info.status === 'loading' && isNeptunDomain(info.url)) {
    browser.tabs.insertCSS(tabId, {code: css})
    message.send(tabId, 'pageLoaded')
    nextRequest = null
  }
})

// Block default images/CSS
browser.webRequest.onBeforeRequest.addListener(
  ({type, url}) => {
    // Don't interfere with non-neptun pages
    if (!isNeptunDomain(url)) {
      return
    }

    // Allow specific images through
    const whitelist = [/favicon.ico$/, /login_logo.png$/]
    if (type === 'image' && whitelist.some(rx => rx.test(url))) {
      return
    }

    // Block other images and all CSS
    if (type === 'image' || type === 'stylesheet') {
      return {cancel: true}
    }

    // Left widget lists are not displayed anyway, block their
    // sorting order info
    if (/GetLeftGadgetSortedList$/.test(url)) {
      return {cancel: true}
    }
  },
  filter,
  ['blocking']
)
