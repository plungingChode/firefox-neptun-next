import type {NeptunLanguage} from 'navigation'

import {NextModule} from 'moduleBase'
import {getPageLanguage, isPage, isPageGroup, NeptunPageGroup} from 'navigation'
import {message} from 'message-content'
import {DateTime} from 'luxon'

const mailTable = '#c_messages_gridMessages_bodytable'
const lux_format: Record<NeptunLanguage, string> = {
  'hu-HU': 'yyyy. MM. dd. H:mm:ss',
  'en-GB': 'dd/MM/yyyy HH:mm:ss',
  'de-DE': 'dd.MM.yyyy HH:mm:ss', // TODO ?
}
const today = DateTime.now().startOf('day')

function parseDate(date: string): DateTime {
  return DateTime.fromFormat(date, lux_format[getPageLanguage()])
}

function formatRows() {
  const rows = $$(`${mailTable} > tbody > tr`)
  const locale = getPageLanguage()

  for (const row of rows) {
    // Set unread flags
    // Unread icon is an image named "message_unread.png"
    const unreadImg = row.$('td:nth-child(6) > img') as HTMLImageElement
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
  message.on('paginationChanged', () => formatRows())
  message.on('filterChanged', () => {
    formatRows()
    fixFilterSwitch()
  })
}

function fixSelection() {
  const rows = $$(`${mailTable} > tbody > tr`)
  const selectAll = $('#chkall') as HTMLInputElement

  selectAll.addEventListener('change', e => {
    rows.forEach(row => row.setAttribute('data-selected', selectAll.checked.toString()))
  })

  for (const row of rows) {
    row.$('input[type=checkbox]').addEventListener('change', e => {
      const cb = e.target as HTMLInputElement

      selectAll.checked = selectAll.checked && cb.checked
      row.setAttribute('data-selected', cb.checked.toString())
    })

    // Make entire row (sender, subject, date) clickable
    const openMailAction = row.$('span.link').getAttribute('onclick')
    const shouldBeClickable = row.$$('td:nth-child(5),td:last-child')
    shouldBeClickable.forEach(cell => cell.setAttribute('onclick', openMailAction))
  }

  // TODO move #chkall to a visible location
}

function fixFilterSwitch() {
  const filterInputs = $$('[id^=upFilter_rblMessageTypes_]')
  const submitButton = $('#upFilter_expandedsearchbutton')

  filterInputs.forEach(inp => {
    inp.addEventListener('change', e => {
      if ((e.target as HTMLInputElement).checked) {
        // Notify background script that the next main.aspx request
        // will be a filter change
        message.send('prepareFilterChange')
        submitButton.click()
      }
    })
  })
}

const fixMailbox: NextModule = {
  name: 'fixMailbox',
  shouldInitialize() {
    return isPageGroup(NeptunPageGroup.mail)
  },
  initialize() {
    // transformSearchBar()
    // formatRows()
    addOnChangeHandlers()
    fixSelection()
    fixFilterSwitch()
  },
}

export default fixMailbox
