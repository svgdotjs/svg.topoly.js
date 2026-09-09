import {
  G,
  Path,
  PathArray,
  PointArray,
  Polygon,
  Polyline,
  Number as SVGNumber,
  extend,
  parser
} from '@svgdotjs/svg.js'

// Only presentation attributes are transferred to the new element. The regex
// matches the attribute itself and everything derived from it (`stroke-width`,
// `fill-opacity`, ...) but not attributes which only contain the name
// (`data-fill`) or geometry (`d`, `points`, ...)
const normaliseAttributes = (attr) => {
  const normalised = {}

  for (const key in attr) {
    if (/^(fill|stroke|opacity|transform)(-|$)/.test(key)) {
      normalised[key] = attr[key]
    }
  }

  return normalised
}

const getParserPath = (pathArray) => {
  const path = parser().path
  path.setAttribute('d', pathArray.toString())
  return path
}

const pathLength = (pathArray) => {
  return getParserPath(pathArray).getTotalLength()
}

// Split the path array into subpaths at each moveto
const splitSubPaths = (pathArray) => {
  const subPaths = []
  let current = []

  for (const segment of pathArray) {
    // every moveto after the first starts a new subpath
    if (segment[0] === 'M' && current.length) {
      subPaths.push(current)
      current = []
    }

    current.push(segment)
  }

  if (current.length) {
    subPaths.push(current)
  }

  return subPaths
}

// Convert a single subpath to a point array
const pathToPoints = (pathArray, sample) => {
  let points = []
  let length = 0
  let x = 0
  let y = 0

  // parse sample value
  sample = new SVGNumber(sample)

  // get total length
  const total = pathLength(pathArray)

  let distance

  // calculate sample distance
  if (sample.unit === '%') {
    // sample distance in %
    distance = total * sample.value
  } else if (sample.unit === 'px') {
    // fixed sample distance in px
    distance = sample.value
  } else {
    // specific number of samples
    distance = total / sample.value
  }

  // sampling with a distance of 0 would never advance
  if (total > 0 && !(distance > 0)) {
    throw new Error(
      `svg.topoly: a sample of ${sample} gives a sample distance of ${distance}`
    )
  }

  // prepare arrays
  const segmentsQueue = pathArray.slice()

  // prepare helpers functions
  const addPoint = function (px, py) {
    // get last point
    const lastPoint = points[points.length - 1]

    // when the last point doesn't equal the current point add the current point
    if (!lastPoint || px !== lastPoint[0] || py !== lastPoint[1]) {
      points.push([px, py])
      x = px
      y = py
    }
  }

  const addSegmentPoint = function (segment) {
    // don't bother processing path ends
    if (segment[0] === 'Z') return

    // map segment to x and y
    switch (segment[0]) {
      case 'M':
      case 'L':
      case 'T':
        x = segment[1]
        y = segment[2]
        break
      case 'H':
        x = segment[1]
        break
      case 'V':
        y = segment[1]
        break
      case 'C':
        x = segment[5]
        y = segment[6]
        break
      case 'S':
      case 'Q':
        x = segment[3]
        y = segment[4]
        break
      case 'A':
        x = segment[6]
        y = segment[7]
        break
    }

    // add point
    addPoint(x, y)
  }

  let lastSegment
  let segmentIndex = 0
  let subPath = new PathArray(pathArray.slice(0, segmentIndex + 1))
  let subPathLength = pathLength(subPath)

  // sample through path
  while (length < total) {
    // get segment index
    while (subPathLength < length) {
      ++segmentIndex
      subPath = new PathArray(pathArray.slice(0, segmentIndex + 1))
      subPathLength = pathLength(subPath)
    }

    // get segment
    const segment = pathArray[segmentIndex]

    // new segment?
    if (segment !== lastSegment) {
      // add the segment we just left
      if (lastSegment !== undefined) {
        addSegmentPoint(lastSegment)
      }

      // add all segments which we just skipped
      while (segmentsQueue.length && segmentsQueue[0] !== segment) {
        addSegmentPoint(segmentsQueue.shift())
      }

      lastSegment = segment
    }

    // add points in between when curving
    switch (segment[0]) {
      case 'C':
      case 'T':
      case 'S':
      case 'Q':
      case 'A': {
        const point = getParserPath(pathArray).getPointAtLength(length)
        addPoint(point.x, point.y)
        break
      }
    }

    // increment by sample value
    length += distance
  }

  let i = 0
  let il = segmentsQueue.length
  // add remaining segments we didn't pass while sampling
  for (; i < il; ++i) {
    addSegmentPoint(segmentsQueue[i])
  }

  // send out as point array
  return new PointArray(points)
}

extend(PathArray, {
  // Convert path to point data. Every subpath (`M..Z M..Z`) is sampled on its
  // own, so a merged path gives one point array per subpath
  toPoly(sample = '1%') {
    const pointArrays = splitSubPaths(this).map((subPath) =>
      pathToPoints(new PathArray(subPath), sample)
    )

    return pointArrays.length === 1 ? pointArrays[0] : pointArrays
  }
})

extend(Path, {
  // Convert path to poly
  toPoly(sample = '1%', replace = true) {
    // every subpath becomes a polygon of its own when it is closed and a
    // polyline when it is not
    const polys = splitSubPaths(this.array()).map((subPath) => {
      const Poly = subPath[subPath.length - 1][0] === 'Z' ? Polygon : Polyline
      return new Poly().plot(pathToPoints(new PathArray(subPath), sample))
    })

    // more than one subpath is wrapped in a group, so that the converted shape
    // can still be moved and styled as a whole
    const poly =
      polys.length === 1
        ? polys[0]
        : polys.reduce((group, subPoly) => group.add(subPoly), new G())

    poly.attr(normaliseAttributes(this.attr()))

    // insert poly
    if (replace) {
      this.replace(poly)
    }

    return poly
  }
})
