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

// prettier-ignore
type ToBackgroundMessage = 
  | 'prepareFilterChange'
  | 'prepareKeepAlive'

export type {
  MessageListener,
  MessageFilter,
  FilteredListener,
  ToContentMessage,
  ToBackgroundMessage,
}
