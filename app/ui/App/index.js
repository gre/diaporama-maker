var React = require("react");

var PromiseMixin = require("../../mixins/PromiseMixin");
var Diaporama = require("../../models/Diaporama");
var MainPanel = require("../MainPanel");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");
var Bootstrap = require("../Bootstrap");

function getWidth () {
  return Math.max(800, window.innerWidth);
}
function getHeight () {
  return Math.max(500, window.innerHeight);
}

var App = React.createClass({

  mixins: [ PromiseMixin ],

  componentDidMount: function () {
    window.addEventListener("resize", this.onresize);
    this.sync(Diaporama.fetch());
  },

  componentWillUnmount: function () {
    window.removeEventListener("resize", this.onresize);
  },

  getInitialState: function () {
    return {
      width: getWidth(),
      height: getHeight(),
      diaporama: undefined, // undefined means not loaded yet, null means no diaporama init yet
      diaporamaLocalized: null,
      mode: "library",
      modeArg: null,
      time: 0
    };
  },

  sync: function (diaporamaPromise) {
    var self = this;
    diaporamaPromise.then(function (diaporama) {
      self.setState({
        diaporama: diaporama,
        diaporamaLocalized: Diaporama.localize(diaporama)
      });
    }, function skipErrors(){}).done();
  },

  onresize: function () {
    this.resize(getWidth(), getHeight());
  },
  resize: function (W, H) {
    this.setState({
      width: W,
      height: H
    });
  },

  bootstrap: function (options) {
    this.sync(Diaporama.bootstrap(options));
  },

  saveDiaporama: function (newDiaporama) {
    if (!newDiaporama) return;
    this.setState({
      diaporama: newDiaporama,
      diaporamaLocalized: Diaporama.localize(newDiaporama)
    });
    // TODO debounce it a bit
    // TODO better feedback on failure cases
    Diaporama.save(newDiaporama).done();
  },

  addToTimeline: function (file) {
    this.saveDiaporama( Diaporama.timelineAdd(this.state.diaporama, file) );
  },

  onTimelineAction: function (action, id) {
    // TODO: we might change the mode on some actions ?
    this.saveDiaporama( Diaporama.timelineAction(this.state.diaporama, action, id) );
  },

  setMode: function (mode, modeArg) {
    this.setState({
      mode: mode,
      modeArg: modeArg
    });
  },

  onSelectTransition: function (id) {
    this.setMode("editTransition", id);
  },

  onSelectImage: function (id) {
    this.setMode("editImage", id);
  },

  onTimelineHover: function (time) {
    if (this.state.time !== time) {
      this.setState({
        time: time
      });
    }
  },

  onSelectedImageEdit: function (element) {
    var id = this.state.modeArg;
    this.saveDiaporama(
      Diaporama.setTimelineElement(this.state.diaporama, id, element)
    );
  },

  onSelectedTransitionEdit: function (transitionNext) {
    var id = this.state.modeArg;
    this.saveDiaporama(
      Diaporama.setTransition(this.state.diaporama, id, transitionNext)
    );
  },

  render: function () {
    var W = this.state.width;
    var H = this.state.height;
    var diaporama = this.state.diaporama;
    var diaporamaLocalized = this.state.diaporamaLocalized;
    var mode = this.state.mode;
    var modeArg = this.state.modeArg;
    var time = this.state.time;

    if (diaporama === undefined) return <div>Loading...</div>;

    if (diaporama === null) return <Bootstrap onSubmit={this.bootstrap} />;

    // Bounds
    var viewerW, viewerH;
    if (H * 2 / 3 < W / 2) {
      viewerH = Math.round(H / 2);
      viewerW = Math.round(viewerH * 4 / 3);
    }
    else {
      viewerW = Math.round(W / 2);
      viewerH = Math.round(viewerW * 3 / 4);
    }
    var viewerBound = {
      x: W-viewerW,
      y: 0,
      width: viewerW,
      height: viewerH
    };
    var mainPanelBound = {
      x: 0,
      y: 0,
      width: W-viewerW,
      height: viewerH
    };
    var timelineBound = {
      x: 0,
      y: viewerH,
      width: W,
      height: H-viewerH
    };

    var draggingElement = null;

    return <div>

      <MainPanel
        bound={mainPanelBound}
        mode={mode}
        modeArg={modeArg}
        diaporama={diaporama}
        onAddToTimeline={this.addToTimeline}
        setMode={this.setMode}
        onSelectedImageEdit={this.onSelectedImageEdit}
        onSelectedTransitionEdit={this.onSelectedTransitionEdit}
      />

      <Viewer
        time={time}
        bound={viewerBound}
        diaporama={diaporamaLocalized} />

      <Timeline
        time={time}
        onHover={this.onTimelineHover}
        bound={timelineBound}
        timeline={diaporama.timeline}
        onAction={this.onTimelineAction}
        onSelectImage={this.onSelectImage}
        onSelectTransition={this.onSelectTransition}
      />

      {draggingElement}

    </div>;
  }
});

module.exports = App;
