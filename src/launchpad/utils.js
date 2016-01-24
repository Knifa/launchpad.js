import * as _ from 'lodash'


/**
 * Clamps x between 0 and 1. If x is Array, clamps all in array
 */
function clampNormalized(x) {
  if (x instanceof Array)
    return x.map((y) => _.clamp(y, 0, 1))
  else
    return _.clamp(x, 0, 1)
}

/**
 * A generator that returns (0, 0) through (width, height) in line order
 */
function* coordIter(width, height, step = 1) {
  if (!height)
    height = width

  for (let y = 0; y < height; y += step)
    for (let x = 0; x < width; x += step)
      yield { x, y }
}


export {
  clampNormalized,
  coordIter
}
