import React from "react/addons";
import Icon from "../Icon";

var TimelineZoomControls = React.createClass({
  mixins: [ React.addons.PureRenderMixin ],

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
    const {
      style
    } = this.props;
    return <div style={style}>
      <Icon onClick={this.decrement} name="search-minus" />
      <Icon style={{marginLeft: "5px"}} onClick={this.increment} name="search-plus" />
    </div>;
  }
});

module.exports = TimelineZoomControls;
