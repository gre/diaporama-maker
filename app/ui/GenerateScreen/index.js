var React = require("react");
var Diaporama = require("../../models/Diaporama");

var GenerateScreen = React.createClass({

  generateHTML: function () {
    Diaporama.generateHTML().done();
  },

  generateVideo: function () {
    Diaporama.generateVideo(this.props.diaporama, {
      videoFormat: "matroska"
    });
  },

  render: function () {
    return <div>
      <h2>N.B. These features are WIP</h2>
      <p>
        Generate a standalone index.html to run the diaporama.
        <button onClick={this.generateHTML}>Generate</button>
      </p>
      <p>
        Generate a video "out.avi" from the diaporama.
        <button onClick={this.generateVideo}>Generate</button>
      </p>
    </div>;
  }
});

module.exports = GenerateScreen;
