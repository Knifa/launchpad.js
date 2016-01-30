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

  draw (canvas, sound) {
    canvas.clip({ pads: true })
    for (let i = 0; i < consts.COLORS.length && i < this.patterns.length; i++) {
      canvas.ctx.fillStyle = consts.COLORS[i]
      for (let pattern of this.patterns[i]) {
        canvas.ctx.fillRect(pattern[0], pattern[1], pattern[2], pattern[3])
      }
    }

    canvas.clip({ controls: true })
    if (sound !== null) {
      let colorIndex = consts.BEATS.indexOf(sound)
      canvas.ctx.fillStyle = consts.COLORS[colorIndex]
      canvas.ctx.fillRect(0, 0, 10, 1)
    }
  }

  hit (sound, { x, y }) {
    let colorIndex = consts.BEATS.indexOf(sound)
    for (let pattern of this.patterns[colorIndex]) {
      if (x >= pattern[0] && x < pattern[0] + pattern[2] &&
          y >= pattern[1] && y < pattern[1] + pattern[3]) {
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

let level3 = new Level()
level3.patterns = [
  [[1, 0, 1, 10], [4, 0, 1, 10], [7, 0, 1, 10]],
  [[2, 0, 1, 10], [5, 0, 1, 10], [8, 0, 1, 10]],
  [[3, 0, 1, 10], [6, 0, 1, 10]]
]
level3.beats = [consts.BEAT_ONE, consts.BEAT_TWO, consts.BEAT_THREE]

let level4 = new Level()
level4.patterns = [
  [[3, 1, 1, 1], [6, 1, 1, 1], [5, 5, 2, 1]],
  [[2, 4, 1, 1], [4, 4, 2, 1], [7, 4, 1, 1], [3, 7, 3, 2], [6, 8, 1, 1], [7, 7, 1, 1]],
  [[3, 2, 4, 2], [3, 4, 1, 1], [6, 4, 1, 1], [4, 6, 1, 1], [6, 6, 1, 1]],
  [[1, 4, 1, 1], [3, 5, 1, 2], [4, 5, 1, 1], [5, 6, 1, 1], [8, 4, 1, 1]]
]
level4.beats = [consts.BEAT_ONE, consts.BEAT_TWO, consts.BEAT_THREE, consts.BEAT_FOUR]

export class Game {
  constructor () {
    getLaunchpad().then(this.start.bind(this))

    this.pulse = 1
    this.hp = 8
    this.level = null
    this.oldLevels = []
    this.levels = [level1, level2, level3, level4]
    this.levelUp()
    this.event = null
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.seq = this.level.beatSequence()

    this.launchpad.device.events.on('pad-on', this.onPadOn.bind(this))
    this.update()
  }

  render () {
    this.level.draw(this.launchpad.canvas, this.drawBar)

    this.launchpad.canvas.clip({ controls: true })
    this.launchpad.canvas.ctx.fillStyle = 'rgba(255, 255, 255, ' + this.pulse + ')'
    this.launchpad.canvas.ctx.fillRect(0, 9, 10, 1)
    this.launchpad.canvas.ctx.fillStyle = 'rgba(0, 0, 255, 1)'
    if (this.hp > 8) {
      this.launchpad.canvas.ctx.fillRect(9, 0, 1, this.hp - 7)
    }
    this.launchpad.canvas.ctx.fillRect(0, 0, 1, this.hp + 1)

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

    let now = this.audioScheduler.audio.ctx.currentTime
    let recentSound = this.audioScheduler.scheduledSounds[0]

    // Remove sounds which happened before the window
    while (recentSound !== undefined &&
           this.level !== null &&
           recentSound.time < now - this.level.beat_window) {
      recentSound = this.audioScheduler.scheduledSounds.shift()
      if (recentSound !== undefined) {
        this.hpDown()
      }
    }

    this.drawBar = null
    if (recentSound !== undefined && this.level !== null) {
      var afterWindowStart = now >= recentSound.time - this.level.beat_window
      var beforeWindowEnd = now <= recentSound.time + this.level.beat_window

      if (afterWindowStart && beforeWindowEnd) {
        this.drawBar = recentSound.sound
      }
    }

    if (this.event !== null) {
      this.handlePadOn(now, afterWindowStart, beforeWindowEnd, recentSound)
      this.event = null
    }

    if (this.level !== null) {
      window.requestAnimationFrame(this.update.bind(this))
    } else {
      console.log("no more levels :[")
      this.audioScheduler.stop()
    }
  }

  handlePadOn (now, afterWindowStart, beforeWindowEnd, recentSound) {
    if (this.level === null || this.audioScheduler.scheduledSounds.length === 0)
      return

    if (afterWindowStart && beforeWindowEnd) {
      if (this.level.hit(recentSound.sound, this.event.key.coord)) {
        console.log('hit', now, recentSound.time)
        this.hpUp()
        this.pulse = 1
        this.audioScheduler.scheduledSounds.shift()
      } else {
        // There is still time to hit the current beat
        console.log('miss1', now, recentSound.time)
        this.pulse = 0
        this.hpDown()
      }
    } else {
      console.log('miss2', now, recentSound.time)
      // It is too late to hit the current beat, so remove it
      if (afterWindowStart && !beforeWindowEnd) {
        this.audioScheduler.scheduledSounds.shift()
      }
      this.pulse = 0
      this.hpDown()
    }
  }

  hpDown () {
    this.hp = Math.max(-1, this.hp - 1)
    if (this.hp === -1) {
      this.levelDown()
    }
  }

  hpUp() {
      this.hp = Math.min(17, this.hp + 1)
      if (this.hp === 17) {
        this.levelUp()
      }
  }

  levelDown () {
    this.levels.unshift(this.level)
    this.level = this.oldLevels.pop()
    this.hp = 8
  }

  levelUp () {
    this.oldLevels.push(this.level)
    this.level = this.levels.shift()
    this.hp = 8
  }

  onPadOn (event) {
    this.event = event
  }
}


let game = new Game()
