import {
  Path,
  PathArray,
  PointArray,
  Polygon,
  Polyline,
  Number as SVGNumber,
  extend,
  parser
} from '@svgdotjs/svg.js'

// Normalise attributes
const normaliseAttributes = (attr) => {
  for (var a in attr) {
    if (!/fill|stroke|opacity|transform/.test(a)) { delete attr[a] }
  }

  return attr
}

const getParserPath = (pathArray) => {
  const path = parser().path
  path.setAttribute('d', pathArray.toString())
  return path
}

const pathLength = (pathArray) => {
  return getParserPath(pathArray).getTotalLength()
}

extend(PathArray, {
  // Convert path to poly
  toPoly (sample = '1%') {
    let points = []
    let length = 0
    let x = 0
    let y = 0

    // parse sample value
    sample = new SVGNumber(sample)

    // get total length
    const total = pathLength(this)

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

    // prepare arrays
    const segmentsQueue = this.slice()

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
    let subPath = this.slice(0, segmentIndex + 1)
    let subPathLength = pathLength(subPath)

    // sample through path
    while (length < total) {

      // get segment index
      while (subPathLength < length) {
        ++segmentIndex
        subPath = this.slice(0, segmentIndex + 1)
        subPathLength = pathLength(subPath)
      }

      // get segment
      const segment = this[segmentIndex]

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
      case 'A':
        const point = getParserPath(this).getPointAtLength(length)
        addPoint(point.x, point.y)
        break
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

})

extend(Path, {
  // Convert path to poly
  toPoly (sample = '1%', replace = true) {
    // define type
    const Poly = /z\s*$/i.test(this.attr('d')) ? Polygon : Polyline

    const pointArray = this.array().toPoly(sample)

    // create poly
    const poly = new Poly().plot(pointArray)
      .attr(normaliseAttributes(this.attr()))

    // insert poly
    if (replace) {
      this.replace(poly)
    }

    return poly
  }

})
