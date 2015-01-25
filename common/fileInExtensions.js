
var _ = require("lodash");

module.exports = function fileInExtensions (name, extensions) {
  var i = name.lastIndexOf(".");
  if (i === -1) return false;
  return _.contains(extensions, name.slice(i+1));
};

