import { Audio } from './audio'
import { DrumSynthGraph } from './audio/synth'

import * as consts from './consts'


export class AudioScheduler {
  constructor () {
    this.audio = new Audio()

    this.delayNode = this.audio.ctx.createDelay(consts.AUDIO_DELAY)
    this.delayNode.delayTime.value = consts.AUDIO_DELAY
    this.delayNode.connect(this.audio.ctx.destination)

    this.synths = {
      kick: new DrumSynthGraph(this.audio, 200, 1),
      lowTom: new DrumSynthGraph(this.audio, 400, 1),
      highTom: new DrumSynthGraph(this.audio, 800, 1),
      defaultBeat: new DrumSynthGraph(this.audio, 100, 0.5)
    }

    for (let s in this.synths) {
      this.synths[s].connect(this.delayNode)
    }

    this.seq = []
    this.seqIndex = 0
    this.scheduledSounds = []
    this.callback = () => {}

    this.interval = window.setInterval(this.update.bind(this), consts.BEAT_DELAY)
  }

  stop () {
    window.clearInterval(this.interval)
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
      time: this.audio.ctx.currentTime + consts.AUDIO_DELAY
    })
    this.callback()
  }
}
