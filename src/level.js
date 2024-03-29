import * as _ from 'lodash'
import tinycolor from 'tinycolor2'

import { game } from './game'
import * as consts from './consts'
import { gisAWeeShadowPal } from './utils'


export class Region {
  constructor (x, y, width, height, beat) {
    this.x = x
    this.y = y
    this.width = width
    this.height = height

    this.beat = beat
    this.fillStyle = consts.COLORS[this.beat]
  }

  render () {
    game.launchpad.canvas.clip({ pads: true })

    let fillStyle = tinycolor(this.fillStyle)
    if (this.beat == game.syncBar.color) {
      fillStyle = fillStyle
        .setAlpha((game.globalPulse.value * 0.25) + 0.75)
        .toString()
    } else {
      fillStyle = fillStyle
        .setAlpha(0.75)
        .toString()
    }

    game.launchpad.canvas.ctx.fillStyle = fillStyle
    game.launchpad.canvas.ctx.fillRect(
      this.x, this.y, this.width, this.height)
  }

  inRegion (coord) {
    if (coord.x >= this.x && coord.x < this.x + this.width &&
        coord.y >= this.y && coord.y < this.y + this.height) {
      return true
    } else {
      return false
    }
  }
}


export class Level {
  constructor (beatDelay = consts.BEAT_DELAY) {
    this.regions  = []
    this.beats = []
    this.beatDelay = beatDelay
  }

  render () {
    for (let region of this.regions) {
      region.render()
    }
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

level1.regions = [
  new Region(
    0, 0,
    5, 10,
    consts.BEAT_0
  ),
  new Region(
    5, 0,
    5, 10,
    consts.BEAT_1
  )
]

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


export let level2 = new Level()

level2.regions = [
  new Region(
    0, 0,
    5, 5,
    consts.BEAT_0
  ),
  new Region(
    5, 0,
    5, 5,
    consts.BEAT_1
  ),
  new Region(
    0, 5,
    10, 5,
    consts.BEAT_2
  )
]

level2.beats = [
  consts.BEAT_0,
  consts.BEAT_1,
  null,
  null,
  consts.BEAT_0,
  consts.BEAT_2,
  null,
  null
]

export let level3 = new Level()

level3.regions = [
  new Region(
    1, 0,
    1, 10,
    consts.BEAT_0
  ),
  new Region(
    3, 0,
    1, 10,
    consts.BEAT_1
  ),
  new Region(
    5, 0,
    1, 10,
    consts.BEAT_2
  ),

  new Region(
    7, 0,
    1, 10,
    consts.BEAT_3
  )
]

level3.beats = [
  consts.BEAT_0,
  consts.BEAT_1,
  consts.BEAT_2,
  null,
  consts.BEAT_3,
  consts.BEAT_2,
  consts.BEAT_3,
  null
]

export let level4 = new Level()

level4.regions = [
  new Region(
    1, 1,
    2, 2,
    consts.BEAT_0
  ),
  new Region(
    3, 1,
    2, 2,
    consts.BEAT_1
  ),
  new Region(
    5, 1,
    2, 2,
    consts.BEAT_2
  ),
  new Region(
    7, 1,
    2, 2,
    consts.BEAT_3
  ),

  new Region(
    1, 3,
    2, 2,
    consts.BEAT_1
  ),
  new Region(
    3, 3,
    2, 2,
    consts.BEAT_2
  ),
  new Region(
    5, 3,
    2, 2,
    consts.BEAT_3
  ),
  new Region(
    7, 3,
    2, 2,
    consts.BEAT_0
  ),

  new Region(
    1, 5,
    2, 2,
    consts.BEAT_2
  ),
  new Region(
    3, 5,
    2, 2,
    consts.BEAT_3
  ),
  new Region(
    5, 5,
    2, 2,
    consts.BEAT_0
  ),
  new Region(
    7, 5,
    2, 2,
    consts.BEAT_1
  ),

  new Region(
    1, 7,
    2, 2,
    consts.BEAT_3
  ),
  new Region(
    3, 7,
    2, 2,
    consts.BEAT_0
  ),
  new Region(
    5, 7,
    2, 2,
    consts.BEAT_1
  ),
  new Region(
    7, 7,
    2, 2,
    consts.BEAT_2
  )
]

level4.beats = [
  consts.BEAT_0,
  consts.BEAT_1,
  consts.BEAT_2,
  consts.BEAT_3,
  null,
  null,
  consts.BEAT_1,
  consts.BEAT_2,
  consts.BEAT_1,
  consts.BEAT_3,
  null,
  null
]

export let bossLevel1 = new Level(400)

bossLevel1.regions = [
  new Region(
    1, 1,
    2, 2,
    consts.BEAT_0
  ),
  new Region(
    3, 3,
    2, 2,
    consts.BEAT_1
  ),

  new Region(
    5, 0,
    1, 10,
    consts.BEAT_2
  ),

  new Region(
    6, 6,
    3, 1,
    consts.BEAT_3
  )
]

bossLevel1.beats = [
  consts.BEAT_3,
  consts.BEAT_3,
  consts.BEAT_2,
  null,
  consts.BEAT_0,
  consts.BEAT_2,
  null,
  null
]


export let bossLevel2 = new Level()

bossLevel2.regions = [
  new Region(
    0, 0,
    5, 5,
    consts.BEAT_0
  ),
  new Region(
    5, 0,
    5, 5,
    consts.BEAT_1
  ),
  new Region(
    0, 5,
    10, 5,
    consts.BEAT_2
  )
]

bossLevel2.beats = [
  consts.BEAT_1,
  consts.BEAT_1,
  null,
  null,
  consts.BEAT_0,
  consts.BEAT_2,
  null,
  null
]
