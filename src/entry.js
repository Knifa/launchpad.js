import 'babel-polyfill'

import { getLaunchpad } from './launchpad'

import * as consts from './consts'
import { AudioScheduler } from './beat'

class Level {
  constructor () {
    // A 3D array of color rectangles
    // eg. patterns[0] is a list of rectangles of COLORS[0]
    this.patterns = [[[]]]
    this.beats = []
    this.beat_window = 0.10
  }

  beatSequence () {
    return this.beats.map(beat => consts.BEATS[beat])
  }

  draw (ctx) {
    for (let i = 0; i < consts.COLORS.length && i < this.patterns.length; i++) {
      ctx.fillStyle = consts.COLORS[i]
      for (let pattern of this.patterns[i]) {
        ctx.fillRect(pattern[0], pattern[1], pattern[2], pattern[3])
      }
    }
  }

  hit (sound, { x, y }) {
    let colorIndex = consts.BEATS.indexOf(sound)
    for (let pattern of this.patterns[colorIndex]) {
      if (x >= pattern[0] && x <= pattern[0] + pattern[2] &&
          y >= pattern[1] && y <= pattern[1] + pattern[3]) {
        return true
      }
    }
    return false
  }
}

let level1 = new Level()
level1.patterns = [
  [[0, 0, 5, 10]],
  [[5, 0, 5, 10]]
]
level1.beats = [consts.BEAT_ONE, consts.BEAT_TWO, consts.BEAT_TWO, consts.BEAT_ONE]

let level2 = new Level()
level2.patterns = [
  [[0, 0, 5, 5], [5, 5, 5, 5]],
  [[5, 0, 5, 5]],
  [[0, 5, 5, 5]]
]
level2.beats = [consts.BEAT_THREE, consts.BEAT_ONE, consts.BEAT_TWO, consts.BEAT_ONE]

export class Game {
  constructor () {
    getLaunchpad().then(this.start.bind(this))

    this.pulse = 1
    this.level = level2
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.seq = this.level.beatSequence()

    this.launchpad.device.events.on('pad-on', this.onPadOn.bind(this))
    this.update()
  }

  render () {
    this.launchpad.canvas.clip({ pads: true })

    this.level.draw(this.launchpad.canvas.ctx)

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
    if (this.audioScheduler.scheduledSounds.length === 0)
      return

    let now = this.audioScheduler.audio.ctx.currentTime
    let recentSound = this.audioScheduler.scheduledSounds[0]

    // Remove sounds which happened before the window
    while (recentSound.time < now - this.level.beat_window) {
      recentSound = this.audioScheduler.scheduledSounds.shift()
      if (recentSound === undefined) {
        return
      }
    }

    let afterWindowStart = now >= recentSound.time - this.level.beat_window
    let beforeWindowEnd = now <= recentSound.time + this.level.beat_window

    if (afterWindowStart && beforeWindowEnd) {
      if (this.level.hit(recentSound.sound, event.key.coord)) {
        console.log('hit', now, recentSound.time)
        this.pulse = 1
        this.audioScheduler.scheduledSounds.shift()
      } else {
        // There is still time to hit the current beat
        console.log('miss1', now, recentSound.time)
        this.pulse = 0
      }
    } else {
      console.log('miss2', now, recentSound.time)
      // It is too late to hit the current beat, so remove it
      if (afterWindowStart && !beforeWindowEnd) {
        this.audioScheduler.scheduledSounds.shift()
      }
      this.pulse = 0
    }

  }
}


let game = new Game()
