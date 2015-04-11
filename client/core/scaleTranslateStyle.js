
var prefix = require("vendor-prefix");
var transformAttr = prefix("transform");
var transformOriginAttr = prefix("transform-origin");

function scaleTranslateStyle (scale, translate) {
  var imgStyle = {
    position: "absolute",
    top: 0,
    left: 0
  };
  imgStyle[transformOriginAttr] = "0% 0%";
  imgStyle[transformAttr] = "scale("+scale+") translate("+Math.round(translate[0])+"px,"+Math.round(translate[1])+"px)";
  return imgStyle;
}

module.exports = scaleTranslateStyle;
