var React = require("react");
var _ = require("lodash");
var Radium = require('radium');

var Icon = React.createClass({
  mixins: [ Radium.StyleResolverMixin, Radium.BrowserStateMixin ],

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
    if (this.props.colorHover) {
      style.states = [
        {
          hover: {
            color: this.props.colorHover
          }
        }
      ];
    }
    var props = _.clone(this.props);
    delete props.style;
    delete props.color;
    delete props.size;
    return <i
      className={"fa fa-"+this.props.name}
      {...this.getBrowserStateEvents()}
      style={this.buildStyles(style)}
      {...props}></i>;
  }
});

module.exports = Icon;
