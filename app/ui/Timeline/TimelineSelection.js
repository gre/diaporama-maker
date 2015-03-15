var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var transparentGif = require("../../core/transparent.gif");
var TimelineSelectionResizeHandle = require("./TimelineSelectionResizeHandle");
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;

var TimelineSelection = React.createClass({
  mixins: [ DragDropMixin ],
  propTypes: {
    itemPointer: React.PropTypes.object.isRequired,
    item: React.PropTypes.object.isRequired,
    x: React.PropTypes.number.isRequired,
    width: React.PropTypes.number.isRequired,
    height: React.PropTypes.number.isRequired,
    alterDiaporama: React.PropTypes.func.isRequired,
    timeScale: React.PropTypes.number.isRequired,
    onClick: React.PropTypes.func
  },
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
    var timeScale = this.props.timeScale;
    var alterDiaporama = this.props.alterDiaporama;
    var item = this.props.item;
    var itemPointer = this.props.itemPointer;
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;

    var handleWidth = 30;

    var style = _.extend({
      zIndex: 50,
      backgroundColor: "rgba(200, 130, 0, 0.2)",
      border: "2px solid #fc0"
    }, boundToStyle({ x: x, y: 0, width: width, height: height }));

    var bodyStyle = _.extend({
      zIndex: 51
    }, boundToStyle({ x: handleWidth, y: 0, width: width-2*handleWidth, height: height }));

    return <div style={style}>
      <TimelineSelectionResizeHandle
        left={true}
        width={handleWidth}
        height={height}
        onResize={alterDiaporama.bind(null, "resizeLeft", itemPointer)}
        referenceValue={itemPointer.transition ? item.duration : -item.duration}
        timeScale={timeScale}
      />
      <div style={bodyStyle} onClick={this.props.onClick} {...this.dragSourceFor(DragItems.SLIDE)} />
      <TimelineSelectionResizeHandle
        left={false}
        width={handleWidth}
        height={height}
        onResize={alterDiaporama.bind(null, "resizeRight", itemPointer)}
        referenceValue={itemPointer.transition ? item.transitionNext.duration : item.duration}
        timeScale={timeScale}
      />
    </div>;
  }
});

module.exports = TimelineSelection;
