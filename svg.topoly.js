// svg.topoly.js 0.1.0 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license

;(function() {

  SVG.extend(SVG.PathArray, {
    // Convert path to poly
    toPoly: function(sample) {
      var total, point, distance
        , length = 0
        , points = []

      // parse sample value
      sample = new SVG.Number(sample || '1%')

      // render data
      SVG.parser.path.setAttribute('d', this.toString())

      // get total length
      total = SVG.parser.path.getTotalLength()

      // calculate sample distance
      if (sample.unit == '%') {
        // sample distance in %
        distance = total * sample.value
      } else if (sample.unit == 'px') {
        // fixed sample distance in px
        distance = sample.value
      } else {
        // specific number of samples
        distance = total / sample.value

        // remove on instance
        total -= 1
      }

      // gather points
      while (length < total) {
        point = SVG.parser.path.getPointAtLength(length)
        points.push([ point.x, point.y ])

        // increment by sample value
        length += distance
      }

      // add last point
      point = SVG.parser.path.getPointAtLength(total)
      points.push([ point.x, point.y ])

      // send out as point array
      return new SVG.PointArray(points)
    }

  })

  SVG.extend(SVG.Path, {
    // Convert path to poly*
    toPoly: function(sample, replace) {
      var poly, type

      // define type
      type = /z\s+$/i.test(this.attr('d')) ? 'polygon' : 'polyline'
      
      // create poly*
      poly = this.parent[type](this.array.toPoly(sample))

      // insert after myself
      this.after(poly)

      // remove myslef if replacement is required
      if (replace)
        this.remove()

      return poly
    }
  })

}).call(this)