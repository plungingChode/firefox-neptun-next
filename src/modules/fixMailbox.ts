import type {NeptunLanguage} from 'navigation'

import {NextModule} from 'moduleBase'
import {getPageLanguage, isPage, NeptunPage, isPageGroup, NeptunPageGroup} from 'navigation'
import {message} from 'message-content'
import {DateTime} from 'luxon'

const mailTable = '#c_messages_gridMessages_bodytable'
const mailTableContainer = '#c_messages_gridMessages_grid_body_div'

const luxonFormats: Record<NeptunLanguage, string> = {
  'hu-HU': 'yyyy. MM. dd. TT',
  'en-GB': 'M/d/yyyy tt',
  'de-DE': 'dd.MM.yyyy TT', // TODO ?
}
const today = DateTime.now().startOf('day')

function parseDate(date: string): DateTime {
  return DateTime.fromFormat(date, luxonFormats[getPageLanguage()])
}

// Shouldn't be done through CSS, since elements with these classes/ids
// need to be visible elsewhere
function hideUnnecessary() {
  const toHide = [
    // Default filter fields
    '.function_table > tbody > tr:nth-child(3)',
    // Add to favorites + new mail command buttons
    '.function_table > tbody > tr:nth-child(4)',
    // "Operations:" labels
    '.FunctionCommandTitle',
    // "Inbox" caption (shown in page title)
    '#function_tableheader'
  ]
  $$(toHide.join()).forEach(el => el.setAttribute('hidden', ''))
}

function formatRows() {
  const rows = $$(`${mailTable} > tbody > tr`)
  const locale = getPageLanguage()

  for (const row of rows) {
    const unreadImg = row.$('td:nth-child(6) > img') as HTMLImageElement
    if (!unreadImg) {
      // No results found, cancel formatting
      return
    }
    
    // Set unread flags
    // Unread icon is an image named "message_unread.png"
    if (unreadImg.src.indexOf('unread') !== -1) {
      row.setAttribute('data-unread', '')
    }

    const dateCell = row.$('td:last-child')
    const deliveryDate = parseDate(dateCell.textContent)
    let format: Intl.DateTimeFormatOptions
    if (deliveryDate.hasSame(today, 'day')) {
      format = {hour: '2-digit', minute: '2-digit'}
    } else if (deliveryDate.hasSame(today, 'year')) {
      format = {month: 'short', day: '2-digit'}
    } else {
      format = {year: 'numeric', month: 'short', day: '2-digit'}
    }

    dateCell.textContent = deliveryDate.toLocaleString(format, {locale})
  }
}

function addOnChangeHandlers() {
  // Filter- and pagination change reloads the page (for some reason), so we need
  // to reapply formatting/event handlers
  message.on('paginationChanged', () => {
    hideUnnecessary()
    formatRows()
    fixSelection()
    fixFilterSwitch()
    cloneNewMessageButton()

    fixHeader()
    fixSearchBar()
  })
  message.on('filterChanged', () => {
    hideUnnecessary()
    formatRows()
    fixSelection()
    fixFilterSwitch()
    cloneNewMessageButton()

    fixHeader()
    fixSearchBar()
  })
}

function fixSelection() {
  const rows = $$(`${mailTable} > tbody > tr`)
  const selectAll = $('#chkall') as HTMLInputElement
  const selectAllProxy = tag`<input type="checkbox" />` as HTMLInputElement

  selectAllProxy.addEventListener('click', e => {
    selectAll.click()
  })
  selectAll.addEventListener('change', e => {
    rows.forEach(row => row.setAttribute('data-selected', selectAll.checked.toString()))
  })

  for (const row of rows) {
    row.$('input[type=checkbox]')?.addEventListener('change', e => {
      const cb = e.target as HTMLInputElement

      selectAll.checked = selectAll.checked && cb.checked
      selectAllProxy.checked = selectAll.checked

      row.setAttribute('data-selected', cb.checked.toString())
    })

    // Make entire row (sender, subject, date) clickable
    const openMailAction = row.$('span.link')?.getAttribute('onclick')
    const shouldBeClickable = row.$$('td:nth-child(5),td:last-child')
    shouldBeClickable.forEach(cell => cell.setAttribute('onclick', openMailAction))
  }

  // Move select all before delete button
  $('#function_delete0').before(selectAllProxy)
}

function fixFilterSwitch() {
  //prettier-ignore
  const [personal, automated, all] = [...$$('[id^=upFilter_rblMessageTypes_]')] as HTMLInputElement[]
  const submitButton = $('#upFilter_expandedsearchbutton')
  const target = tag`<div class="filters" />`
  $('#c_messages_gridMessages_grid_body_div').before(target)

  // Reorder filters
  for (const inp of [all, personal, automated]) {
    const label = inp.nextElementSibling
    const inpProxy = tag`
      <div 
        tabindex="0" 
        class="filter filter-${inp.id}" 
        data-active="${inp.checked}"
      >
        <span>${label.textContent}</span>
      </div>
    `

    // Forward click to original input
    inpProxy.addEventListener('click', e => {
      inp.click()
    })

    // Refresh mailbox automatically on change
    inp.addEventListener('change', e => {
      if ((e.target as HTMLInputElement).checked) {
        // Notify background script that the next main.aspx request
        // will be a filter change
        message.send('prepareFilterChange')
        submitButton.click()
      }
    })

    target.append(inpProxy)
  }
}

function cloneNewMessageButton() {
  const btn = $('#upFunctionCommand_lbtn_new').cloneNode(true) as HTMLElement
  const deleteBtn = $('#function_delete0')

  btn.classList.add('nt-button', 'primary')
  deleteBtn.classList.add('nt-button', 'secondary')

  deleteBtn.before(btn)
}

// TODO execute on window resize
// Should be initialized after filters' transformation
function fixHeader() {
  const filters = $('.filters')
  const rowContainer = $(mailTableContainer)

  const rf = filters.getBoundingClientRect()

  // TODO this isn't very exact, why 40?
  rowContainer.style.height = window.innerHeight - (rf.y + rf.height) - 40 + 'px';
}

function fixSearchBar() {
  const dropdown = $('#c_messages_gridMessages_searchcolumn')
  const textbox = $('#c_messages_gridMessages_searchtext')
  const submitBtn = $('#c_messages_gridMessages_searchsubmit')

  dropdown.classList.add('nt-dropdown', 'secondary', 'nt-input-left')
  textbox.classList.add('nt-textbox', 'nt-input-middle')
  submitBtn.classList.add('nt-button', 'secondary', 'nt-input-right')

  const newContainer = tag`
    <td>
      <div class="nt-input-row" id="inbox-search-bar"></div>
    </td>
  `

  $('.grid_topfunctionpanel').after(newContainer)
  newContainer.$('div').append(dropdown, textbox, submitBtn)
}

const fixMailbox: NextModule = {
  name: 'fixMailbox',
  shouldInitialize() {
    return isPage(NeptunPage.inbox)
  },
  initialize() {
    hideUnnecessary()
    addOnChangeHandlers()

    formatRows()
    fixSelection()
    fixSearchBar()
    fixFilterSwitch()
    cloneNewMessageButton()

    // Need to wait for layout
    setTimeout(() => fixHeader())

    // TODO add page size dropdown somewhere
  },
}

export default fixMailbox
