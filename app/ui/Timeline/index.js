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
var uiConstants = require("../../constants");

var MIN_DRAG_2 = uiConstants.MIN_DRAG_THRESHOLD * uiConstants.MIN_DRAG_THRESHOLD;

var Timeline = React.createClass({

  mixins: [ PromiseMixin ],

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

  onMouseDown: function (e) {
    var mouseDown = this.getEventStats(e);
    this.setState({
      mouseDown: mouseDown
    });
  },

  onMouseMove: function (e) {
    var cb = this.props.onHoverMove;
    if (!cb) return;
    var mouseMove = this.getEventStats(e);
    cb(this.eventPositionToTime(mouseMove.at));
  },

  onMouseUp: function (e) {
    var mouseDown = this.state.mouseDown;
    if (mouseDown) {
      var mouseUp = this.getEventStats(e);
      var deltaT = mouseUp.time - mouseDown.time;
      var delta = [ mouseUp.at[0] - mouseDown.at[0], mouseUp.at[1] - mouseDown.at[1] ];
      var dist2 = delta[0] * delta[0] + delta[1] * delta[1];
      if (dist2 < MIN_DRAG_2 && deltaT < 300) {
        // That's a tap
        this.onTap(mouseUp.at);
      }
      this.setState({ mouseDown: null });
    }
  },

  onMouseEnter: function () {
    this.props.onHoverEnter();
  },

  onMouseLeave: function () {
    this.props.onHoverLeave();
    if (this.state.mouseDown) {
      this.setState({ mouseDown: null });
    }
  },

  onTap: function (pos) {
    var lookup = Diaporama.lookupSegment(this.props.diaporama, this.eventPositionToTime(pos));
    if (lookup && !_.isEqual(lookup, this.props.selectedItem)) {
      this.props.onSelect(lookup);
    }
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

  render: function () {
    var diaporama = this.props.diaporama;
    var timeline = diaporama.timeline;
    var bound = this.props.bound;
    var time = this.props.time;
    var selectedItem = this.props.selectedItem;

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
      width: bound.width+"px",
      height: lineHeight + "px"
    };

    var lineContainerStyle = {
      position: "absolute",
      zIndex: 1,
      top: gridTop+"px",
      left: "0px",
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
        var selectedStyle = _.extend({
          zIndex: 50,
          backgroundColor: "rgba(200, 130, 0, 0.2)",
          border: "2px solid #fc0"
        }, boundToStyle({ x: sx, y: 0, width: sw, height: lineHeight }));

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

        selectedOverlay = <div key="selectionOverlay" style={selectedStyle}>
          {selectedContent}
        </div>;
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

    return <div className="timeline" style={style}
      onMouseDown={this.onMouseDown}
      onMouseUp={this.onMouseUp}
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
