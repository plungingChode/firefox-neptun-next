type MessageListener = () => any
type MessageFilter = (message: string) => void
type FilteredListener = {
  listener: MessageListener,
  filtered: MessageFilter
}

enum ToContentMessage {
  'paginationChanged',
  'beforePaginationChange'
}

export type {MessageListener, MessageFilter, FilteredListener}
export {ToContentMessage}