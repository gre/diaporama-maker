var React = require("react");
var prefix = require("vendor-prefix");
var rectCrop = require("rect-crop");

var transformAttr = prefix("transform");
var transformOriginAttr = prefix("transform-origin");

var Thumbnail = React.createClass({

  propTypes: {
    zoom: React.PropTypes.number,
    center: React.PropTypes.array,
    src: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      zoom: 1,
      center: [ 0.5, 0.5]
    };
  },

  fetchImage: function (props) {
    this.img = new Image();
    if (!props.src) return;
    this.img.src = props.src;
    var self = this;
    this.img.onload = function () {
      self.forceUpdate();
    };
  },

  componentWillMount: function () {
    this.fetchImage(this.props);
  },

  componentWillReceiveProps: function (props) {
    if (!this.img || this.img.src !== props.src) {
      this.fetchImage(props);
    }
  },

  render: function () {
    var props = this.props;
    var style = {
      position: "relative",
      overflow: "hidden",
      background: "#000",
      width: props.width + "px",
      height: props.height + "px"
    };
    if (!this.img.width) {
      return <div className="thumbnail" style={style}></div>;
    }

    var rect = rectCrop(props.zoom, props.center)(props, this.img);
    var scale = [ props.width / rect[2], props.height / rect[3] ];
    var translate = [ Math.round(-rect[0])+"px", Math.round(-rect[1])+"px" ];
    var imgStyle = {
      position: "absolute",
      top: 0,
      left: 0
    };
    imgStyle[transformOriginAttr] = "0% 0%";
    imgStyle[transformAttr] = "scale("+scale+") translate("+translate+")";

    return <div className="thumbnail" style={style}>
      <img src={ props.src } style={imgStyle} />
    </div>;
  }
});

module.exports = Thumbnail;
