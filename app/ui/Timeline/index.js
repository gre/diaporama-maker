var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var PromiseMixin = require("../../mixins/PromiseMixin");
var TimelineGrid = require("../TimelineGrid");
var TimelineElement = require("../TimelineElement");
var TimelineZoomControls = require("../TimelineZoomControls");
var TimelineTransition = require("../TimelineTransition");
var Diaporama = require("../../models/Diaporama");
var Icon = require("../Icon");
var TimelineCursor = require("./TimelineCursor");
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;
var transparentGif = require("../../core/transparent.gif");

function scrollSpeed (x, xtarget, normDist, speed) {
  var dist = Math.abs(x - xtarget) / normDist;
  return speed * Math.exp(-(dist * dist));
}

var trackDragOverX = function (context) {
  return {
    leave: function (component) {
      component._dragOverX = null;
    },
    over: function (component) {
      var initial = context.getInitialOffsetFromClient();
      var delta = context.getCurrentOffsetDelta();
      component._dragOverX = initial.x + delta.x;
    },
    acceptDrop: function (component) {
      component._dragOverX = null;
    },
  };
};

var TimelineSelection = React.createClass({
  mixins: [ DragDropMixin ],
  propTypes: {
    isTransition: React.PropTypes.bool,
    item: React.PropTypes.object,
    x: React.PropTypes.number,
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    onSelectionMoveLeft: React.PropTypes.func,
    onSelectionMoveRight: React.PropTypes.func
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
    var isTransition = this.props.isTransition;
    var x = this.props.x;
    var width = this.props.width;
    var height = this.props.height;

    var selectedStyle = _.extend({
      zIndex: 50,
      backgroundColor: "rgba(200, 130, 0, 0.2)",
      border: "2px solid #fc0"
    }, boundToStyle({ x: x, y: 0, width: width, height: height }));

    var selectedContent = [];
    if (!isTransition) {
      var leftStyle = {
        position: "absolute",
        bottom: "4px",
        left: "8px"
      };
      selectedContent.push(
        <Icon
          style={leftStyle}
          key="left"
          size={32}
          name="arrow-circle-o-left"
          color="#fff"
          onClick={this.props.onSelectionMoveLeft} />
      );

      var rightStyle = {
        position: "absolute",
        bottom: "4px",
        right: "8px"
      };
      selectedContent.push(
        <Icon
          style={rightStyle}
          key="right"
          size={32}
          name="arrow-circle-o-right"
          color="#fff"
          onClick={this.props.onSelectionMoveRight} />
      );
    }

    return <div
      style={selectedStyle}
      {...this.dragSourceFor(DragItems.SLIDE)}>
      {selectedContent}
    </div>;
  }
});

var Timeline = React.createClass({

  mixins: [ PromiseMixin, DragDropMixin ],

  statics: {
    configureDragDrop: function (register, context) {
      var track = trackDragOverX(context);
      register(DragItems.SLIDE, {
        dropTarget: {
          enter: track.enter,
          leave: track.leave,
          over: track.over,

          getDropEffect: function () {
            return "move";
          },

          acceptDrop: function (component, item) {
            track.acceptDrop(component);
            var initial = context.getInitialOffsetFromClient();
            var delta = context.getCurrentOffsetDelta();
            var time = component.timeForClientX(initial.x + delta.x);
            var other = Diaporama.lookupSegment(component.props.diaporama, time);
            if (other && other.id !== item.id) {
              component.props.onSlideSwap(item.id, other.id);
            }
          }
        }
      });
      register(DragItems.IMAGE, {
        dropTarget: {
          enter: track.enter,
          leave: track.leave,
          over: track.over,

          getDropEffect: function () {
            return "copy";
          },

          acceptDrop: function (component, item) {
            track.acceptDrop(component);
            var initial = context.getInitialOffsetFromClient();
            var delta = context.getCurrentOffsetDelta();
            var time = component.timeForClientX(initial.x + delta.x);
            var place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
            component.props.onImageDrop(item.file, place);
          }
        }
      });
    }
  },

  propTypes: {
    diaporama: React.PropTypes.object.isRequired
  },

  // Exposed Methods

  collidesPosition: function (p) {
    var node = this.getDOMNode();
    var rect = node.getBoundingClientRect();
    if (p[1] < rect.top || p[1] > rect.bottom) {
      return null;
    }
    return {
      time: this.eventPositionToTime(p)
    };
  },

  //////

  getInitialState: function () {
    return {
      mouseDown: null,
      timeScale: 0.1 // pixels per milliseconds
    };
  },

  setTimeScale: function (s) {
    this.setState({
      timeScale: s
    });
  },

  getEventPosition: function (e) {
    var bounds = this.getDOMNode().getBoundingClientRect();
    var node = this.refs.scrollcontainer.getDOMNode();
    var x = e.clientX - bounds.left;
    var y = e.clientY - bounds.top;
    var scrollLeft = node.scrollLeft;
    x += scrollLeft;
    return [ x, y ];
  },

  getEventStats: function (e) {
    return {
      at: this.getEventPosition(e),
      time: Date.now()
    };
  },

  eventPositionToTime: function (p) {
    return p[0] / this.state.timeScale;
  },

  timeForClientX: function (x) {
    var node = this.refs.scrollcontainer.getDOMNode();
    var scrollLeft = node.scrollLeft;
    return (x + scrollLeft) / this.state.timeScale;
  },

  onMouseMove: function (e) {
    var cb = this.props.onHoverMove;
    if (!cb) return;
    var mouseMove = this.getEventStats(e);
    cb(this.eventPositionToTime(mouseMove.at));
  },

  onMouseEnter: function () {
    this.props.onHoverEnter();
  },

  onMouseLeave: function () {
    this.props.onHoverLeave();
  },

  onClick: function (e) {
    if (e.target.nodeName === "I") return;
    var pos = this.getEventPosition(e);
    var lookup = Diaporama.lookupSegment(this.props.diaporama, this.eventPositionToTime(pos));
    if (lookup) {
      if (_.isEqual(lookup, this.props.selectedItem))
        this.props.onSelect(null);
      else
        this.props.onSelect(lookup);
    }
  },

  componentWillMount: function () {
    this._dragOverX = null;
  },

  componentWillReceiveProps: function (newProps) {
    var props = this.props;
    if (newProps.selectedItem && 
        (!_.isEqual(props.selectedItem, newProps.selectedItem) ||
         this.props.diaporama !== newProps.diaporama)) {
      var node = this.refs.scrollcontainer.getDOMNode();
      var timeScale = this.state.timeScale;
      var scrollLeft = node.scrollLeft;
      var width = node.clientWidth;
      var scrollDuration = width / timeScale;
      var timeFrom = scrollLeft / timeScale;
      var timeTo = timeFrom + scrollDuration;
      var interval = Diaporama.timelineTimeIntervalForItem(newProps.diaporama, newProps.selectedItem);
      if (interval) {
        // Fix the scrolling by "window of width"
        if (interval.end < timeFrom) {
          node.scrollLeft = scrollLeft - timeScale * scrollDuration * Math.ceil((timeFrom - interval.end) / scrollDuration);
        }
        else if (timeTo < interval.start) {
          node.scrollLeft = scrollLeft + timeScale * scrollDuration * Math.ceil((interval.start - timeTo) / scrollDuration);
        }
      }
    }
  },

  getAnyDropState: function () {
    return _.reduce([
      this.getDropState(DragItems.IMAGE),
      this.getDropState(DragItems.SLIDE)
    ], function (acc, state) {
      if (state.isDragging)
        acc.isDragging = true;
      if (state.isHovering)
        acc.isHovering = true;
      return acc;
    }, { isDragging: false, isHovering: false });
  },

  update: function (t, dt) {
    var x = this._dragOverX;
    if (x !== null) {
      // TODO FIXME: this is only good for Library -> Timeline d&d, for slide d&d, use relative offset only
      var node = this.refs.scrollcontainer.getDOMNode();
      var w = node.clientWidth;
      var border = 10;
      var normDist = w / 4;
      var speed = 2;
      var dx = - scrollSpeed(x, border, normDist, speed) + scrollSpeed(x, w-border, normDist, speed);
      node.scrollLeft += dx * dt;
    }
  },

  render: function () {
    var diaporama = this.props.diaporama;
    var timeline = diaporama.timeline;
    var bound = this.props.bound;
    var time = this.props.time;
    var selectedItem = this.props.selectedItem;

    var timeScale = this.state.timeScale;

    var anyDropState = this.getAnyDropState();

    var headerHeight = 30;
    var gridHeight = bound.height - headerHeight;
    var gridTop = bound.height-gridHeight;
    var lineTop = 16;
    var lineHeight = gridHeight - lineTop;

    var style = _.extend({
      background: "#fcfcfc"
    }, boundToStyle(bound));

    var headerStyle = {
      width: bound.width+"px",
      height: headerHeight+"px"
    };
    
    var lineStyle = {
      background: "#333",
      position: "relative",
      top: lineTop+"px",
      height: lineHeight+"px",
      zIndex: 2,
      opacity:
        (anyDropState.isHovering ? 0.9 : 1.0)
    };

    var lineContainerStyle = {
      position: "absolute",
      zIndex: 1,
      top: gridTop+"px",
      left: "0px",
      width: bound.width+"px",
      height: gridHeight+"px",
      overflow: "auto"
    };

    var selectedOverlay;

    var lineContent = [];
    var x = 0;
    var prevTransitionWidth = 0;
    for (var i=0; i<timeline.length; ++i) {
      var item = timeline[i];
      var transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeScale * item.transitionNext.duration) : 0;

      var onlyImageW = Math.round(timeScale * item.duration);
      var thumbw = transitionw/2 + prevTransitionWidth/2 + onlyImageW;

      var currentSelected = selectedItem && selectedItem.id === item.id;

      if (currentSelected) {
        var isTransition = selectedItem.transition;
        var sx = isTransition ? x + thumbw - transitionw / 2 : x + prevTransitionWidth/2;
        var sw = isTransition ? transitionw : onlyImageW;

        selectedOverlay = <TimelineSelection
          key="tl-selection"
          isTransition={selectedItem.transition}
          item={item}
          x={sx}
          width={sw}
          height={lineHeight}
          onSelectionMoveLeft={this.props.onSelectionMoveLeft}
          onSelectionMoveRight={this.props.onSelectionMoveRight}
        />;
      }

      lineContent.push(
        <TimelineElement
          selected={currentSelected && !selectedItem.transition}
          x={x}
          width={thumbw}
          height={lineHeight}
          item={item}
          key={item.id}
        />
      );

      if (item.transitionNext) {
        lineContent.push(
          <TimelineTransition
            key={item.id+"@t"}
            selected={currentSelected && selectedItem.transition}
            xcenter={x + thumbw}
            width={transitionw}
            height={lineHeight}
            transition={item.transitionNext}
          />
        );
      }
      else {
        var xcenter = x + thumbw;
        var editSize = 50;
        var editIconStyle = boundToStyle({
          x: xcenter-editSize/2,
          y: (lineHeight-editSize)/2,
          width: editSize,
          height: editSize
        });
        editIconStyle.zIndex = 40;

        lineContent.push(
          <Icon
            key={item.id+"@t"}
            style={editIconStyle}
            title="Add a transition"
            name="magic"
            color="#fff"
            size={editSize}
            onClick={this.props.onAddTransition.bind(null, item.id)} />
        );
      }

      prevTransitionWidth = transitionw;
      x += thumbw;
    }
    x += prevTransitionWidth/2;

    if (selectedOverlay) {
      lineContent.push(selectedOverlay);
    }

    var gridWidth = Math.max(x, bound.width);

    lineStyle.width = gridWidth+"px";

    return <div className="timeline" style={style}
      {...this.dropTargetFor(DragItems.IMAGE, DragItems.SLIDE)}
      onClick={this.onClick}
      onMouseMove={this.onMouseMove}
      onMouseEnter={this.onMouseEnter}
      onMouseLeave={this.onMouseLeave}>
      <header style={headerStyle}>
        <h2>Timeline</h2>
        <div style={{ position: "absolute", right: "4px", top: "4px" }}>
          <TimelineZoomControls value={timeScale} onChange={this.setTimeScale} />
        </div>
      </header>
      <div style={lineContainerStyle} ref="scrollcontainer">
        <div className="line" style={lineStyle}>{lineContent}</div>
        <TimelineGrid timeScale={timeScale} width={gridWidth} height={gridHeight} />
        <TimelineCursor time={time} timeScale={timeScale} />
      </div>
    </div>;
  }
});

module.exports = Timeline;
