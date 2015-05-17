var React = require("react");
var _ = require("lodash");
var rectCrop = require("rect-crop");
var scaleTranslateStyle = require("../../core/scaleTranslateStyle");
var ImageHolderMixin = require("../../mixins/ImageHolderMixin");

var UploadingImageThumbnail = React.createClass({

  mixins: [ ImageHolderMixin ],

  propTypes: {
    zoom: React.PropTypes.number,
    center: React.PropTypes.array,
    image: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    progress: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      zoom: 1,
      center: [ 0.5, 0.5 ]
    };
  },

  render: function () {
    const {
      zoom,
      center,
      width,
      height,
      image,
      progress
    } = this.props;

    const style = _.extend({
      position: "relative",
      overflow: "hidden",
      background: "#000",
      width: width + "px",
      height: height + "px"
    }, this.props.style||{});

    const progressStyle = {
      width: width+"px",
      position: "absolute",
      top: "2px",
      left: 0,
      zIndex: 4
    };

    if (!this.img.width) {
      return <div style={style}></div>;
    }

    var rect = rectCrop(zoom, center)({ width, height }, this.img);
    var imgStyle = scaleTranslateStyle(
      width / rect[2],
      [ -rect[0], -rect[1] ]);

    return <div style={style}>
      <img src={image} style={imgStyle} />
      <progress style={progressStyle} value={progress} />
    </div>;
  }
});

module.exports = UploadingImageThumbnail;
