var React = require("react");
var _ = require("lodash");
var Thumbnail = require("../Thumbnail");
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;
var transparentGif = require("../../core/transparent.gif");
var cssCursor = require("css-cursor");

// FIXME: LibraryImage should not anymore be used for DragLayer
var LibraryImage = React.createClass({

  mixins: [ DragDropMixin ],

  statics: {
    configureDragDrop: function (register) {
      register(DragItems.IMAGES, {
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

  render: function () {
    var width = this.props.width;
    var height = this.props.height;
    var item = this.props.item;
    var used = this.props.used;
    var dragging = this.props.dragging;
    var stackSize = this.props.stackSize || 1;
    var selected = this.props.selected;

    var style = _.extend({
      position: "relative",
      width: width+"px",
      height: height+"px"
    }, this.props.style||{});
    
    var thumbnailStyle = {
      position: "relative",
      zIndex: 3,
      opacity: selected ? 0.5 : (!used ? 1 : 0.5),
      cursor: dragging ? cssCursor("grabbing") : cssCursor("grab")
    };

    var border = dragging ? 1 : 2;

    border += (stackSize-1); // FIXME

    var thumbnailContainerStyle = {
      backgroundColor: !selected ? "#000" : "#FC0",
      border: border+"px solid",
      borderColor: !selected ? "#000" : "#FC0",
      boxShadow: !dragging ? "" : "0px 1px 12px rgba(0,0,0,1)"
    };

    var countUsageStyle = {
      position: "absolute",
      bottom: "22px",
      right: "6px",
      color: "#fff",
      zIndex: 2,
      fontSize: "0.8em"
    };

    var titleStyle = {
      display: "inline-block",
      width: "100%",
      height: "20px",
      fontSize: "0.8em",
      fontWeight: 300,
      color: !selected ? "#666" : "#d80",
      whiteSpace: "nowrap",
      overflow: "hidden",
      textOverflow: "ellipsis"
    };
    
    var maybeDragSource = dragging ? {} : this.dragSourceFor(DragItems.IMAGES);

    return <div
      title={item.file}
      style={style}
      onClick={this.props.onClick}>
      { !used ? undefined :
        <span style={countUsageStyle}>
          {used}
          ×
        </span>}
      <div style={thumbnailContainerStyle} {...maybeDragSource}>
        <Thumbnail style={thumbnailStyle} width={width-2*border} height={height-2*border-20} image={item.url} />
      </div>
      { dragging ? undefined :
      <span style={titleStyle}>{item.file}</span>
      }
    </div>;
  }

});

module.exports = LibraryImage;
