// The login page layout is beyond saving, so this module transforms it into
// something easier to work with and style.

import type {NextModule} from '../moduleBase'
import 'dom'
import {isPage, NeptunPage} from '../navigation';

/** Remove unnecessary parts (parens, exact time, whitespace) of a date string. */
function formatDateString(date: string): string {
  return date
    .replace(/[()]/g, '')
    .replace(/\d{1,2}:\d{1,2}:\d{1,2}\s*(AM|PM)?/, '')
    .trim()
}

type NewsItemData = {subject: string; content: string; date: string}
type DocsItemData = {href: string; content: string}
type LinkItemData = {href: string; content: string}
/**
 * Transform news tables into an unordered list and append it to the
 * `mainContainer` element.
 */
function transformNews(mainContainer: Element) {
  const newsTitle = $('#lblHirek').textContent
  const news = [].slice
    .call($$('#dataListNews table'))
    .map(parseNewsItem)
    .map(createNewsItem)
    .join('')

  const newsEl = html`
    <div class="news login-container">
      <h3>${newsTitle}</h3>
      <ul class="news-list">
        ${news}
      </ul>
    </div>
  `

  mainContainer.append(...newsEl)
}

/** Collect the relevant parts of a news item. */
function parseNewsItem(newsTable: HTMLTableElement): NewsItemData {
  return {
    subject: newsTable.$('.login_news_subject')?.innerHTML,
    content:
      newsTable.$('.login_news_content p')?.innerHTML ||
      newsTable.$('.login_news_content div')?.innerHTML,
    date: newsTable.$('.login_news_date')?.innerHTML,
  }
}

/** Generate the HTML for a transformed news item. */
function createNewsItem({subject, content, date}: NewsItemData) {
  return `
    <li class="news-item">
      <div class="news-header">
        <span class="news-subject">${subject}</span>
        <span class="news-date">${formatDateString(date)}</span>
      </div>
      <div class="news-content">
        ${content}
      </div>
    </li>
  `
}

/**
 * Transform document tables into an unordered list and append it to the
 * `mainContainer` element.
 */
function transformDocuments(container: Element) {
  const docsTitle = $('#lblDokumentumok').textContent
  const docs = [].slice
    .call($$('#dataListDocuments .table_left_docs'))
    .map(parseDocument)
    .map(createDocumentItem)
    .join('')

  const docsEl = html`
    <div class="docs login-container">
      <h3>${docsTitle}</h3>
      <ul class="docs-list">
        ${docs}
      </ul>
    </div>
  `

  container.append(...docsEl)
}

/** Collect the relevant parts of a document item. */
function parseDocument(docTable: HTMLElement): DocsItemData {
  const link = docTable.$('a')

  return {
    href: link.href,
    content: link.textContent,
  }
}

/** Generate the HTML for a transformed document item. */
function createDocumentItem({href, content}: DocsItemData) {
  return `
    <li class="docs-item">
      <a href="${href}" target="_blank" rel="noopener">${content}</a>
    </li>
  `
}

/**
 * Transform link tables into a list and append it to the `mainContainer`
 * element.
 */
function transformLinks(container: Element) {
  const linksTitle = $('#lblLinkek').innerHTML
  const links = [].slice
    .call($$('#dataListLinks .table_left'))
    .map(parseLink)
    .map(createLinkItem)
    .join('')

  const linksEl = html`
    <div class="links login-container">
      <h3>${linksTitle}</h3>
      <div class="links-list">${links}</div>
    </div>
  `
  container.append(...linksEl)
}

/** Collect the relevant parts of a link item. */
function parseLink(linkTable: Element): LinkItemData {
  const link = linkTable.$('a')

  return {
    href: link.href,
    content: link.textContent.trim(),
  }
}

/** Generate the HTML for a transformed link item. */
function createLinkItem({href, content}: LinkItemData) {
  return `<a href="${href}" target="_blank" rel="noopener">${content}</a>`
}

/**
 * Transform the main login form into a more manageable state.
 */
function transformLoginForm(container: Element) {
  const loginForm = $('.login_left_side > table')
  const {moduleType, serverName, langSelect, userName, password, loginButton} =
    parseLoginForm(loginForm)

  // prettier-ignore
  const langButtons = langSelect.options
    .map((lang, idx) => `
      <button 
        data-active="${lang.active}"
        id="btnLang_${idx}" 
        name="btnLang_${idx}" 
        onclick="${lang.action}" 
        title="${lang.caption}"
      />
    `)
    .join("")

  // Extract server name and free space
  const serverParts = /(.*)\((\d*)\)/.exec(serverName)
  const server = serverParts[1]
  const space = serverParts[2]

  // TODO add warning if there's no free space

  const loginEl = html`
    <div class="login login-container">
      <div class="logo"></div>
      <div class="info">
        <span class="module-type">${moduleType} portál</span>
        <span class="server">${server}</span>
        <span class="space">${space} szabad hely</span>
      </div>
      <div class="login-fields">
        <div class="lang-select">${langButtons}</div>
        <div class="login-field username">
          <label for="${userName.field}">${userName.caption}</label>
          <input type="text" id="${userName.field}" name="${userName.field}" />
        </div>
        <div class="login-field password">
          <label for="${password.field}">${password.caption}</label>
          <input
            type="password"
            id="${password.field}"
            name="${password.field}"
          />
        </div>
        <input
          type="button"
          id="btnSubmit"
          class="nt-button primary"
          onclick="${loginButton.action}"
          value="${loginButton.caption}"
        />
      </div>
    </div>
  `

  container.append(...loginEl)
  $('.login-field.username').append(userName.validator)
  $('.login-field.username').append(userName.validatorState)
}

function parseLoginForm(table: Element) {
  const langSelectOptions = [].slice
    .call(table.$$('#td_Zaszlok input'))
    .map((input: HTMLInputElement) => ({
      caption: input.title,
      action: input.getAttribute('onclick').replace(/"/g, "'"),
      active: getComputedStyle(input).opacity === '1',
    }))

  return {
    moduleType: table.$('#lblModuleType').textContent,
    serverName: table.$('#lblServerName').textContent,
    langSelect: {
      // caption: table
      //   .find('#td_Zaszlok')
      //   .prev('.login_label')
      //   .text()
      //   .trim()
      //   .replace(/:/, ''),
      options: langSelectOptions,
    },
    userName: {
      field: 'user',
      caption: table.$('#lblUsername').textContent.replace(/:/, ''),

      // Need to grab the exact element (these represent some kind of
      // component for the server)
      validator: table.$('#loginValidator'),
      validatorState: table.$('#vcelogin_ClientState'),
    },
    password: {
      field: 'pwd',
      caption: table.$('#lblPwd').textContent.replace(/:/, ''),
    },
    loginButton: {
      caption: table.$('#btnSubmit').getAttribute('value'),
      action: table.$('#btnSubmit').getAttribute('onclick'),
    },
  }
}

const transformLogin: NextModule = {
  name: 'transformLogin',
  shouldInitialize() {
    return isPage(NeptunPage.login);
  },
  initialize() {
    const container = $('.login_center')

    transformLoginForm(container)
    transformLinks(container)
    transformNews(container)
    transformDocuments(container)

    $('.info_table_center_container_td').remove()
    $('.table_center').remove()
  },
}

export default transformLogin
