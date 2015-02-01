
var prefix = require("vendor-prefix");
var transformAttr = prefix("transform");
function translateStyle (x, y) {
  var style = {};
  style[transformAttr] = "translate("+x+"px,"+y+"px)";
  return style;
}

module.exports = translateStyle;
