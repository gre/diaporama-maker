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

var TimelineCursor = React.createClass({

  render: function () {
    var time = this.props.time;
    var timeScale = this.props.timeScale;
    var x = time * timeScale;
    var style = {
      position: "absolute",
      zIndex: 30,
      left: Math.round(x)+"px",
      top: 0,
      width: "2px",
      height: "100%",
      background: "rgba(0,0,0,0.3)"
    };
    var headerStyle = {
      position: "absolute",
      left: 0,
      top: 0,
      width: "2px",
      height: "16px",
      background: "#fc0"
    };
    return <div style={style}>
      <div style={headerStyle} />
    </div>;
  }
});

var Timeline = React.createClass({

  mixins: [ PromiseMixin ],

  propTypes: {
    diaporama: React.PropTypes.object.isRequired
  },

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

  onMouseMove: function (e) {
    var cb = this.props.onHoverMove;
    if (!cb) return;
    var mouseMove = this.getEventStats(e);
    cb(this.eventPositionToTime(mouseMove.at));
    if (this.state.mouseDown) {
      // ...
    }
  },

  onMouseDown: function (e) {
    var mouseDown = this.getEventStats(e);
    this.setState({
      mouseDown: mouseDown
    });
  },

  onMouseUp: function (e) {
    var mouseDown = this.state.mouseDown;
    if (mouseDown) {
      var mouseUp = this.getEventStats(e);
      var deltaT = mouseUp.time - mouseDown.time;
      var delta = [ mouseUp.at[0] - mouseDown.at[0], mouseUp.at[1] - mouseDown.at[1] ];
      var dist2 = delta[0] * delta[0] + delta[1] * delta[1];
      if (dist2 < 5*5 && deltaT < 300) {
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
    if (newProps.selectedItem && !_.isEqual(props.selectedItem, newProps.selectedItem)) {
      var node = this.refs.scrollcontainer.getDOMNode();
      var timeScale = this.state.timeScale;
      var scrollLeft = node.scrollLeft;
      var width = node.clientWidth;
      var scrollDuration = width / timeScale;
      var timeFrom = scrollLeft / timeScale;
      var timeTo = timeFrom + scrollDuration;
      var interval = Diaporama.timelineTimeIntervalForItem(newProps.diaporama, newProps.selectedItem);
      // Fix the scrolling by "window of width"
      if (interval.end < timeFrom) {
        node.scrollLeft = scrollLeft - timeScale * scrollDuration * Math.ceil((timeFrom - interval.end) / scrollDuration);
      }
      else if (timeTo < interval.start) {
        node.scrollLeft = scrollLeft + timeScale * scrollDuration * Math.ceil((interval.start - timeTo) / scrollDuration);
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

    var headerStyle = { width: bound.width+"px", height: headerHeight+"px" };
    var lineStyle = { top: lineTop+"px", width: bound.width+"px", height: lineHeight + "px" };
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
          border: "2px dashed #fc0"
        }, boundToStyle({ x: sx, y: 0, width: sw, height: lineHeight }));
        var buttonsStyle = {
          textAlign: "center",
          position: "absolute",
          bottom: "0px",
          width: "100%"
        };

        var selectedContent = [];
        if (!isTransition) {
          selectedContent.push(
            <Icon key="left" size={32} name="arrow-circle-o-left" color="#fff" onClick={this.props.onSelectionMoveLeft} />
          );
        }

        if (!isTransition || isTransition && item.transitionNext && item.transitionNext.duration) {
          selectedContent.push(
            <Icon key="middle" size={32} name="remove" color="#F00" onClick={this.props.onSelectionRemove} />
          );
        }

        if (!isTransition) {
          selectedContent.push(
            <Icon key="right" size={32} name="arrow-circle-o-right" color="#fff" onClick={this.props.onSelectionMoveRight} />
          );
        }

        selectedOverlay = <div key="selectionOverlay" style={selectedStyle}>
          <div style={buttonsStyle}>{selectedContent}</div>
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

      lineContent.push(
        <TimelineTransition
          selected={currentSelected && selectedItem.transition}
          xcenter={x + thumbw}
          width={transitionw}
          height={lineHeight}
          transition={item.transitionNext}
          key={item.id+"@t"}
          onAdd={this.props.onAddTransition.bind(null, item.id)}
        />
      );

      prevTransitionWidth = transitionw;
      x += thumbw;
    }
    x += prevTransitionWidth/2;

    if (selectedOverlay) {
      lineContent.push(selectedOverlay);
    }

    var gridWidth = Math.max(x, bound.width);

    return <div className="timeline" style={boundToStyle(bound)}
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
