var React = require("react");

var DurationInput = React.createClass({
  onChange: function (e) {
    if (this.props.onChange) this.props.onChange(1000 * parseFloat(e.target.value));
  },
  getDefaultProps: function () {
    return {
      min: 0.1,
      step: 0.1,
      max: 10,
      value: 1,
      width: 400
    };
  },
  render: function () {
    var width = this.props.width;
    var halfWidth = Math.floor(width/2);
    var inputWidth = 40;
    var value = this.props.value / 1000;
    return <p>
      <label style={{ width: width+"px" }}>
        <strong style={{ width: (width/2)+"px", display: "inline-block", textAlign: "right" }}>
          {this.props.title}
        </strong>
        &nbsp;
        <span style={{ width: halfWidth+"px" }}>
          <input style={{ width: inputWidth+"px" }} type="number"
            min={this.props.min}
            step={this.props.step}
            max={this.props.max}
            value={value}
            onChange={this.onChange} />
          &nbsp;
          <span>seconds</span>
          {this.props.children}
        </span>
      </label>
    </p>;
  }
});

module.exports = DurationInput;
