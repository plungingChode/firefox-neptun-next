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

// prettier-ignore
type ToBackgroundMessage = 
  | 'prepareFilterChange'

export type {
  MessageListener,
  MessageFilter,
  FilteredListener,
  ToContentMessage,
  ToBackgroundMessage,
}
