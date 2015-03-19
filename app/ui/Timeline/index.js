var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var PromiseMixin = require("../../mixins/PromiseMixin");
var TimelineGrid = require("../TimelineGrid");
var TimelineElement = require("../TimelineElement");
var TimelineZoomControls = require("../TimelineZoomControls");
var TimelineTransition = require("../TimelineTransition");
var TimelineSelection = require("./TimelineSelection");
var Diaporama = require("../../models/Diaporama");
var Icon = require("../Icon");
var TimelineCursor = require("./TimelineCursor");
var DragItems = require("../../constants").DragItems;
var DragDropMixin = require('react-dnd').DragDropMixin;

function scrollSpeed (x, xtarget, normDist, speed) {
  var dist = Math.abs(x - xtarget) / normDist;
  return speed * Math.exp(-(dist * dist));
}

var trackDragOverX = function (context) {
  return {
    leave: function (component) {
      component._dragOverX = null;
      component.setState({ hoverPlace: null });
    },
    over: function (component) {
      var initial = context.getInitialOffsetFromClient();
      var delta = context.getCurrentOffsetDelta();
      component._dragOverX = initial.x + delta.x;
      var time = component.timeForClientX(initial.x + delta.x);
      var place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
      if (!_.isEqual(component.state.place, place))
        component.setState({ hoverPlace: place });
    },
    acceptDrop: function (component) {
      component._dragOverX = null;
      component.setState({ hoverPlace: null });
    },
  };
};


var Timeline = React.createClass({

  mixins: [ PromiseMixin, DragDropMixin ],

  propTypes: {
    diaporama: React.PropTypes.object.isRequired,
    alterDiaporama: React.PropTypes.func.isRequired,
    selectedItemPointer: React.PropTypes.object
  },

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
            var place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
            component.props.alterDiaporama("moveItem", item, place);
          }
        }
      });
      register(DragItems.IMAGES, {
        dropTarget: {
          enter: track.enter,
          leave: track.leave,
          over: track.over,

          getDropEffect: function () {
            return "copy";
          },

          acceptDrop: function (component, items) {
            var all = items.all;
            track.acceptDrop(component);
            var initial = context.getInitialOffsetFromClient();
            var delta = context.getCurrentOffsetDelta();
            var time = component.timeForClientX(initial.x + delta.x);
            var place = Diaporama.lookupBetweenImagePlace(component.props.diaporama, time);
            component.props.alterDiaporama("bootstrapImages", _.pluck(all, "file"), place);
          }
        }
      });
    }
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
      hoverPlace: null,
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
    // TODO: the 'lookup' can be pass in instead of re-determined
    var pos = this.getEventPosition(e);
    var lookup = Diaporama.lookupSegment(this.props.diaporama, this.eventPositionToTime(pos));
    if (lookup) {
      if (_.isEqual(lookup, this.props.selectedItemPointer))
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
    if (newProps.selectedItemPointer && 
        (!_.isEqual(props.selectedItemPointer, newProps.selectedItemPointer) ||
         this.props.diaporama !== newProps.diaporama)) {
      var node = this.refs.scrollcontainer.getDOMNode();
      var timeScale = this.state.timeScale;
      var scrollLeft = node.scrollLeft;
      var width = node.clientWidth;
      var scrollDuration = width / timeScale;
      var timeFrom = scrollLeft / timeScale;
      var timeTo = timeFrom + scrollDuration;
      var interval = Diaporama.timelineTimeIntervalForItemPointer(newProps.diaporama, newProps.selectedItemPointer);
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
    var selectedItemPointer = this.props.selectedItemPointer;
    var hoverPlace = this.state.hoverPlace;
    var timeScale = this.state.timeScale;

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
      zIndex: 2
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
      var next = timeline[i+1];
      var spaceAfter = hoverPlace && (
        hoverPlace.after && item.id === hoverPlace.id ||
        hoverPlace.before && next && next.id === hoverPlace.id
      );
      var transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeScale * item.transitionNext.duration) : 0;

      var onlyImageW = Math.round(timeScale * item.duration);
      var thumbw = transitionw/2 + prevTransitionWidth/2 + onlyImageW;

      var currentSelected = selectedItemPointer && selectedItemPointer.id === item.id;

      if (currentSelected) {
        var isTransition = selectedItemPointer.transition;
        var sx = isTransition ? x + thumbw - transitionw / 2 : x + prevTransitionWidth/2;
        var sw = isTransition ? transitionw : onlyImageW;

        selectedOverlay = <TimelineSelection
          key="tl-selection"
          itemPointer={selectedItemPointer}
          item={item}
          x={sx}
          width={sw}
          height={lineHeight}
          onClick={this.onClick}
          timeScale={timeScale}
          alterDiaporama={this.props.alterDiaporama}
        />;
      }

      lineContent.push(
        <TimelineElement
          selected={currentSelected && !selectedItemPointer.transition}
          x={x}
          width={thumbw}
          height={lineHeight}
          item={item}
          key={item.id}
          onClick={this.onClick}
        />
      );

      if (item.transitionNext) {
        lineContent.push(
          <TimelineTransition
            key={item.id+"@t"}
            selected={currentSelected && selectedItemPointer.transition}
            xcenter={x + thumbw}
            width={transitionw}
            height={lineHeight}
            transition={item.transitionNext}
            onClick={this.onClick}
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
            onClick={this.props.alterDiaporama.bind(null, "bootstrapTransition", item.id)}
          />
        );
      }

      prevTransitionWidth = transitionw;
      x += thumbw;

      if (spaceAfter) {
        var pad = 2;
        var top = 6;
        var cursorStyle = {
          background: "#fc0",
          position: "absolute",
          top: "-"+top+"px",
          left: Math.round(x-pad)+"px",
          height: (lineHeight+top)+"px",
          width: (2*pad)+"px",
          zIndex: 52
        };
        var cursorIconStyle = {
          position: "absolute",
          top: "-14px",
          left: (-10+pad)+"px",
          color: "#fc0",
          fontSize: 20
        };
        lineContent.push(
          <div key="cursor" style={cursorStyle}>
            <Icon style={cursorIconStyle} name="chevron-down" />
          </div>
        );
      }
    }
    x += prevTransitionWidth/2;

    if (selectedOverlay) {
      lineContent.push(selectedOverlay);
    }

    var gridWidth = Math.max(x, bound.width);

    lineStyle.width = gridWidth+"px";

    return <div style={style}
      {...this.dropTargetFor(DragItems.IMAGES, DragItems.SLIDE)}
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
        <div style={lineStyle}>{lineContent}</div>
        <TimelineGrid timeScale={timeScale} width={gridWidth} height={gridHeight} />
        <TimelineCursor time={time} timeScale={timeScale} />
      </div>
    </div>;
  }
});

module.exports = Timeline;
