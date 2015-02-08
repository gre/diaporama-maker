var React = require("react");

var PromiseMixin = require("../../mixins/PromiseMixin");
var Diaporama = require("../../models/Diaporama");
var Header = require("../Header");
var MainPanel = require("../MainPanel");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");

var m = React.createElement;

function getWidth () {
  return Math.max(800, window.innerWidth);
}
function getHeight () {
  return Math.max(500, window.innerHeight);
}

var App = React.createClass({

  mixins: [ PromiseMixin ],

  componentDidMount: function () {
    window.addEventListener("resize", this._onresize = this.onresize.bind(this));
    this.sync();
  },

  componentWillUnmount: function () {
    window.removeEventListener("resize", this._onresize);
  },

  getInitialState: function () {
    return {
      width: getWidth(),
      height: getHeight(),
      diaporama: null,
      mode: "library",
      modeArg: null
    };
  },

  sync: function () {
    var self = this;
    Diaporama.fetch()
      .then(function (diaporama) {
        self.setState({
          diaporama: diaporama
        });
      })
      .done();
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

  saveDiaporama: function (newDiaporama) {
    this.setState({ diaporama: newDiaporama });
    // TODO debounce it a bit
    // TODO better feedback on failure cases
    Diaporama.save(newDiaporama).done();
  },

  addToTimeline: function (file) {
    var newDiaporama = Diaporama.timelineAdd(this.state.diaporama, file);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  onElementDurationChange: function (id, duration) {
    var newDiaporama = Diaporama.setDuration(this.state.diaporama, id, duration);
    this.saveDiaporama(newDiaporama);
  },

  onTransitionDurationChange: function (id, duration) {
    var newDiaporama = Diaporama.setTransitionDuration(this.state.diaporama, id, duration);
    this.saveDiaporama(newDiaporama);
  },

  onTransitionUniformsChange: function (id, uniforms) {
    var newDiaporama = Diaporama.setTransitionUniforms(this.state.diaporama, id, uniforms);
    this.saveDiaporama(newDiaporama);
  },

  onEasing: function (args) {
    var el = Diaporama.timelineForId(this.state.diaporama, args.id);
    if (el) {
      this.setMode("easing", args);
    }
  },

  onCrop: function (id) {
    var el = Diaporama.timelineForId(this.state.diaporama, id);
    if (el) {
      this.setMode("crop", id);
    }
  },

  setMode: function (mode, modeArg) {
    this.setState({
      mode: mode,
      modeArg: modeArg
    });
  },

  setKenBurns: function (id, kenburns) {
    var newDiaporama = Diaporama.setKenBurns(this.state.diaporama, id, kenburns);
    this.saveDiaporama(newDiaporama);
  },

  setEasing: function (args, easing) {
    var newDiaporama = Diaporama.setEasing(this.state.diaporama, args.id, args.forTransition, easing);
    this.saveDiaporama(newDiaporama);
  },

  onTransitionSelected: function (name) {
    var newDiaporama = Diaporama.setTransition(this.state.diaporama, name); // FIXME do it for one particular id
    this.saveDiaporama(newDiaporama);
  },

  onTimelineAction: function (action, id) {
    // TODO: we might change the mode on some actions ?
    var newDiaporama = Diaporama.timelineAction(this.state.diaporama, action, id);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  onDiaporamaEdit: function (newDiaporama) {
    this.saveDiaporama(newDiaporama);
  },

  render: function () {
    var W = this.state.width;
    var H = this.state.height;
    var diaporama = this.state.diaporama;
    var mode = this.state.mode;
    var modeArg = this.state.modeArg;

    if (!diaporama) return m("div", null, []);

    // Bounds
    var headerH = 38;
    var viewerW, viewerH;
    if ((H-headerH) * 2 / 3 < W / 2) {
      viewerH = Math.round((H-headerH) / 2);
      viewerW = Math.round(viewerH * 4 / 3);
    }
    else {
      viewerW = Math.round(W / 2);
      viewerH = Math.round(viewerW * 3 / 4);
    }
    var headerBound = {
      x: 0,
      y: 0,
      width: W,
      height: headerH
    };
    var viewerBound = {
      x: W-viewerW,
      y: headerH,
      width: viewerW,
      height: viewerH
    };
    var mainPanelBound = {
      x: 0,
      y: headerH,
      width: W-viewerW,
      height: viewerH
    };
    var timelineBound = {
      x: 0,
      y: headerH+viewerH,
      width: W,
      height: H-headerH-viewerH
    };

    var draggingElement = null;

    return m("div", null, [
      Header({ bound: headerBound }),
      MainPanel({ bound: mainPanelBound, mode: mode, modeArg: modeArg, diaporama: diaporama, onTransitionSelected: this.onTransitionSelected, onAddToTimeline: this.addToTimeline, setMode: this.setMode, setKenBurns: this.setKenBurns, setEasing: this.setEasing, onDiaporamaEdit: this.onDiaporamaEdit }),
      Viewer({ bound: viewerBound, diaporama: Diaporama.localize(diaporama) }),
      Timeline({ bound: timelineBound, timeline: diaporama.timeline, onAction: this.onTimelineAction, onCrop: this.onCrop, onEasing: this.onEasing, onTransitionDurationChange: this.onTransitionDurationChange, onTransitionUniformsChange: this.onTransitionUniformsChange, onElementDurationChange: this.onElementDurationChange }),
      draggingElement
    ]);
  }
});

module.exports = App;
