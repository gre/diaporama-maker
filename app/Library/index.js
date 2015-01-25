var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Library () {

}

Library.render = function (model) {
  return m("div.library", { style: boundToStyle(model.bound) }, "Library");
};

module.exports = Library;
