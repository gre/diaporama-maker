var React = require("react");

var BooleanInput = React.createClass({
  onChange: function (input) {
    if (this.props.onChange) this.props.onChange(input.target.checked);
  },
  render: function () {
    return <p>
      <label>
        <input type="checkbox" onChange={this.onChange} checked={this.props.value} />
        {this.props.title}
        {this.props.children}
      </label>
    </p>;
  }
});

module.exports = BooleanInput;
