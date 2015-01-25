var Q = require("q");
var _ = require("lodash");
var path = require("path");
var fs = require("./fs"); // FIXME use q-io

function fileInExtensions (name, extensions) {
  var i = name.lastIndexOf(".");
  if (i === -1) return false;
  return _.contains(extensions, name.slice(i+1));
}

function findAllFiles (fulldir, extensions, dir) {
  if (!dir) dir = "";
  return fs.readdir(fulldir).then(function (files) {
    return Q.all(files.map(function (file) {
      return fs.stat(path.join(dir, file));
    }))
    .then(function (stats) {
      var all = stats.map(function (stat, i) {
        var name = files[i];
        if (stat.isDirectory()) {
          return findAllFiles(path.join(fulldir, name), extensions, path.join(dir, name));
        }
        else if (stat.isFile() && fileInExtensions(name, extensions)) {
          return Q([ path.join(dir, name) ]);
        }
        else {
          return Q([]);
        }
      });
      return Q.all(all).then(function (all) {
        return _.flatten(all);
      });
    });
  });
}

module.exports = findAllFiles;

