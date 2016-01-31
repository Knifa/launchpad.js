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
      if (this.currentImage >= this.images.length - 1) {
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

class StateOpenCutscene {
  constructor (game) {
    this.game = game
    this.lastTime = null
    this.image = new Image()
    this.image.src = 'img/titleScreen.png';
  }

  enter () {}
  exit () {}
  update () {
    if (this.lastTime === null) {
      this.lastTime = this.game.now
    }
    if (this.lastTime + 5 <= this.game.now) {
      this.game.nextState()
    }
  }

  render () {
    game.canvas.drawImage(this.image, 0, 0)
  }
}

class StateCredits {
  constructor (game) {
    this.game = game
    this.image = new Image()
    this.image.src = 'img/creditsScreen.png'
  }

  enter () {}
  exit () {}
  update () {
  }

  render () {
    game.canvas.drawImage(this.image, 0, 0)
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

    this.bossLasers = []
    this.yourLasers = []

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

    if (this.level)
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
    if (this.hpBar.value == 0)
      window.location.reload()

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
    if (this.level == this.levels.slice(-1)[0]) {
      this.game.nextState()
      return
    }

    this._setLevel(this.levels[++this.levelIndex])
    this.summonBar.value++
    this.symbolIndex++
    this.switchingIntro = true
  }

  _setLevel(level) {
    this.level = level
    //this.game.audioScheduler.setBeatDelay(level.beatWindow)
    this.totalBeats = 0

    this.levelBar.value = 0
    this.levelBar.maxValue = this.level ? this.level.beats.length : 8
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
    if (!this.level)
      return

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


class StateBossGameplay extends StateGameplay {
  constructor (game) {
    super(game)

    this.levels = [levels.bossLevel1]

    this.failPulse = new Pulse('#f00')
    this.goPulse = new Pulse('white')

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

    this.summonBar.maxValue = this.levels.length
    this.summonBar.value = this.summonBar.maxValue

    this.background = new Image()
    this.background.src = 'img/bossEncounter.png';

    this.island = new Image()
    this.island.src = 'img/floatingRock.png';

    this.player = new Image()
    this.player.src = 'img/player_Staff.png';

    this.playerEyes = new Image()
    this.playerEyes.src = 'img/player_eyes.png';

    this.boss = new Image()
    this.bossTheta = 0
    this.bossMul = 1
    this.boss.src = 'img/boss_base.png'

    this.boss.crystals = {}
    this.boss.crystals[consts.BEAT_0] = new Image()
    this.boss.crystals[consts.BEAT_0].src = 'img/boss_crystal_m.png'

    this.boss.crystals[consts.BEAT_1] = new Image()
    this.boss.crystals[consts.BEAT_1].src = 'img/boss_crystal_g.png'

    this.boss.crystals[consts.BEAT_2] = new Image()
    this.boss.crystals[consts.BEAT_2].src = 'img/boss_crystal_b.png'

    this.boss.crystals[consts.BEAT_3] = new Image()
    this.boss.crystals[consts.BEAT_3].src = 'img/boss_crystal_y.png'

    this.intro = true

    this.shake = 0
    this.shakeTheta = 0

    this.won = false
    this.whiteFade = 0
  }

  enter () {
    this._setLevel(this.levels[this.levelIndex])
  }

  update() {
    if (!this.intro && !this.won) {
      this._pruneScheduledSounds()
      this._handlePadOn()
    }

    if (this.won) {
      this.whiteFade += 0.005
      this.bossMul += 0.1

      if (this.whiteFade >= 1) {
        this.game.nextState()
      }
    }

    this.failPulse.update()
    this.goPulse.update()

    let remainingBossLasers = []
    for (let bossLaser of this.bossLasers) {
      bossLaser.val -= 0.1
      if (bossLaser.val > 0)
        remainingBossLasers.push(bossLaser)
    }
    this.bossLasers = remainingBossLasers

    this.bossTheta += Math.pow(this.game.globalPulse.value, 2) * 0.25
    this.shake -= 0.066
    if (this.shake < 0)
      this.shake = 0
  }

  render() {
    let shakeX = Math.random() * 8 * Math.pow(this.shake, 2) - 2
    let shakeY = Math.random() * 8 * Math.pow(this.shake, 2) - 2

    this.hpBar.render()
    this.levelBar.render()
    this.summonBar.render()

    if (this.level)
      this.level.render()

    this.failPulse.render()
    this.goPulse.render()

    this.game.canvas.clearRect(0, 0, 1440, 810)
    this.game.canvas.drawImage(this.background, 0 + shakeX, 0 + shakeX)

    this.game.canvas.drawImage(this.player, 240 + shakeX, 150 + shakeY)

    let bossY = 0 + Math.sin(this.bossTheta) * 4
    let bossYReal = 0 + Math.sin(this.bossTheta) * 4 * this.bossMul
    let bossX = 0
    if (this.won) {
      bossX = Math.random() * this.bossMul
      bossYReal += Math.random() * this.bossMul
    }
    this.game.canvas.drawImage(this.boss, 340 + bossX, bossYReal)
    for (let color in this.boss.crystals) {
      if (color != this.game.syncBar.color)
        continue

      let crystal = this.boss.crystals[color]
      this.game.canvas.drawImage(crystal, 340, bossYReal)
    }

    this.game.canvas.drawImage(this.island, 250 + shakeX, 5 - (bossY/4) + shakeY)
    this.game.canvas.drawImage(this.playerEyes, 240 + shakeX, 150 + (bossY/10) + shakeY)

    this.game.canvas.globalCompositeOperation = 'lighter'
    for (let bossLaser of this.bossLasers) {
      let style1 = tinycolor(consts.COLORS[bossLaser.color]).setAlpha(0.33)
      let style2 = tinycolor(consts.COLORS[bossLaser.color]).darken(10).setAlpha(0.5)

      let startX = 240 + 32
      let startY = 150 + 32

      let endX = 340 + 64
      let endY = 0 + 96 + bossY

      switch (bossLaser.color) {
        case consts.BEAT_0:
          endX += 32
          endY += 24
        break

        case consts.BEAT_1:
          endX -= 32
          endY += 24
        break

        case consts.BEAT_2:
          endX -= 40
          endY -= 40
        break

        case consts.BEAT_3:
          endX += 40
          endY -= 40
        break
      }

      this.game.canvas.lineCap="round"
      this.game.canvas.strokeStyle = style2
      this.game.canvas.lineWidth = bossLaser.val * 32
      this.game.canvas.beginPath()
      this.game.canvas.moveTo(startX, startY)
      this.game.canvas.lineTo(endX, endY)
      this.game.canvas.stroke()
      this.game.canvas.closePath()

      this.game.canvas.strokeStyle = style1
      this.game.canvas.lineWidth = bossLaser.val * 16
      this.game.canvas.beginPath()
      this.game.canvas.moveTo(startX, startY)
      this.game.canvas.lineTo(endX, endY)
      this.game.canvas.stroke()
      this.game.canvas.closePath()
    }
    this.game.canvas.globalCompositeOperation = 'source-over'

    if (this.won) {
      this.game.canvas.fillStyle = tinycolor('white').setAlpha(this.whiteFade).toString()
      this.game.canvas.fillRect(0, 0, 1920, 1080)

      this.game.launchpad.canvas.clip()
      this.game.launchpad.canvas.ctx.fillStyle = tinycolor('white').setAlpha(this.whiteFade).toString()
      this.game.launchpad.canvas.ctx.fillRect(0, 0, 10, 10)
    }
  }

  _beatDelayedHandler (soundColor) {
    this.totalBeats++

    if (this.won)
      return

    if (soundColor != undefined) {
      this.bossLasers.push({
        color: soundColor,
        val: 1
      })
    }


    if (this.intro && this.totalBeats === this.level.beats.length / 2) {
      this.intro = false
      this._updateAudioSchedulerSequence()
      this.totalBeats = 0
    } else {
      if (this.totalBeats === this.level.beats.length) {
        this.goPulse.trigger()
      }

      if (this.levelBar.value == this.levelBar.maxValue) {
        this.game.audioScheduler.seq = []
        this._nextLevel()
        this.summonBar.value -= 1
      }
    }
  }

  _inTutorial() {
    return this.totalBeats <= this.level.beats.length * 1
  }

  _hitBeat () {
    this.levelBar.value++



  }

  _missedBeat () {
    this.hpBar.value--
    this.failPulse.trigger()
    this.shake = 1

    if (this.hpBar.value == 0)
      window.location.reload()
  }

  _nextLevel () {
    if (this.level == this.levels.slice(-1)[0]) {
      this.won = true
      this.game.audioScheduler.seq = []
    }

    this._setLevel(this.levels[++this.levelIndex])
    this.intro = true
    this.totalBeats = 0
    //this.summonBar.value++
  }

  _setLevel(level) {
    this.level = level
    //this.game.audioScheduler.setBeatDelay(level.beatDelay)
    this.totalBeats = 0

    this.levelBar.value = 0

    let beatCount = 0
    if (this.level) {
      for (let beat of this.level.beats) {
        if (beat != null)
          beatCount++
      }
    }

    this.levelBar.maxValue = beatCount
  }
}


class Game {
  constructor () {
    getLaunchpad(true).then(this.start.bind(this))

    this.globalPulse = new Pulse()

    this.totalBeats = 0

    this.canvas = document.getElementById('theScreen').getContext('2d')
    this.canvas.imageSmoothingEnabled = false
    this.canvas.scale(3, 3)

    this.syncBar = new SyncBar()

    this.states = {}
    this.states[consts.STATE_OPEN_CUTSCENE] = new StateOpenCutscene(this)
    this.states[consts.STATE_GAMEPLAY] = new StateGameplay(this)
    this.states[consts.STATE_BOSSPLAY] = new StateBossGameplay(this)
    this.states[consts.STATE_BOSS_CUTSCENE] = new StateBossCutscene(this)
    this.states[consts.STATE_CREDITS] = new StateCredits(this)
    this._state = consts.STATE_OPEN_CUTSCENE
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
      case consts.STATE_OPEN_CUTSCENE:
        this._state = consts.STATE_GAMEPLAY
        break

      case consts.STATE_GAMEPLAY:
        this._state = consts.STATE_BOSS_CUTSCENE
        break

      case consts.STATE_BOSS_CUTSCENE:
        this._state = consts.STATE_BOSSPLAY
        break

      case consts.STATE_BOSSPLAY:
        this._state = consts.STATE_CREDITS
        break
    }
    this.currentState = this.states[this._state]
    if (this.currentState.enter) {
      this.currentState.enter()
    }
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
