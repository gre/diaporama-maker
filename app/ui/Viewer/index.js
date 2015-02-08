var React = require("react");
var boundToStyle = require("../../core/boundToStyle");

var Diaporama = require("../Diaporama");
var Icon = require("../Icon");

var Viewer = React.createClass({

  render: function () {
    var bound = this.props.bound;

    return <a href="/preview" target="_blank" className="viewer" style={boundToStyle(bound)}>
      <h2>Viewer</h2>
      { !this.props.diaporama.timeline.length ? undefined :
        <Diaporama width={bound.width} height={bound.height} diaporama={this.props.diaporama} />
      }
      <div className="hover-overlay">
        <Icon name="external-link" color="#fff" size={64} style={{ paddingTop: ((bound.height-32)/2)+"px" }} />
      </div>
    </a>;
  }

});

module.exports = Viewer;
