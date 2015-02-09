var React = require("react");


var BooleanSettings = React.createClass({

  onChange: function (input) {
    this.props.onChange(input.target.checked);
  },

  render: function () {
    return <p>
      <label>Loop the slideshow
        <input type="checkbox" onChange={this.onChange} checked={this.props.value} />
      </label>
    </p>;
  }
});

var Settings = React.createClass({

  render: function () {
    var diaporama = this.props.diaporama;
    return <div>
      <BooleanSettings title="Loop the slideshow" onChange={this.props.onChange.bind(null, "loop")} value={diaporama.loop} />
    </div>;
  }

});

module.exports = Settings;
