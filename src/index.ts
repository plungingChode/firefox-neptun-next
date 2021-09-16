import type {NextModule} from './moduleBase'

import customStyle from './modules/customStyle'

// prettier-ignore
const modules: NextModule[] = [
  customStyle
]

for (const md of modules) {
  if (md.shouldInitialize()) {
    md.initialize()
  }
}
