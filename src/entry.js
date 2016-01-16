import Launchpad from './launchpad'

window.navigator.requestMIDIAccess({ sysex: true }).then(function(midi) {
  let launchpadIn, launchpadOut = null;

  midi.inputs.forEach(function(device) {
    if (device.name === 'MIDIIN2 (2- Launchpad Pro)')
      launchpadIn = device
  })

  midi.outputs.forEach(function(device) {
    if (device.name === 'MIDIOUT2 (2- Launchpad Pro)')
      launchpadOut = device
  })

  let launchpad = new Launchpad({
    midiIn: launchpadIn,
    midiOut: launchpadOut
  })

  function step() {
    launchpad.updateLeds()

    for (let y = 0; y < 8; y++)
      for (let x = 0; x < 8; x++)
        launchpad.setLed(x, y, [(7 - y) / 7, y / 7, x / 7])

    launchpad.setFrontLed([1, 1, 1])

    window.requestAnimationFrame(step)
  }
  step()
})
