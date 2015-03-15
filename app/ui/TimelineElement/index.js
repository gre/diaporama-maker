var React = require("react");
var translateStyle = require("../../core/translateStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Thumbnail = require("../Thumbnail");
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;
var transparentGif = require("../../core/transparent.gif");

var TimelineElement = React.createClass({

  mixins: [ DragDropMixin ],
  statics: {
    configureDragDrop: function (register) {
      register(DragItems.SLIDE, {
        dragSource: {
          beginDrag: function (component) {
            return {
              item: component.props.item,
              dragPreview: transparentGif,
              effectsAllowed: ["none", "move"]
            };
          }
        }
      });
    }
  },

  render: function () {
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;

    var style = translateStyle(x, 0);

    return <div className="timeline-element"
      style={style}
      onClick={this.props.onClick}
      {...this.dragSourceFor(DragItems.SLIDE)}>
      <Thumbnail image={toProjectUrl(item.image)} width={width} height={height} />
    </div>;
  }
});

module.exports = TimelineElement;
