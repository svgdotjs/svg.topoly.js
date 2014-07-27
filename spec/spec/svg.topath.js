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
		var curvedPath;
    beforeEach(function() {
      path = draw.path(pathData);
      path2 = draw.path(pathData+"Z");
			curvedPath = draw.path('M34.5,45.5 c0,0,38-43,71-18 s31,81 20,78 c0,0,38-43,71-18 s31,81-20,78 -16-47-16-47');
    })
		

    it('generates a polyline', function() {
      expect(path.toPoly() instanceof SVG.Polyline).toBe(true)
    })
		it('generates a polygon', function() {
      expect(path2.toPoly() instanceof SVG.Polygon).toBe(true)
    })
		it('generates a polyline from curved path', function() {
			expect(curvedPath.toPoly() instanceof SVG.Polyline).toBe(true)
    })
		
  })
	
})

