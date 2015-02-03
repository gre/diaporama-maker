var React = require("react");
var boundToStyle = require("../../core/boundToStyle");

var m = React.createElement;

var Header = React.createClass({
  render: function () {
    return <header className="header" style={boundToStyle(this.props.bound)}>
      <h1>Diaporama Maker</h1>
    </header>;
  }
});

module.exports = Header;
