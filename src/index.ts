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

  const initialized: string[] = []
  for (const md of modules) {
    if (md.shouldInitialize()) {
      md.initialize()
      initialized.push(md.name)
    }
  }
  
  console.info({initialized})
})()
