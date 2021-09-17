import {message} from 'message-content'
import {ToContentMessage} from 'message-types'
import {NextModule} from 'moduleBase'
import {isAuthenticated} from 'navigation'

function createElement(): HTMLProgressElement {
  const progress = html`<progress id="n-ext-progressbar" hidden />`
  document.body.prepend(progress)
  return $('#n-ext-progressbar')
}

function registerHooks(el: HTMLProgressElement) {
  message.on(ToContentMessage.beforePaginationChange, () => {
    el.removeAttribute('hidden')
  })
  message.on(ToContentMessage.paginationChanged, () => {
    el.setAttribute('hidden', '')
  })
}

const loadingIndicator: NextModule = {
  name: 'loadingIndicator',
  shouldInitialize() {
    return isAuthenticated()
  },
  initialize() {
    const el = createElement()
    registerHooks(el)
  },
}

export default loadingIndicator
