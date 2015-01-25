var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Timeline () {

}
Timeline.render = function (model) {
  return m("div.timeline", { style: boundToStyle(model.bound) }, "Timeline");
};

module.exports = Timeline;
