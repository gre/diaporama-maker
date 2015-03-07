var React = require("react");
var _ = require("lodash");
var translateStyle = require("../../core/translateStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var boundToStyle = require("../../core/boundToStyle");
var Thumbnail = require("../Thumbnail");
var Icon = require("../Icon");

var TimelineElement = React.createClass({

  onDurationChange: function (e) {
    this.props.onDurationChange(parseInt(e.target.value));
  },

  onClick: function (e) {
    if (e.target.nodeName === "IMG") {
      this.props.onSelect();
    }
  },

  render: function () {
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    var selected = this.props.selected;

    var style = translateStyle(x, 0);

    var selectedOverlay;
    if (selected) {
      var selectedStyle = _.extend({
        zIndex: 5,
        backgroundColor: "rgba(200, 130, 0, 0.4)",
        border: "1px dashed #fc0"
      }, boundToStyle({ x: 0, y: 0, width: width, height: height }));

      selectedOverlay = <div style={selectedStyle} />;
    }

    return <div className="timeline-element" style={style} onClick={this.onClick}>
      {selectedOverlay}
      <Thumbnail image={toProjectUrl(item.image)} width={width} height={height} />
      <div className="actions">
        <Icon name="arrow-circle-o-left" color="#fff" onClick={this.props.onMoveLeft} />
        &nbsp;
        <Icon name="remove" color="#F00" onClick={this.props.onRemove} />
        &nbsp;
        <Icon name="arrow-circle-o-right" color="#fff" onClick={this.props.onMoveRight} />
      </div>
    </div>;
  }
});

module.exports = TimelineElement;
