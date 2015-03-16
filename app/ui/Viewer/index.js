var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var GlslTransitions = require("glsl-transitions");
var Radium = require('radium');

var DiaporamaElement = require("../DiaporamaElement");
var Icon = require("../Icon");

var Viewer = React.createClass({
  mixins: [ Radium.StyleResolverMixin, Radium.BrowserStateMixin ],

  render: function () {
    var bound = this.props.bound;

    var style = _.extend({
      position: "relative",
      background: "#000",
      color: "#fff"
    }, boundToStyle(bound));

    var h2Style = {
      zIndex: 3,
      position: "absolute",
      top: 0,
      left: 0
    };

    var hoverOverlayStyles = {
      zIndex: 2,
      opacity: 0,
      background: "rgba(0,0,0,0.3)",
      textAlign: "center",
      position: "absolute",
      top: 0,
      left: 0,
      width: "100%",
      height: "100%",
      states: [
        {
          hover: {
            opacity: 1,
            transition: "opacity 0.5s"
          }
        }
      ]
    };

    return <a style={style} href="/preview" target="_blank">
      <h2 style={h2Style}>Viewer</h2>
      <DiaporamaElement
        GlslTransitions={GlslTransitions} // TODO: inline the transitions
        width={bound.width}
        height={bound.height}
        data={this.props.diaporama}
        currentTime={this.props.time}
      />
      <div
        {...this.getBrowserStateEvents()}
        style={this.buildStyles(hoverOverlayStyles)}
      >
        <Icon name="external-link" color="#fff" size={64} style={{ paddingTop: ((bound.height-32)/2)+"px" }} />
      </div>
    </a>;
  }

});

module.exports = Viewer;
