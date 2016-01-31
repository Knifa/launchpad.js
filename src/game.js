import tinycolor from 'tinycolor2'

import { getLaunchpad } from './launchpad'

import * as consts from './consts'
import { AudioScheduler } from './beat'
import { gisAWeeShadowPal, StatusBar, SyncBar, Pulse } from './utils'

import * as levels from './level'

class Priest {
  constructor (beat) {
    this.sprite = new Image()
    switch (beat) {
      case consts.BEAT_0:
        this.sprite.src = 'img/priest_Chanting_m.png'
        break
      case consts.BEAT_1:
        this.sprite.src = 'img/priest_Chanting_g.png'
        break
      case consts.BEAT_2:
        this.sprite.src = 'img/priest_Chanting_c.png'
        break
      case consts.BEAT_3:
        this.sprite.src = 'img/priest_Chanting_y.png'
        break
      default:
        this.sprite.src = 'img/priest_Chanting.png'
        break
    }
    this.x = beat * 50
    this.y = 197
    this.beat = beat
  }

  render () {
    let priest = game.currentState.priests[this.beat]
    if (this.beat == game.syncBar.color) {
      var y = priest.y - (Math.sin(Math.PI * game.globalPulse.value) * 15)
    } else {
      var y = priest.y
    }
    game.canvas.drawImage(priest.sprite, priest.x, y)
    gisAWeeShadowPal({ ctx: game.canvas, sprite: priest.sprite, x: priest.x, y: y})
  }
}

class Symbol {
  constructor(index) {
    this.index = index
    this.sprite = new Image()
    this.sprite.src = 'img/ritualChamber_symbols_' + (index + 1) + '.png'
  }
}

class StateBossCutscene {
  constructor (game) {
    this.game = game
    this.lastTime = null
    this.currentImage = 0
    this.images = []
    for (let i = 1; i <= 15; i++) {
      let image = new Image()
      if (i < 10) {
        image.src = 'img/cutscene/cutscene_0' + i + '.png'
      } else {
        image.src = 'img/cutscene/cutscene_' + i + '.png'
      }
      this.images.push(image)
    }

    game.canvas.drawImage(this.images[this.currentImage], 0, 0)
  }

  enter () {}
  exit () {}
  update () {
    if (this.lastTime === null) {
      this.lastTime = this.game.now
      game.canvas.save()
      game.canvas.scale(1.05, 1.05)
    }
    if (this.lastTime + 3 <= this.game.now) {
      game.canvas.restore()
      if (this.currentImage == 15) {
        this.game.nextState()
      } else {
        this.currentImage++
        this.lastTime = this.game.now
        game.canvas.save()
        game.canvas.scale(1.05, 1.05)
      }
    } else {
      game.canvas.scale(0.9996, 0.9996)
    }
  }

  render () {
    game.canvas.drawImage(this.images[this.currentImage], 0, 0)
  }
}

class StateGameplay {
  constructor(game) {
    this.game = game

    this.totalBeats = 0

    this.failPulse = new Pulse('#f00')
    this.goPulse = new Pulse('white')

    this.levels = [levels.level1, levels.level2, levels.level3, levels.level4]
    this.levelIndex = 0
    this.level = null

    this.switchingLevel = false
    this.switchingFade = 0
    this.switchingIntro = true

    this.background = new Image()
    this.background.src = 'img/ritualChamber.png';
    this.doorGlow = {
      sprite: new Image(),
      y: 246,
      zenith: 0
    };
    this.doorGlow.sprite.src = 'img/ritualChamber_glow.png'
    this.player = {
      sprite: new Image(),
      eyes: new Image(),
      x : 200,
      y: 197
    }
    this.dias = new Image()
    this.dias.src = 'img/dias.png'
    this.player.sprite.src = 'img/player_Chanting.png';
    this.player.eyes.src = 'img/player_eyes.png';
    this.priests = []
    for (let i = 0; i < 4; i++) {
      this.priests[i] = new Priest(i)
    }

    this.symbolIndex = 0
    this.symbols = []
    for (let i = 0; i < 4; i ++) {
      this.symbols.push(new Symbol(i))
    }

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
      maxValue: 4,
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

    game.canvas.fillRect(0, 0, 1440, 810)
    game.canvas.drawImage(this.background, 0, 0)

    game.canvas.drawImage(this.doorGlow.sprite, 0, this.doorGlow.y - this.doorGlow.zenith, 480, 270,
                          0, this.doorGlow.y - this.doorGlow.zenith, 480, 270)

    game.canvas.drawImage(this.player.sprite, this.player.x, this.player.y)
    game.canvas.drawImage(this.player.eyes, this.player.x, this.player.y)
    game.canvas.drawImage(this.dias, 208, 197)
    gisAWeeShadowPal({ctx: game.canvas, sprite: this.player.sprite, x: this.player.x, y: this.player.y})
    gisAWeeShadowPal({ctx: game.canvas, sprite: this.player.eyes, x: this.player.x, y: this.player.y})
    gisAWeeShadowPal({ctx: game.canvas, sprite: this.dias, x: 208, y: 197})

    this.level.render()
    this.failPulse.render()
    this.goPulse.render()

    for (let priest of this.priests) {
      priest.render()
    }

    for (let i = 0; i < this.symbolIndex; i++) {
      game.canvas.drawImage(this.symbols[i].sprite, 0, 0)
    }

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
    this.doorGlow.zenith = 246 * (this.levelBar.value / this.levelBar.maxValue)

    if (this.levelBar.value == this.levelBar.maxValue) {
      this.switchingLevel = true
      this.switchingFade = 0
      this.game.audioScheduler.seq = []
    }
  }

  _missedBeat () {
    this.hpBar.value--
    this.levelBar.value--
    this.doorGlow.zenith = 246 * (this.levelBar.value / this.levelBar.maxValue)
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
    this.symbolIndex++
    this.switchingIntro = true
  }

  _setLevel(level) {
    this.level = level
    this.totalBeats = 0

    this.levelBar.value = 0
    this.doorGlow.zenith = 0
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

    this.syncBar = new SyncBar()

    this.states = {}
    this.states[consts.STATE_GAMEPLAY] = new StateGameplay(this)
    this.states[consts.STATE_BOSS_CUTSCENE] = new StateBossCutscene(this)
    this._state = consts.STATE_BOSS_CUTSCENE
    this.currentState = this.states[this._state]

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
    this.syncBar.render()

    this.currentState.render()

    this.launchpad.canvas.sync()
    this.launchpad.canvas.clip()
    this.launchpad.canvas.clear()
  }

  nextState () {
    switch (this._state) {
      case consts.STATE_GAMEPLAY:
        this._state = consts.STATE_BOSS_CUTSCENE
        break;
    }
    this.currentState = this.states[this._state]
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
