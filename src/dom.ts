// prettier-ignore
declare global {
  // Add $, $$ query selector shorthands to Element
  interface Element {
    /**
     * Returns the first element that is a descendant of node that matches selectors.
     */
    $<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null
    $<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null
    $<E extends Element = Element>(selectors: string): E | null

    /**
     * Returns all element descendants of node that match selectors.
     */
    $$<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    $$<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
    $$<E extends Element = Element>(selectors: string): NodeListOf<E>;
  }

  // Add $, $$ query selector shorthands to Document
  interface Document {
    /**
     * Returns the first element that is a descendant of node that matches selectors.
     */
    $<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null
    $<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null
    $<E extends Element = Element>(selectors: string): E | null
    
    /**
     * Returns all element descendants of node that match selectors.
     */
    $$<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
    $$<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
    $$<E extends Element = Element>(selectors: string): NodeListOf<E>;
  }

  // Add $, $$ query selector shorthands to Window
  /**
   * Returns the first element that is a descendant of node that matches selectors.
   */
  function $<K extends keyof HTMLElementTagNameMap>(selectors: K): HTMLElementTagNameMap[K] | null
  function $<K extends keyof SVGElementTagNameMap>(selectors: K): SVGElementTagNameMap[K] | null
  function $<E extends Element = Element>(selectors: string): E | null
  function $(selectors: string): Element | null;

  /**
   * Returns all element descendants of node that match selectors.
   */
  function $$<K extends keyof HTMLElementTagNameMap>(selectors: K): NodeListOf<HTMLElementTagNameMap[K]>;
  function $$<K extends keyof SVGElementTagNameMap>(selectors: K): NodeListOf<SVGElementTagNameMap[K]>;
  function $$<E extends Element = Element>(selectors: string): NodeListOf<E>; 
  function $$(selectors: string): NodeList;

  /**
   * Create an HTML element from a template string.
   */
  function html(template: { raw: readonly string[]}, ...substitutions: any[]): Element;
}

Element.prototype.$ = Element.prototype.querySelector
Element.prototype.$$ = Element.prototype.querySelectorAll

Document.prototype.$ = Document.prototype.querySelector
Document.prototype.$$ = Document.prototype.querySelectorAll

// These have to be separate functions (idk why it doesn't work with prototype fn ref)
window.$ = (selectors: string) => document.querySelector(selectors)
window.$$ = (selectors: string) => document.querySelectorAll(selectors)

// Check if an HTML string is a single tag
const rx_singleTag =
  /^<([a-z][^\/\0>:\x20\t\r\n\f]*)[\x20\t\r\n\f]*\/?>(?:<\/\1>|)$/i

window.html = (template: {raw: readonly string[]}, ...substitutions: any[]) => {
  const processed = String.raw(template, ...substitutions).trim()
  const parsed = rx_singleTag.exec(processed)

  // see https://github.com/jquery/jquery/blob/main/src/core/parseHTML.js
  if (parsed) {
    return document.createElement(parsed[1])
  }

  // see https://stackoverflow.com/questions/9284117/
  const temp = document.createElement('template')
  temp.innerHTML = processed

  return temp.content.firstElementChild!
}

export {}
