var path = require("path");
var Q = require("q");
var _ = require("lodash");
var inquirer = require("inquirer");
var browserify = require("browserify");
var uglify = require("uglify-stream");

var package = require("../package.json");
var fs = require("./fs"); // FIXME use q-io

var prompt = function (questions) {
  var d = Q.defer();
  inquirer.prompt(questions, d.resolve);
  return d.promise;
};

var imageExtensions = "jpg|jpeg|png".split("|");

function isImageFilename (name) {
  var i = name.lastIndexOf(".");
  if (i === -1) return false;
  return _.contains(imageExtensions, name.slice(i+1));
}

function findAllImages (fulldir, dir) {
  if (!dir) dir = "";
  return fs.readdir(fulldir).then(function (files) {
    return Q.all(files.map(function (file) {
      return fs.stat(path.join(dir, file));
    }))
    .then(function (stats) {
      var all = stats.map(function (stat, i) {
        var name = files[i];
        if (stat.isDirectory()) {
          return findAllImages(path.join(fulldir, name), path.join(dir, name));
        }
        else if (stat.isFile() && isImageFilename(name)) {
          return Q([ path.join(dir, name) ]);
        }
      });
      return Q.all(all).then(function (all) {
        return _.flatten(all);
      });
    });
  });
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
    .then(function (json) {
      return Diaporama(dir, json);
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
      var json = Q({
        generator: package.version
      });

      if (answers.bootstrap === "images") {
        json = Q.all([ json, findAllImages(dir) ])
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
      JSON.stringify(this.json, null, '  ')
    ).thenResolve(this);
  }
};

module.exports = Diaporama;
