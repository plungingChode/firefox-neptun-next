import {message} from './contentMessenger'

/**
 * Hooks into a Neptun.NET tabs component and notifies on tab change. It uses background -
 * content script messaging to achieve this as accurately as possible.
 */
class AjaxTabs<T> {
  private readonly _tabNames: readonly T[]
  private readonly _onActivated: (tab: T) => any
  private _activeTab: T

  /**
   * Hooks into a Neptun.NET tabs component and notifies on tab change. It uses background -
   * content script messaging to achieve this as accurately as possible.
   * 
   * @param tabNames a list of tab names to use in the `onActivated` callback
   * @param onActivated called when a different tab is activated
   */
  constructor(tabNames: readonly T[], onActivated: (tab: T) => any) {
    this._tabNames = tabNames
    this._onActivated = onActivated

    this._setupClickEvents()
    message.on('ajaxTabChanged', () => {
      this._onActivated(this._activeTab)

      // 200ms delay, because we need to wait for tabs are modified and event 
      // listeners are removed (for some reason?) by the default script
      //
      // TODO this is not very robust, but I couldn't yet make it work w/
      //      MutationObserver
      setTimeout(() => this._setupClickEvents(), 200)
    })
  }

  private _setupClickEvents() {
    // Need to select immediate children, since they're the ones receiving
    // `ajax__tab_active` and `ajax__tab_disabled` classes. This is the only
    // way we can reliably tell, which tab we're on.
    const tabs = [...$$('.ajax__tab_header > *')]

    if (this._tabNames.length !== tabs.length) {
      throw `Number of tab names (${this._tabNames.length}) and tab elements (${tabs.length}) must match`
    }

    for (let i = 0; i < tabs.length; i++) {
      const tab = tabs[i]

      // Skip disabled tabs
      if (tab.classList.contains('ajax__tab_disabled')) {
        continue
      }

      tab.addEventListener('click', () => {
        message.send('prepareAjaxTabChange')
        this._activeTab = this._tabNames[i]
      })
    }
  }

  /** Returns the name of the currently active tab. */
  get activeTab(): T {
    return this._activeTab
  }
}

export {AjaxTabs}
