var React = require("react");
var _ = require("lodash");
var Diaporama = require("../../models/Diaporama");
var boundToStyle = require("../../core/boundToStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Library = require("../Library");
var Transitions = require("../Transitions");
var KenBurnsEditor = require("../KenBurnsEditor");
var Icon = require("../Icon");

var NAV = [
  { mode: "library", icon: "folder-open" },
  { mode: "transitions", icon: "magic" },
  { mode: "crop", icon: "crop" }
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

    var navWidth = 40;
    var innerWidth = bound.width - navWidth;
    var innerHeight = bound.height;

    var panel = null;
    // TODO: this should be given by children...
    // Should I try react-router ?
    if (mode === "library") {
      panel = <Library width={innerWidth} height={innerHeight} usedImages={_.pluck(diaporama.timeline, "image")} onAddToTimeline={this.addToTimeline} />;
    }
    else if (mode === "transitions") {
      panel = <Transitions width={innerWidth} height={innerHeight} />;
    }
    else if (mode === "crop") {
      var el = Diaporama.timelineForId(diaporama, modeArg);
      var onChange = function (value) {
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

