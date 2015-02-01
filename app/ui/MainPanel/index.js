var React = require("react");
var Q = require("q");
var _ = require("lodash");
var boundToStyle = require("../../core/boundToStyle");
var Library = require("../Library");
var Icon = require("../Icon");

var NAV = [
  { mode: "library", icon: "folder-open" }
];

var MainPanel = React.createClass({

  getInitialState: function () {
    return {
      mode: "library"
    };
  },

  onAddToTimeline: function (item) {
    this.props.onAddToTimeline(item);
  },

  render: function () {
    var bound = this.props.bound;
    var diaporama = this.props.diaporama;
    var mode = this.state.mode;

    var navWidth = 40;
    var innerWidth = bound.width - navWidth;
    var innerHeight = bound.height;


    var panel = null;
    if (mode === "library") {
      panel = <Library width={innerWidth} height={innerHeight} usedImages={_.pluck(diaporama.timeline, "image")} onAddToTimeline={this.addToTimeline} />;
    }

    var self = this;
    var navs = NAV.map(function (n) {
      var current = n.mode===mode;
      function switchMode () {
        self.setState({ mode: n.mode });
      }
      return <Icon key={n.mode} name={n.icon} color={current ? "#999" : "#000"} onClick={switchMode} />;
    });

    return <div className="main-panel" style={boundToStyle(bound)}>
      <nav style={boundToStyle({ x: 0, y: 0, width: navWidth, height: bound.height })}>
        {navs}
      </nav>
      <div className="body" style={boundToStyle({ x: navWidth, y: 0, width: innerWidth, height: innerHeight })}>
      {panel}
      </div>
    </div>;
  }
});

module.exports = MainPanel;

