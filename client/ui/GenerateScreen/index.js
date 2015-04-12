var _ = require("lodash");
var React = require("react");
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
      zipIncludesWeb: true,
      quality: "high"
    };
  },

  downloadZipLink: function () {
    const { quality, zipIncludesWeb } = this.state;
    return DiaporamaMakerAPI.diaporamaZipUrl({ quality, zipIncludesWeb });
  },

  onZipIncludesWebChange: function (e) {
    const zipIncludesWeb = e.target.checked;
    this.setState({ zipIncludesWeb });
  },

  onQualityChange: function (quality) {
    this.setState({ quality });
  },

  render: function () {
    var jsonUrl = DiaporamaMakerAPI.diaporamaJsonUrl();
    var zipUrl = this.downloadZipLink();
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
      <h3>diaporama.json</h3>
      <div style={formStyle}>
        <p>
          <Button download href={jsonUrl} color="#fff" bg="#000" bgHover="#f90">
            <Icon name="download" />
            &nbsp;
            Download
          </Button>
        </p>
      </div>
      <h3>ZIP Export</h3>
      <div style={formStyle}>
        <p>
          <label>
            Image Quality:&nbsp;
            <Select options={options} value={this.state.quality} onChange={this.onQualityChange} />
          </label>
        </p>
        <p>
          <label>
            <input type="checkbox" checked={this.state.zipIncludesWeb} onChange={this.onZipIncludesWebChange} />&nbsp;
            includes web slideshow (<code>index.html</code> and <code>diaporama.bundle.js</code>)
          </label>
        </p>
        <p>
          <Button download href={zipUrl} color="#fff" bg="#000" bgHover="#f90">
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
