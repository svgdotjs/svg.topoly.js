describe('svg.topath.js', function() {
  
  afterEach(function() {
    draw.clear()
  })
  
  describe('toPath()', function() {
    
    var path
      , data = new SVG.PathArray('M50,50 L100,100 L100,100')

    beforeEach(function() {
      path = draw.path(data)
    })

    it('generates a polyline with an unclosed path', function() {
      path = draw.path(data)
      expect(path.toPoly() instanceof SVG.Polyline).toBeTruthy()
    })
    it('generates a polygon with a closed path', function() {
      path = draw.path(data + 'Z')
      expect(path.toPoly() instanceof SVG.Polygon).toBeTruthy()
    })

    describe('with a value of 2%', function() {
      it('generates 52 points', function() {
        expect(path.toPoly('2%').array.value.length).toBe(52)
      })
    })

    describe('with a value of 3px', function() {
      it('generates 25 points', function() {
        expect(path.toPoly('3px').array.value.length).toBe(25)
      })
    })

    describe('with a numerical value of 100', function() {
      it('generates 100 points', function() {
        expect(path.toPoly(100).array.value.length).toBe(100)
      })
    })
    
  })
  
})

