var React = require("react");
var boundToStyle = require("../../core/boundToStyle");
var GlslTransitions = require("glsl-transitions");

var DiaporamaElement = require("../DiaporamaElement");
var Icon = require("../Icon");

var Viewer = React.createClass({

  render: function () {
    var bound = this.props.bound;

    return <a href="/preview" target="_blank" className="viewer" style={boundToStyle(bound)}>
      <h2>Viewer</h2>
      <DiaporamaElement
        GlslTransitions={GlslTransitions} // TODO: inline the transitions
        width={bound.width}
        height={bound.height}
        data={this.props.diaporama}
        currentTime={this.props.time}
      />
      <div className="hover-overlay">
        <Icon name="external-link" color="#fff" size={64} style={{ paddingTop: ((bound.height-32)/2)+"px" }} />
      </div>
    </a>;
  }

});

module.exports = Viewer;
