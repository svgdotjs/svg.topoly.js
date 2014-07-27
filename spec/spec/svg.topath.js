describe('toPoly()', function() {
  
  afterEach(function() {
    draw.clear()
  })
  
  describe('from path', function() {
    
		var points = [50,50,100,50,100,100];
		var pathData = "M"+points[0]+" "+points[1];
		for(var i=2;i<points.length;i+=2) {
			pathData += " L"+points[i]+" "+points[i+1];
		}
		var path;
		var path2;
    beforeEach(function() {
      path = draw.path(pathData);
      path2 = draw.path(pathData+"Z");
    })

    it('generates a polyline', function() {
      expect(path.toPoly() instanceof SVG.Polyline).toBe(true)
    })
		it('generates a polygon', function() {
      expect(path2.toPoly() instanceof SVG.Polygon).toBe(true)
    })
		
  })
	
})

