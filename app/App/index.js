var m = require("mithril");
var Qajax = require("qajax");
var _ = require("lodash");

var Header = require("../Header");
var Library = require("../Library");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");

function App () {
  this.header = new Header();
  this.library = new Library();
  this.viewer = new Viewer();
  this.timeline = new Timeline();

  window.addEventListener("resize", _.throttle(this._resize.bind(this), 100));
  this._resize();
  this.sync();
}

App.prototype = {
  sync: function () {
    var self = this;
    Qajax({
      method: "GET",
      url: "/diaporama.json"
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (diaporama) {
      self.diaporama = diaporama;
      self.timeline.setTimeline(diaporama.timeline);
    })
    .done(m.redraw);
  },
  _resize: function () {
    this.resize(
      Math.max(800, window.innerWidth),
      Math.max(500, window.innerHeight));
  },
  resize: function (W, H) {
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
    this.header.bound = {
      x: 0,
      y: 0,
      width: W,
      height: headerH
    };
    this.viewer.bound = {
      x: W-viewerW,
      y: headerH,
      width: viewerW,
      height: viewerH
    };
    this.library.bound = {
      x: 0,
      y: headerH,
      width: W-viewerW,
      height: viewerH
    };
    this.timeline.bound = {
      x: 0,
      y: headerH+viewerH,
      width: W,
      height: H-headerH-viewerH
    };
    m.redraw();
  }
};

App.render = function (app) {
  if (!app.diaporama) return [];
  return [
    Header.render(app.header),
    Library.render(app.library),
    Viewer.render(app.viewer),
    Timeline.render(app.timeline)
  ];
};

module.exports = App;
