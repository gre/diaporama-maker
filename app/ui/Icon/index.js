var React = require("react");

var Icon = React.createClass({
  render: function () {
    var style = this.props.style || {};
    if (this.props.color) {
      style.color = this.props.color;
    }
    if (this.props.size) {
      style.fontSize = this.props.size + "px";
    }
    if (this.props.onClick) {
      style.cursor = "pointer";
    }
    return <i className={"fa fa-"+this.props.name} style={style} {...this.props}></i>;
  }
});

module.exports = Icon;
