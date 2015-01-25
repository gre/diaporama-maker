var m = require("mithril");
var Q = require("q");
var _ = require("lodash");
var prefix = require("vendor-prefix");
var boundToStyle = require("../core/boundToStyle");
var computeThumbnail = require("../core/computeThumbnail");

var transformAttr = prefix("transform");

var thumbnailResolution = 400;

var _cachedThumbnailsP = {};
var _cachedThumbnails = {};
function loadThumbnail (url) {
  if (!(url in _cachedThumbnailsP)) {
    _cachedThumbnailsP[url] = computeThumbnail(url, thumbnailResolution, thumbnailResolution).then(function (thumb) {
      _cachedThumbnails[url] = thumb;
       return thumb;
    });
  }
  return _cachedThumbnailsP[url];
}
function thumbnail (url) {
  return _cachedThumbnails[url];
}

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
      return loadThumbnail(item.image);
    }))
    .done(m.redraw);
  }
};

Timeline.render = function (model) {
  var thumbh = (model.bound.height - 40);
  var thumbw = thumbh;
  var transitionw = 30;

  var title =
    m("h2", "Timeline");

  var line =
    m("div.line", {
      style: {
        width: model.bound.width+"px",
        height: (thumbh+8)+"px"
      }
    }, _.flatten(model.tl.map(function (item, i) {
      return [
        m("div.thumbnail", { style: translateStyle(i * (thumbw + transitionw), 0) }, [
          m("img", {
            src: thumbnail(item.image),
            style: {
              width: thumbw+"px",
              height: thumbh+"px"
            }
          })
        ]),
        m("div.transition", { style: translateStyle(i * (thumbw + transitionw) + thumbw, 0) }, [
          m("div", {
            style: {
              width: transitionw+"px",
              height: thumbh+"px"
            }
          })
        ])
      ];
    })));

  return m("div.timeline",
    { style: boundToStyle(model.bound) },
    [ title, line ]);
};

module.exports = Timeline;
