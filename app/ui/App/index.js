var React = require("react");
var _ = require("lodash");

var PromiseMixin = require("../../mixins/PromiseMixin");
var Diaporama = require("../../models/Diaporama");
var Header = require("../Header");
var Library = require("../Library");
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
      diaporama: null
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
    Diaporama.save(newDiaporama).done(); // TODO better feedback on failure cases
  },

  addToTimeline: function (file) {
    var newDiaporama = Diaporama.timelineAdd(this.state.diaporama, file);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  onTimelineAction: function (action, id) {
    var newDiaporama = Diaporama.timelineAction(this.state.diaporama, action, id);
    if (newDiaporama) {
      this.saveDiaporama(newDiaporama);
    }
  },

  render: function () {
    var W = this.state.width;
    var H = this.state.height;
    var diaporama = this.state.diaporama;

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
    var libraryBound = {
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
      Library({ bound: libraryBound, usedImages: _.pluck(diaporama.timeline, "image"), onAddToTimeline: this.addToTimeline }),
      Viewer({ bound: viewerBound, diaporama: Diaporama.localize(diaporama) }),
      Timeline({ bound: timelineBound, timeline: diaporama.timeline, onAction: this.onTimelineAction }),
      draggingElement
    ]);
  }
});

module.exports = App;
