import * as _ from 'lodash'
import EventEmitter from 'events'
import * as consts from './consts'


/**
 * Get X/Y coordinate from LED index
 */
function getLedIndexToCoord(index) {
  let y = consts.GRID_SIZE - Math.floor(index / 10) - 1
  let x = index % 10

  return [x, y]
}


/**
 * Creates a SysEx data sequence for sending over MIDI with the standard
 * Launchpad header and footer
 */
function createSysExMessage(command, data) {
  return _.flatten([]
    .concat(consts.SYSEX_HEADER)
    .concat(command)
    .concat(data)
    .concat(consts.SYSEX_FOOTER))
}


/**
 * Scales normalized (0 to 1) value to SysEx values (0 to 63)
 */
function floatTo64Scale(x) {
  return Math.round(Math.max(Math.min(x, 1), 0) * 63)
}

/**
 * Scales a sequence of normalized (0 to 1) values to SysEx values (0 to 63)
 */
function floatsTo64Scale(rgbFloats) {
  return rgbFloats.map((x) => {
    return floatTo64Scale(x)
  })
}


/**
 * Gamma corrects the given value with the (estimated) Launchpad gamma curve
 */
function gammaCorrect(x) {
  return Math.pow(x / 1, consts.GAMMA)
}


/**
 * Creates an RGB pixel array of the given size (size x size x 3)
 */
function createRgbArray(size) {
  let array = []
  for (let y = 0; y < consts.GRID_SIZE; y++) {
    let yArray = []
    for (let x = 0; x < consts.GRID_SIZE; x++) {
      yArray.push([0, 0, 0])
    }

    array.push(yArray)
  }

  return array
}

/**
 * Returns resulting RGB value from blending between dest (RGB) to target (RGBA)
 */
function alphaBlendRgba(dest, target) {
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
 * Clamps an RGB(A) value between 0 and 1
 */
function clampRgba(rgba) {
  return rgba.map((x) => Math.max(Math.min(x, 1), 0))
}



class Launchpad {
  constructor({ midiIn, midiOut }) {
    this.midiIn = midiIn
    this.midiOut = midiOut

    this.leds = createRgbArray(consts.GRID_SIZE)
    this.midiIn.addEventListener('midimessage', this._midiInHandler.bind(this))

    this.events = new EventEmitter()
  }

  clearLeds(rgb = [0, 0, 0]) {
    rgb = clampRgba(rgb)

    for (let y = 0; y < consts.GRID_SIZE; y++)
      for (let x = 0; x < consts.GRID_SIZE; x++)
        this.leds[y][x] = rgb
  }

  updateLeds() {
    // Gamma correct and map float pixel data to 0...63 pixel data
    let gammaData = _.flattenDeep(this.leds).map(gammaCorrect)
    let led64Data = gammaData.map(floatTo64Scale)

    this.midiOut.send(createSysExMessage(consts.SYSEX_CMD_RGB_10X10, led64Data))
  }

  setLed(x, y, rgba) {
    // Flip incoming Y as the Launchpad's origin is in the bottom left
    y = consts.GRID_SIZE - 1 - y

    // Clamp RGB and add A value if missing
    rgba[3] = rgba[3] !== undefined ? rgba[3] : 1
    rgba = clampRgba(rgba)

    // Don't do anything if we're outside bounds, including subpixel border
    if (x <= -1 || x >= consts.GRID_SIZE ||
        y <= -1 || y >= consts.GRID_SIZE) {
      return
    }

    // Skip subpixel blending if co-ords are whole numbers
    if (x === Math.floor(x) && y === Math.floor(y)) {
      this.leds[y][x] = alphaBlendRgba(this.leds[y][x], rgba)
      return
    }

    consts.ANTIALIAS_SAMPLES.map((sample) => {
      let sampleX = Math.floor(x) + sample[0]
      let sampleY = Math.floor(y) + sample[1]

      if (sampleX <= -1 || sampleX >= consts.GRID_SIZE ||
          sampleY <= -1 || sampleY >= consts.GRID_SIZE)
        return

      let dist = Math.max(Math.min(
        Math.sqrt(
          Math.pow(x - sampleX, 2) + Math.pow(y - sampleY, 2)
        ), 1), 0)

      this.leds[sampleY][sampleX] = alphaBlendRgba(
        this.leds[sampleY][sampleX],
        [rgba[0], rgba[1], rgba[2], rgba[3] * (1 - dist)]
      )
    })
  }

  /**
   * Set LED on the front panel to the given RGB value
   */
  setFrontLed(rgb) {
    rgb = clampRgba(rgb)

    this.midiOut.send(createSysExMessage(
      consts.SYSEX_CMD_RGB_1,
      [consts.LED_FRONT, floatsTo64Scale(rgb)]
    ))
  }

  /**
   * Parses incoming MIDI messages and broadcasts over the event bus
   */
  _midiInHandler(event) {
    let midiCmd = event.data[0]
    let coords = getLedIndexToCoord(event.data[1])

    switch (midiCmd) {
      case consts.MIDI_NOTE_ON:
      case consts.MIDI_CONTROL_ON:
        if (event.data[2] > 0) {
          this.events.emit('note-on', {
            x: coords[0],
            y: coords[1],
            velocity: event.data[2] / 128
          })
        } else {
          this.events.emit('note-off', {
            x: coords[0],
            y: coords[1]
          })
        }
      break

      case consts.MIDI_AFTERTOUCH:
        this.events.emit('aftertouch', {
          x: coords[0],
          y: coords[1],
          velocity: event.data[2] / 128
        })
      break

      default:
        console.log('Unhandled MIDI message:', event.data)
      break
    }
  }
}

export {
  Launchpad as default,
  consts
}
