var _ = require("lodash");
var Q = require("q");
var fs = require("fs");

module.exports = _.defaults({
  stat: Q.denodeify(fs.stat),
  readdir: Q.denodeify(fs.readdir),
  readFile: Q.denodeify(fs.readFile),
  writeFile: Q.denodeify(fs.writeFile)
}, fs);

