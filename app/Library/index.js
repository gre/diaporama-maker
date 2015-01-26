var m = require("mithril");
var Q = require("q");
var Qajax = require("qajax");
var computeThumbnail = require("../core/computeThumbnail");
var boundToStyle = require("../core/boundToStyle");
var isImage = require("../../common/isImage");
var toProjectUrl = require("../core/toProjectUrl");

var thumbnailQuality = 2 * (window.devicePixelRatio || 1);

function Library () {
  this.thumbnailWidth = 120;
  this.thumbnailHeight = 80;
  this.items = [];
  this.sync();
}

Library.prototype = {
  sync: function () {
    var self = this;
    var thumbw = self.thumbnailWidth * thumbnailQuality, thumbh = self.thumbnailHeight * thumbnailQuality;
    Qajax({
      method: "GET",
      url: "/listfiles"
    })
    .then(Qajax.filterSuccess)
    .then(Qajax.toJSON)
    .then(function (files) {
      return files.map(function (file) {
        if (isImage(file)) {
          return computeThumbnail(toProjectUrl(file), thumbw, thumbh).then(function (thumb) {
            return {
              file: file,
              thumb: thumb,
              type: "image"
            };
          });
        }
        else {
          return Q({
            file: file,
            type: ""
          });
        }
      });
    })
    .all()
    .then(function (items) {
      self.items = items;
    })
    .done(m.redraw);
  }
};

Library.render = function (model) {

  var title =
    m("h2", "Library");

  var items =
    model.items.map(function (item) {
      var thumbnail = item.thumb ? m("img.thumbnail", {
        src: item.thumb,
        style: {
          width: model.thumbnailWidth+"px",
          height: model.thumbnailHeight+"px"
        }
      }) : m("span", { style: {font: "8px normal monospace"} }, "No Preview");

      var name = m("span.name", {}, item.file);

      return m("div.item", {
        title: item.file,
        style: {
          width: model.thumbnailWidth+"px"
        }
      }, [
        thumbnail,
        name
      ]);
    });

  var body =
    m("div.body", {
      style: {
        height: (model.bound.height - 40)+"px"
      }
    }, items);

  return m("div.library",
    { style: boundToStyle(model.bound) },
    [ title, body ]);
};

module.exports = Library;
