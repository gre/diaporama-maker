var _ = require("lodash");
import genTimelineTransitionDefault from "./genTimelineTransitionDefault";

module.exports = function (defs, template) {
  return _.extend(
    {
      duration: 4000
    },
    template ? _.cloneDeep(template) : {},
    {
      transitionNext: genTimelineTransitionDefault(
        {},
        template && template.transitionNext
      )
    },
    defs);
};
