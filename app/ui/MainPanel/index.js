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
        onAddToTimeline={this.props.onAddToTimeline}
      />;
    }
  },

  editImage: {
    icon: "picture-o",
    title: "Edit Image",
    render: function (innerWidth) {
      var id = this.props.selectedItem.id;
      var diaporama = this.props.diaporama;
      var element = Diaporama.timelineForId(diaporama, id);
      if (!element) return <div>No Slide Selected.</div>;
      return <ImageCustomizer
        value={element}
        onChange={this.props.onSelectedImageEdit}
        width={innerWidth}
      />;
    }
  },

  editTransition: {
    icon: "magic",
    title: "Edit Transition",
    render: function (innerWidth) {
      var id = this.props.selectedItem.id;
      var diaporama = this.props.diaporama;
      var transitionInfos = Diaporama.timelineTransitionForId(diaporama, id);
      if (!transitionInfos.transitionNext) return <div>No Transition Selected.</div>;
      return <TransitionCustomizer
        value={transitionInfos.transitionNext}
        onChange={this.props.onSelectedTransitionEdit}
        width={innerWidth}
        images={[ transitionInfos.from.image, transitionInfos.to.image ].map(toProjectUrl)}
        animated={false}
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

    var navs = _.map(panels, function (panel, panelMode) {
      return <Icon
        title={panel.title}
        key={panelMode}
        name={panel.icon}
        color={panelMode === mode ? "#000" : "#999"}
        onClick={panel.standalone ? this.props.onNav.bind(null, panelMode) : undefined}
      />;
    }, this);

    return <div className="main-panel" style={boundToStyle(bound)}>
      <nav style={boundToStyle({ x: 0, y: 0, width: navWidth, height: bound.height })}>
        {navs}
      </nav>
      <div className="body" style={boundToStyle({ x: navWidth, y: 0, width: innerWidth, height: innerHeight })}>
      {panelDom}
      </div>
    </div>;
  }
});

module.exports = MainPanel;

