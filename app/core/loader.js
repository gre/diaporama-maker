var Qimage = require("qimage");

var imageP = {};
var images = {};

function loadImage (src) {
  if (!(src in imageP) || imageP[src].isRejected()) {
    imageP[src] = Qimage(src).then(function (image) {
      images[src] = image;
      return image;
    });
  }
  return imageP[src];
}

function getImage (src) {
  return images[src];
}

module.exports = {
  image: {
    load: loadImage,
    get: getImage
  }
};
