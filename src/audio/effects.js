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
