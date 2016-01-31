import { getLaunchpad } from './launchpad'

import * as consts from './consts'
import { AudioScheduler } from './beat'
import { StatusBar } from './utils'

import * as levels from './level'

class Game {
  constructor () {
    getLaunchpad(true).then(this.start.bind(this))

    this.globalPulse = 0
    this.successPulse = 0

    this.beats = 0
    this.level = null
    this.oldLevels = []
    this.levels = [levels.level1]

    this.event = null

    this.hpBar = new StatusBar({
      game: this,
      side: 'bottom',
      startValue: 16,
      minValue: 0,
      maxValue: 16,
      fillStyle: consts.COLOR_HP})

    this.levelBar = new StatusBar({
      game: this,
      side: 'left',
      startValue: 0,
      minValue: 0,
      maxValue: 8,
      fillStyle: consts.COLOR_LEVEL})
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.launchpad.device.events.on('pad-on', this._onPadOn.bind(this))

    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.events.on(
      'beat-scheduled',
      this._beatScheduledHandler.bind(this))
    this.audioScheduler.events.on(
      'beat-delayed',
      (() => { this.globalPulse = 1 }).bind(this))

    this.levelUp()
    this.update()
  }

  render () {
    this.launchpad.canvas.clip({ controls: true })
    this.launchpad.canvas.ctx.fillStyle = 'rgba(255, 255, 255, ' + this.globalPulse + ')'
    this.launchpad.canvas.ctx.fillRect(0, 9, 10, 1)

    this.level.render()
    this.hpBar.render()
    this.levelBar.render()

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  update () {
    this.render()

    this.successPulse -= 0.05
    if (this.successPulse < 0) {
      this.successPulse = 0
    }

    this.globalPulse -= 0.025
    if (this.globalPulse < 0) {
      this.globalPulse = 0
    }

    let now = this.audioScheduler.audio.ctx.currentTime
    let recentSound = this.audioScheduler.scheduledSounds[0]

    // Remove sounds which happened before the window
    while (recentSound !== undefined &&
           this.level !== null &&
           recentSound.time < now - consts.BEAT_WINDOW) {
      recentSound = this.audioScheduler.scheduledSounds.shift()
      if (recentSound !== null) {
        this._missedBeat()
      }
    }

    if (recentSound !== undefined && this.level !== null) {
      var afterWindowStart = now >= recentSound.time - consts.BEAT_WINDOW
      var beforeWindowEnd = now <= recentSound.time + consts.BEAT_WINDOW
    }

    if (this.event !== null) {
      this.handlePadOn(now, afterWindowStart, beforeWindowEnd, recentSound)
      this.event = null
    }

    window.requestAnimationFrame(this.update.bind(this))
  }

  handlePadOn (now, afterWindowStart, beforeWindowEnd, recentSound) {
    if (this.level === null || this.audioScheduler.scheduledSounds.length === 0)
      return

    if (afterWindowStart && beforeWindowEnd) {
      if (this.level.hit(recentSound.sound, this.event.key.coord)) {
        this._hitBeat()

        this.pulse = 1
        this.audioScheduler.scheduledSounds.shift()
      } else if (recentSound.sound !== 'defaultSound') {
        // There is still time to hit the current beat
        this.pulse = 0
        this._missedBeat()
      }
    } else {
      // It is too late to hit the current beat, so remove it
      if (afterWindowStart && !beforeWindowEnd) {
        this.audioScheduler.scheduledSounds.shift()
      }
      this.pulse = 0
      if (recentSound.sound !== 'defaultSound') {
        this._missedBeat()
      }
    }
  }

  levelDown () {
    this.levels.unshift(this.level)
    this.level = this.oldLevels.pop()
    this.switchAudio()
    this.tutorial = 1
  }

  levelUp () {
    this.oldLevels.push(this.level)
    this.level = this.levels.shift()
    this.switchAudio()
    this.tutorial = 1
  }

  switchAudio () {
    if (this.level === null) {
      this.audioScheduler.stop()
    } else {
      this.audioScheduler.seq = this.level.beats
    }
  }

  _onPadOn (event) {
    this.event = event
  }

  _beatScheduledHandler () {
    if (this.tutorial == 0) {
      return
    }
    this.beats++
    if (this.beats >= this.audioScheduler.seq.length * 1) {
      this.beats = 0
      this.tutorial = 0
    } else if (this.beats >= this.audioScheduler.seq.length * 1) {
      this.tutorial = 2
    }
  }

  _hitBeat () {
    console.log('hit')

    if (this.tutorial) {
      return
    }

    this.levelBar.value++
  }

  _missedBeat () {
    console.log('miss')

    if (this.tutorial) {
      return
    }

    this.hpBar.value--
    this.levelBar.value--
  }
}


export let game = new Game()
