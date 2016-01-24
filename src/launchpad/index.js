import EventEmitter from 'events'

import * as _ from 'lodash'
import * as consts from './consts'

import * as utils from './utils'


/**
 * Creates a SysEx data sequence for sending over MIDI with the standard
 * Launchpad header and footer
 */
function _createSysExMessage(command, data) {
  return _.flatten([]
    .concat(consts.SYSEX_HEADER)
    .concat(command)
    .concat(data)
    .concat(consts.SYSEX_FOOTER))
}

/**
 * Get X/Y coordinate from LED index
 */
function _getLedIndexToCoord(index) {
  let y = consts.GRID_SIZE - Math.floor(index / 10) - 1
  let x = index % 10

  return { x, y }
}

/**
 * Scales normalized (0 to 1) value to int SysEx values (0 to 63)
 */
function _floatTo64Scale(x) {
  return Math.round(x * 63)
}

/**
 * Gamma corrects the given value with the (estimated) Launchpad gamma curve
 */
function _gammaCorrect(x) {
  return Math.pow(x / 1, consts.GAMMA)
}


/**
 * Represents current state of the Launchpad
 */
class _LaunchpadState {
  constructor() {
    this.state = []

    for (let c of utils.coordIter(consts.GRID_SIZE)) {
      if (!this.state[c.y])
        this.state[c.y] = []

      this.state[c.y][c.x] = {
        pressed: false,
        velocity: 0
      }
    }
  }

  get(x, y) {
    return this.state[y][x]
  }

  clone() {
    let ls = new _LaunchpadState()

    for (let c of utils.coordIter(consts.GRID_SIZE))
      for (let prop in this.get(c.x, c.y))
        ls.get(c.x, c.y)[prop] = this.get(c.x, c.y)[prop]

    return ls
  }
}


class Launchpad {
  constructor({ midiIn, midiOut }) {
    this.midiIn = midiIn
    this.midiOut = midiOut

    this.state = new _LaunchpadState()
    this.events = new EventEmitter()

    this.midiIn.addEventListener('midimessage', this._midiInHandler.bind(this))
  }

  /**
   * Set all LEDs using the supplied normalized RGB LED data, and applies gamma
   * correction
   */
  setLeds(ledData) {
    ledData = _
      .flattenDeep(ledData)
      .map(_gammaCorrect)
      .map(_floatTo64Scale)

    this.midiOut.send(
      _createSysExMessage(consts.SYSEX_CMD_RGB_10X10, ledData))
  }

  /**
   * Set LED on the front panel to the given RGB value
   */
  setFrontLed(rgb) {
    rgb = rgb
      .map(_gammaCorrect)
      .map(_floatTo64Scale)

    this.midiOut.send(_createSysExMessage(
      consts.SYSEX_CMD_RGB_1,
      [consts.LED_FRONT, rgb]
    ))
  }

  getState() {
    return this.state.clone()
  }

  /**
   * Parses incoming MIDI messages and broadcasts over the event bus
   */
  _midiInHandler(event) {
    let midiCmd = event.data[0]

    let key = event.data[1]
    let coords = _getLedIndexToCoord(key)
    let velocity = event.data[2] / 127

    this.state.get(coords.x, coords.y).pressed = velocity > 0 ? true : false
    this.state.get(coords.x, coords.y).velocity = velocity

    switch (midiCmd) {
      case consts.MIDI_NOTE_ON:
      case consts.MIDI_CONTROL_ON:
        if (velocity > 0) {
          this.events.emit('note-on', {
            x: coords.x,
            y: coords.y,
            key,
            velocity
          })
        } else {
          this.events.emit('note-off', {
            key,
            x: coords.x,
            y: coords.y
          })
        }
      break

      case consts.MIDI_AFTERTOUCH:
        this.events.emit('aftertouch', {
          x: coords.x,
          y: coords.y,
          key,
        velocity: event.data[2] / 128
      })
      break
    }
  }
}


/**
 * Returns a Promise that will resolve with a Launchpad, if connected.
 */
export function getLaunchpad() {
  return new Promise((resolve, reject) => {
    window.navigator.requestMIDIAccess({ sysex: true }).then((midi) => {
      let launchpadIn, launchpadOut = null;

      midi.inputs.forEach((device) => {
        if (device.name === consts.MIDI_NAME_WINDOWS_IN ||
            device.name === consts.MIDI_NAME_OSX) {
          launchpadIn = device
        }
      })

      midi.outputs.forEach((device) => {
        if (device.name === consts.MIDI_NAME_WINDOWS_OUT ||
            device.name === consts.MIDI_NAME_OSX) {
          launchpadOut = device
        }
      })

      if (launchpadIn && launchpadOut) {
        resolve(new Launchpad({
          midiIn: launchpadIn,
          midiOut: launchpadOut
        }))
      } else {
        reject()
      }
    })
  })
}
