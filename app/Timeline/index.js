var m = require("mithril");
var boundToStyle = require("../core/boundToStyle");

function Timeline () {

}
Timeline.prototype = {
  render: function () {
    return m("div.timeline", { style: boundToStyle(this.bound) }, "Timeline");
  }
};

module.exports = Timeline;
