
var prefix = require("vendor-prefix");
var transformAttr = prefix("transform");
var transformOriginAttr = prefix("transform-origin");

function centeredRotate (degrees, scale) {
  var imgStyle = {};
  imgStyle[transformOriginAttr] = "50% 50%";
  imgStyle[transformAttr] = "rotate("+degrees+"deg)"+(scale ? " scale("+scale+")" : "");
  return imgStyle;
}

module.exports = centeredRotate;

