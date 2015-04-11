var Q = require("q");
var _ = require("lodash");
var path = require("path");
var fs = require("./fs");

function excludedFile (name) {
  return name[0] === ".";
}

function findAllFiles (fulldir, fileFilter, dir) {
  if (!fileFilter) fileFilter = _.identity;
  if (!dir) dir = "";
  return fs.readdir(fulldir).then(function (files) {
    return Q.all(files.map(function (file) {
      return fs.stat(path.join(fulldir, file));
    }))
    .then(function (stats) {
      var all = stats.map(function (stat, i) {
        var name = files[i];
        if (!excludedFile(name)) {
          if (stat.isDirectory()) {
            return findAllFiles(path.join(fulldir, name), fileFilter, path.join(dir, name));
          }
          else if (stat.isFile() && fileFilter(name)) {
            return Q([ path.join(dir, name) ]);
          }
        }
        return Q([]);
      });
      return Q.all(all).then(function (all) {
        return _.flatten(all);
      });
    });
  });
}

module.exports = findAllFiles;
