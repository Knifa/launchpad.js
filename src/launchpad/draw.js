import * as consts from './consts'


class LaunchpadDrawingContext {
  constructor(launchpad) {
    this.launchpad = launchpad
  }
}


class LaunchpadCanvasContext extends LaunchpadDrawingContext {
  constructor(launchpad) {
    super(launchpad)

    this.canvas = document.createElement('canvas');
    this.canvas.width = consts.GRID_SIZE;
    this.canvas.height = consts.GRID_SIZE;

    this.ctx = this.canvas.getContext('2d');
  }

  copyCanvas(launchpad) {
    let imageData = this.ctx.getImageData(
      0, 0, consts.GRID_SIZE, consts.GRID_SIZE)

    for (let y = 0; y <= consts.GRID_SIZE; y++) {
      for (let x = 0; x <= consts.GRID_SIZE; x++) {
        let data = [
          imageData.data[((y * consts.GRID_SIZE + x) * 4) + 0] / 255,
          imageData.data[((y * consts.GRID_SIZE + x) * 4) + 1] / 255,
          imageData.data[((y * consts.GRID_SIZE + x) * 4) + 2] / 255,
        ]

        this.launchpad.setLed(x, y, data)
      }
    }
  }
}


export {
  LaunchpadDrawingContext,
  LaunchpadCanvasContext
}
