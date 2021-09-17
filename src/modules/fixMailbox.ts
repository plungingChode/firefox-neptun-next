import {NextModule} from 'moduleBase'
import {isPage, isPageGroup, NeptunPageGroup} from 'navigation'

function transformSearchBar() {
  const searchFieldDropdown = $('#c_messages_gridMessages_searchcolumn')
  const searchFilter = $('#c_messages_gridMessages_searchtext')
  const searchSubmit = $('#c_messages_gridMessages_searchsubmit')
}

function setUnreadFlags() {
  const rows = $$('#c_messages_gridMessages_bodytable > tbody > tr')

  for (const row of rows) {
    // Unread icon is an image named "message_unread.png"
    const unreadImg = row.$('td:nth-child(6) > img') as HTMLImageElement
    if (unreadImg.src.indexOf('unread') !== -1) {
      row.setAttribute('data-unread', '')
    }
  }
}

function addOnChangeHandlers() {
  const pageSizeDropdown = $('#c_messages_gridMessages_ddlPageSize')
  const pageLinks = $$('.pagerlink')

  pageSizeDropdown.addEventListener('change', setUnreadFlags)
  pageLinks.forEach(a => a.addEventListener('click', setUnreadFlags))
}

const fixMailbox: NextModule = {
  name: 'fixMailbox',
  shouldInitialize() {
    console.log(isPageGroup(NeptunPageGroup.mail))
    return isPageGroup(NeptunPageGroup.mail)
  },
  initialize() {
    // transformSearchBar()
    setUnreadFlags()
    addOnChangeHandlers()
  },
}

export default fixMailbox
