import type {NextModule} from './moduleBase'

import {isNeptunDomain} from 'navigation'

import customStyle from './modules/customStyle'
import transformLogin from './modules/transformLogin'
import infiniteSession from 'modules/infiniteSession'

// prettier-ignore
const modules: NextModule[] = [
  customStyle,
  transformLogin,
  infiniteSession
]

;(() => {
  if (!isNeptunDomain()) {
    return
  }

  for (const md of modules) {
    if (md.shouldInitialize()) {
      md.initialize()
    }
  }
})()
