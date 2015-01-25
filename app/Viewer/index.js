var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Viewer () {
}
Viewer.prototype = {
  render: function () {
    return m("div.viewer", { style: boundToStyle(this.bound) }, "Viewer");
  }
};

module.exports = Viewer;
