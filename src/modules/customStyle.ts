import type {NextModule} from '../moduleBase'

import 'dom'
import css from '../../scss/index.scss'

const customStyle: NextModule = {
  name: 'customStyle',
  shouldInitialize() {
    return true
  },
  initialize() {
    // Disable default styles
    $$('link').forEach(lnk => (lnk.disabled = true))

    // prettier-ignore
    // const style = html`<style>${css}</style>`
    // document.head.append(style)
  },
}

export default customStyle
