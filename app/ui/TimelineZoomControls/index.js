var React = require("react/addons");
var PureRenderMixin = React.addons.PureRenderMixin;
var Icon = require("../Icon");

var TimelineZoomControls = React.createClass({
  mixins: [ PureRenderMixin ],

  getDefaultProps: function () {
    return {
      mult: 1.5
    };
  },

  increment: function () {
    this.props.onChange(this.props.value * this.props.mult);
  },

  decrement: function () {
    this.props.onChange(this.props.value / this.props.mult);
  },

  render: function () {
    return <div className="zoom-control">
      <Icon onClick={this.decrement} name="search-minus" />
      &nbsp;
      <Icon onClick={this.increment} name="search-plus" />
    </div>;
  }
});

module.exports = TimelineZoomControls;
