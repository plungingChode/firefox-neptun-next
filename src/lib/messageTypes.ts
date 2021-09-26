type MessageListener = () => any
type MessageFilter = (message: string) => void
type FilteredListener = {
  listener: MessageListener
  filtered: MessageFilter
}

// prettier-ignore
type ToContentMessage = 
  | 'paginationChanged' 
  | 'beforePaginationChange' 
  | 'filterChanged'
  | 'pageLoaded'
  | 'modalOpened'
  | 'ajaxTabChanged'

// prettier-ignore
type ToBackgroundMessage = 
  | 'prepareFilterChange'
  | 'prepareKeepAlive'
  | 'prepareModalOpen'
  | 'prepareAjaxTabChange'

export type {
  MessageListener,
  MessageFilter,
  FilteredListener,
  ToContentMessage,
  ToBackgroundMessage,
}
