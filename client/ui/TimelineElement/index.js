import React from "react";
import _ from "lodash";
import translateStyle from "../../core/translateStyle";
import ItemThumbnail from "../ItemThumbnail";
import {DragItems} from "../../constants";
import {DragDropMixin} from 'react-dnd';
import transparentGif from "../../core/transparent.gif";

const TimelineElement = React.createClass({

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

  // FIXME: this should be moved to ImageThumbnail & Slide2d only
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

    const dragState = this.getDragState(DragItems.SLIDE);

    const style = _.extend({
      position: "absolute",
      top: 0,
      left: 0,
      zIndex: 1,
      opacity: dragState.isDragging ? 0.5 : 1
    }, translateStyle(x, 0));
    
    return <div
      style={style}
      onClick={onClick}
      {...this.dragSourceFor(DragItems.SLIDE)}>
      <ItemThumbnail
        item={item}
        width={width}
        height={height} />
    </div>;
  }
});

module.exports = TimelineElement;
