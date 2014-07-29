describe('toPoly()', function() {
  
  afterEach(function() {
    draw.clear()
  })
  
  describe('from path', function() {
    
    var path
      , path2
      , curvedPath
      , pathData = 'M50,50 L100,50 L100,100'

    beforeEach(function() {
      path       = draw.path(pathData)
      path2      = draw.path(pathData + 'Z')
      curvedPath = draw.path('M34.5,45.5 c0,0,38-43,71-18 s31,81 20,78 c0,0,38-43,71-18 s31,81-20,78 -16-47-16-47').translate(-10,-20)
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
    it('generates a polyline and replace', function() {
      path.toPoly('1%',true);
      expect(path.parent === null).toBe(true);
    })
    it('generates a polyline with a samplerate of 5%', function() {
      expect(path.toPoly('5%') instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline with a samplerate of 5px', function() {
      expect(path.toPoly('5px') instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline with a samplerate of 5', function() {
      expect(path.toPoly('5') instanceof SVG.Polyline).toBe(true)
    })
    it('generates a polyline and includes translate', function() {
      var poly = curvedPath.toPoly()
      expect( poly.trans.x === curvedPath.trans.x && 
              poly.trans.y === curvedPath.trans.y).toBe(true)
    })
    
  })
  
  describe('recursive from group', function() {
    var group;
    beforeEach(function() {
      group = draw.group();
      group.path('M50,50 L100,50,100,100');
      group.path('m0,50 l100,50,100,100');
      var subgroup = group.group();
      subgroup.path('M34.5,45.5 c0,0,38-43,71-18 s31,81 20,78 c0,0,38-43,71-18 s31,81-20,78 -16-47-16-47');
    })
    
    it('generates polylines', function() {
      group.toPoly();
      expect(getStructure(group.node)).toEqual({type:'g',
                                                children:[
                                                  {type:'path'},
                                                  {type:'polyline'},
                                                  {type:'path'},
                                                  {type:'polyline'},
                                                  {type:'g',
                                                   children:[
                                                     {type:'path'},
                                                     {type:'polyline'}
                                                   ]}
                                                ]});
    })
    it('generates polylines and replaces', function() {
      group.toPoly('1%',true);
      expect(getStructure(group.node)).toEqual({type:'g',
                                                children:[
                                                  {type:'polyline'},
                                                  {type:'polyline'},
                                                  {type:'g',
                                                   children:[
                                                     {type:'polyline'}
                                                   ]}
                                                ]});
    })
  })
  
})
