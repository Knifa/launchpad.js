import { EventEmitter } from 'events'

import { Audio } from './audio'
import { SynthGraph, DrumSynthGraph } from './audio/synth'

import * as consts from './consts'


export class AudioScheduler {
  constructor () {
    this.audio = new Audio()

    this.delayNode = this.audio.ctx.createDelay(consts.AUDIO_DELAY)
    this.delayNode.delayTime.value = consts.AUDIO_DELAY
    this.delayNode.connect(this.audio.ctx.destination)

    this.metroSynth = {
      beat: new DrumSynthGraph(this.audio, 100, 0.2),
      bar: new DrumSynthGraph(this.audio, 800, 0.05)
    }

    for (let s in this.metroSynth) {
      this.metroSynth[s].connect(this.delayNode)
    }

    this.synths = {}
    this.synths[consts.BEAT_0] = new SynthGraph(this.audio)
    this.synths[consts.BEAT_1] = new SynthGraph(this.audio)
    this.synths[consts.BEAT_2] = new SynthGraph(this.audio)
    this.synths[consts.BEAT_3] = new SynthGraph(this.audio)

    for (let s in this.synths) {
      this.synths[s].connect(this.delayNode)
      this.synths[s].adsr.d = 0.25
    }

    this.synths[consts.BEAT_0].osc.frequency.value = 400
    this.synths[consts.BEAT_1].osc.frequency.value = 600
    this.synths[consts.BEAT_2].osc.frequency.value = 800
    this.synths[consts.BEAT_3].osc.frequency.value = 1000

    this.seq = []
    this.seqIndex = 0
    this.scheduledSounds = []

    this.events = new EventEmitter()

    this.interval = window.setInterval(
      this.update.bind(this),
      consts.BEAT_DELAY)
  }

  stop () {
    window.clearInterval(this.interval)
  }

  update () {
    this._triggerMetronome()

    if (this.seq.length === 0)
      return

    let currentSound = this.seq[this.seqIndex]
    this.seqIndex = (this.seqIndex + 1) % this.seq.length

    if (currentSound !== null) {
      this.synths[currentSound].trigger()
      this.scheduledSounds.push({
        sound: currentSound,
        time: this.audio.ctx.currentTime + consts.AUDIO_DELAY
      })

      this.events.emit('beat-scheduled')
    }

    this.events.emit('beat-triggered', currentSound)
    window.setTimeout(
      (() => {
        this.events.emit('beat-delayed', currentSound)
      }).bind(this), consts.AUDIO_DELAY * 1000)
  }

  _triggerMetronome () {
    this.metroSynth.beat.trigger()
    if (this.seqIndex % 4 === 0)
      this.metroSynth.bar.trigger()
  }
}
