import { getLaunchpad } from './launchpad'

import * as consts from './consts'
import { AudioScheduler } from './beat'
import { StatusBar, SyncBar, Pulse } from './utils'

import * as levels from './level'

class Game {
  constructor () {
    getLaunchpad(true).then(this.start.bind(this))

    this.globalPulse = new Pulse()
    this.failPulse = new Pulse('#f00')
    this.goPulse = new Pulse('white')

    this.totalBeats = 0

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
      maxValue: 16,
      fillStyle: consts.COLOR_LEVEL})

    this.syncBar = new SyncBar()

    this.now = null
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.launchpad.device.events.on('pad-on', (event) => { this.event = event })

    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.events.on(
      'beat-delayed',
      this._beatDelayedHandler.bind(this))

    this.levelUp()
    this.update()
  }

  render () {
    this.level.render()
    this.hpBar.render()
    this.levelBar.render()
    this.syncBar.render()

    this.failPulse.render()
    this.goPulse.render()

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  update () {
    this.now = this.audioScheduler.audio.ctx.currentTime

    this._updatePulses()
    this._pruneScheduledSounds()
    this._handlePadOn()

    this.render()
    window.requestAnimationFrame(this.update.bind(this))
  }

  _handlePadOn () {
    let event = this.event
    this.event = null

    if (!event || this.level === null || this._inTutorial())
      return

    if (this.audioScheduler.scheduledSounds.length === 0) {
      this._missedBeat()
      return
    }

    let recentSound = this.audioScheduler.scheduledSounds[0]
    let afterWindowStart = this.now >= recentSound.time - consts.BEAT_WINDOW
    let beforeWindowEnd = this.now <= recentSound.time + consts.BEAT_WINDOW

    if (afterWindowStart && beforeWindowEnd) {
      if (this.level.hit(recentSound.sound, event.key.coord)) {
        this._hitBeat()
        this.audioScheduler.scheduledSounds.shift()
      } else if (recentSound.sound !== null) {
        // There is still time to hit the current beat
        this._missedBeat()
      }
    } else {
      // It is too late to hit the current beat, so remove it
      if (afterWindowStart && !beforeWindowEnd) {
        this.audioScheduler.scheduledSounds.shift()
      }
      if (recentSound.sound !== null) {
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

  _beatDelayedHandler (soundColor) {
    this.globalPulse.trigger()

    this.totalBeats++
    if (this.totalBeats === this.level.beats.length * consts.TUTORIAL_BARS) {
      this.goPulse.trigger()
    }

    this.syncBar.color = soundColor
  }

  _hitBeat () {
    this.levelBar.value += 2
  }

  _missedBeat () {
    this.hpBar.value--
    this.levelBar.value--
    this.failPulse.trigger()
  }

  _updatePulses() {
    this.globalPulse.update()
    this.failPulse.update()
    this.goPulse.update()
  }

  _pruneScheduledSounds () {
    let recentSound = this.audioScheduler.scheduledSounds[0]

    while (recentSound !== undefined &&
           this.level !== null &&
           this.now > recentSound.time + consts.BEAT_WINDOW) {
      recentSound = this.audioScheduler.scheduledSounds.shift()
      if (recentSound !== null &&
          recentSound !== undefined
          && !this._inTutorial()) {
        this._missedBeat()
      }
    }
  }

  _inTutorial () {
    return this.totalBeats <= this.level.beats.length * consts.TUTORIAL_BARS
  }
}


export let game = new Game()
