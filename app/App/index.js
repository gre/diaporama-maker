var m = require("mithril");
var Qajax = require("qajax");

var Header = require("../Header");
var Library = require("../Library");
var Viewer = require("../Viewer");
var Timeline = require("../Timeline");

function App () {
  var self = this;
  Qajax({
    method: "GET",
    url: "/diaporama.json"
  })
  .then(function (diaporama) {
    self.diaporama = diaporama;
  })
  .done(m.redraw);

  this.header = new Header();
  this.library = new Library();
  this.viewer = new Viewer();
  this.timeline = new Timeline();

  window.addEventListener("resize", this._resize.bind(this));
  this._resize();
}

App.prototype = {
  _resize: function () {
    this.resize(
      Math.max(600, window.innerWidth),
      Math.max(400, window.innerHeight));
  },
  resize: function (W, H) {
    var headerH = 30;
    var viewerW = 400;
    var viewerH = 300;
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
  },
  render: function () {
    if (!this.diaporama) return [];
    return [
      this.header.render(),
      this.library.render(),
      this.viewer.render(),
      this.timeline.render()
    ];
  }
};

module.exports = App;
