import type {NextModule} from './moduleBase'

import {isNeptunDomain} from './navigation'

import customStyle from './modules/customStyle'
import transformLogin from './modules/transformLogin'
import infiniteSession from './modules/infiniteSession'
import transformHeader from './modules/transformHeader'
import fixMailbox from './modules/fixMailbox'

// prettier-ignore
const modules: NextModule[] = [
  // Single global stylesheet
  customStyle,

  // Login page
  transformLogin,

  // All authenticated pages
  infiniteSession,
  transformHeader,

  // Specific pages
  fixMailbox
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

  console.info(initialized)
})()
