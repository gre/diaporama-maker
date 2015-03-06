var React = require("react");
var _ = require("lodash");
var translateStyle = require("../../core/translateStyle");
var boundToStyle = require("../../core/boundToStyle");
var Icon = require("../Icon");

var SvgCrossFadeBackground = React.createClass({
  render: function () {
    var width = this.props.width;
    var height = this.props.height;

    var crossPathV = [
      "M", 0, 0,
      "L", width, height,
      "L", 0, height,
      "L", width, 0,
      "Z"
    ].join(" ");


    return <svg width={width} height={height}>
      <linearGradient id="grad" x1="100%" y1="0%" x2="0%" y2="0%">
        <stop offset="0%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
        <stop offset="50%" style={{ stopColor: "#000000", stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: "#000000", stopOpacity: 0 }} />
      </linearGradient>
      <path fill="#000" d={crossPathV} />
      <rect fill="url(#grad)" x={0} y={0} width={width} height={height} />
    </svg>;
  }
});

var TimelineTransition = React.createClass({

  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value));
  },

  render: function () {
    var xcenter = this.props.xcenter;
    var width = this.props.width;
    var height = this.props.height;
    var transition = this.props.transition;

    var size = Math.min(100, height);
    var layerWidth = Math.max(size, width);
    var x = Math.floor(xcenter - layerWidth/2);

    return <div className="timeline-transition" style={_.extend({
      color: "#fff",
      overflow: "hidden",
      zIndex: 2
    }, boundToStyle({
      x: x,
      y: 0,
      width: layerWidth,
      height: height
    }))}>
      <div style={_.extend({
        textAlign: "center",
        zIndex: 3
      }, boundToStyle({
        x: Math.floor((layerWidth - size)/2),
        y: Math.floor((height - size) / 2),
        width: size,
        height: size
      }))}>
        {!transition ? undefined :
        <div>
          <div style={{ whiteSpace: "nowrap", font: "monospace 9px #fff" }}>
            {(transition.name || "fade")}
          </div>
          <div style={{ whiteSpace: "nowrap", font: "monospace 9px #fff" }}>
            {(transition.duration/1000)+"s "}
          </div>
        </div>
        }
        <div className="sub-actions">
        {transition ?
          <Icon title="Edit a transition" name="pencil-square" color="#fff" size={50} onClick={this.props.onSelect} />
            :
          <Icon title="Add a transition" name="magic" color="#fff" size={50} onClick={this.props.onAdd} />
        }

        {!transition ? undefined :
          <div style={{ position: "absolute", width: "100%", textAlign: "center", bottom: Math.round((size-height)/2+5)+"px" }}>
            <Icon title="Delete transition" name="remove" color="#f00" size={32} onClick={this.props.onRemove} />
          </div>
        }
        </div>
      </div>
      <div style={translateStyle((layerWidth-width)/2, 0)}>
        <SvgCrossFadeBackground width={width} height={height} />
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
