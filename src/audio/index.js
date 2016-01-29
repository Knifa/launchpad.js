export class Audio {
  constructor () {
    this.ctx = new AudioContext()
  }
}


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


export class ADSRGraph {
  constructor(audio) {
    this.audio = audio

    this.gainNode = audio.ctx.createGain()
    this.gainNode.gain.value = 0
    this.destination = this.gainNode

    this.a = 0
    this.d = 0.1
    this.s = 0
    this.r = 0.1
  }

  connect(destNode) {
    this.gainNode.connect(destNode)
  }

  trigger() {
    let now = this.audio.ctx.currentTime

    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.setValueAtTime(0, now)
    this.gainNode.gain.linearRampToValueAtTime(1, now + this.a)
    this.gainNode.gain.linearRampToValueAtTime(this.s, now + this.d)
  }

  release() {
    let now = this.audio.ctx.currentTime

    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.linearRampToValueAtTime(0, now + this.r)
  }
}


export class DelayGraph {
  constructor(audio) {
    this.audio = audio

    this.gainNodeIn = audio.ctx.createGain()
    this.gainNodeOut = audio.ctx.createGain()
    this.gainNodeDelay = audio.ctx.createGain()

    this.delayNode = audio.ctx.createDelay()
    this.delayNode.delayTime.value = 0.33

    this.gainNodeDelay.gain.value = 0.33

    this.gainNodeIn.connect(this.gainNodeOut)
    this.gainNodeIn.connect(this.gainNodeDelay)
    this.gainNodeDelay.connect(this.delayNode)
    this.delayNode.connect(this.gainNodeOut)
    this.delayNode.connect(this.gainNodeDelay)

    this.destination = this.gainNodeIn
  }

  connect(destNode) {
    this.gainNodeOut.connect(destNode)
  }
}
