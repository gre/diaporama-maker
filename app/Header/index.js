var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Header () {

}
Header.prototype = {
  render: function () {
    return m("header", { style: boundToStyle(this.bound) }, "Header");
  }
};

module.exports = Header;
