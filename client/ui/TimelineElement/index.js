var React = require("react");
var _ = require("lodash");
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

  shouldComponentUpdate (props) {
    const {
      x,
      width,
      height,
      item,
      onClick
    } = this.props;
    return (
      x !== props.x ||
      width !== props.width ||
      height !== props.height ||
      onClick !== props.onClick ||
      !_.isEqual(item, props.item)
    );
  },

  render: function () {
    const {
      x,
      width,
      height,
      item,
      onClick
    } = this.props;

    var dragState = this.getDragState(DragItems.SLIDE);

    var style = _.extend({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
      opacity: dragState.isDragging ? 0.5 : 1
    }, translateStyle(x, 0));

    return <div className="timeline-element"
      style={style}
      onClick={onClick}
      {...this.dragSourceFor(DragItems.SLIDE)}>
      <Thumbnail image={toProjectUrl(item.image)} width={width} height={height} />
    </div>;
  }
});

module.exports = TimelineElement;
