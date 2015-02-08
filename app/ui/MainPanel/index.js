var React = require("react");
var _ = require("lodash");
var BezierEditor = require("glsl.io-client/src/ui/BezierEditor");
var Diaporama = require("../../models/Diaporama");
var boundToStyle = require("../../core/boundToStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Library = require("../Library");
var Transitions = require("../Transitions");
var KenBurnsEditor = require("../KenBurnsEditor");
var Settings = require("../Settings");
var Icon = require("../Icon");

var NAV = [
  { mode: "settings", icon: "cogs" },
  { mode: "library", icon: "folder-open" },
  { mode: "transitions", icon: "magic" },
  { mode: "crop", icon: "crop" },
  { mode: "easing", icon: "line-chart" }
];

var MainPanel = React.createClass({

  setMode: function (mode, o) {
    this.props.setMode(mode, o);
  },

  onAddToTimeline: function (item) {
    this.props.onAddToTimeline(item);
  },

  render: function () {
    var bound = this.props.bound;
    var diaporama = this.props.diaporama;
    var mode = this.props.mode;
    var modeArg = this.props.modeArg;
    var setKenBurns = this.props.setKenBurns;
    var setEasing = this.props.setEasing;

    var navWidth = 40;
    var innerWidth = bound.width - navWidth;
    var innerHeight = bound.height;

    var panel = null, el, onChange;
    // TODO: this should be given by children...
    // Should I try react-router ?
    if (mode === "settings") {
      panel = <Settings />;
    }
    else if (mode === "library") {
      panel = <Library width={innerWidth} height={innerHeight} usedImages={_.pluck(diaporama.timeline, "image")} onAddToTimeline={this.onAddToTimeline} />;
    }
    else if (mode === "transitions") {
      panel = <Transitions width={innerWidth} height={innerHeight} onTransitionSelected={this.props.onTransitionSelected} />;
    }
    else if (mode === "crop") {
      el = Diaporama.timelineForId(diaporama, modeArg);
      onChange = function (value) {
        setKenBurns(modeArg, value);
      };
      panel = <KenBurnsEditor
        width={innerWidth}
        height={innerHeight}
        image={toProjectUrl(el.image)}
        onChange={onChange}
        value={el.kenburns}
      />;
    }
    else if (mode === "easing") {
      el = Diaporama.timelineForId(diaporama, modeArg.id);
      var easing = modeArg.forTransition ?
        el.transitionNext && el.transitionNext.easing :
        el.kenburns && el.kenburns.easing;
      var paddingW = Math.max(10, (innerWidth - innerHeight) / 2);
      onChange = function (value) {
        setEasing(modeArg, value);
      };
      panel = <BezierEditor
        width={innerWidth}
        height={innerHeight}
        value={easing}
        onChange={onChange}
        handleRadius={10}
        padding={[10, paddingW, 20, paddingW]}
      />;
    }

    var self = this;
    var navs = NAV.map(function (n) {
      var current = n.mode===mode;
      function switchMode () {
        self.setMode(n.mode);
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

