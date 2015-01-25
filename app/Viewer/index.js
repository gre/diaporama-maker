var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Viewer () {
}
Viewer.render = function (model) {
  var title =
    m("h2", "Viewer");
  return m("div.viewer", { style: boundToStyle(model.bound) }, [ title ]);
};

module.exports = Viewer;
