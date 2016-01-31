import tinycolor from 'tinycolor2'

import { game } from './game'
import * as consts from './consts'


export function RgbaToCss(rgba) {
  if (rgba.length === 3) {
    let rgb255 = [
      Math.round(rgba[0] * 255),
      Math.round(rgba[1] * 255),
      Math.round(rgba[2] * 255)]

    return `rgb(${rgb255[0]}, ${rgb255[1]}, ${rgb255[2]})`
  } else {
    let rgba255 = [
      Math.round(rgba[0] * 255),
      Math.round(rgba[1] * 255),
      Math.round(rgba[2] * 255),
      rgba[3]]

    return `rgb(${rgba255[0]}, ${rgba255[1]}, ${rgba255[2]}, ${rgba255[3]})`
  }
}

export function gisAWeeShadowPal({ctx, sprite, x, y}) {
  ctx.drawImage(sprite, x, y)
  ctx.save()
  ctx.translate(0, 100)
  ctx.scale(1, -1)
  ctx.globalAlpha = 0.1
  ctx.drawImage(sprite, x, y - 400)

  ctx.restore()
}


export class StatusBar {
  constructor ({ game, side, startValue, minValue, maxValue, fillStyle }) {
    this.game = game
    this.side = side
    this.fillStyle = fillStyle

    this.startValue = startValue
    this.minValue = minValue
    this.maxValue = maxValue
    this._value = this.startValue
  }

  render () {
    this.game.launchpad.canvas.clip({ controls: true })
    this.game.launchpad.canvas.ctx.fillStyle = this.fillStyle

    let scaledSize = this._value / this.maxValue * 8

    switch(this.side) {
      case 'left':
        this.game.launchpad.canvas.ctx.fillRect(0, 1, 1, scaledSize)
      break

      case 'right':
        this.game.launchpad.canvas.ctx.fillRect(9, 1, 1, scaledSize)
      break

      case 'bottom':
        this.game.launchpad.canvas.ctx.fillRect(1, 0, scaledSize, 1)
      break
    }
  }

  get value() {
    return this._value
  }

  set value(v) {
    if (v > this.maxValue)
      this._value = this.maxValue
    else if (v < this.minValue)
      this._value = this.minValue
    else
      this._value = v
  }

  reset () {
    this._value = this.startValue
  }
}


export class SyncBar {
  constructor () {
    this.color = null
  }

  render () {
    // Draw sync bar
    let fillStyle = null
    if (this.color !== null) {
      fillStyle = consts.COLORS[this.color]
    } else {
      fillStyle = 'white'
    }

    fillStyle = tinycolor(fillStyle)
      .setAlpha(game.globalPulse.value)
      .toString()

    game.launchpad.canvas.clip({ controls: true })
    game.launchpad.canvas.ctx.fillStyle = fillStyle
    game.launchpad.canvas.ctx.fillRect(0, 9, 10, 1)
  }
}

export class Pulse {
  constructor (fillStyle = 'white') {
    this.value = 0
    this.fillStyle = fillStyle
  }

  render() {
    let color = tinycolor(this.fillStyle)
      .setAlpha(this.value * 0.33)

    game.launchpad.canvas.clip({ pads: true })
    game.launchpad.canvas.ctx.fillStyle = color.toString()
    game.launchpad.canvas.ctx.fillRect(0, 0, 10, 10)
  }

  update () {
    this.value -= 0.025
    if (this.value < 0)
      this.value = 0
  }

  trigger() {
    this.value = 1
  }
}
