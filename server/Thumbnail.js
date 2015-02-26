var send = require("send");
var parseurl = require("parseurl");
var querystring = require("querystring");
var Q = require("q");
var Qretry = require("qretry");
var FS = require("q-io/fs");
var path = require("path");
var serverStatic = require('serve-static');

var isImage = require("../common/isImage");

module.exports = function (app, io, slug, root) {
  var cacheRoot = ".cache-diaporama-maker";
  // TODO : recover from previously used tmp file? ".dmtmp" dir?

  var formats = {
    thumbnail: {
      max: 1024,
      mime: "image/jpeg",
      quality: 0.9
    }
  };

  var caches = {};
  Q.all(Object.keys(formats).map(function (k) {
    return FS.makeTree(path.join(cacheRoot, k)).then(function () {
      caches[k] = {};
    });
  })).done();

  var sockets = [];
  var roundRobin = 0;

  io.sockets.on('connection', function (socket) {
    sockets.push(socket);
    socket.on("disconnect", function () {
      var i = sockets.indexOf(socket);
      if (i !== -1) sockets.splice(i, 1);
    });
  });

  function getThumbnail (thumbroot, url, format) {
    var max = formats[format].max;
    var cache = caches[format];
    if (cache[url]) return cache[url];

    var fileTo = path.join(path.resolve(thumbroot), path.resolve(url));

    // TODO : ensure that fileTo modified time > fileFrom modified time

    cache[url] = (FS.makeTree(path.dirname(fileTo))
      .then(function () {
        return Qretry(function () {
          if (sockets.length === 0) throw new Error("no more sockets");
          roundRobin = roundRobin+1 < sockets.length ? roundRobin+1 : 0;
          var d = Q.defer();
          var socket = sockets[roundRobin];
          socket.once(slug+"/"+url, function (dataUrl) {
            var split = dataUrl.split(",");
            var buffer = new Buffer(split[1], 'base64');
            FS.write(fileTo, buffer).then(d.resolve, d.reject);
          });
          socket.emit(slug+"/compute", url, formats[format]);
          return d.promise.timeout(2000);
        }, { maxRetry: 3, interval: 200 });
      }));

    cache[url].fail(function () {
      delete cache[url];
    });

    return cache[url];
  }

  var rootStatic = serverStatic(root);

  app.use("/"+slug, function (req, res, next) {
    if (!cacheRoot) next();

    var url = parseurl(req);
    var pathname = url.pathname;

    function fallback (e) {
      if (e) console.error("Thumbnail: Fallback:", e);
      rootStatic(req, res, next);
    }

    var shouldFallback = true;

    if (isImage(pathname) && url.query) {
      var query = querystring.parse(url.query);
      var format = query.format;
      if (format) {
        var cacheDir = path.join(cacheRoot, format);
        if (format in formats) {
          getThumbnail(cacheDir, pathname, format).then(function () {
            send(req, pathname, { root: cacheDir }).pipe(res);
          }, fallback);

          shouldFallback = false;
        }
      }
    }

    if (shouldFallback) fallback();
  });

};
