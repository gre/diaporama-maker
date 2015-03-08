var React = require("react");
var _ = require("lodash");
var translateStyle = require("../../core/translateStyle");
var boundToStyle = require("../../core/boundToStyle");
var Icon = require("../Icon");

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

  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value));
  },

  render: function () {
    var xcenter = this.props.xcenter;
    var width = this.props.width;
    var height = this.props.height;
    var transition = this.props.transition;
    var selected = this.props.selected;

    var size = Math.min(100, height);
    var layerWidth = Math.max(size, width);
    var x = Math.floor(xcenter - layerWidth/2);
    var editSize = 50;
    var deleteSize = 30;

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

    var editIconStyle = _.extend({
      position: "absolute",
      top: "0px",
      left: "0px",
    }, translateStyle(((layerWidth-editSize)/2), ((height-editSize)/2)));

    var deleteIconStyle = _.extend({
      position: "absolute",
      bottom: "0px",
      left: "0px"
    }, translateStyle(((width-deleteSize)/2), 0));

    return <div style={style}>
      <div style={containerStyle}>

        {!transition ? undefined :
        <div>
          <div style={titleStyle}>
            {(transition.name || "fade")}
          </div>
          <div style={titleStyle}>
            {(transition.duration/1000)+"s "}
          </div>
        </div>
        }

      { !selected ? undefined : <div>
      
        {transition ?
          undefined
            :
          <Icon style={editIconStyle} title="Add a transition" name="magic" color="#fff" size={editSize} onClick={this.props.onAdd} />
        }

        {!transition ? undefined :
          <Icon style={deleteIconStyle} title="Delete transition" name="remove" color="#f00" size={deleteSize} onClick={this.props.onRemove} />
        }

      </div>
      }

      </div>

      <div style={bgStyle}>
        <SvgCrossFadeBackground width={width} height={height} easing={transition && transition.easing} />
      </div>
    </div>;
  }
});


module.exports = TimelineTransition;
