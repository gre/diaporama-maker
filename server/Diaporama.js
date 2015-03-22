var path = require("path");
var _ = require("lodash");
var Q = require("q");
var browserify = require("browserify");
var uglifyify = require("uglifyify");
var archiver = require("archiver");
var imagemagick = require("imagemagick-native");

var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");

var package = require("../package.json");
var fs = require("./fs"); // FIXME use q-io

function getInitialJson () {
  return {
    generator: { version: package.version, url: package.homepage },
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
  return Diaporama(dir, null);
};

var imagemagickFilters = {
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
      quality: "original"
    }, options);
    var root = this.dir;
    var diaporama = this.json;
    var images = _.compact(_.pluck(diaporama.timeline, "image"));
    var archive = archiver("zip");
    _.forEach(images, function (image) {
      var file = path.join(root, image);
      var stream = fs.createReadStream(file);;
      var filter = imagemagickFilters[options.quality];
      if (filter) {
        stream = stream.pipe(imagemagick.streams.convert({
          width: filter.max,
          height: filter.max,
          resizeStyle: "aspectfit",
          quality: filter.ext,
          quality: 100 * filter.quality
        }));
      }
      archive.append(stream, { name: image });
    });

    var json = JSON.stringify(diaporama, null, 2);
    archive.append(json, { name: "diaporama.json" });

    var js = browserify()
      .transform({ global: true }, uglifyify)
      .add(path.join(__dirname, "../bootstrap/index.js"))
      .bundle();
    archive.append(js, { name: "build.js" });

    var html = fs.createReadStream(path.join(__dirname, "../bootstrap/index.html"));
    archive.append(html, { name: "index.html" });

    archive.finalize();
    return archive;
  },
  bootstrap: function (options) {
    var dir = this.dir;
    var json = Q.fcall(getInitialJson);

    if (options.pickAllImages) {
      json = Q.all([ json, findAllFiles(dir, isImage) ])
      .spread(function (json, images) {
        if (options.shuffle) {
          images.sort(function () {
            return Math.random() - 0.5;
          });
        }
        json.timeline = images.map(function (image) {
          return _.defaults({ image: image }, _.cloneDeep(options.timelineSkeleton));
        });
        return json;
      });
    }

    var diaporama = this;
    return json
      .then(function (json) {
        diaporama.json = json;
        return diaporama;
      });
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
