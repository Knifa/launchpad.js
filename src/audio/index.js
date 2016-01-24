class Audio {
  constructor() {
    this.ctx = new AudioContext()

    this.adsr = new ADSRBox(this.ctx)
    this.delay = new DelayBox(this.ctx)

    this.o = this.ctx.createOscillator()
    this.o.connect(this.adsr.destination)
    this.o.type = 'square'
    this.o.frequency.value = 50
    this.o.start(0)

    this.o2 = this.ctx.createOscillator()
    this.o2.connect(this.adsr.destination)
    this.o2.type = 'square'
    this.o2.frequency.value = 50
    this.o2.start(0)

    this.adsr.connect(this.delay.destination)
    this.delay.connect(this.ctx.destination)
  }
}

export function getAudio() {
  return new Audio()
}


class ADSRBox {
  constructor(audioContext) {
    this.audioContext = audioContext

    this.gainNode = audioContext.createGain()
    this.gainNode.gain.value = 0
    this.destination = this.gainNode

    this.a = 0
    this.d = 0.1
    this.s = 0.25
    this.r = 0.1
  }

  connect(destNode) {
    this.gainNode.connect(destNode)
  }

  trigger() {
    let now = this.audioContext.currentTime

    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.setValueAtTime(0, now)
    this.gainNode.gain.linearRampToValueAtTime(1, now + this.a)
    this.gainNode.gain.linearRampToValueAtTime(this.s, now + this.d)
  }

  release() {
    let now = this.audioContext.currentTime

    this.gainNode.gain.cancelScheduledValues(now)
    this.gainNode.gain.linearRampToValueAtTime(0, now + this.r)
  }
}

class DelayBox {
  constructor(audioContext) {
    this.audioContext = audioContext

    this.gainNodeIn = audioContext.createGain()
    this.gainNodeOut = audioContext.createGain()
    this.gainNodeDelay = audioContext.createGain()

    this.delayNode = audioContext.createDelay()
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
