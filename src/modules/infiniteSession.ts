import {NextModule} from 'moduleBase'
import {isAuthenticated} from 'navigation'

const threeMinutes = 180_000 // minimum wait time
const upToFiveMinutes = () => Math.random() * 300_000 // random variance

function keepAlive() {
  const timeout = threeMinutes + upToFiveMinutes()

  // TODO disable when not debugging
  // const fmt = new Intl.DateTimeFormat('hu-HU', {
  //   'hour': '2-digit',
  //   'minute': '2-digit',
  //   'second': '2-digit'
  // });
  // console.info('Refresh session @', fmt.format(new Date(Date.now())));

  // Refresh session
  evalHere(() => {
    const path = location.href.substring(0, location.href.lastIndexOf('/'))
    const pages = ['inbox', '0303', '0401', '0203', '0206']
    const randomPage = pages[Math.floor(Math.random() * pages.length)]

    fetch(`${path}/main.aspx?ismenclick=true&ctrl=${randomPage}`)
  })

  window.setTimeout(keepAlive, timeout)
}

/** Remove logout timers and warning dialog */
function clearTimers() {
  evalHere(() => {
    ;(window as any).ShowModal = function () {}
    clearTimeout((window as any).timerID)
    clearTimeout((window as any).timerID2)
    ;(window as any).sessionEndDate = null
  })
}

const infiniteSession: NextModule = {
  name: 'infiniteSession',
  shouldInitialize() {
    return isAuthenticated()
  },
  initialize() {
    keepAlive()
    clearTimers()
  },
}

export default infiniteSession
