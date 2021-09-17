import 'dom'
import {NextModule} from 'moduleBase'
import {isAuthenticated, isPageGroup, NeptunPageGroup} from '../navigation'

/**
 * Remove unnecessary elements from the default header and replace it with a
 * more concise one.
 */
async function replaceHeader() {
  const trainingChangeHref = "javascript:__doPostBack('SDAUpdatePanel1$lbtnChangeTraining','')"
  const logoutAction = 'DoLogOut(-1);return false;'

  // Extract relevant training information (course + degree)
  let training = $('#lblTrainingName').textContent
  training = training.substring(0, training.indexOf(' -'))

  const userName = $('#upTraining_topname').textContent
  const logoutCaption = $('#lbtnQuit').textContent

  // Specific element required to avoid errors
  const logoutTimer = $('#upTraining_lblRemainingTime')

  // TODO change #upTraining_topname to something sensible (currently needed
  // for compatibility)
  const header = html`
    <header id="page-header">
      <span id="upTraining_topname">${userName},</span>
      <a id="training" href="${trainingChangeHref}">${training}</a>
      <a id="logout-btn" href="#" onclick="${logoutAction}">${logoutCaption}</a>
    </header>
    <nav id="main-menu"></nav>
  `

  const oldHeader = $('#mainPageHeader')
  oldHeader.after(...header)
  oldHeader.remove()

  // Move main menu after header
  $('#main-menu').append($('#mb1'))
}

/**
 * Designate the element with `shortcutId` as a shortcut for `targetId`.
 */
function createShortcut(shortcutId: string, targetId: string) {
  const shortcut = $(`${shortcutId} > span`)
  const target = $(targetId)

  shortcut.classList.add('menu-item')
  shortcut.addEventListener(
    'click',
    () => (window.location.search = target.getAttribute('targeturl'))
  )
  shortcut.addEventListener('mouseenter', () => target.classList.add('menu-hover'))
  shortcut.addEventListener('mouseleave', () => target.classList.remove('menu-hover'))
}
function addShortcuts() {
  createShortcut('#mb1_Tanulmanyok', '#mb1_Tanulmanyok_Leckekonyv')
  createShortcut('#mb1_Targyak', '#mb1_Targyak_Targyfelvetel')
  createShortcut('#mb1_Vizsgak', '#mb1_Vizsgak_Vizsgajelentkezes')
  createShortcut('#mb1_Mail', '#Mail-Inbox')
}

/**
 * Move the timetable menu item to the main menu.
 */
function moveTimetable() {
  const timetable = $('#mb1_Tanulmanyok_Órarend')
  $('#mb1_Targyak').before(timetable)

  timetable.classList.add('menu-parent')
  timetable.addEventListener(
    'click',
    () => (window.location.search = timetable.getAttribute('targeturl'))
  )
}

/**
 * Add a link to Meet Street / Neptun to the main menu.
 */
function addMeetStreetToggle() {
  const isNeptun = $('#upChooser_chooser_neptun').classList.contains('NeptunChooserSelected')

  let menuItem = {target: '', caption: ''}
  if (isNeptun) {
    menuItem = {target: 'btnKollab', caption: 'Meet Street'}
  } else {
    menuItem = {target: 'btnNeptun', caption: 'Neptun'}
  }

  // Add item to main menu. Link is wrapped in a <span>, since styling depends
  // on an inner <span> element (see /scss/_header.scss)
  // prettier-ignore
  const toggle = html`
    <li class="separator" tabindex="-1"></li>
    <li class="menu-parent menu-item">
      <span>
        <a href="javascript:__doPostBack('upChooser$${menuItem.target}','')">
          ${menuItem.caption}
        </a>
      </span>
    </li>
  `
  $('#mb1').append(...toggle)
}

/** A list of main menu item IDs with the corresponding page group regex */
const pageGroups: Record<string, NeptunPageGroup> = {
  '#mb1_Sajatadatok': NeptunPageGroup.personalData,
  '#mb1_Tanulmanyok': NeptunPageGroup.studies,
  '#mb1_Tanulmanyok_Órarend': NeptunPageGroup.timetable,
  '#mb1_Targyak': NeptunPageGroup.courses,
  '#mb1_Vizsgak': NeptunPageGroup.exams,
  '#mb1_Penzugyek': NeptunPageGroup.finances,
  '#mb1_Informacio': NeptunPageGroup.information,
  '#mb1_Ügyintezes': NeptunPageGroup.administration,
  '#mb1_Mail': NeptunPageGroup.mail,
}
function setActivePage() {
  for (const id in pageGroups) {
    if (isPageGroup(pageGroups[id])) {
      $(id).classList.add('active')
      return
    }
  }
}

function prepareIcons() {
  for (const id in pageGroups) {
    $(id).classList.add('menu-icon')
  }
}

/**
 * Replace the `Mail` gadget with an entry in the main menu
 */
function addMailMenu() {
  // Title of the mail gadget (no ID, but comes after its `ColorBtn`)
  const mailTitle = $('#upBoxes_upMessage_gdgMessage_gdgMessage_ColorBtn').nextElementSibling
    .textContent

  // Add data attribute if there's unread mail
  const inboxLink = $('#_lnkInbox')
  const inboxLinkCS = getComputedStyle(inboxLink)
  const hasUnread = parseInt(inboxLinkCS.fontWeight) > 500 ? 'data-unread' : ''

  // Extract relevant information from mail link
  type LinkData = {name: string; href: string; caption: string}
  function parseLink(name: string): LinkData {
    const link = $('#_lnk' + name) as HTMLLinkElement

    return {
      name: name,
      href: link.href,
      caption: link.textContent,
    }
  }
  // Generate mail menu item
  function createMenuItem({name, href, caption}: LinkData) {
    return `
      <li id="Mail-${name}" class="menu-item" targeturl="${href}">
        <a href="${href}">${caption}</a>
      </li>
    `
  }

  const mailLinks = ['Inbox', 'OutBox', 'Options', 'Directory']
  const menuRoot = tag`
    <li id="mb1_Mail" class="menu-parent" ${hasUnread} role="menuitem" aria-haspopup="true">
      <span class="menu-item"> ${mailTitle} </span>
      <ul class="menu" role="menu">
        ${mailLinks.map(parseLink).map(createMenuItem).join('')}
      </ul>
    </li>
  `

  // Should come after personal information
  $('#mb1_Sajatadatok').after(menuRoot)
  menuRoot.addEventListener('mouseenter', () => ($('#mb1_Mail > ul').style.display = 'block'))
  menuRoot.addEventListener('mouseleave', () => ($('#mb1_Mail > ul').style.display = 'none'))
}

const transformHeaders: NextModule = {
  name: 'transformHeaders',
  shouldInitialize() {
    return isAuthenticated()
  },
  initialize() {
    // Start async tasks
    replaceHeader()

    // Sync tasks in sequence
    moveTimetable()

    // Wrap raw text nodes in a <span> before further
    // transformations
    $$('#mb1 > li').forEach(li => {
      const text = li.childNodes[0].textContent
      li.childNodes[0].replaceWith(tag`<span>${text}</span>`)
    })

    addMeetStreetToggle()
    addMailMenu()

    // Should come after addMailMenu(), since they expect
    // a completed main menu
    addShortcuts()
    prepareIcons()
    setActivePage()
  },
}

export default transformHeaders
