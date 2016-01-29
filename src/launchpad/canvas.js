import * as _ from 'lodash'

import * as consts from './consts'
import * as utils from './utils'


class LaunchpadCanvas {
  constructor(launchpadDevice) {
    this.launchpadDevice = launchpadDevice

    this.canvas = document.createElement('canvas');
    this.canvas.width = consts.GRID_SIZE;
    this.canvas.height = consts.GRID_SIZE;

    this.ctx = this.canvas.getContext('2d');
    this.ctx.save()

    this.clip()
    this.clear()
  }

  clear(clearStyle = '#000') {
    this.ctx.fillStyle = clearStyle
    this.ctx.fillRect(0, 0, consts.GRID_SIZE, consts.GRID_SIZE)
  }

  clip({ pads, controls } = {}) {
    this.ctx.restore()
    this.ctx.save()
    this.ctx.beginPath()

    if (!pads && !controls) {
      this.ctx.rect(0, 0, consts.GRID_SIZE, consts.GRID_SIZE)
    } else {
      if (pads) {
        this.ctx.rect(1, 1, consts.GRID_SIZE - 2, consts.GRID_SIZE - 2)
      }

      if (controls) {
        this.ctx.rect(0, 0, consts.GRID_SIZE, 1)
        this.ctx.rect(0, consts.GRID_SIZE - 1, consts.GRID_SIZE, 1)
        this.ctx.rect(0, 0, 1, consts.GRID_SIZE)
        this.ctx.rect(consts.GRID_SIZE - 1, 0, 1, consts.GRID_SIZE)
      }
    }

    this.ctx.clip()
  }

  sync() {
    let rgbData = []
    let canvasData = this.ctx.getImageData(
      0, 0, consts.GRID_SIZE, consts.GRID_SIZE)

    for (let c of utils.coordIter(consts.GRID_SIZE)) {
      let canvasFloatRgb = [
        canvasData.data[(((c.y) * consts.GRID_SIZE + c.x) * 4) + 0] / 255,
        canvasData.data[(((c.y) * consts.GRID_SIZE + c.x) * 4) + 1] / 255,
        canvasData.data[(((c.y) * consts.GRID_SIZE + c.x) * 4) + 2] / 255,
      ]

      rgbData.push(
        this.constructor._gammaCorrect(canvasFloatRgb[0]),
        this.constructor._gammaCorrect(canvasFloatRgb[1]),
        this.constructor._gammaCorrect(canvasFloatRgb[2]))
    }

    this.launchpadDevice.setLeds(rgbData)
  }

  static _gammaCorrect(x) {
    return Math.pow(x / 1, consts.GAMMA)
  }
}


export default LaunchpadCanvas
