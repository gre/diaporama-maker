var React = require("react");
var Diaporama = require("../../models/Diaporama");

var GenerateScreen = React.createClass({

  generateHTML: function () {
    Diaporama.generateHTML().done();
  },

  generateVideo: function () {
    Diaporama.generateVideo(this.props.diaporama, {
      width: 800,
      height: 600,
      fps: 25
    });
  },

  render: function () {
    return <div>
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
