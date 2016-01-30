import 'babel-polyfill'

import { getLaunchpad } from '../launchpad'

import * as consts from './consts'
import { BeatBox } from './beat'


export class Game {
  constructor () {
    getLaunchpad().then(this.start.bind(this))

    this.pulse = 1
  }

  start (launchpad) {
    this.launchpad = launchpad
    this.audioScheduler = new AudioScheduler()
    this.audioScheduler.seq = ['kick', 'lowTom', 'lowTom', 'kick']

    this.launchpad.device.events.on('pad-on', this.onPadOn.bind(this))
    this.update()
  }

  render () {
    this.launchpad.canvas.clip({ pads: true })

    this.launchpad.canvas.ctx.fillStyle = consts.COLORS[0]
    this.launchpad.canvas.ctx.fillRect(0, 0, 5, 10)

    this.launchpad.canvas.ctx.fillStyle = consts.COLORS[1]
    this.launchpad.canvas.ctx.fillRect(5, 0, 5, 10)

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

    if (now >= recentSound.time - consts.BEAT_WINDOW && now <= recentSound.time + consts.BEAT_WINDOW) {
      if ((recentSound.sound === 'kick' && event.key.coord.x < 5) ||
          (recentSound.sound === 'lowTom' && event.key.coord.x >= 5)) {
        console.log('hit', now, recentSound.time)
        this.pulse = 1
      } else {
        console.log('miss', now, recentSound.time)
        this.pulse = 0
      }
    } else {
      console.log('miss', now, recentSound.time)
      this.pulse = 0
    }

    this.audioScheduler.scheduledSounds = []
  }
}


let game = new Game()
