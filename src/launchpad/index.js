import * as _ from 'lodash'


const SYSEX_HEADER = [240,0,32,41,2,16]
const SYSEX_FOOTER = [247]

const SYSEX_CMD_RGB_LEDS_IN_GRID = [15, 1]
const SYSEX_CMD_RGB_LEDS_SINGLE = [11]

const LED_FRONT = 99


function createSysExMessage(command, data) {
  return _.flatten([]
    .concat(SYSEX_HEADER)
    .concat(command)
    .concat(data)
    .concat(SYSEX_FOOTER))
}


function floatTo64Scale(x) {
  return Math.round(Math.max(Math.min(x, 1), 0) * 63)
}

function floatsTo64Scale(rgbFloats) {
  return rgbFloats.map((x) => {
    return floatTo64Scale(x)
  })
}


class Launchpad {
  constructor({
    midiIn,
    midiOut
  }) {
    this.midiIn = midiIn
    this.midiOut = midiOut

    this.leds = []
    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++)
        this.leds.push([0, 0, 0])

    this.updateLeds()
  }

  updateLeds() {
    // Map float pixel data to 0...63 pixel data required by Launchpad
    let ledData = this.leds.map((rgbFloats) => {
      return floatsTo64Scale(rgbFloats)
    })

    this.midiOut.send(createSysExMessage(SYSEX_CMD_RGB_LEDS_IN_GRID, ledData)
    )
  }

  getLed(x, y) {
    return this.leds[x + y * 8]
  }

  setLed(x, y, rgb) {
    let led = this.getLed(x, y)

    led[0] = rgb[0]
    led[1] = rgb[1]
    led[2] = rgb[2]
  }

  setFrontLed(rgb) {
    this.midiOut.send(createSysExMessage(
      SYSEX_CMD_RGB_LEDS_SINGLE,
      [LED_FRONT, floatsTo64Scale(rgb)]
    ))
  }
}

export default Launchpad;
