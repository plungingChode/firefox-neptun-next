import type {NextModule} from '../moduleBase';
import css from '../../scss/index.scss'

const customStyle: NextModule = {
  shouldInitialize: () => {
    return true;
  },
  initialize: () => {
    const tag = document.createElement('style')
    tag.innerHTML = css
    document.head.append(tag)
  }
}

export default customStyle;
