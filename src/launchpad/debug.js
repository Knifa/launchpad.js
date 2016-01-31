import * as _ from 'lodash'

import * as consts from './consts'
import * as utils from './utils'


const SCALE = 64


let canvas = document.createElement('canvas')


export class LaunchpadDebugMidiOut {
  constructor () {
    this.canvas = canvas
    this.canvas.id = 'launchpad-debug'
    this.canvas.width = consts.GRID_SIZE * SCALE
    this.canvas.height = consts.GRID_SIZE * SCALE

    this.ctx = this.canvas.getContext('2d')
    this.ctx.scale(SCALE, SCALE)

    document.body.appendChild(this.canvas)
  }

  send (message) {
    if (!this._areLaunchpadMagicBitsEqual(message))
      return

    let cmd = message[consts.SYSEX_HEADER.length]
    let data = message.slice(consts.SYSEX_HEADER.length + 2, -1)

    switch (cmd) {
      case consts.SYSEX_CMD_RGB_ALL[0]:
        this._rgbAll(data)
      break
    }
  }

  _rgbAll(data) {
    this.ctx.clearRect(0, 0, consts.GRID_SIZE, consts.GRID_SIZE)

    let rgb255Data = []
    for (let i = 0; i < data.length; i += 3) {
      let x = i / 3 % consts.GRID_SIZE
      let y = Math.floor(i / 3 / consts.GRID_SIZE)

      if (!rgb255Data[y])
        rgb255Data[y] = []

      rgb255Data[y][x] = [
        Math.floor(data[i] / 63 * 255),
        Math.floor(data[i + 1] / 63 * 255),
        Math.floor(data[i + 2] / 63 * 255)
      ]
    }

    for (let c of utils.coordIter(consts.GRID_SIZE)) {
      let rgb = rgb255Data[c.y][c.x]

      if (c.x === 0 && c.y === 0 ||
          c.x === consts.GRID_SIZE - 1 && c.y === 0 ||
          c.x === 0 && c.y == consts.GRID_SIZE - 1 ||
          c.x === consts.GRID_SIZE - 1 && c.y === consts.GRID_SIZE - 1)
        continue

      this.ctx.lineWidth = 1 / SCALE
      this.ctx.strokeStyle = 'black'
      this.ctx.fillStyle = `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
      this.ctx.beginPath()
      this.ctx.rect(c.x, consts.GRID_SIZE - c.y - 1, 1, 1)
      this.ctx.fill()
      this.ctx.stroke()
      this.ctx.closePath()
    }
  }

  _areLaunchpadMagicBitsEqual (message) {
    return _.isEqual(
        consts.SYSEX_HEADER,
        message.slice(0, consts.SYSEX_HEADER.length)
      ) && _.isEqual(
        consts.SYSEX_FOOTER,
        message.slice(-1)
      )
  }
}


export class LaunchpadDebugMidiIn {
  constructor () {
    this.canvas = canvas
    this.canvas.addEventListener('mousedown', this._mouseDownHandler.bind(this))
    this.canvas.addEventListener('mouseup', this._mouseUpHandler.bind(this))
    this.eventHandlers = {
      'midimessage': []
    }
  }

  addEventListener (event, handler) {
    if (!(event in this.eventHandlers)) {
      this.eventHandlers[event] = []
    }

    this.eventHandlers[event].push(handler)
  }

  _mouseDownHandler(event) {
    let x = Math.floor(event.clientX / SCALE)
    let y = consts.GRID_SIZE - Math.floor(event.clientY / SCALE) - 1
    let key = y * consts.GRID_SIZE + x

    for (let handler of this.eventHandlers['midimessage']) {
      if (x == 0 || x == consts.GRID_SIZE - 1 ||
          y == 0 || y == consts.GRID_SIZE - 1) {
        handler({ data: [consts.MIDI_CONROL_ON, key, 127] })
      } else {
        handler({ data: [consts.MIDI_NOTE_ON, key, 127] })
      }
    }
  }

  _mouseUpHandler(event) {
    let x = Math.floor(event.clientX / SCALE)
    let y = consts.GRID_SIZE - Math.floor(event.clientY / SCALE) - 1
    let key = y * consts.GRID_SIZE + x

    for (let handler of this.eventHandlers['midimessage']) {
      if (x == 0 || x == consts.GRID_SIZE - 1 ||
          y == 0 || y == consts.GRID_SIZE - 1) {
        handler({ data: [consts.MIDI_CONROL_ON, key, 0] })
      } else {
        handler({ data: [consts.MIDI_NOTE_ON, key, 0] })
      }
    }
  }
}
