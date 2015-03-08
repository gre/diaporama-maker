var React = require("react");
var translateStyle = require("../../core/translateStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Thumbnail = require("../Thumbnail");

var TimelineElement = React.createClass({

  render: function () {
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;

    var style = translateStyle(x, 0);

    return <div className="timeline-element" style={style}>
      <Thumbnail image={toProjectUrl(item.image)} width={width} height={height} />
    </div>;
  }
});

module.exports = TimelineElement;
