var React = require("react");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var PromiseMixin = require("../../mixins/PromiseMixin");
var TimelineGrid = require("../TimelineGrid");
var TimelineElement = require("../TimelineElement");
var TimelineZoomControls = require("../TimelineZoomControls");
var TimelineTransition = require("../TimelineTransition");
var Diaporama = require("../../models/Diaporama");

var TimelineCursor = React.createClass({

  render: function () {
    var time = this.props.time;
    var timeScale = this.props.timeScale;
    var x = time * timeScale;
    var style = {
      position: "absolute",
      zIndex: 1,
      left: Math.round(x)+"px",
      top: 0,
      width: "2px",
      height: "100%",
      background: "#000"
    };
    return <div style={style}></div>;
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
    var lineStyle = { zIndex: 10, top: lineTop+"px", width: bound.width+"px", height: lineHeight + "px" };
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
      var transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeScale * item.transitionNext.duration) : 0; // TODO the transition should be shown in cross-fade between images

      var thumbw = transitionw/2 + prevTransitionWidth/2 + Math.round(timeScale * item.duration);

      var currentSelected = selectedItem && selectedItem.id === item.id;

      if (currentSelected) {
        var sx = selectedItem.transition ? x + thumbw - transitionw / 2 : x;
        var sw = selectedItem.transition ? transitionw : thumbw;
        var selectedStyle = _.extend({
          zIndex: 5,
          backgroundColor: "rgba(200, 130, 0, 0.2)",
          border: "2px dashed #fc0"
        }, boundToStyle({ x: sx, y: 0, width: sw, height: lineHeight }));
        selectedOverlay = <div style={selectedStyle} />;
      }

      lineContent.push(
        <TimelineElement
          selected={currentSelected && !selectedItem.transition}
          x={x}
          width={thumbw}
          height={lineHeight}
          item={item}
          key={item.id}
          onMoveLeft={this.props.onAction.bind(null, "moveLeft", item.id)}
          onMoveRight={this.props.onAction.bind(null, "moveRight", item.id)}
          onRemove={this.props.onAction.bind(null, "remove", item.id)}
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
          onRemove={this.props.onRemoveTransition.bind(null, item.id)}
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
