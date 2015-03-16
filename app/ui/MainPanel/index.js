var React = require("react");
var _ = require("lodash");
var Diaporama = require("../../models/Diaporama");
var boundToStyle = require("../../core/boundToStyle");
var toProjectUrl = require("../../core/toProjectUrl");
var Library = require("../Library");
var Icon = require("../Icon");
var TransitionCustomizer = require("../TransitionCustomizer");
var ImageCustomizer = require("../ImageCustomizer");
var GenerateScreen = require("../GenerateScreen");

var panels = {

  generate: {
    standalone: true,
    icon: "cogs",
    title: "Save / Generate",
    render: function (innerWidth, innerHeight) {
      var diaporama = this.props.diaporama;
      return <GenerateScreen
        width={innerWidth}
        height={innerHeight}
        diaporama={diaporama}
      />;
    }
  },

  library: {
    standalone: true,
    icon: "folder-open",
    title: "Library",
    render: function (innerWidth, innerHeight) {
      var diaporama = this.props.diaporama;
      return <Library
        width={innerWidth}
        height={innerHeight}
        usedImages={_.pluck(diaporama.timeline, "image")}
        alterDiaporama={this.props.alterDiaporama}
      />;
    }
  },

  editImage: {
    icon: "picture-o",
    title: "Edit Image",
    render: function (innerWidth) {
      var id = this.props.selectedItemPointer.id;
      var diaporama = this.props.diaporama;
      var element = Diaporama.timelineForId(diaporama, id);
      if (!element) return <div>No Slide Selected.</div>;
      return <ImageCustomizer
        value={element}
        onChange={this.props.alterSelection.bind(null, "setItem")}
        width={innerWidth}
        onRemove={this.props.alterSelection.bind(null, "removeItem")}
      />;
    }
  },

  editTransition: {
    icon: "magic",
    title: "Edit Transition",
    render: function (innerWidth) {
      var id = this.props.selectedItemPointer.id;
      var diaporama = this.props.diaporama;
      var transitionInfos = Diaporama.timelineTransitionForId(diaporama, id);
      if (!transitionInfos.transitionNext) return <div>No Transition Selected.</div>;
      return <TransitionCustomizer
        value={transitionInfos.transitionNext}
        onChange={this.props.alterSelection.bind(null, "setItem")}
        width={innerWidth}
        images={[ transitionInfos.from.image, transitionInfos.to.image ].map(toProjectUrl)}
        animated={false}
        onRemove={this.props.alterSelection.bind(null, "removeItem")}
      />;
    }
  }

};

var MainPanel = React.createClass({

  render: function () {
    var bound = this.props.bound;
    var mode = this.props.panel;

    var navWidth = 40;
    var innerWidth = bound.width - navWidth;
    var innerHeight = bound.height;

    var panel = panels[mode];
    var panelDom = panel && panel.render && panel.render.call(this, innerWidth, innerHeight);

    var style = _.extend({
      borderTop: "1px solid #ccc",
      borderBottom: "1px solid #eee"
    }, boundToStyle(bound));

    var bodyStyle = _.extend({
      overflow: "auto"
    }, boundToStyle({ x: navWidth, y: 0, width: innerWidth, height: innerHeight }));

    var navStyle = _.extend({
      padding: "8px",
      fontSize: "24px"
    }, boundToStyle({ x: 0, y: 0, width: navWidth, height: bound.height }));

    var navs = _.map(panels, function (panel, panelMode) {
      return <Icon
        title={panel.title}
        key={panelMode}
        name={panel.icon}
        color={panelMode === mode ? "#000" : "#999"}
        onClick={panel.standalone ? this.props.onNav.bind(null, panelMode) : undefined}
      />;
    }, this);

    return <div style={style}>
      <nav style={navStyle}>
        {navs}
      </nav>
      <div style={bodyStyle}>
      {panelDom}
      </div>
    </div>;
  }
});

module.exports = MainPanel;

