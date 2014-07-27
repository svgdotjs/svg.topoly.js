/* create canavs */
var canvas = document.createElement('div')
canvas.id = 'canvas'
with (canvas.style) {
  width = '1px'
  height = '1px'
  overflow = 'hidden'
}
document.getElementsByTagName('body')[0].appendChild(canvas)
window.draw = SVG(canvas)

function getStructure(element){
	var structure = {type:element.tagName};
	if(element.children.length > 0) {
		structure.children = [];
		for(var i=0;i<element.children.length;i++) {
			var child = element.children[i];
			structure.children.push(getStructure(child))
		}
	}
	return structure;
}