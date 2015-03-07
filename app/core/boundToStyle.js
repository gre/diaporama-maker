var prefix = require("vendor-prefix");

var transformAttr = prefix("transform");

module.exports = function boundToStyle (bound) {
  var o = { position: "absolute" };
  if (bound) {
    o[transformAttr] = "translate("+bound.x+"px,"+bound.y+"px)";
    o.top = 0;
    o.left = 0;
    o.width = bound.width+"px";
    o.height = bound.height+"px";
  }
  return o;
};
