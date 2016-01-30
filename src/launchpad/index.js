import LaunchpadDevice from './device'
import LaunchpadStateTracker from './state'
import LaunchpadCanvas from './canvas'

import * as consts from './consts'


class Launchpad {
  constructor({ midiIn, midiOut }) {
    this.device = new LaunchpadDevice({ midiIn, midiOut })
    this.state = new LaunchpadStateTracker(this.device)
    this.canvas = new LaunchpadCanvas(this.device)
  }
}


export function getLaunchpad() {
  return new Promise((resolve, reject) => {
    window.navigator.requestMIDIAccess({ sysex: true }).then((midi) => {
      let launchpadIn, launchpadOut = null;

      midi.inputs.forEach((device) => {
        if (device.name === consts.MIDI_NAME_WINDOWS_IN ||
            device.name === consts.MIDI_NAME_OSX ||
            device.name === consts.MIDI_NAME_LINUX) {
          launchpadIn = device
        }
      })

      midi.outputs.forEach((device) => {
        if (device.name === consts.MIDI_NAME_WINDOWS_OUT ||
            device.name === consts.MIDI_NAME_OSX ||
            device.name === consts.MIDI_NAME_LINUX) {
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
