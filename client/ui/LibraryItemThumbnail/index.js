import React from "react";
import _ from "lodash";
import ItemThumbnail from "../ItemThumbnail";
import {DragItems} from "../../constants";
import {DragDropMixin} from 'react-dnd';
import transparentGif from "../../core/transparent.gif";
import centeredRotate from "../../core/centeredRotate";
import cssCursor from "css-cursor";

// FIXME: LibraryImage should not anymore be used for DragLayer
const LibraryItemThumbnail = React.createClass({

  mixins: [ DragDropMixin ],

  statics: {
    configureDragDrop: function (register) {
      register(DragItems.LIBRARY_ITEMS, {
        dragSource: {
          beginDrag: function (component) {
            var items = component.props.getDragItems(component.props.item);
            return {
              item: items,
              dragPreview: transparentGif,
              effectsAllowed: ["none", "copy"]
            };
          },
          endDrag: function (component) {
            component.props.onDropped();
          }
        }
      });
    }
  },

  getDefaultProps: function () {
    return {
      used: 0
    };
  },

  getInitialState: function () {
    return {
      hover: false
    };
  },

  onMouseEnter: function () {
    this.setState({
      hover: true
    });
  },

  onMouseLeave: function () {
    this.setState({
      hover: false
    });
  },

  render: function () {
    const {
      width,
      height,
      item,
      used,
      dragging,
      stack,
      selected
    } = this.props;
    const {
      hover
    } = this.state;

    const title = item.title;

    const border = dragging ? 1 : 2;
    const titleH = 20;
    const thumbH = height - 2 * border;
    const thumbW = width - 2 * border;

    const style = _.extend({
      position: "relative",
      width: width+"px",
      height: height+"px"
    }, this.props.style||{});

    const thumbnailStyle = {
      position: "relative",
      zIndex: 3,
      opacity: selected ? 0.6 : (!used ? 1 : 0.5),
      cursor: dragging ? cssCursor("grabbing") : cssCursor("grab")
    };

    const thumbnailContainerStyle = {
      backgroundColor: !selected ? "#000" : "#FC0",
      border: border+"px solid",
      borderColor: !selected ? "#000" : "#FC0"
      // boxShadow: !dragging ? "" : "0px 0px 10px rgba(0,0,0,1)"
    };

    const countUsageStyle = {
      position: "absolute",
      top: "6px",
      right: "6px",
      color: "#fff",
      zIndex: 4,
      fontSize: "0.8em"
    };

    const titleStyle = {
      position: "absolute",
      left: "2%",
      bottom: "2px",
      zIndex: 3,
      display: hover ? "inline-block" : "none",
      width: "96%",
      height: titleH+"px",
      fontSize: "0.8em",
      fontWeight: 300,
      color: !selected ? "#fff" : "#000",
      opacity: 0.9,
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis",
      pointerEvents: "none"
    };

    const maybeDragSource = dragging ? {} : this.dragSourceFor(DragItems.LIBRARY_ITEMS);

    const stackElements = [];

    if (stack) {
      for (let i = 0; i < stack.length && i < 6; ++i) {
        const el = stack[i];
        if (el === item) continue;
        const stackElementStyle = _.extend({
          zIndex: -1,
          position: "absolute",
          border: "1px solid #000",
          left: "0px",
          top: "0px",
          opacity: 0.6
        }, centeredRotate(
          Math.round(((i*101) % 19) - 10),
          1 + 0.01 * (Math.round(((i*383) % 11)))
        ));
        stackElements.push(
          <div
              key={"stack-"+i}
              style={stackElementStyle}>
            <ItemThumbnail
              item={item}
              width={thumbW}
              height={thumbH} />
          </div>
        );
      }
    }

    return <div
      title={title}
      style={style}
      onClick={this.props.onClick}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}>
      { !used ? undefined :
        <span style={countUsageStyle}>
          {used}
          ×
        </span>}
      <div style={thumbnailContainerStyle} {...maybeDragSource}>
        <ItemThumbnail
          item={item}
          style={thumbnailStyle}
          width={thumbW}
          height={thumbH} />
      </div>
      {stackElements}
      { dragging || !title ? undefined :
      <span style={titleStyle}>{title}</span>
      }
    </div>;
  }

});

module.exports = LibraryItemThumbnail;
