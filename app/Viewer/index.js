var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Viewer () {
}
Viewer.render = function (model) {
  return m("div.viewer", { style: boundToStyle(model.bound) }, "Viewer");
};

module.exports = Viewer;
