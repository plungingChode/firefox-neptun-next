interface NextModule {
  shouldInitialize: () => boolean
  initialize: () => void
}

export type {NextModule}
