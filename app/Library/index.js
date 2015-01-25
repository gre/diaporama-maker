var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Library () {

}
Library.prototype = {
  render: function () {
    return m("div.library", { style: boundToStyle(this.bound) }, "Library");
  }
};

module.exports = Library;
