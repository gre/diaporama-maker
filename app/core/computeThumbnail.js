var loader = require("./loader");
var rectCrop = require("rect-crop");

function computeThumbnailImage (image, width, height) {
  var canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  var ctx = canvas.getContext("2d");
  if (image && image.width) {
    var rect = rectCrop.largest(canvas, image);
    ctx.drawImage.apply(ctx, [ image ].concat(rect).concat([ 0, 0, canvas.width, canvas.height ]));
  }
  else {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, width, height);
  }
  var dataUrl = canvas.toDataURL();
  return dataUrl;
}

function computeThumbnail (url, width, height) {
  return loader.image.load(url).then(function (image) {
    return computeThumbnailImage(image, width, height);
  });
}

computeThumbnail.fromImage = computeThumbnailImage;

module.exports = computeThumbnail;
