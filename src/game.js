import { getLaunchpad } from './launchpad'

import * as consts from './consts'
import { AudioScheduler } from './beat'
import { StatusBar, SyncBar, Pulse } from './utils'

import * as levels from './level'

class Priest {
  constructor (x) {
    this.sprite = new Image()
    this.sprite.src = 'img/priest_Chanting.png'
    this.x = x
    this.y = 197
  }
}




class Game {
  constructor () {
    getLaunchpad(true).then(this.start.bind(this))

    this.globalPulse = new Pulse()
    this.failPulse = new Pulse('#f00')
    this.goPulse = new Pulse('white')

    this.totalBeats = 0

    this.levels = [levels.level1, levels.level2, levels.level3]
    this.levelIndex = 0
    this.level = null

    this.canvas = document.getElementById('theScreen').getContext('2d')
    this.canvas.imageSmoothingEnabled = false
    this.canvas.scale(3, 3)

    this.background = new Image()
    this.background.src = 'img/ritualChamber.png';
    this.player = {
      sprite: new Image(),
      eyes: new Image(),
      x : 200,
      y: 197
    }
    this.player.sprite.src = 'img/player_Chanting.png';
    this.player.eyes.src = 'img/player_eyes.png';
    this.priests = []
    for (let i = 0; i < 4; i++) {
      this.priests[i] = new Priest(i * 50)
    }

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

    this.summonBar = new StatusBar({
        game: this,
        side: 'right',
        startValue: 0,
        minValue: 0,
        maxValue: 8,
        fillStyle: consts.COLOR_SUMMON})

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

    this._setLevel(this.levels[0])
    this.update()
  }

  render () {
    this.canvas.fillRect(0, 0, 1440, 810)
    this.canvas.drawImage(this.background, 0, 0)
    //for (let priest of this.priests) {
    //  this.canvas.drawImage(priest.sprite, priest.x, priest.y)
    //}

    this.canvas.drawImage(this.player.sprite, this.player.x, this.player.y)
    this.canvas.drawImage(this.player.eyes, this.player.x, this.player.y)
    this.canvas.save()

    if (this.level)
      this.level.render()

    this.hpBar.render()
    this.levelBar.render()
    this.syncBar.render()
    this.summonBar.render()

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

  _beatDelayedHandler (soundColor) {
    this.globalPulse.trigger()

    this.totalBeats++
    if (this.totalBeats === this.level.beats.length * consts.TUTORIAL_BARS) {
      this.goPulse.trigger()
    }

    this.syncBar.color = soundColor
  }

  _hitBeat () {
    let oldLevelVal = this.levelBar.value
    this.levelBar.value += 2

    if (this.levelBar.value == this.levelBar.maxValue &&
        oldLevelVal == this.levelBar.value) {
      this._nextLevel()
    }
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

  _nextLevel () {
    this._setLevel(this.levels[++this.levelIndex])
    this.summonBar.value++
    this.audioScheduler.stop()
  }

  _setLevel(level) {
    this.level = level
    this.totalBeats = 0
    this.levelBar.value = 0

    if (this.level === undefined) {

    } else {
      this.audioScheduler.seq = this.level.beats
    }
  }
}


export let game = new Game()
