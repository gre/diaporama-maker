var React = require("react");
var _ = require("lodash");
var DragLayerMixin = require("react-dnd").DragLayerMixin;
var DragItems = require("../../constants").DragItems;
var LibraryImage = require("../LibraryImage");
var translateStyle = require("../../core/translateStyle");

var DragLayer = React.createClass({
  mixins: [ DragLayerMixin ],

  render: function () {
    var state = this.getDragLayerState();

    if (state.isDragging) {
      var style = {
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 9999,
        pointerEvents: "none"
      };

      switch (state.draggedItemType) {
        case DragItems.SLIDE:
          _.extend(style, translateStyle(
            state.currentOffsetFromClient.x - 100,
            state.currentOffsetFromClient.y - 75
          ));
          // Hack: for now use LibraryImage
          return <LibraryImage
            style={style}
            width={200}
            height={160}
            item={{ url: DiaporamaMakerAPI.toProjectUrl(state.draggedItem.image), file: state.draggedItem.image }}
            dragging={true}
          />;

        case DragItems.IMAGES:
          var primary = state.draggedItem.primary;
          var all = state.draggedItem.all;
          _.extend(style, translateStyle(state.currentOffset.x, state.currentOffset.y));
          return <LibraryImage
            style={style}
            width={120}
            height={100}
            item={primary}
            stack={all}
            dragging={true} />;
      }
    }
    return <div />;
  }
});

module.exports = DragLayer;
