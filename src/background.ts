import {isNeptunDomain, isPageGroup, isPage, NeptunPage, NeptunPageGroup} from './navigation'
import {message} from './message-background'
import css from '../scss/index.scss'

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

let nextRequest: PreparableRequest | null = null
let ignoreUrl: string | null = null

// TODO what about concurrent requests?
message.on('prepareFilterChange', () => (nextRequest = 'filterChange'))
message.on('prepareKeepAlive', () => (nextRequest = 'ignored'))

// Intercept web requests from all domains, filter for Neptun later (since they
// have a strange subdomain naming scheme)
const filter = {urls: ['https://*/*']}
browser.webRequest.onCompleted.addListener(({method, url, tabId}) => {
  // Discard non-Neptun.NET requests
  if (!isNeptunDomain(url)) {
    return
  }

  if (url === ignoreUrl) {
    console.log('ignored', url)
    return
  }
  if (isAction('paginationChange', url)) {
    message.send(tabId, 'paginationChanged')
  }
  if (nextRequest === 'filterChange' && isAction('generic', url)) {
    message.send(tabId, 'filterChanged')
  }
  nextRequest = null
}, filter)

browser.webRequest.onBeforeRequest.addListener(({url, tabId}) => {
  if (!isNeptunDomain(url)) {
    return
  }
  if (nextRequest === 'ignored') {
    console.log('will be ignored', url)
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
