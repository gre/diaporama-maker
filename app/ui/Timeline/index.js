var React = require("react");
var boundToStyle = require("../../core/boundToStyle");
var PromiseMixin = require("../../mixins/PromiseMixin");
var TimelineGrid = require("../TimelineGrid");
var TimelineElement = require("../TimelineElement");
var TimelineZoomControls = require("../TimelineZoomControls");
var TimelineTransition = require("../TimelineTransition");

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
    timeline: React.PropTypes.array
  },

  getInitialState: function () {
    return {
      timeScale: 0.1 // pixels per milliseconds
    };
  },

  setTimeScale: function (s) {
    this.setState({
      timeScale: s
    });
  },

  onHover: function (e) {
    var cb = this.props.onHover;
    if (!cb) return;
    var bounds = this.getDOMNode().getBoundingClientRect();
    var x = e.clientX - bounds.left;
    if (x < 0 || x > bounds.width) return;
    var scrollLeft = this.refs.scrollcontainer.getDOMNode().scrollLeft;
    x += scrollLeft;
    var time = x / this.state.timeScale;
    cb(time);
  },

  render: function () {
    var timeline = this.props.timeline;
    var bound = this.props.bound;
    var time = this.props.time;
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

    var lineContent = [];
    var x = 0;
    var prevTransitionWidth = 0;
    for (var i=0; i<timeline.length; ++i) {
      var item = timeline[i];
      var transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeScale * item.transitionNext.duration) : 0; // TODO the transition should be shown in cross-fade between images

      var thumbw = transitionw/2 + prevTransitionWidth/2 + Math.round(timeScale * item.duration);

      lineContent.push(
        <TimelineElement
          x={x}
          width={thumbw}
          height={lineHeight}
          item={item}
          key={item.id}
          onMoveLeft={this.props.onAction.bind(null, "moveLeft", item.id)}
          onMoveRight={this.props.onAction.bind(null, "moveRight", item.id)}
          onRemove={this.props.onAction.bind(null, "remove", item.id)}
          onSelect={this.props.onSelectImage.bind(null, item.id)}
        />
      );

      lineContent.push(
        <TimelineTransition
          xcenter={x + thumbw}
          width={transitionw}
          height={lineHeight}
          transition={item.transitionNext}
          key={item.id+"@t"}
          onSelect={this.props.onSelectTransition.bind(null, item.id)}
        />
      );

      prevTransitionWidth = transitionw;
      x += thumbw;
    }
    x += prevTransitionWidth/2;

    var gridWidth = Math.max(x, bound.width);

    return <div className="timeline" style={boundToStyle(bound)} onMouseMove={this.onHover}>
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
