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
