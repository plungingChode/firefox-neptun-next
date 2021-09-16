import type {NextModule} from './moduleBase'

import customStyle from './modules/customStyle'
import transformLogin from './modules/transformLogin'

// prettier-ignore
const modules: NextModule[] = [
  customStyle,
  transformLogin
]

;(() => {
  const rx_neptun = /^http(s)?:\/\/neptun.*?\..*?\..*?\/(oktato|hallgato).*$/
  if (!rx_neptun.test(window.location.href)) {
    return
  }

  for (const md of modules) {
    if (md.shouldInitialize()) {
      md.initialize()
    }
  }
})()
