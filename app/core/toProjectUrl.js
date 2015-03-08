var Qimage = require("qimage");
var isImage = require("../../common/isImage");

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

var max = 1024;
var mime = "image/jpg";
var quality = 0.95;

function computeDataURL (img) {
  if (img.width <= max && img.height <= max) {
    return null;
  }
  var ratio = img.width / img.height;
  if (ratio > 1) {
    canvas.width = max;
    canvas.height = Math.round(max / ratio);
  }
  else {
    canvas.width = Math.round(max * ratio);
    canvas.height = max;
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(mime, quality);
}


var _imagePromises = {};
var _dataUrls = {};
function imageP (url) {
  if (_imagePromises[url]) return _imagePromises[url];
  return (_imagePromises[url] = Qimage(url).then(function (img) {
    _dataUrls[url] = computeDataURL(img) || url;
    return img;
  }));
}
function image (url) {
  imageP(url);
  return _dataUrls[url];
}

function toProjectUrl (url) {
  return "/preview/"+url;
}

function toProjectThumbnailUrl (url) {
  var projUrl = toProjectUrl(url);
  return isImage(projUrl) && image(projUrl) || projUrl;
}

module.exports = function (url, fullSize) {
  return toProjectUrl(url);
  // FIXME: this creates freezes / crashes on start...
  //return fullSize ? toProjectUrl(url) : toProjectThumbnailUrl(url);
};

