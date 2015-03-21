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
    var playing = this.props.playing;

    var style = _.extend({
      background: "#000",
      color: "#fff"
    }, boundToStyle(bound));

    var h2Style = {
      zIndex: 3,
      position: "absolute",
      top: 0,
      left: 0
    };

    var playPauseSize = 40;
    var playPauseStyle = {
      position: "absolute",
      left: ((bound.width-playPauseSize)/2)+"px",
      top: ((bound.height-playPauseSize)/2)+"px"
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

    return <div style={style}>
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
        <h2 style={h2Style}>Viewer</h2>

      { playing ?
        <Icon style={playPauseStyle} size={playPauseSize} onClick={this.props.onPause} name="pause" colorHover="#fc0" color="#fff" />
          :
        <Icon style={playPauseStyle} size={playPauseSize} onClick={this.props.onPlay} name="play" colorHover="#fc0" color="#fff" />
      }
      </div>
    </div>;
  }

});

module.exports = Viewer;
