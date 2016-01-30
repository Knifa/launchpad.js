import { getLaunchpad } from '../launchpad'
import { Audio, SynthGraph } from '../audio'

const AUDIO_DELAY = 0.25
const BEAT_DELAY = 500
const BEAT_WINDOW = 0.05
const COLORS = [
  '#f0f',
  '#0f0',
  '#0ff',
  '#ff0'
]

class BeatBox {
  constructor () {
    this.audio = new Audio()

    this.delayNode = this.audio.ctx.createDelay(AUDIO_DELAY)
    this.delayNode.delayTime.value = AUDIO_DELAY
    this.delayNode.connect(this.audio.ctx.destination)

    this.synths = {
      kick: new DrumSynthGraph(this.audio, 100, 0.5),
      lowTom: new DrumSynthGraph(this.audio, 400, 1),
      highTom: new DrumSynthGraph(this.audio, 800, 1)
    }

    for (let s in this.synths) {
      this.synths[s].connect(this.delayNode)
    }

    this.seq = []
    this.seqIndex = 0
    this.scheduledSounds = []

    window.setInterval(this.update.bind(this), BEAT_DELAY)
  }

  update () {
    if (this.seq.length === 0)
      return

    let currentSound = this.seq[this.seqIndex]
    this.seqIndex = (this.seqIndex + 1) % this.seq.length

    if (currentSound === null)
      return

    this.synths[currentSound].trigger()
    this.scheduledSounds.push({
      sound: currentSound,
      time: this.audio.ctx.currentTime + AUDIO_DELAY
    })
  }
}


class DrumSynthGraph {
  constructor(audio, pitch, decay) {
    this.audio = audio
    this.pitch = pitch

    this.synth = new SynthGraph(this.audio)
    this.synth.adsr.d = decay
  }

  connect(destNode) {
    this.synth.connect(destNode)
  }

  trigger() {
    this.synth.trigger()

    let now = this.audio.ctx.currentTime

    this.synth.osc.frequency.cancelScheduledValues(now)
    this.synth.osc.frequency.setValueAtTime(this.pitch, now)
    this.synth.osc.frequency.linearRampToValueAtTime(0, now + this.synth.adsr.d)
  }
}


export class Game {
  constructor () {
    getLaunchpad().then(this.start.bind(this))

    this.pulse = 1
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.beatbox = new BeatBox()
    this.beatbox.seq = ['kick', 'lowTom', 'lowTom', 'kick']

    this.launchpad.device.events.on('pad-on', this.onPadOn.bind(this))
    this.update()
  }

  render () {
    this.launchpad.canvas.clip({ pads: true })

    this.launchpad.canvas.ctx.fillStyle = COLORS[0]
    this.launchpad.canvas.ctx.fillRect(0, 0, 5, 10)

    this.launchpad.canvas.ctx.fillStyle = COLORS[1]
    this.launchpad.canvas.ctx.fillRect(5, 0, 5, 10)

    this.launchpad.canvas.clip({ controls: true })
    this.launchpad.canvas.ctx.fillStyle = 'rgba(255, 255, 255, ' + this.pulse + ')'
    this.launchpad.canvas.ctx.fillRect(0, 0, 10, 10)

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  update () {
    this.render()

    this.pulse -= 0.05
    if (this.pulse < 0) {
      this.pulse = 0
    }

    window.requestAnimationFrame(this.update.bind(this))
  }

  onPadOn(event) {
    if (this.beatbox.scheduledSounds.length === 0)
      return

    let now = this.beatbox.audio.ctx.currentTime
    let recentSound = this.beatbox.scheduledSounds[0]

    if (now >= recentSound.time - BEAT_WINDOW && now <= recentSound.time + BEAT_WINDOW) {
      if ((recentSound.sound === 'kick' && event.key.coord.x < 5) ||
          (recentSound.sound === 'lowTom' && event.key.coord.x >= 5)) {
        console.log('hit', now, recentSound.time)
        this.pulse = 1
      } else {
        console.log('miss', now, recentSound.time)
        this.pulse = 0
      }
    } else {
      console.log('miss', now, recentSound.time)
      this.pulse = 0
    }

    this.beatbox.scheduledSounds = []
  }
}
