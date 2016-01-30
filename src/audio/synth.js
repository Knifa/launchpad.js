import { ADSRGraph } from './core'


export class SynthGraph {
  constructor (audio) {
    this.audio = audio

    this.osc = this.audio.ctx.createOscillator()
    this.osc.type = 'triangle'
    this.osc.frequency.value = 100

    this.adsr = new ADSRGraph(this.audio)

    this.osc.connect(this.adsr.destination)
    this.osc.start()
  }

  connect(destNode) {
    this.adsr.connect(destNode)
  }

  trigger() {
    this.adsr.trigger()
  }

  release() {
    this.adsr.release()
  }
}


export class DrumSynthGraph {
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
