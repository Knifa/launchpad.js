import 'babel-polyfill'

import tinycolor from 'tinycolor2'

import { getLaunchpad } from './launchpad'
import { LaunchpadDrawingContext, LaunchpadCanvasContext } from './launchpad/draw'

import { getAudio } from './audio'

import * as utils from './launchpad/utils'

let audio = getAudio()

getLaunchpad().then((launchpad) => {
  launchpad.setFrontLed([1, 1, 1])
  launchpad.events.on('note-on', (event) => {
    ps.push({
      x: event.x,
      y: event.y,
      s: 1,
      h: Math.random() * 360,
      v: event.velocity,
      active: true
    })

    audio.o.frequency.value = 440 * Math.pow(2, ((event.x + ((10 - event.y) * 5)) - 60) / 12)
    audio.o2.frequency.value = 440 * Math.pow(2, ((event.x + ((10 - event.y) * 5)) - 60 + 0.01) / 12)
    audio.adsr.trigger()
  })

  launchpad.events.on('note-off', (event) => {
    audio.adsr.release()
  })

  let ctx = new LaunchpadCanvasContext(launchpad)
  let ps = []

  function step() {
    let state = launchpad.getState()

    for (let p of ps) {
      if (!p.active)
        continue

      let col = tinycolor({h: p.h, s: 1, v: 1})
      let rgb = col.toRgb()
      /*ctx.plot(p.x + c.x - p.s / 2, p.y + c.y - p.s / 2, [rgb.r / 255, rgb.g / 255, rgb.b / 255,
        Math.pow(Math.abs((c.x - (p.s / 2)) * (c.y - (p.s / 2)) / p.s) * 0.5 * (1 - (p.s / 50)), 1)
      ])*/


      //for (let x = 0; x < 1 && p.s - x > 1; x+= 1) {
        ctx.ctx.beginPath()
        ctx.ctx.arc(p.x + 0.5, p.y + 0.5, p.s, 0, Math.PI * 2, false);
        ctx.ctx.strokeStyle = LaunchpadCanvasContext.RgbaToCss([rgb.r / 255, rgb.g / 255, rgb.b / 255, Math.pow(Math.max(0.75, 0), 2)])
        ctx.ctx.fillStyle = 'black'
        ctx.ctx.lineWidth = '1'
        ctx.ctx.stroke()
        //ctx.ctx.fill()
        ctx.ctx.closePath()

      //}

      ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 1, Math.max(1 - (p.s / 10), 0)])
      ctx.ctx.fillRect(p.x, p.y, 1, 1)

      p.s += 0.25
      if (p.s > 15)
        p.active = false
    }

    for (let c of utils.coordIter(10)) {
      if ((c.x + ((10 - c.y) * 5)) % 12 == 2) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 1, 0.25])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 4) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 1, 0.25])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 9) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 1, 0.25])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 11) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 1, 0.25])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 5) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 1, 0, 0.75])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 7) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([0, 1, 1, 0.75])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }

      if ((c.x + ((10 - c.y) * 5)) % 12 == 0) {
        ctx.ctx.fillStyle = LaunchpadCanvasContext.RgbaToCss([1, 0, 1, 0.75])
        ctx.ctx.fillRect(c.x - 1, c.y, 1, 1)
      }
    }

    ctx.syncCanvas(true)
    ctx.sync()
    ctx.clear()

    window.requestAnimationFrame(step)
  }

  step()
})
