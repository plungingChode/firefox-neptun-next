import type {NextModule} from 'lib/moduleBase'

import {isNeptunDomain} from 'lib/navigation'

import transformLogin from 'modules/transformLogin'
import infiniteSession from 'modules/infiniteSession'
import transformHeader from 'modules/transformHeader'
import fixMailbox from 'modules/fixMailbox'
import loadingIndicator from 'modules/loadingIndicator'
import setPageTitle from 'modules/setPageTitle'

// prettier-ignore
const modules: NextModule[] = [
  // Login page
  transformLogin,

  // All authenticated pages
  setPageTitle,
  loadingIndicator,
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
  const errored: string[] = []
  for (const md of modules) {
    if (md.shouldInitialize()) {
      try {
        md.initialize()
        initialized.push(md.name)
      } catch (err) {
        console.error(err);
        errored.push(md.name)
      }
    }
  }

  console.info({initialized, errored})
})()
