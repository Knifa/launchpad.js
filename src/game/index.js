import { getLaunchpad } from '../launchpad'
import { Audio, SynthGraph } from '../audio'

const COLORS = [
  '#f0f',
  '#0f0',
  '#0ff',
  '#ff0'
]

const SOUNDS = {
  KICK: 0,
  SNARE: 1,
  HAT: 2
}


class BeatBox {
  constructor () {
    this.audio = new Audio()

    this.drum = new DrumSynthGraph(this.audio)

    window.setInterval(function() {
      this.drum.trigger()
    }.bind(this), 1000)
  }
}


class DrumSynthGraph {
  constructor(audio) {
    this.audio = audio

    this.synth = new SynthGraph(this.audio)
    this.synth.connect(this.audio.ctx.destination)

    this.synth.adsr.d = 0.5
  }

  trigger() {
    this.synth.trigger()

    let now = this.audio.ctx.currentTime

    this.synth.osc.frequency.cancelScheduledValues(now)
    this.synth.osc.frequency.setValueAtTime(100, now)
    this.synth.osc.frequency.linearRampToValueAtTime(0, now + this.synth.adsr.d)
  }
}


export class Game {
  constructor () {
    getLaunchpad().then(this.start.bind(this))
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.beatbox = new BeatBox()

    this.launchpad.device.events.on('pad-on', function() {
      this.beatbox.synth.trigger()
    }.bind(this))

    this.launchpad.device.events.on('pad-off', function() {
      this.beatbox.synth.release()
    }.bind(this))

    this.update()
  }

  render () {
    this.launchpad.canvas.clip({ pads: true })

    this.launchpad.canvas.ctx.fillStyle = COLORS[0]
    this.launchpad.canvas.ctx.fillRect(0, 0, 5, 10)

    this.launchpad.canvas.ctx.fillStyle = COLORS[2]
    this.launchpad.canvas.ctx.fillRect(5, 0, 5, 10)

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  update () {
    this.render()

    window.requestAnimationFrame(this.update.bind(this))
  }
}
