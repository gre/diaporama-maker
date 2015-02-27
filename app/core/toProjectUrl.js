var isImage = require("../../common/isImage");

var _loaded = {};
function image (url) {
  if (_loaded[url]) return _loaded[url];
  return (_loaded[url] = Qimage(url));
}

function toProjectUrl (url) {
  return "/preview/"+url;
}

function toProjectThumbnailUrl (url) {
  var projUrl = toProjectUrl(url);
  if (image(projUrl).isPending()) {
    return projUrl;
  }
  return projUrl + (!isImage(url) ? "" : "?format=thumbnail");
}

module.exports = toProjectThumbnailUrl;

//////// handling network resize ////////

var network = require("./network");
var Qimage = require("qimage");

var canvas = document.createElement("canvas");
var ctx = canvas.getContext("2d");

network.on("preview/compute", function (url, opts) {
  var max = opts.max;
  var mime = opts.mime;
  var quality = opts.quality;
  console.log("Compute: "+url, opts);

  image(toProjectUrl(url)).then(function (img) {
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
    var dataURL = canvas.toDataURL(mime, quality);
    network.emit("preview/"+url, dataURL);
  });
});
