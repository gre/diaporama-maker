var React = require("react");

var TimelineZoomControls = React.createClass({

  onchange: function (e) {
    this.props.onChange(parseFloat(e.target.value));
  },

  render: function () {
    return <div className="zoom-control">
      <span>{this.props.value}</span>
      <input type="range" min={this.props.from}
        max={this.props.to}
        step={this.props.step}
        value={this.props.value}
        onChange={this.onchange} />
    </div>;
  }
});

module.exports = TimelineZoomControls;
