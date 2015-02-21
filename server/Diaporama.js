var path = require("path");
var _ = require("lodash");
var Q = require("q");
var browserify = require("browserify");
var uglify = require("uglify-stream");

var findAllFiles = require("./findAllFiles");
var isImage = require("../common/isImage");

var package = require("../package.json");
var fs = require("./fs"); // FIXME use q-io

function getInitialJson () {
  return {
    generator: { version: package.version, url: package.homepage }
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

Diaporama.prototype = {
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

    if (options.withHTML) {
      console.log("Building browserify build.js bundle ...");
      var buildjs = Q.defer();
      var b = browserify();
      b.add(path.join(__dirname, "../bootstrap/index.js"));
      b.bundle()
        .pipe(uglify({ compress: true, mangle: true }))
        .pipe(fs.createWriteStream(path.join(dir, "build.js")))
        .on("error", buildjs.reject)
        .on("finish", buildjs.resolve);

      console.log("Bootstrapping index.html ...");
      var copyhtml = Q.defer();
      fs.createReadStream(path.join(__dirname, "../bootstrap/index.html"))
        .pipe(fs.createWriteStream(path.join(dir, "index.html")))
        .on("error", copyhtml.reject)
        .on("finish", copyhtml.resolve);

      json = Q.all([
        buildjs.promise,
        copyhtml.promise
      ]).thenResolve(json);
    }

    var diaporama = this;
    return json
      .then(function (json) {
        diaporama.json = json;
        return diaporama;
      })
      .invoke("save");
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
