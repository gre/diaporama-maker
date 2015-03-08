var React = require("react");
var _ = require("lodash");
var rectCrop = require("rect-crop");
var scaleTranslateStyle = require("../../core/scaleTranslateStyle");
var ImageHolderMixin = require("../../mixins/ImageHolderMixin");

var Thumbnail = React.createClass({

  mixins: [ ImageHolderMixin ],

  propTypes: {
    zoom: React.PropTypes.number,
    center: React.PropTypes.array,
    image: React.PropTypes.string,
    width: React.PropTypes.number,
    height: React.PropTypes.number
  },

  getDefaultProps: function () {
    return {
      zoom: 1,
      center: [ 0.5, 0.5 ]
    };
  },

  render: function () {
    var props = this.props;
    
    var style = _.extend({
      position: "relative",
      overflow: "hidden",
      background: "#000",
      width: props.width + "px",
      height: props.height + "px"
    }, this.props.style||{});

    if (!this.img.width) {
      return <div className="thumbnail" style={style}></div>;
    }

    var rect = rectCrop(props.zoom, props.center)(props, this.img);
    var imgStyle = scaleTranslateStyle(
      props.width / rect[2],
      [ -rect[0], -rect[1] ]);

    return <div className="thumbnail" style={style}>
      <img src={ props.image } style={imgStyle} />
    </div>;
  }
});

module.exports = Thumbnail;
