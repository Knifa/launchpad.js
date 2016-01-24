import * as _ from 'lodash'

import * as consts from './consts'
import * as utils from './utils'


/**
 * Creates an RGB pixel array of the given size (size x size x 3)
 */
function _createRgbArray(size) {
  let array = []

  for (let c of utils.coordIter(consts.GRID_SIZE)) {
    if (!array[c.y])
      array[c.y] = []

    array[c.y][c.x] = [0, 0, 0]
  }

  return array
}

/**
 * Returns resulting RGB value from blending between dest (RGB) to target (RGBA)
 */
function _alphaBlendRgba(dest, target) {
  // Don't bother blending if alpha is 0 (entirely dest) or 1 (entirely target)
  if (target[3] === 0)
    return [dest[0], dest[1], dest[2]]
  else if (target[3] === 1)
    return [target[0], target[1], target[2]]

  return [
    (dest[0] * (1 - target[3])) + (target[0] * target[3]),
    (dest[1] * (1 - target[3])) + (target[1] * target[3]),
    (dest[2] * (1 - target[3])) + (target[2] * target[3])
  ]
}

/**
 * Ensures value is RGBA. Sets A channel to full opaque if missing.
 */
function _ensureRgba(rgba) {
  return [
    rgba[0],
    rgba[1],
    rgba[2],
    rgba[3] !== undefined ? rgba[3] : 1
  ]
}


class LaunchpadDrawingContext {
  constructor(launchpad) {
    this.launchpad = launchpad
    this.ledData = _createRgbArray(consts.GRID_SIZE)
  }

  /**
   * Plot a single pixel. Supports float coordinates.
   */
  plot(x, y, rgba) {
    // Flip incoming Y as the Launchpad's origin is in the bottom left
    y = consts.GRID_SIZE - 1 - y

    // Clamp RGB and add A value if missing
    rgba = utils.clampNormalized(_ensureRgba(rgba))

    // Don't do anything if we're outside bounds, including subpixel border
    if (x <= -1 || x >= consts.GRID_SIZE ||
        y <= -1 || y >= consts.GRID_SIZE) {
      return
    }

    // Skip subpixel blending if co-ords are whole numbers
    if (x === Math.floor(x) && y === Math.floor(y)) {
      this.ledData[y][x] = _alphaBlendRgba(this.ledData[y][x], rgba)
      return
    }

    // Perform subpixel blending. Alpha for each sample is given by getting the
    // distance between the sample and the target coordinates.
    consts.ANTIALIAS_SAMPLES.map((sample) => {
      let sampleX = Math.floor(x) + sample[0]
      let sampleY = Math.floor(y) + sample[1]

      if (sampleX <= -1 || sampleX >= consts.GRID_SIZE ||
          sampleY <= -1 || sampleY >= consts.GRID_SIZE)
        return

      let dist = utils.clampNormalized(
        Math.sqrt(Math.pow(x - sampleX, 2) + Math.pow(y - sampleY, 2)))

      this.ledData[sampleY][sampleX] = _alphaBlendRgba(
        this.ledData[sampleY][sampleX],
        [rgba[0], rgba[1], rgba[2], rgba[3] * (1 - dist)]
      )
    })
  }

  /**
   * Clear drawing context, optionally with the provided RGB value
   */
  clear(rgb = [0, 0, 0]) {
    rgb = utils.clampNormalized(rgb)

    for (let c of utils.coordIter(consts.GRID_SIZE))
      this.ledData[c.y][c.x] = rgb
  }

  /**
   * Update the display to current LED data
   */
  sync() {
    this.launchpad.setLeds(this.ledData)
  }
}


class LaunchpadCanvasContext extends LaunchpadDrawingContext {
  constructor(launchpad) {
    super(launchpad)

    this.canvas = document.createElement('canvas');
    this.canvas.width = consts.GRID_SIZE;
    this.canvas.height = consts.GRID_SIZE;

    this.ctx = this.canvas.getContext('2d');

    this.clear()
  }

  /**
   * Clear canvas and Launchpad display with optional RGB value
   */
  clear(rgb = [0, 0, 0]) {
    super.clear(rgb)

    this.ctx.beginPath()
    this.ctx.fillStyle = this.constructor.RgbaToCss(rgb)
    this.ctx.fillRect(0, 0, consts.GRID_SIZE, consts.GRID_SIZE)
    this.ctx.closePath()
  }

  /**
   * Copies current canvas state to the Launchpad display. Must still sync()
   */
  syncCanvas(padsOnly = false) {
    let imageData = this.ctx.getImageData(
      0, 0, consts.GRID_SIZE, consts.GRID_SIZE)

    let size = consts.GRID_SIZE
    if (padsOnly) {
      size = size - 2
    }

    for (let c of utils.coordIter(size)) {
      if (padsOnly) {
        c.x += 1
        c.y += 1
      }

      this.plot(c.x, c.y, [
        imageData.data[((c.y * consts.GRID_SIZE + c.x) * 4) + 0] / 255,
        imageData.data[((c.y * consts.GRID_SIZE + c.x) * 4) + 1] / 255,
        imageData.data[((c.y * consts.GRID_SIZE + c.x) * 4) + 2] / 255,
      ])
    }
  }

  /**
   * Gives CSS3 color string for given RGB(A) value
   */
  static RgbaToCss(rgba) {
    if (rgba[3] !== undefined) {
      return `rgba(` +
        `${Math.round(rgba[0] * 255)},` +
        `${Math.round(rgba[1] * 255)},` +
        `${Math.round(rgba[2] * 255)},` +
        `${rgba[3]})`
    } else {
      let r = Math.round(rgba[0] * 255).toString(16)
      let g = Math.round(rgba[1] * 255).toString(16)
      let b = Math.round(rgba[2] * 255).toString(16)

      if (r.length < 2) r = '0' + r
      if (g.length < 2) g = '0' + g
      if (b.length < 2) b = '0' + b

      return `#` +
        `${r}` +
        `${g}` +
        `${b}`
    }
  }
}


export {
  LaunchpadDrawingContext,
  LaunchpadCanvasContext
}
