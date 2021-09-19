import type {NextModule} from 'lib/moduleBase'
import {isAuthenticated} from 'lib/navigation'

const originalTitle = document.title

function setTitle() {
  const pageSubitle = $('h1')?.textContent
  if (pageSubitle) {
    document.title = `${pageSubitle} - ${originalTitle}`
  }
}

// TODO hook into page events instead?
function repeatSetTitle() {
  setInterval(setTitle, 750)
}

/**
 * Add current page subtitle to document title.
 */
const setPageTitle: NextModule = {
  name: 'setPageTitle',
  shouldInitialize() {
    return isAuthenticated()
  },
  initialize() {
    setTitle()
    repeatSetTitle()
  },
}

export default setPageTitle
