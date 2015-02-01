var React = require("react");
var boundToStyle = require("../../core/boundToStyle");

var m = React.createElement;

var Header = React.createClass({
  render: function () {
    return m("header", { style: boundToStyle(this.props.bound) }, [
      m("h1", null, "Diaporama Maker")
    ]);
  }
});

module.exports = Header;
