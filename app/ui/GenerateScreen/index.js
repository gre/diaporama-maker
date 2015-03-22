var _ = require("lodash");
var React = require("react");
var Diaporama = require("../../models/Diaporama");
var Icon = require("../Icon");
var Button = require("../Button");

var Select = React.createClass({
  onChange: function (e) {
    e.preventDefault();
    this.props.onChange(e.target.value);
  },
  render: function () {
    var value = this.props.value;
    var options = _.map(this.props.options, function (option, key) {
      return <option key={key} value={key}>{option}</option>;
    });
    return <select value={value} onChange={this.onChange}>{options}</select>;
  }
});

var GenerateScreen = React.createClass({

  getInitialState: function () {
    return {
      quality: "high"
    };
  },

  downloadZipLink: function () {
    return Diaporama.downloadZipLink(this.state);
  },

  onQualityChange: function (q) {
    this.setState({
      quality: q
    });
  },

  render: function () {
    var url = this.downloadZipLink();
    var options = {
      low: "Low",
      medium: "Medium",
      high: "High",
      original: "Original"
    };

    var formStyle = {
      margin: "8px 40px"
    };

    return <div>
      <h2>Export to ZIP</h2>
      <div style={formStyle}>
        <p>
          <label>
            Image Quality:&nbsp;
            <Select options={options} value={this.state.quality} onChange={this.onQualityChange} />
          </label>
        </p>
        <p>
          <Button download href={url} color="#fff" bg="#000" bgHover="#f90">
            <Icon name="download" />
            &nbsp;
            Download
          </Button>
        </p>
      </div>
    </div>;
  }
});

module.exports = GenerateScreen;
