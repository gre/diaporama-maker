var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");

var SvgCrossFadeBackground = React.createClass({
  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var easing = this.props.easing || [ 0, 0, 1, 1 ];

    var crossPathV = [
      "M", 0, height,
      "C", Math.round(width * easing[0]), Math.round(height * (1-easing[1])),
           Math.round(width * easing[2]), Math.round(height * (1-easing[3])),
      width, 0,
      "L", 0, 0,
      "C", Math.round(width * easing[0]), Math.round(height * easing[1]),
           Math.round(width * easing[2]), Math.round(height * easing[3]),
      width, height,
      "Z"
    ].join(" ");

    var crossStyle = {
      strokeWidth: 1,
      stroke: "#333",
      fill: "rgba(0, 0, 0, 0.5)"
    };

    return <svg width={width} height={height}>
      <path style={crossStyle} d={crossPathV} />
    </svg>;
  }
});

var TimelineTransition = React.createClass({

  render: function () {
    var xcenter = this.props.xcenter;
    var width = this.props.width;
    var height = this.props.height;
    var transition = this.props.transition;

    var size = Math.min(100, height);
    var layerWidth = Math.max(size, width);
    var x = Math.floor(xcenter - layerWidth/2);

    var style = _.extend({
      color: "#fff",
      overflow: "hidden",
      zIndex: 2,
      backgroundColor: "rgba(0, 0, 0, 0.1)"
    }, boundToStyle({
      x: x,
      y: 0,
      width: layerWidth,
      height: height
    }));

    var containerStyle = {
      position: "absolute",
      left: "0px",
      top: "0px",
      width: "100%",
      height: "100%",
      textAlign: "center",
      zIndex: 3
    };

    var bgStyle = boundToStyle({
      x: (layerWidth-width)/2,
      y: 0,
      width: width,
      height: height
    });


    var titleStyle = {
      whiteSpace: "nowrap",
      font: "monospace 9px #fff"
    };

    return <div style={style}>
      <div style={containerStyle}>

        <div>
          <div style={titleStyle}>
            {transition.name || "fade"}
          </div>
          <div style={titleStyle}>
            {(transition.duration/1000)+"s"}
          </div>
        </div>

      </div>

      <div style={bgStyle}>
        <SvgCrossFadeBackground width={width} height={height} easing={transition.easing} />
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
