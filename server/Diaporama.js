var path = require("path");
var Q = require("q");
var inquirer = require("inquirer");
var browserify = require("browserify");
var uglify = require("uglify-stream");

var findAllFiles = require("./findAllFiles");

var package = require("../package.json");
var fs = require("./fs"); // FIXME use q-io

var prompt = function (questions) {
  var d = Q.defer();
  inquirer.prompt(questions, d.resolve);
  return d.promise;
};

var imageExtensions = "jpg|jpeg|png".split("|");

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

Diaporama.bootstrapDirectory = function (dir) {
  return prompt([
    {
      name: "bootstrap",
      type: "list",
      message: "Bootstrap a diaporama",
      choices: [
        { name: "using all images of this folder (and sub-folders recursively)", value: "images" },
        { name: "with an empty diaporama (will customize image per image later in an editor)", value: "empty" }
      ]
    },
    {
      name: "html",
      type: "confirm",
      message: "Do you want to bootstrap an index.html file running the diaporama?"
    }
  ])
    .then(function (answers) {
      var json = Q.fcall(getInitialJson);

      if (answers.bootstrap === "images") {
        json = Q.all([ json, findAllFiles(dir, imageExtensions) ])
        .spread(function (json, images) {
          json.timeline = images.map(function (image) {
            return {
              image: image,
              duration: 2000,
              transitionNext: {
                duration: 1000
              }
            };
          });
          return json;
        });
      }

      if (answers.html) {
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

      return json;
    })
    .then(function (json) {
      return Diaporama(dir, json);
    });
};

Diaporama.prototype = {
  save: function () {
    return fs.writeFile(
      path.join(this.dir, Diaporama.jsonfile),
      JSON.stringify(this.json, null, 2)
    ).thenResolve(this);
  },
  trySet: function (json) {
    var self = this;
    Diaporama.validate(json)
      .then(function () {
        self.json = json;
        return self;
      });
  }
};

module.exports = Diaporama;
