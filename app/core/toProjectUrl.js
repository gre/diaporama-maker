var isImage = require("../../common/isImage");

function toProjectUrl (url) {
  return "/preview/"+url+(!isImage(url) ? "" : "?format=thumbnail");
}

module.exports = toProjectUrl;

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

  Qimage(toProjectUrl(url)).then(function (img) {
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
