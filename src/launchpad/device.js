import EventEmitter from 'events'
import * as _ from 'lodash'

import * as consts from './consts'
import * as utils from './utils'


class LaunchpadDevice {
  constructor({ midiIn, midiOut }) {
    this.midiIn = midiIn
    this.midiOut = midiOut

    this.events = new EventEmitter()
    this.midiIn.addEventListener('midimessage', this._midiInHandler.bind(this))
  }

  setLed(index, rgb) {
    this.midiOut.send(this.constructor._createSysExMessage(
      consts.SYSEX_CMD_RGB_1,
      rgb.map((x) => { return x * 63 })
    ))
  }

  setLeds(rgbs) {
    this.midiOut.send(this.constructor._createSysExMessage(
      consts.SYSEX_CMD_RGB_10X10,
      rgbs.map((x) => { return x * 63 })
    ))
  }

  setFrontLed(rgb) {
    this.setLed(consts.LED_FRONT, rgb)
  }

  _midiInHandler(event) {
    let cmd = event.data[0]

    let key = event.data[1]
    let coord = {
      x: key % consts.GRID_SIZE,
      y: Math.floor(key / consts.GRID_SIZE)
    }

    let velocity = event.data[2]
    let velocityNorm = velocity / 127

    let eventName = null
    let eventData = {
      key: { raw: key, coord },
      velocity: { raw: velocity, norm: velocityNorm }
    }

    switch (cmd) {
      case consts.MIDI_NOTE_ON:
        if (velocity > 0)
          eventName = 'pad-on'
        else
          eventName = 'pad-off'
      break

      case consts.MIDI_CONTROL_ON:
        if (velocity > 0)
          eventName = 'control-on'
        else
          eventName = 'control-off'
      break

      case consts.MIDI_AFTERTOUCH:
        eventName = 'aftertouch'
      break
    }

    this.events.emit(eventName, eventData)
  }

  static _createSysExMessage(command, data) {
    return _.flatten([]
      .concat(consts.SYSEX_HEADER)
      .concat(command)
      .concat(data)
      .concat(consts.SYSEX_FOOTER))
  }
}


export default LaunchpadDevice
