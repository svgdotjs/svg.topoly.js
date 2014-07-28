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

function getStructure(element){
	var i, child
		, structure = { type: element.tagName }

	if(element.children.length > 0) {
		structure.children = []

		for(i = 0; i < element.children.length; i++) {
			child = element.children[i]
			structure.children.push(getStructure(child))
		}
	}
	return structure;
}