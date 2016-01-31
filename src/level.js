import * as _ from 'lodash'
import tinycolor from 'tinycolor2'

import { game } from './game'
import * as consts from './consts'


export class Region {
  constructor (level, x, y, width, height, beat) {
    this.level = level

    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.beat = beat
    this.fillStyle = consts.COLORS[this.beat]
  }

  render () {
    game.launchpad.canvas.clip({ pads: true })
    game.launchpad.canvas.ctx.fillStyle = tinycolor(this.fillStyle)
      .darken((1 - game.globalPulse) * 33)
      .toString()

    game.launchpad.canvas.ctx.fillRect(
      this.x, this.y, this.width, this.height)
  }

  inRegion (coord) {
    console.log(coord, this.x, this.y)
    if (coord.x >= this.x && coord.x < this.x + this.width &&
        coord.y >= this.y && coord.y < this.y + this.height) {
      return true
    } else {
      return false
    }
  }
}


export class Level {
  constructor () {
    this.regions  = []
    this.beats = []
  }

  render () {
    for (let region of this.regions) {
      region.render()
    }

    /*for (let i = 0; i < consts.COLORS.length && i < this.patterns.length; i++) {
      if (tutorial == 0 || (tutorial == 1 && sound !== null && i === consts.BEATS.indexOf(sound))) {
        this.game.launchpad.canvascanvas.ctx.fillStyle = tinycolor(consts.COLORS[i])
          .darken((1 - this.game.globalPulse) * 33)
          .toString()

        for (let pattern of this.patterns[i]) {
          this.game.launchpad.canvascanvas.ctx.fillRect(pattern[0], pattern[1], pattern[2], pattern[3])
        }
      }
    }*/
  }

  hit (beat, coord) {
    let soundRegions = _.filter(this.regions, (region) => {
      return region.beat === beat
    })

    return _.some(soundRegions, (region) => {
      return region.inRegion(coord)
    })
  }
}


export let level1 = new Level()

level1.regions.push(new Region(
  level1,
  0, 0,
  5, 5,
  consts.BEAT_0
))
level1.regions.push(new Region(
  level1,
  5, 5,
  5, 5,
  consts.BEAT_1
))

level1.beats = [
  consts.BEAT_0,
  consts.BEAT_0,
  null,
  null,
  consts.BEAT_1,
  consts.BEAT_1,
  null,
  null
]

/*let level2 = new Level()
level2.patterns = [
  [[0, 0, 5, 5], [5, 5, 5, 5]],
  [[5, 0, 5, 5]],
  [[0, 5, 5, 5]]
]
level2.beats = [consts.BEAT_THREE, null,
                consts.BEAT_ONE, null,
                consts.BEAT_TWO, null,
                consts.BEAT_ONE, null]

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
level4.beats = [consts.BEAT_ONE, consts.BEAT_TWO, consts.BEAT_THREE, consts.BEAT_FOUR]*/
