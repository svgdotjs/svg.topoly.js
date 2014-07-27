/* create canavs */
var drawing = document.createElement('div')
drawing.id = 'drawing'
with (drawing.style) {
  width = '1px'
  height = '1px'
  overflow = 'hidden'
}
document.getElementsByTagName('body')[0].appendChild(drawing)
window.draw = SVG(drawing)