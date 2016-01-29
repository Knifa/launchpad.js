import 'babel-polyfill'

import { getLaunchpad } from './launchpad'
import * as utils from './launchpad/utils'

getLaunchpad().then((launchpad) => {
  function render() {
    let state = launchpad.state.getState()

    launchpad.canvas.clip({ controls: true })
    launchpad.canvas.ctx.fillStyle = '#f00'
    launchpad.canvas.ctx.fillRect(0, 0, 10, 10)

    launchpad.canvas.clip({ pads: true })
    launchpad.canvas.ctx.fillStyle = '#00f'
    launchpad.canvas.ctx.fillRect(0, 0, 10, 10)

    launchpad.canvas.clip()
    launchpad.canvas.ctx.fillStyle = '#fff'
    launchpad.canvas.ctx.fillRect(0, 0, 5, 5)

    launchpad.canvas.clip()
    for (let c of utils.coordIter(10)) {
      if (state.get(c.x, c.y).pressed) {
        launchpad.canvas.ctx.fillStyle = 'rgba(255, 255, 255, ' + state.get(c.x, c.y).velocity.norm + ')'
        launchpad.canvas.ctx.fillRect(c.x, c.y, 1, 1)
      }
    }

    launchpad.canvas.sync()
    launchpad.canvas.clip()
    launchpad.canvas.clear()

    window.requestAnimationFrame(render)
  }

  render()
})
