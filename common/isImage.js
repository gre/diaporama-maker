var fileInExtensions = require("./fileInExtensions");
var imageExtensions = "jpg|jpeg|png".split("|");
module.exports = function (name) {
  return fileInExtensions(name.toLowerCase(), imageExtensions);
};

