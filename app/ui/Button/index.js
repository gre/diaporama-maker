var React = require("react");
var _ = require("lodash");
var Radium = require('radium');

var Button = React.createClass({
  mixins: [ Radium.StyleResolverMixin, Radium.BrowserStateMixin ],

  propTypes: {
    onClick: React.PropTypes.func,
    color: React.PropTypes.string,
    bg: React.PropTypes.string,
    colorHover: React.PropTypes.string,
    bgHover: React.PropTypes.string,
    fontSize: React.PropTypes.string
  },
  
  onClick: function (e) {
    e.preventDefault();
    if (this.props.onClick) this.props.onClick(e);
  },

  render: function () {
    var color = this.props.color || "#000";
    var colorHover = this.props.colorHover || color;
    var bg = this.props.bg || "#fff";
    var bgHover = this.props.bgHover || bg;
    var styles = _.extend({
      padding: '0.2em 0.8em',
      border: 0,
      borderRadius: 4,
      cursor: 'pointer',
      fontSize: this.props.fontSize || "1em",
      fontWeight: 700,
      color: color,
      background: bg,
      textDecoration: "none",
      states: [
        {
          hover: {
            color: colorHover,
            background: bgHover
          }
        }
      ]
    }, this.props.style);

    return (
      <a href="#" onClick={this.onClick}
        {...this.getBrowserStateEvents()}
        style={this.buildStyles(styles)}
      >
        {this.props.children}
      </a>
    );
  }
});

module.exports = Button;


