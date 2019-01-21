/* global describe, beforeEach, afterEach, it, expect, draw, SVG */

window.draw = SVG().addTo('#canvas')

describe('toPoly()', function () {

  afterEach(function () {
    draw.clear()
  })

  describe('from path', function () {

    var path
    var path2
    var curvedPath
    var pathData = 'M50,50 L100,50 L100,100'

    beforeEach(function () {
      path = draw.path(pathData)
      path2 = draw.path(pathData + 'Z')
      curvedPath = draw.path('M34.5,45.5 c0,0,38-43,71-18 s31,81 20,78 c0,0,38-43,71-18 s31,81-20,78 -16-47-16-47')
    })

    it('generates a polyline', function () {
      expect(path.toPoly() instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polygon', function () {
      expect(path2.toPoly() instanceof SVG.Polygon).toBe(true)
    })
    it('generates a polyline from curved path', function () {
      expect(curvedPath.toPoly() instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline and replace', function () {
      path.toPoly('1%')
      expect(path.parent() === null).toBe(true)
    })
    it('generates a polyline with a samplerate of 5%', function () {
      expect(path.toPoly('5%') instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline with a samplerate of 5px', function () {
      expect(path.toPoly('5px') instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline with a samplerate of 5', function () {
      expect(path.toPoly('5') instanceof SVG.Polyline).toBe(true)
    })

  })

  describe('attributes', function () {
    var poly
    var path
    var pathData = 'M50,50 L100,50 L100,100'

    beforeEach(function () {
      path = draw.path(pathData)
        .fill({ color: '#f06', opacity: 0.5 })
        .stroke({ color: '#ff6', opacity: 1, width: 5 })
        .opacity(0.8)
        .scale(2, 0, 0)

      poly = path.toPoly()
    })

    it('stroke is transferred', function () {
      expect(poly.attr('stroke')).toBe(path.attr('stroke'))
      expect(poly.attr('stroke-width')).toBe(path.attr('stroke-width'))
      expect(poly.attr('stroke-opacity')).toBe(path.attr('stroke-opacity'))
    })

    it('fill is transferred', function () {
      expect(poly.attr('fill')).toBe(path.attr('fill'))
      expect(poly.attr('fill-opacity')).toBe(path.attr('fill-opacity'))
    })

    it('opacity is transferred', function () {
      expect(poly.attr('opacity')).toBe(path.attr('opacity'))
    })

    it('transform is transferred', function () {
      expect(poly.transform('scaleX')).toBe(2)
    })

  })
})
