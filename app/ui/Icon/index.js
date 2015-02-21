var React = require("react");
var _ = require("lodash");

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
    var props = _.clone(this.props);
    delete props.style;
    delete props.color;
    delete props.size;
    return <i className={"fa fa-"+this.props.name} style={style} {...props}></i>;
  }
});

module.exports = Icon;
