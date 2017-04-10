// svg.topoly.js 0.1.1 - Copyright (c) 2014 Wout Fierens - Licensed under the MIT license

;(function() {

  SVG.extend(SVG.PathArray, {
    // Convert path to poly
    toPoly: function(sample) {
      var i
        , il
        , total
        , point
        , distance
        , segment
        , segments
        , segmentsQueue
        , addPoint
        , addSegmentPoint
        , lastSegment
        , segmentIndex
        , points = []
        , length = 0
        , x      = 0
        , y      = 0

      // parse sample value
      sample = new SVG.Number(sample || '1%')

      // render data
      SVG.parser.path.setAttribute('d', this.toString())

      // get total length
      total = SVG.parser.path.getTotalLength()
      
      // calculate sample distance
      if(sample.unit === '%')
        distance = total * sample.value // sample distance in %
      else if (sample.unit === 'px')
        distance = sample.value         // fixed sample distance in px
      else
        distance = total / sample.value // specific number of samples
      
      // prepare arrays
      segments = this.value
      segmentsQueue = segments.concat()

      // prepare helpers functions
      addPoint = function (px, py) {
        // get last point
        var lastPoint = points[points.length-1]

        // when the last point doesn't equal the current point add the current point
        if (!lastPoint || px != lastPoint[0] || py != lastPoint[1]) {
          points.push([px, py])
          x = px
          y = py
        }
      }

      addSegmentPoint = function (segment){
        // don't bother processing path ends
        if (segment[0] === 'Z') return

        // map segment to x and y
        switch(segment[0]) {
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
        }

        // add point
        addPoint(x, y)
      }
      
      // sample through path
      while (length < total) {
        // get segment index
        segmentIndex = SVG.parser.path.getPathSegAtLength(length)

        // get segment
        segment = segments[segmentIndex]

        // new segment? 
        if (segment != lastSegment){
          // add the segment we just left
          if (lastSegment !== undefined)
            addSegmentPoint(lastSegment)

          while (segmentsQueue.length && segmentsQueue[0] != segment)
            addSegmentPoint(segmentsQueue.shift())
          
          lastSegment = segment
        }
  
        // add points in between when curving
        switch(segment[0]) {
          case 'C':
          case 'T':
          case 'S':
          case 'Q': 
          case 'A': 
            point = SVG.parser.path.getPointAtLength(length)
            addPoint(point.x, point.y)
          break
        }
        
        // increment by sample value
        length += distance
      }
      
      // add remaining segments we didn't pass while sampling
      for (i = 0, il = segmentsQueue.length; i < il; ++i)
        addSegmentPoint(segmentsQueue[i])
      
      // send out as point array
      return new SVG.PointArray(points)
    }

  })

  SVG.extend(SVG.Path, {
    // Convert path to poly
    toPoly: function(sample, replace) {
      var poly, type
      , trans = this.transform()

      // define type
      type = /z\s*$/i.test(this.attr('d')) ? 'polygon' : 'polyline'
      
      // create poly
      poly = this.parent()[type](this.array().toPoly(sample))
        .attr(normaliseAttributes(this.attr()))
        .transform(trans)

      // insert poly
      replace ? this.replace(poly) : this.after(poly)

      return poly
    }
    
  })
  // Normalise attributes
  function normaliseAttributes(attr) {
    for (var a in attr)
      if (!/fill|stroke|opacity/.test(a))
        delete attr[a]

    return attr
  }
  
  SVG.extend(SVG.Parent, {
    // Convert path children to to poly's
    toPoly: function(sample, replace) {
      // cloning children array so that we don't touch the paths we create
      var children = [].slice.call(this.children())

      // convert to poly's
      for (var i = children.length - 1; i >= 0; i--)
        if (typeof children[i].toPoly === 'function')
          children[i].toPoly(sample, replace)
      
      return this
    }

  })

}).call(this)