var Qimage = require("qimage");
var toProjectUrl = require("./toProjectUrl");
var rectCrop = require("rect-crop");

function computeThumbnail (url, width, height) {
  return Qimage(toProjectUrl(url)).then(function (image) {
    var canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    var ctx = canvas.getContext("2d");
    var rect = rectCrop.largest(canvas, image);
    ctx.drawImage.apply(ctx, [ image ].concat(rect).concat([ 0, 0, canvas.width, canvas.height ]));
    var dataUrl = canvas.toDataURL();
    return dataUrl;
  });
}

module.exports = computeThumbnail;
