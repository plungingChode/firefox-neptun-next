interface NextModule {
  name: string
  shouldInitialize: () => boolean
  initialize: () => void
}

export type {NextModule}
