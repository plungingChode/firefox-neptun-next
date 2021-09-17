import {isNeptunDomain, isPageGroup, isPage, NeptunPage, NeptunPageGroup} from './navigation'
import {message} from './message-background'
import {ToContentMessage} from 'message-types'
import css from '../scss/index.scss'

enum Action {
  paginationChange,
}
const webRequestActions: Record<Action, RegExp> = {
  [Action.paginationChange]: /.*handlerequest.ashx.*|main.aspx.*/i,
}
function isAction(action: Action, url: string) {
  return webRequestActions[action].test(url)
}

// Intercept web requests from all domains, filter for Neptun later (since they
// have a strange subdomain naming scheme)
const filter: browser.webRequest.RequestFilter = {
  urls: ['https://*/*'],
}
browser.webRequest.onCompleted.addListener(({url, tabId}) => {
  // Discard non-Neptun.NET requests
  if (!isNeptunDomain(url)) {
    return
  }

  if (isAction(Action.paginationChange, url)) {
    message.send(tabId, ToContentMessage.paginationChanged)
  }
}, filter)

browser.webRequest.onBeforeRequest.addListener(({url, tabId}) => {
  if (!isNeptunDomain(url)) {
    return
  }

  if (isAction(Action.paginationChange, url)) {
    message.send(tabId, ToContentMessage.beforePaginationChange)
  }
}, filter)

browser.tabs.onUpdated.addListener((tabId, info) => {
  // Inject custom CSS into Neptun pages
  if (info.status === 'loading' && isNeptunDomain(info.url)) {
    console.log('Add custom CSS')
    browser.tabs.insertCSS(tabId, {code: css})
  }
})

// Block default images/CSS
browser.webRequest.onBeforeRequest.addListener(({type, url}) => {
  // Don't interfere with non-neptun pages
  if (!isNeptunDomain(url)) {
    return
  }

  // Allow specific images through
  const whitelist = [
    /favicon.ico$/,
    /login_logo.png$/
  ]
  if (type === 'image' && whitelist.some(rx => rx.test(url))) {
    return
  }

  // Block other images and all CSS
  if (type === 'image' || type === 'stylesheet') {
    return {cancel: true}
  }
}, filter, ['blocking']);
