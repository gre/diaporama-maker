var parseurl = require("parseurl");
var querystring = require("querystring");
var imagemagick = require("imagemagick-native");
var fs = require("fs");
var path = require("path");
var serverStatic = require('serve-static');
var etag = require('etag');
var fresh = require('fresh');

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

  var maxAge = 60000;

  function setHeaders (res, file, stat) {
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Date', new Date().toUTCString());
    res.setHeader('Cache-Control', 'public, max-age='+maxAge);
    res.setHeader('Last-Modified', stat.mtime.toUTCString());
    res.setHeader('ETag', etag(stat));
  }

  function isFresh (req, res) {
    return fresh(req.headers, res._headers);
  }

  function isConditionalGET (req) {
    return req.headers['if-none-match'] || req.headers['if-modified-since'];
  }

  function sendThumbnail (pathname, format, req, res, fallback) {
    var file = path.join(root, pathname);
    fs.stat(file, function onstat(err, stat) {
      if (err) {
        return fallback(err);
      }

      setHeaders(res, file, stat);
      res.setHeader("Content-Type", format.contentType);
      if (isConditionalGET(req) && isFresh(req, res)) {
        Object.keys(res._headers).forEach(function(field){
          if (0 === field.indexOf('content')) {
            res.removeHeader(field);
          }
        });
        res.statusCode = 304;
        res.end();
        return;
      }

      fs.createReadStream(file)
        .pipe(imagemagick.streams.convert({
          width: format.max,
          height: format.max,
          resizeStyle: "aspectfit",
          format: format.ext,
          quality: 100 * format.quality
        }))
        .on("error", fallback)
        .pipe(res);
    });
  }

  var rootStatic = serverStatic(root);

  app.use("/"+slug, function (req, res, next) {
    var url = parseurl(req);
    var pathname = decodeURIComponent(url.pathname);

    function fallback (e) {
      if (e) console.error("Thumbnail: Fallback:", e);
      rootStatic(req, res, next);
    }

    var shouldFallback = true;

    if (isImage(pathname) && url.query) {
      var query = querystring.parse(url.query);
      var format = formats[query.format];
      if (format) {
        sendThumbnail(pathname, format, req, res, fallback);
        shouldFallback = false;
      }
    }

    if (shouldFallback) fallback();
  });

};
