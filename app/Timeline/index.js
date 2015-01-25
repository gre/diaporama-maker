var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Timeline () {

}
Timeline.render = function (model) {
  var title =
    m("h2", "Timeline");

  return m("div.timeline", { style: boundToStyle(model.bound) }, [ title ]);
};

module.exports = Timeline;
