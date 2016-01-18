import Launchpad from './launchpad'
import * as draw from './launchpad/draw'

window.navigator.requestMIDIAccess({ sysex: true }).then((midi) => {
  let launchpadIn, launchpadOut = null;

  midi.inputs.forEach((device) => {
    if (device.name === 'MIDIIN2 (2- Launchpad Pro)')
      launchpadIn = device
  })

  midi.outputs.forEach((device) => {
    if (device.name === 'MIDIOUT2 (2- Launchpad Pro)')
      launchpadOut = device
  })

  let launchpad = new Launchpad({
    midiIn: launchpadIn,
    midiOut: launchpadOut
  })

  launchpad.events.on('note-on', (event) => {
    console.log(event)
    launchpad.setLed(event.x, event.y, [0, 0, 0, 0.25])
  })

  launchpad.events.on('note-off', (event) => {
    launchpad.setLed(event.x, event.y, [1, 0, 1, 0.25])
  })

  let x = -1
  let y = 0
  function step() {

  //launchpad.setLed(x, x, [1, 0, 0, 1])
    launchpad.setLed(9 - x, x, [0, 0, 1, 1])
    launchpad.setLed(x, 9 - x, [0, 1, 0, 1])
    //launchpad.setLed(9 - x, 9 - x, [1, 1, 0, 1])

    //launchpad.setLed(4.5 + Math.sin(y) * 2, 4.5 + Math.cos(y) * 2, [1, 1, 1, 0.25])

    //draw.copy(launchpad)
    launchpad.updateLeds()
    //launchpad.clearLeds()

    x += 0.1
    if (x > 10)
      x = -1

    y += 0.1
  }

  window.setInterval(step, 1 / 30 * 1000)
})
