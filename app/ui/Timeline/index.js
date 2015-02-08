var React = require("react");
var boundToStyle = require("../../core/boundToStyle");
var PromiseMixin = require("../../mixins/PromiseMixin");
var TimelineGrid = require("../TimelineGrid");
var TimelineElement = require("../TimelineElement");
var TimelineZoomControls = require("../TimelineZoomControls");
var TimelineTransition = require("../TimelineTransition");

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

  render: function () {
    var timeline = this.props.timeline;
    var bound = this.props.bound;
    var timeScale = this.state.timeScale;

    var headerHeight = 50;
    var lineHeight = (bound.height - headerHeight);

    var headerStyle = { width: bound.width+"px", height: headerHeight+"px" };
    var lineStyle = { width: bound.width+"px", height: lineHeight + "px" };
    var gridHeight = lineHeight + 10;
    var gridStyle = { zIndex: 2, position: "absolute", top: (bound.height-gridHeight)+"px" };

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
          onCrop={this.props.onCrop.bind(null, item.id)}
          onEasing={this.props.onEasing.bind(null, { id: item.id, forTransition: false })}
          onDurationChange={this.props.onElementDurationChange.bind(null, item.id)}
        />
      );

      lineContent.push(
        <TimelineTransition
          xcenter={x + thumbw}
          width={transitionw}
          height={lineHeight}
          transition={item.transitionNext}
          key={item.id+"@t"}
          onEasing={this.props.onEasing.bind(null, { id: item.id, forTransition: true })}
          onDurationChange={this.props.onTransitionDurationChange.bind(null, item.id)}
          onUniformsChange={this.props.onTransitionUniformsChange.bind(null, item.id)}
        />
      );

      prevTransitionWidth = transitionw;
      x += thumbw;
    }

    return <div className="timeline" style={boundToStyle(bound)}>
      <header style={headerStyle}>
        <h2>Timeline</h2>
        <div style={{ position: "absolute", right: "4px", top: "4px" }}>
          <TimelineZoomControls from={0.01} to={0.2} step={0.01} value={timeScale} onChange={this.setTimeScale} />
        </div>
      </header>
      <div className="line" style={lineStyle}>{lineContent}</div>
      <div style={gridStyle}>
        <TimelineGrid timeScale={timeScale} width={bound.width} height={gridHeight} />
      </div>
    </div>;
  }
});

module.exports = Timeline;
