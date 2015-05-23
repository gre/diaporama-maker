var path = require("path");
var _ = require("lodash");
var Q = require("q");
var archiver = require("archiver");
var gm = require("gm");

var pack = require("../package.json");
var fs = require("./fs");

function getInitialJson () {
  return {
    generator: { version: pack.version, url: pack.homepage },
    timeline: []
  };
}

function Diaporama (dir, json) {
  if (!(this instanceof Diaporama)) return new Diaporama(dir, json);
  this.dir = dir;
  this.json = json;
}

Diaporama.jsonfile = "diaporama.json";

Diaporama.fromDirectory = function (dir) {
  return fs.readFile(path.join(dir, Diaporama.jsonfile))
    .then(JSON.parse)
    .then(Diaporama.validate)
    .then(function (json) {
      return Diaporama(dir, json);
    });
};

Diaporama.validate = function (json) {
  return Q.fcall(function () {
    if (typeof json !== "object") throw new Error("diaporama.json: must be a json object");
    if (Object.keys(json).length === 0) throw new Error("diaporama.json: must be non empty");
    return json;
  });
};

Diaporama.genEmpty = function (dir) {
  return Diaporama(dir, getInitialJson());
};

var formats = {
  low: {
    max: 512,
    contentType: "image/jpeg",
    ext: "JPEG",
    quality: 0.9
  },
  medium: {
    max: 1024,
    contentType: "image/jpeg",
    ext: "JPEG",
    quality: 0.9
  },
  high: {
    max: 2048,
    contentType: "image/jpeg",
    ext: "JPEG",
    quality: 0.95
  },
  original: null
};

Diaporama.prototype = {
  zip: function (options) {
    options = _.extend({
      quality: "original",
      zipIncludesWeb: "true"
    }, options);
    options.zipIncludesWeb = options.zipIncludesWeb==="true";
    var root = this.dir;
    var diaporama = this.json;
    var images = _.compact(_.pluck(diaporama.timeline, "image"));
    var archive = archiver("zip");

    var imagesConvertions = _.map(images, function (image) {
      var file = path.join(root, image);
      var fileStream = fs.createReadStream(file);
      var filter = formats[options.quality];
      var d = Q.defer();
      if (filter) {
        gm(fileStream).size({bufferStream: true}, function (err, size) {
          var w = size.width;
          var h = size.height;
          var ratio = w / h;
          var m = filter.max;

          if (ratio > 1) {
            h = Math.round(m / ratio);
            w = m;
          }
          else {
            w = Math.round(m * ratio);
            h = m;
          }
          var stream = this.resize(w, h)
              .quality(100 * filter.quality)
              .stream(filter.ext);
          d.resolve(stream);
        });
      }
      else {
        d.resolve(fileStream);
      }
      return d.promise.then(function (stream) {
        archive.append(stream, { name: image });
      });
    });

    var json = JSON.stringify(diaporama, null, 2);
    archive.append(json, { name: "diaporama.json" });

    if (options.zipIncludesWeb) {
      var js = fs.createReadStream(path.join(__dirname, '../builds/diaporama.bundle.js'));
      archive.append(js, { name: "diaporama.bundle.js" });
      var html = fs.createReadStream(path.join(__dirname, "../bootstrap/index.html"));
      archive.append(html, { name: "index.html" });
    }

    var result = Q.defer();
    archive.on('error', result.reject);
    Q.all(imagesConvertions).then(function () {
      archive.finalize();
      result.resolve(archive);
    });
    return result.promise;
  },
  save: function () {
    return fs.writeFile(
      path.join(this.dir, Diaporama.jsonfile),
      JSON.stringify(this.json, null, 2)
    ).thenResolve(this);
  },
  trySet: function (json) {
    var self = this;
    return Diaporama.validate(json)
      .then(function () {
        self.json = json;
        return self;
      });
  }
};

module.exports = Diaporama;
