import tinycolor from 'tinycolor2'

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


class StateGameplay {
  constructor(game) {
    this.game = game

    this.totalBeats = 0

    this.failPulse = new Pulse('#f00')
    this.goPulse = new Pulse('white')

    this.levels = [levels.level1, levels.level2, levels.level3]
    this.levelIndex = 0
    this.level = null

    this.switchingLevel = false
    this.switchingFade = 0
    this.switchingIntro = true

    this.hpBar = new StatusBar({
      game: this.game,
      side: 'bottom',
      startValue: 16,
      minValue: 0,
      maxValue: 16,
      fillStyle: consts.COLOR_HP})

    this.levelBar = new StatusBar({
      game: this.game,
      side: 'left',
      startValue: 0,
      minValue: 0,
      maxValue: 8,
      fillStyle: consts.COLOR_LEVEL})

    this.summonBar = new StatusBar({
      game: this.game,
      side: 'right',
      startValue: 0,
      minValue: 0,
      maxValue: 8,
      fillStyle: consts.COLOR_SUMMON})
  }

  enter () {
    this._setLevel(this.levels[this.levelIndex])
  }

  exit () {

  }

  update() {
    if (!this.switchingLevel) {
      this._pruneScheduledSounds()
      this._handlePadOn()
    } else {
      this.switchingFade += 0.01
      if (this.switchingFade >= 1) {
        this.switchingFade = 1
      }
    }

    this.failPulse.update()
    this.goPulse.update()
  }

  render() {
    this.hpBar.render()
    this.levelBar.render()
    this.summonBar.render()

    this.level.render()
    this.failPulse.render()
    this.goPulse.render()

    if (this.switchingLevel) {
      let fillStyle = tinycolor('black').setAlpha(this.switchingFade)

      this.game.launchpad.canvas.clip({ pads: true })
      this.game.launchpad.canvas.ctx.fillStyle = fillStyle.toString()
      this.game.launchpad.canvas.ctx.fillRect(0, 0, 10, 10)
    }
  }

  _handlePadOn () {
    let event = this.game.event
    this.game.event = null

    if (!event || this.level === null || this._inTutorial())
      return

    if (this.game.audioScheduler.scheduledSounds.length === 0) {
      this._missedBeat()
      return
    }

    let recentSound = this.game.audioScheduler.scheduledSounds[0]
    let afterWindowStart =
      this.game.now >= recentSound.time - consts.BEAT_WINDOW
    let beforeWindowEnd =
      this.game.now <= recentSound.time + consts.BEAT_WINDOW

    if (afterWindowStart && beforeWindowEnd) {
      if (this.level.hit(recentSound.sound, event.key.coord)) {
        this._hitBeat()
        this.game.audioScheduler.scheduledSounds.shift()
      } else if (recentSound.sound !== null) {
        // There is still time to hit the current beat
        this._missedBeat()
      }
    } else {
      // It is too late to hit the current beat, so remove it
      if (afterWindowStart && !beforeWindowEnd) {
        this.game.audioScheduler.scheduledSounds.shift()
      }
      if (recentSound.sound !== null) {
        this._missedBeat()
      }
    }
  }

  _hitBeat () {
    this.levelBar.value++

    if (this.levelBar.value == this.levelBar.maxValue) {
      this.switchingLevel = true
      this.switchingFade = 0
      this.game.audioScheduler.seq = []
    }
  }

  _missedBeat () {
    this.hpBar.value--
    this.levelBar.value--
    this.failPulse.trigger()
  }

  _pruneScheduledSounds () {
    let recentSound = this.game.audioScheduler.scheduledSounds[0]

    while (recentSound !== undefined &&
           this.level !== null &&
           this.game.now > recentSound.time + consts.BEAT_WINDOW) {
      recentSound = this.game.audioScheduler.scheduledSounds.shift()
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
    this.switchingIntro = true
  }

  _setLevel(level) {
    this.level = level
    this.totalBeats = 0

    this.levelBar.value = 0
    this.levelBar.maxValue = this.level.beats.length

    if (this.level === undefined) {
      // sssh
    }
  }

  _updateAudioSchedulerSequence() {
    this.game.audioScheduler.seq = this.level.beats
    this.game.audioScheduler.seqIndex = 0
  }

  _beatDelayedHandler (soundColor) {
    this.totalBeats++

    if (this.switchingIntro) {
      if (this.totalBeats % this.level.beats.length * consts.SWITCH_BARS === 0) {
        this._updateAudioSchedulerSequence()
        this.switchingIntro = false;
        this.totalBeats = 0
      }
    } else if (this.switchingLevel) {
      if (this.totalBeats % this.level.beats.length * consts.SWITCH_BARS === 0
          && this.switchingFade === 1) {
        this._nextLevel()
        this.switchingLevel = false
        this.switchingFade = 0
      }
    } else {
      if (this.totalBeats === this.level.beats.length * consts.TUTORIAL_BARS) {
        this.goPulse.trigger()
      }
    }
  }
}


class Game {
  constructor () {
    getLaunchpad(false).then(this.start.bind(this))

    this.globalPulse = new Pulse()

    this.totalBeats = 0

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

    this.syncBar = new SyncBar()

    this.states = {}
    this.states[consts.STATE_GAMEPLAY] = new StateGameplay(this)
    this.currentState = this.states[consts.STATE_GAMEPLAY]

    this.now = null
    this.event = null
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.launchpad.device.events.on('pad-on', (event) => { this.event = event })

    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.events.on(
      'beat-delayed',
      this._beatDelayedHandler.bind(this))

    this.currentState.enter()
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

    this.syncBar.render()

    this.currentState.render()

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  update () {
    this.now = this.audioScheduler.audio.ctx.currentTime

    this.globalPulse.update()
    this.currentState.update()

    this.render()
    window.requestAnimationFrame(this.update.bind(this))
  }

  _beatDelayedHandler (soundColor) {
    this.globalPulse.trigger()
    this.syncBar.color = soundColor

    if (this.currentState._beatDelayedHandler)
      this.currentState._beatDelayedHandler(soundColor)
  }
}


export let game = new Game()
