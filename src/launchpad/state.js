import * as consts from './consts'
import * as utils from './utils'


class LaunchpadStateTracker {
  constructor(launchpadDevice) {
    this.state = []

    for (let c of utils.coordIter(consts.GRID_SIZE)) {
      if (!this.state[c.y])
        this.state[c.y] = []

      this.state[c.y][c.x] = {
        pressed: false,
        velocity: { raw: 0, norm: 0 }
      }
    }

    launchpadDevice.events.on('pad-on', (event) => {
      this.state[event.key.coord.y][event.key.coord.x].pressed = true
      this.state[event.key.coord.y][event.key.coord.x].velocity = event.velocity
    })

    launchpadDevice.events.on('pad-off', (event) => {
      this.state[event.key.coord.y][event.key.coord.x].pressed = false
      this.state[event.key.coord.y][event.key.coord.x].velocity = event.velocity
    })

    launchpadDevice.events.on('control-on', (event) => {
      this.state[event.key.coord.y][event.key.coord.x].pressed = true
      this.state[event.key.coord.y][event.key.coord.x].velocity = event.velocity
    })

    launchpadDevice.events.on('control-off', (event) => {
      this.state[event.key.coord.y][event.key.coord.x].pressed = false
      this.state[event.key.coord.y][event.key.coord.x].velocity = event.velocity
    })

    launchpadDevice.events.on('aftertouch', (event) => {
      this.state[event.key.coord.y][event.key.coord.x].velocity = event.velocity
    })
  }

  get(x, y) {
    return this.state[y][x]
  }

  getState() {
    let ls = []
    ls.get = (x, y) => { return ls[y][x] }

    for (let c of utils.coordIter(consts.GRID_SIZE)) {
      if (!ls[c.y])
        ls[c.y] = []

      ls[c.y][c.x] = {}

      for (let prop in this.get(c.x, c.y))
        ls.get(c.x, c.y)[prop] = this.get(c.x, c.y)[prop]
    }

    return ls
  }
}


export default LaunchpadStateTracker
