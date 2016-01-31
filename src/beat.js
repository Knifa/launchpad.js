import { EventEmitter } from 'events'

import { Audio } from './audio'
import { SynthGraph, DrumSynthGraph } from './audio/synth'
import { DelayGraph } from './audio/effects'

import * as consts from './consts'


export class AudioScheduler {
  constructor () {
    this.audio = new Audio()

    this.delayNode = this.audio.ctx.createDelay(consts.AUDIO_DELAY)
    this.delayNode.delayTime.value = consts.AUDIO_DELAY

    this.crayDelay = new DelayGraph(this.audio)
    this.crayDelay.connect(this.audio.ctx.destination)
    this.delayNode.connect(this.crayDelay.destination)

    this.metroSynth = {
      beat: new DrumSynthGraph(this.audio, 100, 0.2),
      bar: new DrumSynthGraph(this.audio, 1600, 0.05)
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

    this.synths[consts.BEAT_0].osc.type = 'sawtooth'
    this.synths[consts.BEAT_1].osc.type = 'sawtooth'
    this.synths[consts.BEAT_2].osc.type = 'sawtooth'
    this.synths[consts.BEAT_3].osc.type = 'sawtooth'

    this.synths[consts.BEAT_0].osc.frequency.value = 300
    this.synths[consts.BEAT_1].osc.frequency.value = 400
    this.synths[consts.BEAT_2].osc.frequency.value = 600
    this.synths[consts.BEAT_3].osc.frequency.value = 700

    this.synths[consts.BEAT_0].osc2.type = 'sawtooth'
    this.synths[consts.BEAT_1].osc2.type = 'sawtooth'
    this.synths[consts.BEAT_2].osc2.type = 'sawtooth'
    this.synths[consts.BEAT_3].osc2.type = 'sawtooth'

    this.synths[consts.BEAT_0].osc2.frequency.value = 300
    this.synths[consts.BEAT_1].osc2.frequency.value = 400
    this.synths[consts.BEAT_2].osc2.frequency.value = 600
    this.synths[consts.BEAT_3].osc2.frequency.value = 700

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
    let currentSound = null

    if (this.seq.length > 0) {
      currentSound = this.seq[this.seqIndex]
      this.seqIndex = (this.seqIndex + 1) % this.seq.length

      if (currentSound !== null) {
        this.synths[currentSound].trigger()
        this.scheduledSounds.push({
          sound: currentSound,
          time: this.audio.ctx.currentTime + consts.AUDIO_DELAY
        })

        this.events.emit('beat-scheduled')
      }
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
