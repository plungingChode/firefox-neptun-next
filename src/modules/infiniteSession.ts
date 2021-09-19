import {NextModule} from 'lib/moduleBase'
import {isAuthenticated} from 'lib/navigation'
import {message} from 'lib/message-content'

const threeMinutes = 180_000 // minimum wait time
const upToFiveMinutes = () => Math.random() * 300_000 // random variance

// TODO test if this actually works
function keepAlive() {
  const timeout = threeMinutes + upToFiveMinutes()

  // Notify background to ignore next request
  message.send('prepareKeepAlive')

  // Get random page for proxy (most likely targets)
  const path = location.href.substring(0, location.href.lastIndexOf('/'))
  const pages = ['inbox', '0303', '0401', '0203', '0206']
  const randomPage = pages[Math.floor(Math.random() * pages.length)]

  // Use local jQuery ajax to send the correct headers and cookies
  evalHere(`$.ajax({ url: '${path}/main.aspx?ismenclick=true&ctrl=${randomPage}'})`)

  // Use builtin keepalive request (doesn't seem to work)
  // evalHere(`$.ajax({type: 'Post', url: 'service.asmx/StayAlive'})`)
  
  window.setTimeout(keepAlive, timeout)
}

/** Remove logout timers and warning dialog */
function clearTimers() {
  evalHere(`
    window.ShowModal = function () {}
    clearTimeout(window.timerID)
    clearTimeout(window.timerID2)
    window.sessionEndDate = null
  `)
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
