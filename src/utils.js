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
