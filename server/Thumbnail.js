var parseurl = require("parseurl");
var querystring = require("querystring");
var imagemagick = require("imagemagick-native");
var fs = require("fs");
var path = require("path");
var serverStatic = require('serve-static');

var isImage = require("../common/isImage");

module.exports = function (app, slug, root) {

  var formats = {
    thumbnail: {
      max: 1024,
      contentType: "image/jpeg",
      ext: "JPEG",
      quality: 0.9
    }
  };

  function getThumbnail (pathname, format) {
    return fs.createReadStream(path.join(root, pathname))
      .pipe(imagemagick.streams.convert({
        width: format.max,
        height: format.max,
        resizeStyle: "aspectfit",
        format: format.ext,
        quality: 100 * format.quality
      }));
  }

  var rootStatic = serverStatic(root);

  app.use("/"+slug, function (req, res, next) {
    var url = parseurl(req);
    var pathname = url.pathname;

    function fallback (e) {
      if (e) console.error("Thumbnail: Fallback:", e);
      rootStatic(req, res, next);
    }

    var shouldFallback = true;

    if (isImage(pathname) && url.query) {
      var query = querystring.parse(url.query);
      var format = formats[query.format];
      if (format) {
        res.setHeader("Content-Type", format.contentType);
        getThumbnail(pathname, format).on("error", fallback).pipe(res);
        shouldFallback = false;
      }
    }

    if (shouldFallback) fallback();
  });

};
