var m = require("mithril");
var Q = require("q");
// var _ = require("lodash");
var prefix = require("vendor-prefix");
var boundToStyle = require("../core/boundToStyle");
var ThumbnailCache = require("../core/ThumbnailCache");
var loader = require("../core/loader");
var toProjectUrl = require("../core/toProjectUrl");

var transformAttr = prefix("transform");

var thumbnailCache = new ThumbnailCache();
var thumbnailQuality = window.devicePixelRatio || 1;

function translateStyle (x, y) {
  var style = {};
  style[transformAttr] = "translate("+x+"px,"+y+"px)";
  return style;
}

function Timeline () {

}
Timeline.prototype = {
  setTimeline: function (tl) {
    this.tl = tl;
    Q.all(tl.map(function (item) {
      return loader.image.load(toProjectUrl(item.image));
    }))
    .done(m.redraw);
  }
};

Timeline.render = function (model) {

  var title =
    m("h2", "Timeline");

  var timeResolution = 0.1; // how much pixel per millisecond of time

  var lineContent = [];
  var thumbh = (model.bound.height - 40);
  var x = 0;
  var prevTransitionWidth = 0;
  for (var i=0; i<model.tl.length; ++i) {
    var item = model.tl[i];
    var transitionw = item.transitionNext && item.transitionNext.duration ? Math.round(timeResolution * item.transitionNext.duration) : 0; // TODO the transition should be shown in cross-fade between images

    var thumbw = transitionw/2 + prevTransitionWidth/2 + Math.round(timeResolution * item.duration);

    lineContent.push(
      m("div.thumbnail", { style: translateStyle(x, 0) }, [
        m("img", {
          src: thumbnailCache.get(toProjectUrl(item.image), thumbnailQuality * thumbw, thumbnailQuality * thumbh),
          style: {
            width: thumbw+"px",
            height: thumbh+"px"
          }
        })
      ])
    );

    lineContent.push(
      m("div.transition", { style: translateStyle(x + thumbw - transitionw/2, 0) }, [
        m("div", {
          style: {
            width: transitionw+"px",
            height: thumbh+"px"
          }
        })
      ])
    );

    prevTransitionWidth = transitionw;
    x += thumbw;
  }

  var line =
    m("div.line", {
      style: {
        width: model.bound.width+"px",
        height: (thumbh+8)+"px"
      }
    }, lineContent);

  return m("div.timeline",
    { style: boundToStyle(model.bound) },
    [ title, line ]);
};

module.exports = Timeline;
