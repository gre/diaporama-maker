var React = require("react");
var packageJson = require("../../../package.json");
var Button = require("../Button");
var Icon = require("../Icon");

var AboutScreen = React.createClass({
  render: function () {
    return <div>
      <h2>Welcome to Diaporama Maker Beta ({packageJson.version})</h2>
      <p style={{ margin: "1em 0" }}>
        <a target="_blank" href={packageJson.bugs.url}>We <Icon name="heart" /> to hear your feedbacks</a>.
        &nbsp;
        <a target="_blank" href={packageJson.homepage}>Source Code</a> is under {packageJson.license}.
      </p>
      <p>
        <Button color="#000" colorHover="#f90" target="_blank" href={"http://gre.gitbooks.io/diaporama-maker/content/index.html"}>Getting Started</Button>
        <Button bg="#000" color="#fff" bgHover="#f90" onClick={this.props.onDone}>
          <Icon name="folder-open" />&nbsp;Open Library
        </Button>
      </p>
    </div>;
  }
});

module.exports = AboutScreen;
